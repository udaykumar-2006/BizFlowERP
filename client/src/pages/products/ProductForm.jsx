import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 0,
    warehouseLocation: ''
  });
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const response = await api.get(`/products/${id}`);
          const data = response.data.data;
          
          setFormData({
            name: data.name || '',
            sku: data.sku || '',
            category: data.category || '',
            unitPrice: data.unitPrice || 0,
            currentStock: data.currentStock || 0,
            minimumStock: data.minimumStock || 0,
            warehouseLocation: data.warehouseLocation || ''
          });
        } catch (err) {
          if (err.response?.status === 401) navigate('/login');
          else if (err.response?.status === 404) setError('Product not found');
          else setError('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

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
    setError('');
    setSaving(true);
    
    try {
      if (isEdit) {
        await api.patch(`/products/${id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      navigate('/products');
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 422 || err.response?.status === 409) {
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
  if (error && !isEdit) return <div className="error">{error}</div>;

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px' }}>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
      
      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Name *</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>SKU *</label>
          <input name="sku" value={formData.sku} onChange={handleChange} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Category *</label>
          <input name="category" value={formData.category} onChange={handleChange} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Unit Price *</label>
          <input type="number" step="0.01" min="0" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Current Stock *</label>
          <input type="number" min="0" name="currentStock" value={formData.currentStock} onChange={handleChange} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Minimum Stock *</label>
          <input type="number" min="0" name="minimumStock" value={formData.minimumStock} onChange={handleChange} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Warehouse Location *</label>
          <input name="warehouseLocation" value={formData.warehouseLocation} onChange={handleChange} required />
        </div>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/products')} style={{ backgroundColor: '#fff', color: '#000' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
