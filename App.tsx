
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Login from './pages/Login';
import Register from './pages/Register';
import Watchlist from './pages/Watchlist';
import AdminPanel from './pages/AdminPanel';
import Search from './pages/Search';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/watch/:id" element={<Layout><Watch /></Layout>} />
        <Route path="/watchlist" element={<Layout><Watchlist /></Layout>} />
        <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
        <Route path="/search" element={<Layout><Search /></Layout>} />
        <Route path="*" element={<Layout><Home /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;
