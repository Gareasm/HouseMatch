import React from 'react';
import { Navigate } from 'react-router-dom';

function AuthGuard_Bypass({ children }) {
  return children; // bypass auth for frontend dev
}

function AuthGuard({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AuthGuard;