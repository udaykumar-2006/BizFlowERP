import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [customer, setCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpError, setFollowUpError] = useState('');

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const [customerRes, followUpsRes] = await Promise.all([
          api.get(`/customers/${id}`),
          api.get(`/customers/${id}/followups`)
        ]);
        setCustomer(customerRes.data);
        setFollowUps(followUpsRes.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        else if (err.response?.status === 404) setError('Customer not found');
        else setError('Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [id, navigate]);

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    setFollowUpError('');
    setSavingFollowUp(true);
    
    try {
      const payload = {
        note,
        followUpDate: new Date(followUpDate).toISOString()
      };
      
      const res = await api.post(`/customers/${id}/followups`, payload);
      setFollowUps([res.data, ...followUps]);
      setNote('');
      setFollowUpDate('');
    } catch (err) {
      if (err.response?.status === 400) {
        const msg = err.response.data.errors?.map(e => `${e.field}: ${e.message}`).join(', ') || err.response.data.message;
        setFollowUpError(msg || 'Validation failed');
      } else if (err.response?.status === 403) {
        setFollowUpError('Access denied');
      } else {
        setFollowUpError('Failed to add follow-up');
      }
    } finally {
      setSavingFollowUp(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!customer) return <div>No customer found.</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2>Customer Details</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && <Link to={`/customers/${id}/edit`}><button>Edit</button></Link>}
          <button onClick={() => navigate('/customers')} style={{ backgroundColor: '#fff', color: '#000' }}>Back</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        <div style={{ border: '1px solid #000', padding: '16px' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #000', paddingBottom: '8px' }}>Information</h3>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Business Name:</strong> {customer.businessName || '-'}</p>
          <p><strong>Mobile:</strong> {customer.mobile}</p>
          <p><strong>Email:</strong> {customer.email || '-'}</p>
          <p><strong>Type:</strong> {customer.customerType}</p>
          <p><strong>GST:</strong> {customer.gstNumber || '-'}</p>
          <p><strong>Address:</strong> {customer.address || '-'}</p>
          <p><strong>Status:</strong> {customer.status}</p>
          <p><strong>Next Follow-up:</strong> {customer.followUpDate ? new Date(customer.followUpDate).toLocaleString() : '-'}</p>
          <p><strong>Notes:</strong> {customer.notes || '-'}</p>
        </div>

        <div style={{ border: '1px solid #000', padding: '16px' }}>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid #000', paddingBottom: '8px' }}>Follow-ups</h3>
          
          {canEdit && (
            <form onSubmit={handleFollowUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px dashed #000' }}>
              <input 
                placeholder="Note" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                required 
              />
              <input 
                type="datetime-local" 
                value={followUpDate} 
                onChange={(e) => setFollowUpDate(e.target.value)} 
                required 
              />
              {followUpError && <div className="error">{followUpError}</div>}
              <button type="submit" disabled={savingFollowUp}>
                {savingFollowUp ? 'Adding...' : 'Add Follow-up'}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {followUps.length === 0 ? (
              <p>No follow-ups recorded.</p>
            ) : (
              followUps.map(fu => (
                <div key={fu.id} style={{ borderLeft: '3px solid #000', paddingLeft: '8px' }}>
                  <p><strong>Date:</strong> {new Date(fu.followUpDate).toLocaleString()}</p>
                  <p><strong>Note:</strong> {fu.note}</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Added by: {fu.createdBy}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
