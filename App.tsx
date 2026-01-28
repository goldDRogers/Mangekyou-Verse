import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Login from './pages/Login';
import Register from './pages/Register';
import Watchlist from './pages/Watchlist';
import Search from './pages/Search';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/search" element={<Search />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;