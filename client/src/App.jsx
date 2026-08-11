import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetails from './pages/customers/CustomerDetails';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductDetails from './pages/products/ProductDetails';
import Inventory from './pages/inventory/Inventory';
import ProductMovements from './pages/inventory/ProductMovements';
import ChallanList from './pages/challans/ChallanList';
import ChallanForm from './pages/challans/ChallanForm';
import ChallanDetails from './pages/challans/ChallanDetails';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Customer Routes */}
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />
              
              {/* Product Routes */}
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
              
              {/* Inventory Routes */}
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/product/:id" element={<ProductMovements />} />
              
              {/* Challan Routes */}
              <Route path="/challans" element={<ChallanList />} />
              <Route path="/challans/new" element={<ChallanForm />} />
              <Route path="/challans/:id" element={<ChallanDetails />} />
              <Route path="/challans/:id/edit" element={<ChallanForm />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
