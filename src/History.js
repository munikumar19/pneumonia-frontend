import './History.css';
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

function History() {
  const [page, setPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [history, setHistory] = useState([]);
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [feedbacks, setFeedbacks] = useState({});
  const [zoomedImage, setZoomedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/history');
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleFeedbackChange = (id, value) => {
    setFeedbacks({ ...feedbacks, [id]: value });
  };

  const submitFeedback = async (id) => {
    try {
      await axios.post(`http://localhost:5000/feedback/${id}`, {
        feedback: feedbacks[id]
      });
      alert("✅ Feedback submitted");
      fetchHistory();
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  const exportCSV = async () => {
    try {
      const res = await axios.get('http://localhost:5000/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'prediction_export.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const highlightMatch = (text) => {
    if (!debouncedSearchTerm) return text;
    const regex = new RegExp(`(${debouncedSearchTerm})`, 'gi');
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === debouncedSearchTerm.toLowerCase() ? <mark key={i}>{part}</mark> : part
    );
  };

  const filteredHistory = useMemo(() =>
    history.filter(record =>
      record.filename.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      record.prediction.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ), [history, debouncedSearchTerm]);

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const valA = a[sortKey] || '';
    const valB = b[sortKey] || '';
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const paginatedHistory = sortedHistory.slice(
    (page - 1) * recordsPerPage,
    page * recordsPerPage
  );

  return (
    <div className="history-container">
      <h2>📝 Prediction History</h2>
      <input
        type="text"
        placeholder="Search by filename or result"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <button className="export-btn" onClick={exportCSV}>📅 Export as CSV</button>

      <table className="history-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort('filename')} style={{ cursor: 'pointer' }}>Filename ⬍</th>
            <th>Preview</th>
            <th>Prediction</th>
            <th onClick={() => toggleSort('timestamp')} style={{ cursor: 'pointer' }}>Timestamp ⬍</th>
            <th>Feedback</th>
            <th>Add/Update Feedback</th>
          </tr>
        </thead>
        <tbody>
          {paginatedHistory.map(record => (
            <tr key={record._id} className={record.prediction === "Pneumonia Detected" ? 'danger-row' : ''}>
              <td>{highlightMatch(record.filename)}</td>
              <td>
                <img
                  src={`http://localhost:5000/static/uploads/${record.filename}`}
                  alt="X-ray preview"
                  style={{ width: '60px', borderRadius: '6px', cursor: 'pointer' }}
                  onClick={() => setZoomedImage(record.filename)}
                />
              </td>
              <td>{highlightMatch(record.prediction)}</td>
              <td>{new Date(record.timestamp).toLocaleString()}</td>
              <td>{record.feedback || "—"}</td>
              <td>
                <input
                  type="text"
                  value={feedbacks[record._id] || ''}
                  placeholder="Enter feedback"
                  onChange={e => handleFeedbackChange(record._id, e.target.value)}
                />
                <button onClick={() => submitFeedback(record._id)}>Submit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
        <span style={{ padding: '0 10px' }}>Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page * recordsPerPage >= sortedHistory.length}
        >
          Next
        </button>
      </div>

      {zoomedImage && (
        <div className="zoomed-image-modal" onClick={() => setZoomedImage(null)}>
          <img
            src={`http://localhost:5000/static/uploads/${zoomedImage}`}
            alt="Zoomed X-ray"
          />
        </div>
      )}
    </div>
  );
}

export default History;
