import React, { useState, useEffect } from 'react';
import api from '../api';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaSignInAlt, FaUsers, FaTrash, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Dashboard({ activeTab, setActiveTab, onLogout }) {
  const [myRooms, setMyRooms] = useState([]);
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(2);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [deletingRoomCode, setDeletingRoomCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload?.username) throw new Error('Invalid payload');
      setUser(payload.username.toLowerCase());

    } catch (err) {
      console.error('Invalid or missing token:', err.message);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    api.get('/chat/my-rooms')
      .then(res => setMyRooms(res.data))
      .catch(() => setMyRooms([]));
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !roomId || !maxCapacity) return setError('All fields required');
    if (maxCapacity < 2 || maxCapacity > 100) return setError('Max capacity must be 2-100');
    try {
      await api.post('/chat/room', { name, code: roomId, maxCapacity });
      setSuccess('Room created!');
      setName('');
      setRoomId('');
      setMaxCapacity(2);
      api.get('/chat/my-rooms').then(res => setMyRooms(res.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating room');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!joinRoomId) return setError('Room code required');
    try {
      await api.post(`/chat/room/${joinRoomId}/join`);
      navigate(`/chat/${joinRoomId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error joining room');
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm('Delete this room?')) return;
    setDeletingRoomCode(code);
    try {
      await api.delete(`/chat/room/${code}`);
      setMyRooms(prev => prev.filter(r => r.code !== code));
    } catch (err) {
      console.error('Delete failed:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Error deleting   room');
    } finally {
      setDeletingRoomCode('');
    }
  };

  return (
    <main className="dashboard-bg py-4 min-vh-100">
      <Container>
        <Row className="justify-content-center">
         <Col xs={12} md={10} lg={8} xl={6}>

            {activeTab === 'create' && (
              <Card className="p-4 mb-4 dashboard-card">
                <h4 className="mb-3"><FaPlus className="me-2 text-primary" />Create a New Room</h4>
                <Form onSubmit={handleCreate}>
                  <Form.Group className="mb-3">
                    <Form.Label>Room Name</Form.Label>
                    <Form.Control value={name} onChange={e => setName(e.target.value)} required maxLength={20} size="lg" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Room Code <Badge bg="secondary">6 chars</Badge></Form.Label>
                    <Form.Control value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase())} maxLength={6} minLength={6} pattern="[A-Z0-9]{6}" required size="lg" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Capacity</Form.Label>
                    <Form.Control type="number" value={maxCapacity} onChange={e => setMaxCapacity(Number(e.target.value))} min={2} max={100} required size="lg" />
                  </Form.Group>
                  {error && <div className="text-danger mb-2 fw-semibold">{error}</div>}
                  {success && <div className="text-success mb-2 fw-semibold">{success}</div>}
                  <Button type="submit" variant="primary" size="lg" className="w-100">Create Room</Button>
                </Form>
              </Card>
            )}

            {activeTab === 'join' && (
              <Card className="p-4 mb-4 dashboard-card">
                <h4 className="mb-3"><FaSignInAlt className="me-2 text-success" />Join a Room</h4>
                <Form onSubmit={handleJoin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Room Code</Form.Label>
                    <Form.Control value={joinRoomId} onChange={e => setJoinRoomId(e.target.value.toUpperCase())} maxLength={6} minLength={6} pattern="[A-Z0-9]{6}" required size="lg" />
                  </Form.Group>
                  {error && <div className="text-danger mb-2 fw-semibold">{error}</div>}
                  {success && <div className="text-success mb-2 fw-semibold">{success}</div>}
                  <Button type="submit" variant="success" size="lg" className="w-100">Join Room</Button>
                </Form>
              </Card>
            )}

          {activeTab === 'myRooms' && (
  <Card className="p-4 mb-4 dashboard-card">
    <h4 className="mb-3"><FaUsers className="me-2 text-warning" />My Rooms</h4>
    <ListGroup variant="flush">
      {myRooms.map(room => (
        <ListGroup.Item
          key={room.code || Math.random()}
          className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center"
        >
          {/* Room Info */}
          <div>
            <div className="fs-5 fw-bold text-primary d-flex align-items-center flex-wrap gap-1">
              <FaComments className="me-2 text-info" />
              <span className="dashboard-room-name-text d-block">{room.name}</span>
            </div>
            <div className="mt-1 mb-1">
              <Badge bg="secondary" className="dashboard-room-code-badge">{room.code || 'NO_CODE'}</Badge>
            </div>
            <div className="text-muted">Max: {room.maxCapacity}</div>
          </div>

          {/* Buttons */}
          <div className="d-flex gap-2 mt-2 mt-sm-0 w-100 justify-content-end">
            <Button
              size="md"
              variant="outline-primary"
              className="flex-grow-0"
              onClick={() => navigate(`/chat/${room.code}`)}
            >
              <FaSignInAlt className="me-1" />Join
            </Button>
            <Button
              size="md"
              variant="outline-danger"
              className="flex-grow-0"
              disabled={deletingRoomCode === room.code}
              onClick={() => handleDelete(room.code)}
            >
              {deletingRoomCode === room.code ? 'Deleting...' : (<><FaTrash className="me-1" />Delete</>)}
            </Button>
          </div>
        </ListGroup.Item>
      ))}
      {myRooms.length === 0 && (
        <ListGroup.Item className="text-center text-muted py-4">
          No rooms created yet. Create or join a room to get started!
        </ListGroup.Item>
      )}
    </ListGroup>
  </Card>
)}

            
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default Dashboard;
