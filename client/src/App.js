import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import LandingPage from './pages/LandingPage';
import ChatRoomPage from './pages/ChatRoomPage';
import Dashboard from './pages/Dashboard';
import DashboardNavbar from './components/DashboardNavbar';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PrivateRoute from './components/PrivateRoute';

import './App.css';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('myRooms');

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <>
                <LandingPage
                  onLoginClick={() => setShowLogin(true)}
                  onRegisterClick={() => setShowRegister(true)}
                />
                {showLogin && (
                  <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Login</h5>
                          <button type="button" className="btn-close" onClick={() => setShowLogin(false)}></button>
                        </div>
                        <div className="modal-body">
                          <LoginForm
                            onSuccess={() => {
                              setShowLogin(false);
                              navigate('/dashboard');
                            }}
                            onSwitchToRegister={() => {
                              setShowLogin(false);
                              setShowRegister(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {showRegister && (
                  <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Register</h5>
                          <button type="button" className="btn-close" onClick={() => setShowRegister(false)}></button>
                        </div>
                        <div className="modal-body">
                          <RegisterForm
                            onSuccess={() => {
                              setShowRegister(false);
                              navigate('/dashboard');
                            }}
                            onSwitchToLogin={() => {
                              setShowRegister(false);
                              setShowLogin(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <>
                <DashboardNavbar activeTab={dashboardTab} setActiveTab={setDashboardTab} onLogout={handleLogout} />
                <Dashboard activeTab={dashboardTab} setActiveTab={setDashboardTab} onLogout={handleLogout} />
                <Footer />
              </>
            </PrivateRoute>
          }
        />

        <Route
          path="/chat/:roomId"
          element={
            <PrivateRoute>
              <ChatRoomPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
