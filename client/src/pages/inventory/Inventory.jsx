import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Inventory = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    movementType: 'IN',
    reason: ''
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [movRes, prodRes] = await Promise.all([
        api.get('/stock-movements'),
        api.get('/products')
      ]);
      setMovements(movRes.data.data || []);
      setProducts(prodRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else if (err.response?.status === 403) setError('Access denied');
      else setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    
    try {
      await api.post('/stock-movements', formData);
      setFormData({ productId: '', quantity: '', movementType: 'IN', reason: '' });
      await fetchData(); // Refresh data immediately
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 422) {
        const msg = err.response.data.errors?.map(e => `${e.field}: ${e.message}`).join(', ') || err.response.data.message;
        setFormError(msg || 'Validation failed');
      } else if (err.response?.status === 403) {
        setFormError('Access denied');
      } else {
        setFormError('An error occurred');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Inventory Management</h2>

      <div style={{ display: 'grid', gridTemplateColumns: canEdit ? '2fr 1fr' : '1fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #000', paddingBottom: '8px' }}>Current Stock</h3>
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                  <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Product</th>
                  <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Stock</th>
                  <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Min Stock</th>
                  <th style={{ padding: '8px' }}>History</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLow = p.currentStock <= p.minimumStock;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #000' }}>
                      <td style={{ padding: '8px', borderRight: '1px solid #000' }}>
                        {p.name} <span style={{ fontSize: '12px' }}>({p.sku})</span>
                      </td>
                      <td style={{ padding: '8px', borderRight: '1px solid #000', fontWeight: isLow ? 'bold' : 'normal' }}>
                        {p.currentStock} {isLow && <span style={{ backgroundColor: '#000', color: '#fff', padding: '2px 4px', fontSize: '10px', marginLeft: '4px' }}>LOW</span>}
                      </td>
                      <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{p.minimumStock}</td>
                      <td style={{ padding: '8px' }}>
                        <Link to={`/inventory/product/${p.id}`} style={{ textDecoration: 'underline' }}>View</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {canEdit && (
          <div>
            <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #000', paddingBottom: '8px' }}>Add Movement</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #000', padding: '16px' }}>
              {formError && <div className="error">{formError}</div>}
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Product *</label>
                <select name="productId" value={formData.productId} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #000' }}>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Quantity *</label>
                <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Movement Type *</label>
                <select name="movementType" value={formData.movementType} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #000' }}>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Reason *</label>
                <input name="reason" value={formData.reason} onChange={handleChange} required />
              </div>

              <button type="submit" disabled={saving || !formData.productId}>
                {saving ? 'Saving...' : 'Add Movement'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #000', paddingBottom: '8px' }}>Recent Movements</h3>
        {movements.length === 0 ? (
          <p>No stock movements found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Date</th>
                <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Product</th>
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
                  <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{m.product?.name || m.productId}</td>
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
    </div>
  );
};

export default Inventory;
