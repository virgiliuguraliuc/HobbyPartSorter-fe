// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
// import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/js/all.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';





ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);