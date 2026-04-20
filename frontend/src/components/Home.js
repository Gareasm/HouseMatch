import { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import './Home.css';

function Home() {
  const heroRef = useRef(null);
  const vantaRef = useRef(null);
  const [topTrack, setTopTrack] = useState(null);

  useEffect(() => {
    const fetchTopTrack = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/songs/leaderboard');
        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setTopTrack(data[0]);
        }
      } catch {
        // silently fail, placeholder text will show
      }
    };
    fetchTopTrack();
  }, []);

  useEffect(() => {
    let vantaEffect = null;

    const initVanta = async () => {
      const THREE = await import('three');
      const VANTA = await import('vanta/dist/vanta.halo.min');
      vantaEffect = VANTA.default({
        el: heroRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        baseColor: 0x421793,
        backgroundColor: 0x0a0a0a,
        amplitudeFactor: 0.30,
        xOffset: 0.15,
        size: 1.50,
      });
      vantaRef.current = vantaEffect;
    };

    initVanta();
    return () => { if (vantaRef.current) vantaRef.current.destroy(); };
  }, []);

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero-content">
          <h1 className="hero-title">HouseMatch</h1>
          <p className="hero-tagline">Let the Music Play.</p>
        </div>
      </section>

      {/* Top Track */}
      <section className="top-track-section">
        <div className="top-track-card">
          <h2>Today's Top Track</h2>
          <p>Track Name: {topTrack ? topTrack.title : 'Placeholder'}</p>
          <p>Artist: {topTrack ? topTrack.artist : 'Placeholder'}</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <h2>Placeholder Features Section</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Discover</h3>
            <p>Find a new favorite!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎧</div>
            <h3>Vote</h3>
            <p>Rank which songs are better!</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎵</div>
            <h3>Contribute</h3>
            <p>Add a track for other users to vote on!</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© HouseMatch. CEN 3031.</p>
      </footer>
    </div>
  );
}

export default Home;
