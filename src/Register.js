import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import { jwtDecode } from 'jwt-decode'; 

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/register', { email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);

      const decoded = jwtDecode(token);
      localStorage.setItem('email', decoded.email); // ✅ Save email in localStorage

      alert('Registration successful');
      navigate('/');
    } catch (err) {
      setError('Email already registered');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>📝 Register</h2>
        {error && <p className="auth-error">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
        <p className="auth-link" onClick={() => navigate('/login')}>Already have an account? Login</p>
      </form>
    </div>
  );
}

export default Register;
