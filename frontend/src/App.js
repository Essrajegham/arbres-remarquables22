import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Login from './components/Login';
import Register from './components/Register';
import PasswordResetFlow from './components/PasswordResetFlow';
import AdminDashboard from './components/AdminDashboard';
import TreeDetails from './components/TreeDetails';
import PrivateRoute from './components/PrivateRoute';

import AddAdminPage from './pages/AddAdminPage';
import AddUserPage from './pages/AddUserPage';
import AddTreePage from './pages/AddTreePage';
import TreesPage from './pages/TreesPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import TreeMapPage from './pages/TreeMapPage';
import TreeProvider from './contexts/TreeContext';

import UsersList from './pages/UsersList';
import AdminsList from './pages/AdminsList';
import AvisPage from './pages/AvisPage';

import './styles/variables.css';

const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({
        username: localStorage.getItem('username'),
        role: localStorage.getItem('role'),
        avatar: localStorage.getItem('avatar') || '',
      });
    }
    setAuthChecked(true);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.user.username);
    localStorage.setItem('role', userData.user.role);
    localStorage.setItem('avatar', userData.user.avatar || '');
    setUser(userData.user);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin indicator={antIcon} />
      </div>
    );
  }

  return (
    <TreeProvider>
      <Router>
        <div className="app">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
              <Route path="/forgot-password" element={<PasswordResetFlow />} />
              <Route path="/dashboard" element={<PrivateRoute>{user?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/trees" />}</PrivateRoute>} />
              <Route path="/ajouter-utilisateur" element={<PrivateRoute allowedRoles={['admin', 'superadmin']}><AddUserPage /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute allowedRoles={['admin', 'superadmin']}><AdminDashboard /></PrivateRoute>} />
              <Route path="/add-admin" element={<PrivateRoute allowedRoles={['superadmin']}><AddAdminPage /></PrivateRoute>} />
              <Route path="/add-tree" element={<PrivateRoute allowedRoles={['admin', 'superadmin']}><AddTreePage /></PrivateRoute>} />
              <Route path="/trees" element={<PrivateRoute><TreesPage /></PrivateRoute>} />
              <Route path="/trees/:id" element={<PrivateRoute><TreeDetails /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage user={user} /></PrivateRoute>} />
              <Route path="/map" element={<TreeMapPage />} />
              <Route path="/users-list" element={<PrivateRoute allowedRoles={['admin', 'superadmin']}><UsersList /></PrivateRoute>} />
              <Route path="/admins-list" element={<PrivateRoute allowedRoles={['superadmin']}><AdminsList /></PrivateRoute>} />
              <Route path="/avis" element={<AvisPage />} />

              {/* Supprime les doublons */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </TreeProvider>
  );
}

export default App;
