import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// TODO: backend — wire this up to POST /api/songs idk how to 
async function submitSong(songData) {
  const token = localStorage.getItem('token');

	const response = await fetch('http://localhost:5000/api/songs', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(songData),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'Failed to submit song');
	}

	return data;
}

const emptyForm = { title: '', artist: '', url: '' };

function Navbar() {
  const isLoggedIn = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('role') === 'admin';
  const navigate = useNavigate();
  const [loggedOut, setLoggedOut] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setLoggedOut(true);
    setTimeout(() => navigate('/login'), 1500);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitSong({ title: form.title, artist: form.artist, soundcloudUrl: form.url });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setForm(emptyForm);
    }, 1500);
  };

  if (loggedOut) {
    return <div style={styles.confirmation}>You have been logged out.</div>;
  }

  return (
    <>
      <nav style={styles.nav}>
        <Link to="/">
          <img src="/purpleLogo.svg" alt="HouseMatch" style={styles.logo} />
        </Link>
        <div style={styles.links}>
          {isLoggedIn ? (
            <>
              <Link to="/feed" style={styles.btn}>Feed</Link>
              <Link to="/leaderboard" style={styles.btn}>Leaderboard</Link>
              <Link to="/profile" style={styles.btn}>Profile</Link>
              {isAdmin && <Link to="/admin" style={styles.btnAdmin}>Admin</Link>}
              <button onClick={() => setShowForm(true)} style={styles.btnAdd}>+ Add Song</button>
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

      {/* Modal
      */}
      
      {showForm && (
        <div style={styles.overlay} onClick={() => setShowForm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add a Song</h2>
            {submitted ? (
              <p style={styles.successMsg}>Song submitted!</p>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Artist</label>
                <input
                  name="artist"
                  value={form.artist}
                  onChange={handleChange}
                  placeholder="e.g. Dom Dolla"
                  required
                  style={styles.input}
                />
                <label style={styles.label}>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. San Frandisco"
                  required
                  style={styles.input}
                />
                <label style={styles.label}>SoundCloud URL</label>
                <input
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  placeholder="https://soundcloud.com/..."
                  required
                  style={styles.input}
                />
                <div style={styles.formActions}>
                  <button type="button" onClick={
                    () => setShowForm(false)} 
                    style={styles.btnCancel}>Cancel</button>
                  <button type="submit" 
                    style={styles.btnSubmit}>Submit</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
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
  logo: { height: 36, cursor: 'pointer' },
  links: { display: 'flex', gap: 12, alignItems: 'center' },
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
  btnAdmin: {
    textDecoration: 'none',
    color: '#a855f7',
    fontSize: 14,
    padding: '6px 16px',
    borderRadius: 8,
    border: '1px solid #a855f7',
    fontWeight: 600,
  },
  btnAdd: {    background: '#7c3aed',
    color: '#fff',
    fontSize: 14,
    padding: '6px 16px',
    borderRadius: 8,
    border: '1px solid #7c3aed',
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnPrimary: {
    background: '#7c3aed',
    color: '#fff',
    border: '1px solid #7c3aed',
  }
;
  },
  confirmation: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    padding: '16px',
    background: '#3b0764',
    color: '#e2d9f3',
    textAlign: 'center',
    fontSize: 14,
    zIndex: 1000,
  },
  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: '#1a1a1a',
    border: '2px solid #a855f7',
    borderRadius: 12,
    padding: '2rem',
    width: '100%',
    maxWidth: 420,
  },
  modalTitle: {
    color: '#a855f7',
    marginBottom: '1.5rem',
    fontSize: '1.25rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { color: '#a855f7', fontSize: 13, fontWeight: 600 },
  input: {
    background: '#0a0a0a',
    border: '2px solid #a855f7',
    borderRadius: 6,
    padding: '0.6rem 0.75rem',
    color: '#e0e0e0',
    fontSize: 14,
    outline: 'none',
  },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '0.5rem' },
  btnCancel: {
    background: 'transparent',
    color: '#b0b0b0',
    border: '1px solid #444',
    borderRadius: 6,
    padding: '6px 16px',
    cursor: 'pointer',
    fontSize: 14,
  },
  btnSubmit: {
    background: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '6px 20px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  successMsg: { color: '#a855f7', textAlign: 'center', padding: '1rem 0' },
};

export default Navbar;
