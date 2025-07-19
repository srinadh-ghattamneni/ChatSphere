import React from 'react';
import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-dark text-white py-3 mt-auto shadow-sm animate__animated animate__fadeInUp">
      <Container className="text-center">
        <small>&copy; {new Date().getFullYear()} ChatSphere. All rights reserved.</small>
      </Container>
    </footer>
  );
}

export default Footer;
