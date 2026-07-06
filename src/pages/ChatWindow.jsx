import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function ChatWindow() {
  const { userId }              = useParams();
  const { user }                = useAuth();
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [otherUser,setOtherUser]= useState(null);
  const bottomRef               = useRef(null);

  useEffect(() => {
    API.get(`/messages/${userId}`).then(res => {
      setMessages(res.data);
      if (res.data.length > 0) {
        const other = res.data[0].from._id === user.id
          ? res.data[0].to : res.data[0].from;
        setOtherUser(other);
      }
    });

    API.patch(`/messages/read/${userId}`);

    const interval = setInterval(() => {
      API.get(`/messages/${userId}`).then(res => setMessages(res.data));
    }, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const { data } = await API.post(`/messages/${userId}`, { message: text });
      setMessages(prev => [...prev, data]);
      setText('');
    } catch (err) {
      alert('Message could not be sent');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 70px)', maxWidth: '700px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px 20px', background: '#0f172a',
        color: 'white', display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%',
          background: '#667eea', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
        }}>
          {otherUser?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <b>{otherUser?.name || 'Loading...'}</b>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        background: '#f4f6fb'
      }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888' }}>
            No messages yet — say hello! 👋
          </p>
        )}
        {messages.map(m => {
          const isMine = m.from._id === user.id || m.from._id?.toString() === user.id;
          return (
            <div key={m._id} style={{
              display: 'flex',
              justifyContent: isMine ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '65%',
                background: isMine ? '#667eea' : 'white',
                color:      isMine ? 'white'   : '#1a1a1a',
                padding: '10px 14px',
                borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                fontSize: '14px'
              }}>
                <p style={{ margin: 0 }}>{m.message}</p>
                <span style={{
                  fontSize: '11px', opacity: 0.7,
                  display: 'block', marginTop: '4px', textAlign: 'right'
                }}>
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px', background: 'white',
        borderTop: '1px solid #eee',
        display: 'flex', gap: '10px', alignItems: 'center'
      }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message... (Enter to send)"
          style={{ flex: 1, margin: 0 }}
        />
        <button onClick={sendMessage} style={{ margin: 0, padding: '10px 20px' }}>
          Send
        </button>
      </div>
    </div>
  );
}