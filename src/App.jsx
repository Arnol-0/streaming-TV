import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import TvPlayer from './components/TvPlayer';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { MediaProvider } from './context/MediaContext';

function App() {
  return (
    <MediaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TvPlayer />} />
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </MediaProvider>
  );
}

export default App;
