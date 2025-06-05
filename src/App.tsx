import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Network from './pages/Network';
import Wallet from './pages/Wallet';
import Kyc from './pages/Kyc';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminKyc from './pages/AdminKyc';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminWithdrawals from './pages/AdminWithdrawals';
import LandingPage from './pages/LandingPage';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Referrals from './pages/Referrals';
import Settings from './pages/Settings';
import Support from './pages/Support';
import ProtectedRoute from './components/auth/ProtectedRoute';
import About from './pages/About';


function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* User Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/:referralCode" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        {/* KYC-protected routes */}
        <Route path="/network" element={<ProtectedRoute element={<Network />} requiresKyc={true} />} />
        <Route path="/wallet" element={<ProtectedRoute element={<Wallet />} requiresKyc={true} />} />
        <Route path="/kyc" element={<ProtectedRoute element={<Kyc />} />} />
        <Route path="/products" element={<ProtectedRoute element={<Products />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/referrals" element={<ProtectedRoute element={<Referrals />} requiresKyc={true} />} />
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
        <Route path="/support" element={<ProtectedRoute element={<Support />} />} />
        <Route path="/about" element={<ProtectedRoute element={<About />} />} />

        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/kyc" element={<AdminKyc />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </Router>
  );
}

export default App;