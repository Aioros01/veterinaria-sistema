import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pets from './pages/Pets';
import Appointments from './pages/Appointments';
import MedicalHistory from './pages/MedicalHistory';
import Inventory from './pages/Inventory';
import AdminDashboard from './pages/AdminDashboard';
import AdminPanel from './pages/AdminPanel';
import Hospitalizations from './pages/Hospitalizations';
import Consents from './pages/Consents';
import UserManagement from './pages/UserManagement';
import Sales from './pages/Sales';
import QuickAttention from './pages/QuickAttention';
import Layout from './components/Layout';
import './utils/systemValidator';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
    },
    secondary: {
      main: '#FF6F00',
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="quick-attention" element={<QuickAttention />} />
        <Route path="pets" element={<Pets />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="medical-history/:petId" element={<MedicalHistory />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="sales" element={<Sales />} />
        <Route path="hospitalizations" element={<Hospitalizations />} />
        <Route path="consents" element={<Consents />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin-panel" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;