import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function SearchProducts({ user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('trustScore');

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [searchQuery, filterCategory, sortBy, products]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products');
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      // New Vercel API route: /api/search?q=searchQuery
      const response = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Search failed');
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let filtered = [...products];

    // Filter by category
    if (filterCategory !== 'All') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'trustScore') {
      filtered.sort((a, b) => b.trustScore - a.trustScore);
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const getTrustColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>🔍 Product Verification</h1>
        <p>Search and verify sustainability claims on thousands of products</p>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by product name, brand, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Category:</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="trustScore">Trust Score (High to Low)</option>
            <option value="price">Price (Low to High)</option>
            <option value="name">Name (A to Z)</option>
          </select>
        </div>

        <div className="filter-info">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {loading && <div className="loading">Loading products...</div>}

      {!loading && filteredProducts.length === 0 && (
        <div className="no-results">
          <p>No products found. Try adjusting your search.</p>
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.map(product => (
          <Link key={product.id} to={`/product/${product.id}`} className="product-card">
            <img src={product.image} alt={product.name} />
            
            <div className="product-card-content">
              <h3>{product.name}</h3>
              <p className="brand">{product.brand}</p>
              <p className="category">{product.category}</p>

              <div className="trust-score-badge" style={{ backgroundColor: getTrustColor(product.trustScore) }}>
                Trust: {product.trustScore}
              </div>

              <div className="product-card-footer">
                <span className="price">₹{product.price}</span>
                <span className="claims">
                  {product.claims.filter(c => c.verified).length}/{product.claims.length} verified
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SearchProducts;
