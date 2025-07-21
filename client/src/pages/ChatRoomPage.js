import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Form, ListGroup, Badge, Navbar } from 'react-bootstrap';
import { io } from 'socket.io-client';
import api from '../api';
import dayjs from 'dayjs';
import './ChatRoomPage.css';

function ChatRoomPage() {
  const { roomId } = useParams();
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState([]);
  const [usersCount, setUsersCount] = useState(1);
  const [roomInfo, setRoomInfo] = useState({ name: '', maxCapacity: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();
  const navigate = useNavigate();

  // token validation
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.username) throw new Error('Invalid token payload!');
      setUser(payload.username.toLowerCase());
      setLoading(false);
    } catch (err) {
      console.error('Token error:', err.message);
      navigate('/');
    }
  }, [navigate]);

  // Socket & API setup
  useEffect(() => {
    if (!roomId || !user) return;

     //  Fetch room info 
    api.get(`/chat/room/${roomId}`)
      .then(res => setRoomInfo(res.data))
      .catch(() => { });

      // Fetch all previous messages
    api.get(`/chat/room/${roomId}/messages`)
      .then(res => {
        setEvents(res.data.map(m => ({
          user: m.username,
          content: m.content,
          self: m.username === user,
          createdAt: m.createdAt
        })));
      })
      .catch(() => { });
       // Initialize the socket connection
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true,
    });

    //  Join the room
    socketRef.current.emit('joinRoom', { code: roomId, username: user });



    //  Listen to new messages from other users
    socketRef.current.on('event', (evt) => {
      if (!evt.username || !evt.content) return;
      setEvents(prev => [...prev, {
        user: evt.username,
        content: evt.content,
        self: evt.username === user,
        createdAt: evt.createdAt
      }]);
    });


     //  Listen to user count update
    socketRef.current.on('userCount', (data) => {
      setUsersCount(data.count);
    });


    // Cleanup on unmount (when leaving page)
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', { code: roomId, username: user });
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user]);

  // message sending
  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current) return;
    socketRef.current.emit('sendMessage', { code: roomId, username: user, content: message });
    setMessage('');
  };

  const handleLeave = () => navigate('/dashboard');

  if (loading) return <div className="p-5 text-center text-muted">Loading chat room...</div>;
  if (!roomId) return <div className="text-danger p-4">No room selected.</div>;

  return (
    <div className="chatroom-outer-bg min-vh-100 d-flex flex-column">
      <>
        <Navbar bg="primary" variant="dark" expand="md" className="mb-0 rounded-0 shadow chatroom-navbar">
          <Container fluid className="d-flex justify-content-between align-items-center flex-wrap py-2">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <Badge bg="warning" className="text-dark fw-semibold px-3 py-2">Max: {roomInfo.maxCapacity}</Badge>
              <Badge bg="info" className="fw-semibold px-3 py-2">Users: {usersCount}</Badge>
            </div>
            <Button variant="light" size="lg" className="leave-room-btn" onClick={handleLeave}>
              Leave Room
            </Button>
          </Container>
        </Navbar>

        <div className="chatroom-title-bar text-center">
          <h3 className="chatroom-title-text">{roomInfo.name || 'Room'}</h3>
        </div>
      </>

      <div className="chatroom-main flex-grow-1 d-flex flex-column justify-content-end">
        <div className="chat-messages-adv flex-grow-1 w-100 px-0 px-md-3 py-2">
          <ListGroup variant="flush" className="w-100">
            {events.map((evt, idx) => (
              <ListGroup.Item key={idx} className={`border-0 d-flex ${evt.self ? 'justify-content-end' : 'justify-content-start'} bg-transparent`}>
                <div className={`chat-bubble p-2 px-3 rounded-4 shadow-sm mb-1 ${evt.self ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
                  <span className="fw-bold small">{evt.self ? 'You' : evt.user}</span><br />
                  <span>{evt.content}</span>
                  <div className="text-end text-muted small mt-1">{dayjs(evt.createdAt).format('HH:mm, MMM D')}</div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        <div className="chatroom-input-bar w-100 bg-white border-top p-3">
          <Form onSubmit={handleSend} className="d-flex gap-2 align-items-center">
            <Form.Control
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              autoFocus
            />
            <Button type="submit" variant="primary" size="lg">Send</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default ChatRoomPage;
