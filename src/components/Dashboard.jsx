import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Dashboard() {
  const { user }               = useAuth();
  const [skills,   setSkills]  = useState([]);
  const [requests, setRequests]= useState([]);

  useEffect(() => {
    API.get('/skills').then(res => setSkills(res.data));
    API.get('/requests/mine').then(res =>
      setRequests([...res.data.sent, ...res.data.received])
    );
  }, []);

  const mySkills = skills.filter(s => s.user?._id === user?.id);
  const pending  = requests.filter(r => r.status === 'Pending');
  const accepted = requests.filter(r => r.status === 'Accepted');

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <div className="card">
        <h2>👤 {user?.name}</h2>
        <p>💰 Credits: {user?.credits}</p>
      </div>
      <div className="card"><h3>📚 Total Skills: {mySkills.length}</h3></div>
      <div className="card"><h3>📨 Total Requests: {requests.length}</h3></div>
      <div className="card"><h3>⏳ Pending: {pending.length}</h3></div>
      <div className="card"><h3>✅ Accepted: {accepted.length}</h3></div>
    </div>
  );
}