import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #000' }}>
        <div>
          <h1 style={{ fontSize: '20px' }}>BizFlow CRM</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>{user?.name} ({user?.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: '200px', borderRight: '1px solid #000', padding: '32px 16px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/customers">Customers</Link>
            <Link to="/products">Products</Link>
            <Link to="/inventory">Inventory</Link>
            <Link to="/challans">Challans</Link>
          </nav>
        </aside>

        <main style={{ flex: 1, padding: '32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
