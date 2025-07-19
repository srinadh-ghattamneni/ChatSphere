import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import api from '../api';

function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { email, username, password });
      localStorage.setItem('token', res.data.token);
      if (onSuccess) onSuccess();
      else window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit} autoComplete="on">
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3" controlId="registerEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            maxLength={80}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="registerUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            minLength={4}
            maxLength={40}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="registerPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={4}
            maxLength={40}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="registerConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={4}
            maxLength={40}
          />
        </Form.Group>

        <Button variant="success" type="submit" className="w-100" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </Form>

      <div className="text-center mt-3">
        <span>Already have an account?{' '}
          <Button variant="link" size="sm" className="p-0 align-baseline" onClick={onSwitchToLogin}>
            Sign in
          </Button>
        </span>
      </div>
    </>
  );
}

export default RegisterForm;
