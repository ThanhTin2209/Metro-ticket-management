import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TicketValidation from './pages/TicketValidation';
import ManualInspection from './pages/ManualInspection';
import AdminUsers from './pages/AdminUsers';
import AdminMetro from './pages/AdminMetro';
import PurchaseTicket from './pages/PurchaseTicket';
import MyTickets from './pages/MyTickets';
import TopUp from './pages/TopUp';
import Transactions from './pages/Transactions';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SecuritySettings from './pages/SecuritySettings';
import ValidationHistory from './pages/ValidationHistory';
import ReportIncident from './pages/ReportIncident';
import MetroMap from './pages/MetroMap';
import Violations from './pages/Violations';
import InspectionHistory from './pages/InspectionHistory';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes Wrapper */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="metro-map" element={<MetroMap />} />
            
            {/* Passenger Routes */}
            <Route path="purchase" element={<ProtectedRoute roles={['passenger']}><PurchaseTicket /></ProtectedRoute>} />
            <Route path="my-tickets" element={<ProtectedRoute roles={['passenger']}><MyTickets /></ProtectedRoute>} />
            <Route path="topup" element={<ProtectedRoute roles={['passenger']}><TopUp /></ProtectedRoute>} />
            <Route path="transactions" element={<ProtectedRoute roles={['passenger']}><Transactions /></ProtectedRoute>} />

            {/* Staff Routes */}
            <Route path="validate" element={<ProtectedRoute roles={['staff', 'admin']}><TicketValidation /></ProtectedRoute>} />
            <Route path="validation-history" element={<ProtectedRoute roles={['staff', 'admin']}><ValidationHistory /></ProtectedRoute>} />
            <Route path="report-incident" element={<ProtectedRoute roles={['staff', 'inspector', 'admin']}><ReportIncident /></ProtectedRoute>} />

            {/* Inspector Routes */}
            <Route path="manual-inspection" element={<ProtectedRoute roles={['inspector', 'admin']}><ManualInspection /></ProtectedRoute>} />
            <Route path="violations" element={<ProtectedRoute roles={['inspector', 'admin']}><Violations /></ProtectedRoute>} />
            <Route path="inspection-history" element={<ProtectedRoute roles={['inspector', 'admin']}><InspectionHistory /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="admin/metro" element={<ProtectedRoute roles={['admin']}><AdminMetro /></ProtectedRoute>} />
            <Route path="admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
            <Route path="admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
