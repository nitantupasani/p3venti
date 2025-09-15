import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Dashboard from './dashboard';
import Home from './Home';
import Info from './Info';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tool" element={<App />} />
        <Route path="/summary" element={<Dashboard />} />
         <Route path="/info" element={<Info />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);