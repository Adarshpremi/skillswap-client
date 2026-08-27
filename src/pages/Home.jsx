import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RatingModal from '../components/RatingModal';
import API from '../api/axios';

const CATEGORIES = ['All', 'Tech', 'Music', 'Art', 'Language', 'Cooking', 'Fitness', 'Business', 'Other'];

export default function Home() {
  const { user, setUser } = useAuth();

  const [skills,    setSkills]    = useState([]);
  const [requests,  setRequests]  = useState([]);
  const [offer,     setOffer]     = useState('');
  const [need,      setNeed]      = useState('');
  const [category,  setCategory]  = useState('Other');
  const [editId,    setEditId]    = useState(null);
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [sort,      setSort]      = useState('new');
  const [ratingReq, setRatingReq] = useState(null);

  const loadRequests = () => {
    API.get('/requests/mine').then(res =>
      setRequests([...res.data.sent, ...res.data.received])
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const params = new URLSearchParams();
    if (search)              params.append('search',   search);
    if (filterCat !== 'All') params.append('category', filterCat);
    if (sort)                params.append('sort',     sort);
    API.get(`/skills?${params}`).then(res => setSkills(res.data));
  }, [search, filterCat, sort]);

  useEffect(() => {
    loadRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSkill = async () => {
    if (!offer || !need) return alert('Please fill all fields');
    try {
      if (editId) {
        const { data } = await API.put(`/skills/${editId}`, { offer, need, category });
        setSkills(skills.map(s => s._id === editId ? data : s));
        setEditId(null);
      } else {
        const { data } = await API.post('/skills', { offer, need, category });
        setSkills(prev => [...prev, data]);
      }
      setOffer(''); setNeed(''); setCategory('Other');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const deleteSkill = async (id) => {
    await API.delete(`/skills/${id}`);
    setSkills(skills.filter(s => s._id !== id));
  };

  const startEdit = (skill) => {
    setOffer(skill.offer);
    setNeed(skill.need);
    setCategory(skill.category || 'Other');
    setEditId(skill._id);
  };

  const sendRequest = async (skill) => {
    try {
      const { data } = await API.post('/requests', {
        to:    skill.user._id,
        skill: skill._id
      });
      setUser(prev => ({ ...prev, credits: data.credits }));
      alert('Request sent successfully! ✅');
      loadRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/requests/${id}`, { status });
      setRequests(requests.map(r => r._id === id ? { ...r, status } : r));
      if (status === 'Accepted') {
        setUser(prev => ({ ...prev, credits: prev.credits + 1 }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const mySkills     = skills.filter(s => s.user?._id === user?.id);
  const otherSkills  = skills.filter(s => s.user?._id !== user?.id);
  const sentReqs     = requests.filter(r => r.from?._id === user?.id || r.from === user?.id);
  const receivedReqs = requests.filter(r => r.to?._id   === user?.id || r.to   === user?.id);

  return (
    <div className="appContainer">
      <h1>🔁 SkillSwap</h1>
      <p>Welcome, {user?.name} | 💰 Credits: {user?.credits}</p>

      {/* Skill Form */}
      <div className="section">
        <input
          placeholder="Skill You Offer"
          value={offer}
          onChange={e => setOffer(e.target.value)}
        />
        <input
          placeholder="Skill You Need"
          value={need}
          onChange={e => setNeed(e.target.value)}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '8px' }}
        >
          {CATEGORIES.filter(c => c !== 'All').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button onClick={saveSkill}>
          {editId ? 'Update Skill' : 'Add Skill'}
        </button>
        {editId && (
          <button onClick={() => { setEditId(null); setOffer(''); setNeed(''); setCategory('Other'); }}>
            Cancel
          </button>
        )}
      </div>

      {/* Advanced Search */}
      <div style={{ background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
        <input
          placeholder="Search skills, users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>📁 {c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }}
          >
            <option value="new">Newest First</option>
            <option value="old">Oldest First</option>
            <option value="az">A to Z</option>
            <option value="za">Z to A</option>
          </select>
        </div>
      </div>

      {/* Other Users */}
      <h2>Users ({otherSkills.length})</h2>
      {otherSkills.length === 0 && <p style={{ color: 'white' }}>No skills found.</p>}
      {otherSkills.map(s => (
        <div key={s._id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Link to={`/profile/${s.name}`}>
                <b style={{ color: '#667eea', cursor: 'pointer' }}>{s.name}</b>
              </Link>
              {s.category && (
                <span style={{ background: '#fff0d4', color: '#b86f00', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', marginLeft: '8px' }}>
                  {s.category}
                </span>
              )}
              <p style={{ margin: '6px 0 2px' }}>Offers: {s.offer}</p>
              <p style={{ margin: 0 }}>Needs: {s.need}</p>
            </div>
            <button onClick={() => sendRequest(s)}>Request</button>
          </div>
        </div>
      ))}

      {/* My Skills */}
      <h2>My Skills</h2>
      {mySkills.length === 0 && <p style={{ color: 'white' }}>No skills added yet.</p>}
      {mySkills.map(s => (
        <div key={s._id} className="card">
          <p><b>Offer:</b> {s.offer}</p>
          <p><b>Need:</b>  {s.need}</p>
          {s.category && <p><b>Category:</b> {s.category}</p>}
          <button onClick={() => startEdit(s)}>Edit</button>
          <button onClick={() => deleteSkill(s._id)}>Delete</button>
        </div>
      ))}

      {/* Sent Requests */}
      <h2>Sent Requests</h2>
      {sentReqs.length === 0 && <p style={{ color: 'white' }}>No requests sent yet.</p>}
      {sentReqs.map(r => (
        <div key={r._id} className="card">
          <p>To: <b>{r.to?.name}</b></p>
          <p>Skill: {r.skill?.offer}</p>
          <span className={`status ${r.status.toLowerCase()}`}>{r.status}</span>
        </div>
      ))}

      {/* Incoming Requests */}
      <h2>Incoming Requests</h2>
      {receivedReqs.length === 0 && <p style={{ color: 'white' }}>No incoming requests.</p>}
      {receivedReqs.map(r => (
        <div key={r._id} className="card">
          <p>From: <b>{r.from?.name}</b></p>
          <p>Skill: {r.skill?.offer}</p>
          <span className={`status ${r.status.toLowerCase()}`}>{r.status}</span>
          {r.status === 'Pending' && (
            <div style={{ marginTop: '8px' }}>
              <button onClick={() => updateStatus(r._id, 'Accepted')}>Accept</button>
              <button onClick={() => updateStatus(r._id, 'Rejected')}>Reject</button>
            </div>
          )}
          {r.status === 'Accepted' && (
            <button onClick={() => setRatingReq(r)} style={{ background: '#f59e0b', marginTop: '8px' }}>
              ⭐ Rate Now
            </button>
          )}
        </div>
      ))}

      {ratingReq && (
        <RatingModal
          request={ratingReq}
          onClose={() => setRatingReq(null)}
          onDone={() => alert('Rating submitted successfully! ✅')}
        />
      )}
    </div>
  );
}