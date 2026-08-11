import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const ChallanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const canAction = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchChallan = async () => {
    try {
      const response = await api.get(`/challans/${id}`);
      setChallan(response.data.data);
      setActionError(''); // Clear errors on fresh load
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else if (err.response?.status === 404) setError('Challan not found');
      else setError('Failed to load challan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id, navigate]);

  const handleConfirm = async () => {
    if (!window.confirm('Are you sure you want to confirm this challan? This will deduct stock permanently.')) return;
    
    setActionLoading(true);
    setActionError('');
    try {
      await api.post(`/challans/${id}/confirm`);
      await fetchChallan();
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 422) {
        setActionError(err.response.data.message || 'Validation failed');
      } else if (err.response?.status === 403) {
        setActionError('Access denied');
      } else {
        setActionError('An error occurred during confirmation');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this draft?')) return;
    
    setActionLoading(true);
    setActionError('');
    try {
      await api.post(`/challans/${id}/cancel`);
      await fetchChallan();
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 422) {
        setActionError(err.response.data.message || 'Validation failed');
      } else if (err.response?.status === 403) {
        setActionError('Access denied');
      } else {
        setActionError('An error occurred during cancellation');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!challan) return <div>No challan found.</div>;

  const isDraft = challan.status === 'DRAFT';

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2>Challan Details</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canAction && isDraft && (
            <Link to={`/challans/${id}/edit`}><button>Edit</button></Link>
          )}
          <button onClick={() => navigate('/challans')} style={{ backgroundColor: '#fff', color: '#000' }}>Back</button>
        </div>
      </div>

      {actionError && <div className="error" style={{ marginBottom: '16px', padding: '8px', border: '1px solid red' }}><strong>Error:</strong> {actionError}</div>}

      <div style={{ border: '1px solid #000', padding: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '16px', marginBottom: '16px' }}>
          <div>
            <p style={{ marginBottom: '8px' }}><strong>Challan Number:</strong> {challan.challanNumber}</p>
            <p style={{ marginBottom: '8px' }}><strong>Customer:</strong> {challan.customer?.name}</p>
            <p style={{ marginBottom: '8px' }}><strong>Created Date:</strong> {new Date(challan.createdAt).toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ marginBottom: '8px', fontSize: '18px' }}>
              <strong>Status: </strong> 
              <span style={{ fontWeight: 'bold', textDecoration: isDraft ? 'none' : 'underline' }}>{challan.status}</span>
            </p>
            <p style={{ marginBottom: '8px' }}><strong>Total Quantity:</strong> {challan.totalQuantity}</p>
          </div>
        </div>

        <h3 style={{ marginBottom: '16px' }}>Products</h3>
        {challan.challanItems?.length === 0 ? (
          <p>No products in this challan.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Product Name (Snapshot)</th>
                <th style={{ padding: '8px', borderRight: '1px solid #000' }}>SKU (Snapshot)</th>
                <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Unit Price (Snapshot)</th>
                <th style={{ padding: '8px' }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {challan.challanItems?.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #000' }}>
                  <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{item.productNameSnapshot}</td>
                  <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{item.skuSnapshot}</td>
                  <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{item.unitPriceSnapshot}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {canAction && isDraft && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '32px', borderTop: '1px solid #000', paddingTop: '16px' }}>
            <button onClick={handleConfirm} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm Challan'}
            </button>
            <button onClick={handleCancel} disabled={actionLoading} style={{ backgroundColor: '#fff', color: '#000' }}>
              Cancel Challan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallanDetails;
