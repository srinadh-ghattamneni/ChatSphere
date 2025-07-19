import React from 'react';
import { FaComments } from 'react-icons/fa';
import './LandingPage.css';

function LandingPage({ onLoginClick, onRegisterClick }) {
  return (
    <div className="landing-bg">
      {/* Overlay */}
      <div className="landing-overlay" />
      {/* Top-right nav */}
      <div className="landing-nav position-absolute top-0 end-0 p-4">
        <button className="btn btn-outline-light me-2 landing-btn" onClick={onLoginClick}>Login</button>
        <button className="btn btn-warning landing-btn" onClick={onRegisterClick}>Sign Up</button>
      </div>
      {/* Centered hero */}
      <div className="landing-center-content text-center">
        <FaComments className="chat-icon mb-3" />
        <h1 className="display-4 fw-bold text-white mb-3">
          Welcome to <span className="brand-highlight">ChatSphere</span>
        </h1>
        <p className="lead text-white mb-4">Real-time messaging for teams, friends, and communities. Fast, secure, and fun.</p>
        <button className="btn btn-primary btn-lg px-5 landing-btn-cta" onClick={onLoginClick}>
          Try Chat App
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
