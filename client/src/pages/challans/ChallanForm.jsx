import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const ChallanForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    customerId: '',
    items: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers'),
          api.get('/products')
        ]);
        setCustomers(custRes.data.data || []);
        setProducts(prodRes.data.data || []);

        if (isEdit) {
          const challanRes = await api.get(`/challans/${id}`);
          const challan = challanRes.data.data;
          
          if (challan.status !== 'DRAFT') {
            setError('Only DRAFT challans can be edited');
            return;
          }

          setFormData({
            customerId: challan.customerId,
            items: challan.challanItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          });
        }
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else if (err.response?.status === 404) setError('Not found');
        else setError('Failed to load dependencies');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDependencies();
  }, [id, isEdit, navigate]);

  const handleCustomerChange = (e) => {
    setFormData(prev => ({ ...prev, customerId: e.target.value }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'quantity') {
      newItems[index][field] = value === '' ? '' : Number(value);
    } else {
      newItems[index][field] = value;
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.items.length === 0) {
      setError('At least one product is required.');
      return;
    }

    const productIds = formData.items.map(i => i.productId);
    const uniqueIds = new Set(productIds);
    if (productIds.length !== uniqueIds.size) {
      setError('Duplicate products are not allowed in the same challan.');
      return;
    }

    setSaving(true);
    
    try {
      let res;
      if (isEdit) {
        res = await api.patch(`/challans/${id}`, formData);
      } else {
        res = await api.post('/challans', formData);
      }
      
      const savedChallan = res.data.data;
      navigate(`/challans/${savedChallan.id || id}`);
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 422) {
        const msg = err.response.data.errors?.map(e => `${e.field}: ${e.message}`).join(', ') || err.response.data.message;
        setError(msg || 'Validation failed');
      } else if (err.response?.status === 403) {
        setError('Access denied');
      } else {
        setError('An error occurred while saving');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error && !formData.customerId && !formData.items.length) return <div className="error">{error}</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '24px' }}>{isEdit ? 'Edit Draft Challan' : 'Create Challan'}</h2>
      
      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Customer *</label>
          <select 
            value={formData.customerId} 
            onChange={handleCustomerChange} 
            required 
            style={{ width: '100%', padding: '8px', border: '1px solid #000' }}
          >
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Products</h3>
            <button type="button" onClick={handleAddItem} style={{ fontSize: '12px', padding: '4px 8px' }}>+ Add Product</button>
          </div>

          {formData.items.length === 0 ? (
            <p style={{ fontSize: '14px' }}>No products added. Please add at least one.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formData.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Product</label>
                    <select 
                      value={item.productId} 
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '8px', border: '1px solid #000' }}
                    >
                      <option value="">Select product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div style={{ width: '100px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Quantity</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                      required 
                    />
                  </div>
                  <button type="button" onClick={() => handleRemoveItem(index)} style={{ backgroundColor: '#fff', color: '#000', border: '1px solid #000', padding: '8px 12px' }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', borderTop: '1px solid #000', paddingTop: '16px' }}>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Draft')}
          </button>
          <button type="button" onClick={() => navigate('/challans')} style={{ backgroundColor: '#fff', color: '#000' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChallanForm;
