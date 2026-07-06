import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function ChatList() {
  const [convs,   setConvs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/messages')
      .then(res => setConvs(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>💬 Chats</h1>
      {convs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#888' }}>
          <p>No conversations yet.</p>
          <p>Go to a user's profile and start chatting!</p>
        </div>
      )}
      {convs.map(c => (
        <div
          key={c.user._id}
          className="card"
          onClick={() => navigate(`/chat/${c.user._id}`)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div style={{
            width: '45px', height: '45px', borderRadius: '50%',
            background: '#667eea', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 'bold', flexShrink: 0
          }}>
            {c.user.name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <b>{c.user.name}</b>
            <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>
              {c.lastMessage.message.length > 40
                ? c.lastMessage.message.substring(0, 40) + '...'
                : c.lastMessage.message}
            </p>
          </div>
          <span style={{ fontSize: '12px', color: '#aaa' }}>
            {new Date(c.lastMessage.createdAt).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}