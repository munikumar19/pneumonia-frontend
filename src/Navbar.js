import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  let email = '';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      email = decoded.email;
    } catch (err) {
      console.error("Invalid token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">🏥 Pneumonia Detector</Link>
      </div>
      <div className="navbar-right">
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link> {/* ✅ Add profile link */}
            <span className="user-email">👤 {email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
