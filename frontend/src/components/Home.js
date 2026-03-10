import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">House Match</h1>
        <p className="home-subtitle">Discover and vote on the best house music tracks</p>
        
        <div className="home-buttons">
          <Link to="/register" className="home-button primary">
            Sign Up
          </Link>
          <Link to="/login" className="home-button secondary">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
