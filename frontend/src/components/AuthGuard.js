import React from 'react';
import { Navigate } from 'react-router-dom';

function AuthGuard_Bypass({ children }) {
  return children; // bypass auth for frontend dev
}
{/* 
TEMPORARY USE 
  localStorage.setItem('token', 'dev-bypass')
TO GO INTO LOGGED IN MODE
  localStorage.removeItem('token')
TO LOG OUT
*/}
function AuthGuard({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AuthGuard;
