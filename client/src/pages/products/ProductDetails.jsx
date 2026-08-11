import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else if (err.response?.status === 404) setError('Product not found');
        else setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div>No product found.</div>;

  const isLowStock = product.currentStock <= product.minimumStock;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2>Product Details</h2>
          {isLowStock && (
            <span style={{ backgroundColor: '#000', color: '#fff', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold' }}>
              LOW STOCK
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && <Link to={`/products/${id}/edit`}><button>Edit</button></Link>}
          <button onClick={() => navigate('/products')} style={{ backgroundColor: '#fff', color: '#000' }}>Back</button>
        </div>
      </div>

      <div style={{ border: '1px solid #000', padding: '16px', maxWidth: '600px' }}>
        <p style={{ marginBottom: '8px' }}><strong>Name:</strong> {product.name}</p>
        <p style={{ marginBottom: '8px' }}><strong>SKU:</strong> {product.sku}</p>
        <p style={{ marginBottom: '8px' }}><strong>Category:</strong> {product.category}</p>
        <p style={{ marginBottom: '8px' }}><strong>Unit Price:</strong> {product.unitPrice}</p>
        <p style={{ marginBottom: '8px' }}><strong>Current Stock:</strong> {product.currentStock}</p>
        <p style={{ marginBottom: '8px' }}><strong>Minimum Stock:</strong> {product.minimumStock}</p>
        <p style={{ marginBottom: '8px' }}><strong>Warehouse Location:</strong> {product.warehouseLocation}</p>
      </div>
    </div>
  );
};

export default ProductDetails;
