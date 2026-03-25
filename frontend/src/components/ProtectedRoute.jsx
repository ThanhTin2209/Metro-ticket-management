import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, hasAnyRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 animate-bounce">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-blue-500/40">🚇</div>
          <p className="text-xl font-black italic tracking-widest text-blue-600">METRONET</p>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasAnyRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
