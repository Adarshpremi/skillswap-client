import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/notifications')
      .then(res => setNotifs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const readAll = async () => {
    await API.patch('/notifications/read-all');
    setNotifs(notifs.map(n => ({ ...n, read: true })));
  };

  const deleteAll = async () => {
    await API.delete('/notifications');
    setNotifs([]);
  };

  const handleClick = async (notif) => {
    await API.patch(`/notifications/${notif._id}/read`);
    setNotifs(notifs.map(n => n._id === notif._id ? { ...n, read: true } : n));
    if (notif.link) navigate(notif.link);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'request_sent':     return '📩';
      case 'request_accepted': return '✅';
      case 'request_rejected': return '❌';
      case 'new_message':      return '💬';
      default:                 return '🔔';
    }
  };

  const getBg = (type) => {
    switch(type) {
      case 'request_accepted': return '#e2f5ee';
      case 'request_rejected': return '#fde8e8';
      case 'new_message':      return '#ece9fc';
      default:                 return '#fff0d4';
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '20px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '20px'
      }}>
        <h1>
          🔔 Notifications
          {unreadCount > 0 && (
            <span style={{
              background: '#ef4444', color: 'white',
              fontSize: '14px', padding: '2px 8px',
              borderRadius: '20px', marginLeft: '10px'
            }}>
              {unreadCount}
            </span>
          )}
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button onClick={readAll} style={{ background: '#667eea', fontSize: '13px', padding: '6px 12px' }}>
              Mark All Read
            </button>
          )}
          {notifs.length > 0 && (
            <button onClick={deleteAll} style={{ background: '#ef4444', fontSize: '13px', padding: '6px 12px' }}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {notifs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔔</div>
          <p>No notifications yet.</p>
        </div>
      )}

      {notifs.map(n => (
        <div
          key={n._id}
          onClick={() => handleClick(n)}
          className="card"
          style={{
            cursor: 'pointer',
            background: n.read ? 'white' : getBg(n.type),
            borderLeft: n.read ? '4px solid #eee' : '4px solid #667eea',
            display: 'flex', alignItems: 'center', gap: '14px'
          }}
        >
          <div style={{ fontSize: '28px', flexShrink: 0 }}>{getIcon(n.type)}</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: n.read ? 'normal' : 'bold', fontSize: '14px' }}>
              {n.message}
            </p>
            <span style={{ fontSize: '12px', color: '#888' }}>
              {new Date(n.createdAt).toLocaleString('en-US', {
                day: 'numeric', month: 'short',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          {!n.read && (
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#667eea', flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}