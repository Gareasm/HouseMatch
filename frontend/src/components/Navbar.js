import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/">
        <img src="/purpleLogo.svg" alt="HouseMatch" style={styles.logo} />
      </Link>
      <div style={styles.links}>
        {isLoggedIn ? (
          <>
            <Link to="/feed" style={styles.btn}>Feed</Link>
            <button onClick={handleLogout} style={styles.btnLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.btn}>Log In</Link>
            <Link to="/register" style={{ ...styles.btn, ...styles.btnPrimary }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #3b0764 0%, #0d0d0d 100%)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxSizing: 'border-box',
  },
  logo: {
    height: 36,
    cursor: 'pointer',
  },
  links: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  btn: {
    textDecoration: 'none',
    color: '#e2d9f3',
    fontSize: 14,
    padding: '6px 16px',
    borderRadius: 8,
    border: '1px solid rgba(168, 85, 247, 0.4)',
  },
  btnLogout: {
    background: 'transparent',
    color: '#e2d9f3',
    fontSize: 14,
    padding: '6px 16px',
    borderRadius: 8,
    border: '1px solid rgba(168, 85, 247, 0.4)',
    cursor: 'pointer',
  },
    background: '#7c3aed',
    color: '#fff',
    border: '1px solid #7c3aed',
  }
;

export default Navbar;
