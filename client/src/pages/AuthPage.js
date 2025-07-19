import React, { useState } from 'react';
import { Tabs, Tab, Container, Row, Col, Card } from 'react-bootstrap';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

function AuthPage() {
  const [key, setKey] = useState('login');
  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-lg p-4 bg-light animate__animated animate__fadeIn">
            <Tabs
              id="auth-tabs"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mb-3 justify-content-center"
            >
              <Tab eventKey="login" title="Login">
                <LoginForm />
              </Tab>
              <Tab eventKey="register" title="Register">
                <RegisterForm />
              </Tab>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AuthPage;
