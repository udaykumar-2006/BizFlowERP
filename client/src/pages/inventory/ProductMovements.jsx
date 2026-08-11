import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProductMovements = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movements, setMovements] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movRes, prodRes] = await Promise.all([
          api.get(`/products/${id}/stock-movements`),
          api.get(`/products/${id}`)
        ]);
        setMovements(movRes.data.data || []);
        setProduct(prodRes.data.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else if (err.response?.status === 404) setError('Product not found');
        else setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2>Movement History: {product.name} ({product.sku})</h2>
        <button onClick={() => navigate('/inventory')} style={{ backgroundColor: '#fff', color: '#000' }}>Back</button>
      </div>

      <div style={{ marginBottom: '24px', border: '1px solid #000', padding: '16px', display: 'inline-block' }}>
        <p><strong>Current Stock:</strong> {product.currentStock}</p>
        <p><strong>Minimum Stock:</strong> {product.minimumStock}</p>
      </div>

      {movements.length === 0 ? (
        <p>No stock movements found for this product.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Date</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Type</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Qty</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Reason</th>
              <th style={{ padding: '8px' }}>User</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #000' }}>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{new Date(m.createdAt).toLocaleString()}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000', fontWeight: 'bold' }}>{m.movementType}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{m.quantity}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{m.reason}</td>
                <td style={{ padding: '8px' }}>{m.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductMovements;
