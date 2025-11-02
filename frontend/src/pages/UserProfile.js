import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserProfile({ user }) {
  const [verifications, setVerifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVerifications();
      fetchUserStats();
    }
  }, [user]);

  const fetchVerifications = async () => {
    try {
      const response = await axios.get(`/api/verifications/${user.id}`);
      setVerifications(response.data.data);
    } catch (err) {
      console.error('Error fetching verifications');
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`/api/users/${user.id}`);
      setStats(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user stats');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="user-profile">
      <h1>👤 My Profile</h1>

      <div className="profile-card">
        <h2>{user.name}</h2>
        <p className="email">{user.email}</p>
        <p className="role">Role: <strong>{user.role === 'consumer' ? '🛍️ Consumer' : '🏢 Brand Manager'}</strong></p>
      </div>

      {user.role === 'consumer' && (
        <div className="verification-stats">
          <h2>📊 Your Verification Activity</h2>
          
          <div className="stats-grid">
            <div className="stat-box">
              <h3>{verifications.length}</h3>
              <p>Total Verifications</p>
            </div>
            <div className="stat-box">
              <h3>{verifications.filter(v => v.analysis.recommendation === 'Highly Recommended').length}</h3>
              <p>High Trust Products Found</p>
            </div>
            <div className="stat-box">
              <h3>
                {verifications.length > 0 
                  ? Math.round(verifications.reduce((a, b) => a + b.trustScore, 0) / verifications.length)
                  : 0}%
              </h3>
              <p>Average Trust Score</p>
            </div>
            <div className="stat-box">
              <h3>{verifications.length > 0 ? '✅ Yes' : '—'}</h3>
              <p>Making Verified Choices</p>
            </div>
          </div>

          {verifications.length > 0 && (
            <div className="verifications-history">
              <h3>📱 Recent Verifications</h3>
              <div className="history-list">
                {verifications.map((v, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-info">
                      <p><strong>Product ID:</strong> {v.productId}</p>
                      <p><strong>Timestamp:</strong> {new Date(v.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="history-score" style={{
                      backgroundColor: v.trustScore >= 80 ? '#27ae60' : v.trustScore >= 60 ? '#f39c12' : '#e74c3c'
                    }}>
                      {v.trustScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {verifications.length === 0 && (
            <div className="empty-state">
              <p>No verifications yet. Start by searching for products!</p>
            </div>
          )}
        </div>
      )}

      <div className="profile-section">
        <h2>📋 About EcoVerify</h2>
        <p>
          EcoVerify empowers you to make informed sustainability decisions by providing transparent, 
          AI-verified data on product claims. Our mission is to bridge the gap between consumer intent 
          and sustainable action.
        </p>
      </div>
    </div>
  );
}

export default UserProfile;
