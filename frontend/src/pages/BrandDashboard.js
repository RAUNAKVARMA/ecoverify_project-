import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BrandDashboard({ user }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateData, setUpdateData] = useState({});

  useEffect(() => {
    fetchBrandProducts();
  }, []);

  const fetchBrandProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/brands/GreenFlow/products`);
      setProducts(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching brand products');
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (productId) => {
    try {
      const response = await axios.put(`/api/products/${productId}/sustainability`, updateData);
      alert('Product updated successfully!');
      setUpdateData({});
      setSelectedProduct(null);
      fetchBrandProducts();
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) return <div className="loading">Loading brand dashboard...</div>;

  return (
    <div className="brand-dashboard">
      <h1>🏢 Brand Dashboard</h1>
      <p className="subtitle">Manage your product sustainability profiles</p>

      <div className="dashboard-stats">
        <div className="stat-box">
          <h3>{products.length}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-box">
          <h3>{products.filter(p => p.trustScore >= 80).length}</h3>
          <p>High Trust Products</p>
        </div>
        <div className="stat-box">
          <h3>{products.filter(p => p.certifications.length > 0).length}</h3>
          <p>Certified Products</p>
        </div>
        <div className="stat-box">
          <h3>{Math.round(products.reduce((a, b) => a + b.trustScore, 0) / products.length)}%</h3>
          <p>Average Trust Score</p>
        </div>
      </div>

      <div className="products-management">
        <h2>Your Products</h2>
        
        {selectedProduct ? (
          <div className="edit-form">
            <h3>Update: {selectedProduct.name}</h3>
            
            <div className="form-group">
              <label>Carbon Footprint (kg CO2):</label>
              <input
                type="text"
                defaultValue={selectedProduct.sustainability.carbonFootprint}
                onChange={(e) => setUpdateData({ ...updateData, carbonFootprint: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Recyclability (%):</label>
              <input
                type="text"
                defaultValue={selectedProduct.sustainability.recyclability}
                onChange={(e) => setUpdateData({ ...updateData, recyclability: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Recyclable Material:</label>
              <input
                type="text"
                defaultValue={selectedProduct.sustainability.recyclableMaterial}
                onChange={(e) => setUpdateData({ ...updateData, recyclableMaterial: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button
                className="btn-primary"
                onClick={() => handleUpdateProduct(selectedProduct.id)}
              >
                Save Changes
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedProduct(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="products-table">
            {products.map(product => (
              <div key={product.id} className="product-row">
                <img src={product.image} alt={product.name} className="product-thumbnail" />
                
                <div className="product-info-row">
                  <h4>{product.name}</h4>
                  <p>{product.category}</p>
                </div>

                <div className="trust-score-inline" style={{
                  backgroundColor: product.trustScore >= 80 ? '#27ae60' : product.trustScore >= 60 ? '#f39c12' : '#e74c3c'
                }}>
                  {product.trustScore}
                </div>

                <div className="certifications-count">
                  {product.certifications.length} certs
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => setSelectedProduct(product)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-tips">
        <h3>💡 Tips to Improve Trust Score</h3>
        <ul>
          <li>Add verified certifications to your products</li>
          <li>Update sustainability metrics regularly</li>
          <li>Provide transparent supply chain information</li>
          <li>Get third-party verification for claims</li>
          <li>Share environmental impact data</li>
        </ul>
      </div>
    </div>
  );
}

export default BrandDashboard;
