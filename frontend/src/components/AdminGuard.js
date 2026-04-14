import { Navigate } from 'react-router-dom';


//Similar to Authguard, could combine
function AdminGuard({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

export default AdminGuard;
