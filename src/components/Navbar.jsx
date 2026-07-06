import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      API.get('/notifications/unread-count')
        .then(res => setUnread(res.data.count))
        .catch(() => { });
    };
    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '15px 40px',
      backgroundColor: '#0f172a', color: '#fff',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '22px', fontWeight: 'bold' }}>
        🔁 SkillSwap
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {user ? (
          <>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
            <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/chats" style={{ color: '#fff', textDecoration: 'none' }}>💬 Chats</Link>

            {/* Notification Bell */}
            <div onClick={() => navigate('/notifications')} style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ fontSize: '22px' }}>🔔</span>
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px',
                  background: '#ef4444', color: 'white',
                  fontSize: '11px', fontWeight: 'bold',
                  padding: '1px 6px', borderRadius: '20px',
                  minWidth: '18px', textAlign: 'center'
                }}>
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>

            <span style={{ color: '#94a3b8', fontSize: '14px' }}>Hi, {user.name}</span>
            <span style={{ background: '#22c55e', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
              💰 {user.credits}
            </span>
            <button onClick={logout} style={{
              background: '#ef4444', color: 'white', border: 'none',
              padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}