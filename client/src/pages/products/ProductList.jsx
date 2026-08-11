import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const fetchProducts = async (searchQuery = '', isLowStock = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (isLowStock) params.append('lowStock', 'true');
      
      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else if (err.response?.status === 403) setError('Access denied');
      else setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search, lowStock);
  };

  const handleLowStockChange = (e) => {
    const isLowStock = e.target.checked;
    setLowStock(isLowStock);
    fetchProducts(search, isLowStock);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2>Products</h2>
        {canEdit && (
          <Link to="/products/new">
            <button>Add Product</button>
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            checked={lowStock} 
            onChange={handleLowStockChange} 
            style={{ width: 'auto' }}
          />
          Low stock only
        </label>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Name</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>SKU</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Category</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Price</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Stock</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Min Stock</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Location</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #000' }}>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{p.name}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{p.sku}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{p.category}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{p.unitPrice}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{p.currentStock}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{p.minimumStock}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{p.warehouseLocation}</td>
                <td style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                  <Link to={`/products/${p.id}`}><button>View</button></Link>
                  {canEdit && <Link to={`/products/${p.id}/edit`}><button>Edit</button></Link>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductList;
