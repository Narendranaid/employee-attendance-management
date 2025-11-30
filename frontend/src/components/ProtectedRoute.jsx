// src/components/ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * <ProtectedRoute roles={['employee']} />
 * if roles omitted -> any authenticated user allowed
 */
const ProtectedRoute = ({ roles = [] }) => {
  const { user, token } = useSelector((s) => s.auth);

  if (!token) return <Navigate to="/login" replace />;
  if (roles.length && user && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

export default ProtectedRoute;