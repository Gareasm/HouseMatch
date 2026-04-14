import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './AdminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        //Could create another route for pre-query optimization
        const res = await fetch('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
        setUsers(data);
      } 
      catch (err) {
        setError(err.message || 'Something went wrong.');
      } 
      finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
// Make sure the DB/BE is running, no placeholder data 
  return (
    <div className="admin-container">
      <Navbar />
      <div className="admin-content">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Registered users</p>

        {loading && <p className="admin-status">Loading...</p>}
        {error && <p className="admin-status admin-error">{error}</p>}

        {!loading && !error && (
          <div className="admin-table-wrapper">
            //Code segment below from W3School HTML Tutorial
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-empty">No users found.</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`admin-role admin-role--${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
