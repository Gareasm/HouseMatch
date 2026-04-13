import Navbar from './Navbar';
import './Profile.css';

const placeholderLikedSongs = [
  { id: 1, title: "Losing It", artist: "FISHER" },
  { id: 2, title: "Rumble", artist: "Skrillex & Fred Again" },
  { id: 3, title: "San Frandisco", artist: "Dom Dolla" },
];

function Profile() {
  const username = localStorage.getItem('username') || 'User';

  return (
    <div className="profile-container">
      <Navbar />

      <div className="profile-content">

        {/* Avatar + name */}
        <div className="profile-header">
          <div className="profile-avatar">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="profile-name">{username}</h1>
            <p className="profile-meta">Member since 2025 · House music enthusiast</p>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-number">42</span>
            <span className="stat-label">Liked</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">17</span>
            <span className="stat-label">Passed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">59</span>
            <span className="stat-label">Swiped</span>
          </div>
        </div>

        {/* Liked songs */}
        <section className="profile-section">
          <h2 className="profile-section-title">Liked Songs</h2>
          <div className="liked-songs-list">
            {placeholderLikedSongs.map(song => (
              <div key={song.id} className="liked-song-card">
                <div className="liked-song-art" />
                <div>
                  <p className="liked-song-title">{song.title}</p>
                  <p className="liked-song-artist">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Profile;
