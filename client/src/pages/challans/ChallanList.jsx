import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const ChallanList = () => {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchChallans = async (searchQuery = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/challans?search=${searchQuery}`);
      setChallans(response.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else if (err.response?.status === 403) setError('Access denied');
      else setError('Failed to fetch challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchChallans(search);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2>Sales Challans</h2>
        {canEdit && (
          <Link to="/challans/new">
            <button>Create Challan</button>
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Search by challan number or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {challans.length === 0 ? (
        <p>No challans found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Challan No.</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Customer</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Total Qty</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Status</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Created Date</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {challans.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #000' }}>
                <td style={{ padding: '8px', borderRight: '1px solid #000', fontWeight: 'bold' }}>{c.challanNumber}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{c.customer?.name}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{c.totalQuantity}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{c.status}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                  <Link to={`/challans/${c.id}`}><button>View</button></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ChallanList;
