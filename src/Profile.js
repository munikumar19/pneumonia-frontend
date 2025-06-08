import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile() {
  const [email, setEmail] = useState(localStorage.getItem('email'));
  const [editMode, setEditMode] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [profilePic, setProfilePic] = useState(null);
  const [data, setData] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    fetchHistory();

    // Load saved profile picture if available
    const savedPic = localStorage.getItem('profilePic');
    if (savedPic) setProfilePic(savedPic);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/history');
      const userData = res.data.filter(r => r.user === email);
      setData(userData);
      if (userData.length) {
        setLatest(userData[0]); // Assuming newest first
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePic(url);
      localStorage.setItem('profilePic', url); // Save to localStorage
    }
  };

  const saveEmail = () => {
    localStorage.setItem('email', newEmail);
    setEmail(newEmail);
    setEditMode(false);
    alert('Email updated locally. (Backend not yet updated)');
  };

  return (
    <div className="profile-container">
      <h2>👤 Profile</h2>

      {/* Profile Picture */}
      <div style={{ marginBottom: '1rem' }}>
        <input type="file" accept="image/*" onChange={handleProfilePicChange} />
        {profilePic && (
          <img
            src={profilePic}
            alt="Profile"
            style={{ width: '120px', borderRadius: '50%', marginTop: '10px' }}
          />
        )}
      </div>

      {/* Email Edit Section */}
      {editMode ? (
        <div>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button onClick={saveEmail}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      ) : (
        <>
          <p><strong>Email:</strong> {email}</p>
          <button onClick={() => setEditMode(true)}>Edit Email</button>
        </>
      )}

      <p><strong>Total Predictions:</strong> {data.length}</p>
      <p><strong>Feedbacks Given:</strong> {data.filter(d => d.feedback).length}</p>

      {latest && (
        <>
          <h3>📄 Last Prediction</h3>
          <p><strong>Result:</strong> {latest.prediction}</p>
          <p><strong>Confidence:</strong> {latest.confidence}%</p>
          <p><strong>Date:</strong> {new Date(latest.timestamp).toLocaleString()}</p>
        </>
      )}
    </div>
  );
}

export default Profile;
