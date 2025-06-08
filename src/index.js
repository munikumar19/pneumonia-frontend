import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './Main'; // ✅ Main contains the Router and all routes
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

reportWebVitals();
