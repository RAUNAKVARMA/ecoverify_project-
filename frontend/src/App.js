import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import BrandDashboard from './pages/BrandDashboard';
import UserProfile from './pages/UserProfile';
import SearchProducts from './pages/SearchProducts';
import Analytics from './pages/Analytics';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading EcoVerify...</div>;
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">
              🌿 EcoVerify
            </Link>
            <div className="nav-links">
              <Link to="/search" className="nav-link">Search Products</Link>
              {user && user.role === 'brand' && (
                <Link to="/dashboard" className="nav-link">Brand Dashboard</Link>
              )}
              <Link to="/analytics" className="nav-link">Analytics</Link>
              {user ? (
                <>
                  <Link to="/profile" className="nav-link">
                    {user.name}
                  </Link>
                  <button onClick={handleLogout} className="btn-logout">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/" className="btn-primary">Login</Link>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} setUser={setUser} />} />
            <Route path="/search" element={<SearchProducts user={user} />} />
            <Route path="/product/:id" element={<ProductDetails user={user} />} />
            {user && user.role === 'brand' && (
              <Route path="/dashboard" element={<BrandDashboard user={user} />} />
            )}
            {user && (
              <Route path="/profile" element={<UserProfile user={user} />} />
            )}
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2026 EcoVerify. Empowering sustainable consumer choices.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
