import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { jwtDecode } from 'jwt-decode';
import html2canvas from 'html2canvas';

function Dashboard() {
  const [userEmail, setUserEmail] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pneumonia: 0,
    feedbacks: 0,
    latest: ''
  });
  const [recent, setRecent] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [page, setPage] = useState(1);
  const recordsPerPage = 5;
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [labelFilter, setLabelFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.email);
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchStats();
    }
  }, [userEmail, fromDate, toDate, labelFilter]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/history');

      console.log("User Email:", userEmail);
      console.log("Fetched Data:", res.data);

      let data = res.data; // disable filtering for now

      if (fromDate) {
        data = data.filter(r => new Date(r.timestamp) >= new Date(fromDate));
      }
      if (toDate) {
        data = data.filter(r => new Date(r.timestamp) <= new Date(toDate));
      }
      if (labelFilter) {
        data = data.filter(r => r.prediction === labelFilter);
      }

      console.log("Filtered Data:", data);

      const total = data.length;
      const pneumonia = data.filter(r => r.prediction === 'Pneumonia Detected').length;
      const feedbacks = data.filter(r => r.feedback && r.feedback.trim()).length;
      const latest = data.length ? new Date(data[0].timestamp).toLocaleString() : 'N/A';
      setStats({ total, pneumonia, feedbacks, latest });
      setRecent(data);

      const trendMap = {};
      data.forEach(r => {
        const dateStr = new Date(r.timestamp).toLocaleDateString();
        if (!trendMap[dateStr]) {
          trendMap[dateStr] = { date: dateStr, pneumonia: 0, normal: 0 };
        }
        if (r.prediction === 'Pneumonia Detected') trendMap[dateStr].pneumonia++;
        else trendMap[dateStr].normal++;
      });
      const sortedTrend = Object.values(trendMap).sort((a, b) => new Date(a.date) - new Date(b.date));
      setTrendData(sortedTrend);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  const paginatedData = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    return recent.slice(start, end);
  }, [recent, page]);

  const exportChartAsImage = async () => {
    const element = document.querySelector('.chart-container');
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = 'charts_export.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const resetFilters = () => {
    setFromDate('');
    setToDate('');
    setLabelFilter('');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📊 Welcome, {userEmail}</h2>
        <button onClick={exportChartAsImage} className="export-btn top-right">🖼 Export Charts as PNG</button>
      </div>
      <p>Last login: {new Date().toLocaleString()}</p>

      <div className="filter-controls">
        <label>From: </label>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        <label>To: </label>
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        <label>Label: </label>
        <select value={labelFilter} onChange={e => setLabelFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Pneumonia Detected">Pneumonia Detected</option>
          <option value="Normal">Normal</option>
        </select>
        <button onClick={resetFilters}>Reset Filters</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Predictions</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Pneumonia Detected</h3>
          <p>{stats.pneumonia}</p>
        </div>
        <div className="stat-card">
          <h3>Feedback Count</h3>
          <p>{stats.feedbacks}</p>
        </div>
        <div className="stat-card">
          <h3>Latest Upload</h3>
          <p>{stats.latest}</p>
        </div>
      </div>

      <div className="chart-container">
        <h3>📈 Prediction Type Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[{ name: 'Pneumonia', value: stats.pneumonia }, { name: 'Normal', value: stats.total - stats.pneumonia }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>

        <h3>📅 Daily Prediction Activity (Pneumonia vs Normal)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="pneumonia" stroke="#ff6f61" name="Pneumonia" />
            <Line type="monotone" dataKey="normal" stroke="#4caf50" name="Normal" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h3>📝 Recent Predictions</h3>
      <table className="recent-table">
        <thead>
          <tr>
            <th>Preview</th>
            <th>Filename</th>
            <th>Prediction</th>
            <th>Confidence</th>
            <th>Date</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map(r => (
            <tr key={r._id}>
              <td><img src={`http://localhost:5000/static/uploads/${r.filename}`} alt="thumb" className="thumb" /></td>
              <td>{r.filename}</td>
              <td>{r.prediction}</td>
              <td>{r.confidence ? `${r.confidence}%` : '—'}</td>
              <td>{new Date(r.timestamp).toLocaleString()}</td>
              <td>{r.feedback || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
        <span style={{ padding: '0 10px' }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={page * recordsPerPage >= recent.length}>Next</button>
      </div>
    </div>
  );
}

export default Dashboard;
