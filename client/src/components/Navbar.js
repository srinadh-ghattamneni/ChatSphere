import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function AppNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="md" sticky="top" className="shadow-sm animate__animated animate__fadeInDown">
      <Container>
        <Navbar.Brand as={Link} to="/">ChatSphere</Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
