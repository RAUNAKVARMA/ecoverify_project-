import React from 'react';
import { Link } from 'react-router-dom';

function Home({ user, setUser }) {
  const handleLogin = (role) => {
    const demoUsers = {
      consumer: { id: 'user_001', name: 'Priya Sharma', email: 'priya@example.com', role: 'consumer' },
      brand: { id: 'user_002', name: 'Arjun Patel', email: 'arjun@example.com', role: 'brand' }
    };

    const userData = demoUsers[role];
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>🌿 EcoVerify</h1>
          <h2>Verify Sustainability. Build Trust. Make Impact.</h2>
          <p>AI-powered platform empowering eco-conscious consumers to verify product sustainability claims and brands to build transparent trust.</p>

          {!user ? (
            <div className="login-section">
              <h3>Select Your Role to Get Started</h3>
              <div className="login-options">
                <button
                  className="btn-primary large"
                  onClick={() => handleLogin('consumer')}
                >
                  🛍️ I'm a Consumer<br/>
                  <small>Verify product sustainability claims</small>
                </button>
                <button
                  className="btn-primary large"
                  onClick={() => handleLogin('brand')}
                >
                  🏢 I'm a Brand<br/>
                  <small>Manage product sustainability data</small>
                </button>
              </div>
            </div>
          ) : (
            <div className="welcome-section">
              <h3>Welcome, {user.name}! 👋</h3>
              <p>You are logged in as: <strong>{user.role === 'consumer' ? 'Consumer' : 'Brand Manager'}</strong></p>
              {user.role === 'consumer' ? (
                <Link to="/search" className="btn-primary large">Start Verifying Products →</Link>
              ) : (
                <Link to="/dashboard" className="btn-primary large">Go to Dashboard →</Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <h2>Why Choose EcoVerify?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Verification</h3>
            <p>Verify sustainability claims in under 30 seconds at point of purchase</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Transparent Data</h3>
            <p>Access detailed supply chain and material sourcing information</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Trust Score</h3>
            <p>AI-powered trust score combining certifications and third-party data</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Local Focus</h3>
            <p>Indian eco-labels and certifications database with local context</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Easy to Use</h3>
            <p>Scan products, compare alternatives, track impact in one app</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Brand Transparency</h3>
            <p>Help brands showcase genuine sustainability efforts</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <h2>By The Numbers</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>79%</h3>
            <p>of green claims are misleading</p>
          </div>
          <div className="stat-card">
            <h3>84%</h3>
            <p>prefer sustainable products</p>
          </div>
          <div className="stat-card">
            <h3>71%</h3>
            <p>have encountered greenwashing</p>
          </div>
          <div className="stat-card">
            <h3>10-15 mins</h3>
            <p>time currently spent verifying claims</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
