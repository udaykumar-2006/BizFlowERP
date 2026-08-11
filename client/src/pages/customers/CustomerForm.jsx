import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const CustomerForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL',
    address: '',
    status: 'LEAD',
    followUpDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        try {
          const response = await api.get(`/customers/${id}`);
          const data = response.data;
          
          setFormData({
            name: data.name || '',
            mobile: data.mobile || '',
            email: data.email || '',
            businessName: data.businessName || '',
            gstNumber: data.gstNumber || '',
            customerType: data.customerType || 'RETAIL',
            address: data.address || '',
            status: data.status || 'LEAD',
            followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString().slice(0, 16) : '',
            notes: data.notes || ''
          });
        } catch (err) {
          if (err.response?.status === 401) navigate('/login');
          else if (err.response?.status === 404) setError('Customer not found');
          else setError('Failed to load customer');
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      const payload = { ...formData };
      if (payload.followUpDate) {
        payload.followUpDate = new Date(payload.followUpDate).toISOString();
      } else {
        delete payload.followUpDate;
      }
      
      if (isEdit) {
        await api.patch(`/customers/${id}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      
      navigate('/customers');
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
  if (error && !isEdit) return <div className="error">{error}</div>; // For unrecoverable load errors

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px' }}>{isEdit ? 'Edit Customer' : 'Add Customer'}</h2>
      
      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Name *</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Mobile *</label>
          <input name="mobile" value={formData.mobile} onChange={handleChange} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Business Name</label>
          <input name="businessName" value={formData.businessName} onChange={handleChange} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>GST Number</label>
          <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Customer Type *</label>
          <select 
            name="customerType" 
            value={formData.customerType} 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #000' }}
          >
            <option value="RETAIL">RETAIL</option>
            <option value="WHOLESALE">WHOLESALE</option>
            <option value="DISTRIBUTOR">DISTRIBUTOR</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Address</label>
          <input name="address" value={formData.address} onChange={handleChange} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Status</label>
          <select 
            name="status" 
            value={formData.status} 
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #000' }}
          >
            <option value="LEAD">LEAD</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Follow-up Date</label>
          <input type="datetime-local" name="followUpDate" value={formData.followUpDate} onChange={handleChange} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>Notes</label>
          <input name="notes" value={formData.notes} onChange={handleChange} />
        </div>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/customers')} style={{ backgroundColor: '#fff', color: '#000' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
