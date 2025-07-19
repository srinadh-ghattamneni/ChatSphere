import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';

function DashboardNavbar({ activeTab, setActiveTab, onLogout }) {
  return (
    <Navbar bg="primary" variant="dark" expand="md" sticky="top" className="shadow-sm dashboard-navbar py-3 animate__animated animate__fadeInDown">
      <Container>
        <Navbar.Brand style={{ cursor: 'pointer', fontSize: '2rem', fontWeight: 700, letterSpacing: '1px', fontFamily: 'Poppins, Segoe UI, Arial, sans-serif' }} onClick={() => setActiveTab('myRooms')}>
          ChatSphere
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="dashboard-navbar-nav" />
        <Navbar.Collapse id="dashboard-navbar-nav">
          <Nav className="me-auto dashboard-nav-links">
            <Nav.Link active={activeTab === 'create'} onClick={() => setActiveTab('create')} className="dashboard-nav-link">Create Room</Nav.Link>
            <Nav.Link active={activeTab === 'join'} onClick={() => setActiveTab('join')} className="dashboard-nav-link">Join Room</Nav.Link>
            <Nav.Link active={activeTab === 'myRooms'} onClick={() => setActiveTab('myRooms')} className="dashboard-nav-link">My Rooms</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <Button variant="outline-light" size="lg" className="dashboard-logout-btn" onClick={onLogout}>Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default DashboardNavbar;
