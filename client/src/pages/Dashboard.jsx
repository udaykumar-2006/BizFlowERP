import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>BizFlow CRM</h2>
      <p style={{ marginBottom: '8px' }}>Welcome, {user?.name}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
};

export default Dashboard;
