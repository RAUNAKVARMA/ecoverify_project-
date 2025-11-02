import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ProductDetails({ user }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductDetails();
    fetchAlternatives();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      // New Vercel API route: /api/products (GET all), filter client-side for demo
      const response = await axios.get('/api/products');
      const found = response.data.find((p) => String(p.id) === String(id));
      if (found) {
        setProduct(found);
      } else {
        setError('Product not found');
      }
      setLoading(false);
    } catch (err) {
      setError('Product not found');
      setLoading(false);
    }
  };

  const fetchAlternatives = async () => {
    try {
      // New Vercel API route: /api/alternatives?productId=ID
      const response = await axios.get(`/api/alternatives?productId=${id}`);
      setAlternatives(response.data);
    } catch (err) {
      console.error('Error fetching alternatives');
    }
  };

  const handleVerify = async () => {
    try {
      // New Vercel API route: /api/verify (POST)
      const response = await axios.post('/api/verify', {
        productId: id,
        userId: user?.id || 'anonymous',
      });
      setVerification(response.data);
    } catch (err) {
      console.error('Verification failed');
    }
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  const getTrustColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="product-details">
      <div className="product-header">
        <img src={product.image} alt={product.name} className="product-image-large" />
        
        <div className="product-info">
          <div className="breadcrumb">
            <Link to="/search">Products</Link> / {product.category}
          </div>

          <h1>{product.name}</h1>
          <p className="brand">{product.brand}</p>

          <div className="trust-score-large">
            <div className="score-circle" style={{ borderColor: getTrustColor(product.trustScore) }}>
              <div className="score-value">{product.trustScore}</div>
              <div className="score-label">Trust Score</div>
            </div>
            <div className="score-description">
              <h3>{product.trustScore >= 80 ? '✅ Highly Recommended' : product.trustScore >= 60 ? '⚠️ Recommended' : '❌ Low Trust'}</h3>
              <p>{product.verificationDetails.trustLevel} sustainability confidence</p>
            </div>
          </div>

          {!verification && (
            <button className="btn-primary large" onClick={handleVerify}>
              ✓ Verify This Product
            </button>
          )}

          {verification && (
            <div className="verification-result">
              <h3>✅ Verification Complete</h3>
              <p><strong>Transparency Score:</strong> {verification.analysis.transparencyScore}%</p>
              <p><strong>Status:</strong> {verification.analysis.recommendation}</p>
            </div>
          )}
        </div>
      </div>

      <div className="details-grid">
        <section className="details-section">
          <h2>🏷️ Sustainability Claims</h2>
          <div className="claims-list">
            {product.claims.map((claim, idx) => (
              <div key={idx} className={`claim ${claim.verified ? 'verified' : 'unverified'}`}>
                <span className="claim-icon">{claim.verified ? '✅' : '❌'}</span>
                <span className="claim-text">{claim.claim}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="details-section">
          <h2>🏆 Certifications</h2>
          <div className="certifications-list">
            {product.certifications.length > 0 ? (
              product.certifications.map((cert, idx) => (
                <div key={idx} className="certification-badge">
                  {cert}
                </div>
              ))
            ) : (
              <p className="no-data">No certifications found</p>
            )}
          </div>
        </section>

        <section className="details-section">
          <h2>🔧 Materials & Sourcing</h2>
          <div className="sourcing-info">
            <h4>Materials:</h4>
            <ul>
              {product.materials.map((mat, idx) => (
                <li key={idx}>{mat}</li>
              ))}
            </ul>
            <h4>Sourcing:</h4>
            <p>{product.sourcing}</p>
          </div>
        </section>

        <section className="details-section">
          <h2>🌍 Environmental Impact</h2>
          <div className="sustainability-metrics">
            <div className="metric">
              <label>Carbon Footprint:</label>
              <span>{product.sustainability.carbonFootprint}</span>
            </div>
            <div className="metric">
              <label>Recyclability:</label>
              <span>{product.sustainability.recyclability}</span>
            </div>
            <div className="metric">
              <label>Primary Material:</label>
              <span>{product.sustainability.recyclableMaterial}</span>
            </div>
          </div>
        </section>

        <section className="details-section">
          <h2>💰 Pricing</h2>
          <div className="pricing">
            <div className="price-item">
              <label>EcoVerify Listed Price:</label>
              <span className="price">₹{product.price}</span>
            </div>
            <div className="price-item">
              <label>Market Average Price:</label>
              <span className="market-price">₹{product.marketPrice}</span>
            </div>
            <div className="price-benefit">
              <p>💡 Premium justified by {product.verificationDetails.claimsVerified} verified sustainability claims</p>
            </div>
          </div>
        </section>
      </div>

      {alternatives.length > 0 && (
        <section className="alternatives">
          <h2>🔍 Better Alternatives</h2>
          <div className="alternatives-grid">
            {alternatives.map(alt => (
              <Link key={alt.id} to={`/product/${alt.id}`} className="alternative-card">
                <img src={alt.image} alt={alt.name} />
                <h4>{alt.name}</h4>
                <p className="brand-small">{alt.brand}</p>
                <div className="score-badge" style={{ backgroundColor: getTrustColor(alt.trustScore) }}>
                  {alt.trustScore}
                </div>
                <p className="category-small">{alt.category}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetails;
