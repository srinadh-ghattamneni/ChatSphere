import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import api from '../api';

function LoginForm({ onSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      if (onSuccess) onSuccess();
      else window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit} autoComplete="on">
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3" controlId="loginEmail">
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

        <Form.Group className="mb-3" controlId="loginPassword">
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

        <Button variant="primary" type="submit" className="w-100" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>

      <div className="text-center mt-3">
        <span>New user?{' '}
          <Button variant="link" size="sm" className="p-0 align-baseline" onClick={onSwitchToRegister}>
            Sign up
          </Button>
        </span>
      </div>
    </>
  );
}

export default LoginForm;
