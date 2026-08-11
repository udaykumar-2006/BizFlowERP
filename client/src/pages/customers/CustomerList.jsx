import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/customers?search=${searchQuery}`);
      setCustomers(response.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else if (err.response?.status === 403) setError('Access denied');
      else setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2>Customers</h2>
        {canEdit && (
          <Link to="/customers/new">
            <button>Add Customer</button>
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Search by name, mobile, email, business..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Name</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Mobile</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Business Name</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Type</th>
              <th style={{ padding: '8px', borderRight: '1px solid #000' }}>Status</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #000' }}>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{c.name}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{c.mobile}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{c.businessName || '-'}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{c.customerType}</td>
                <td style={{ padding: '8px', borderRight: '1px solid #000' }}>{c.status}</td>
                <td style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                  <Link to={`/customers/${c.id}`}><button>View</button></Link>
                  {canEdit && <Link to={`/customers/${c.id}/edit`}><button>Edit</button></Link>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerList;
