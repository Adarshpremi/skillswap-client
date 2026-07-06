import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RatingStars from './RatingStars';
import API from '../api/axios';

export default function Profile() {
  const { name }              = useParams();
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [skills,  setSkills]  = useState([]);
  const [ratings, setRatings] = useState({ ratings: [], average: 0, total: 0 });
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    API.get('/skills').then(res => {
      const userSkills = res.data.filter(s => s.name === name);
      setSkills(userSkills);
      if (userSkills.length > 0) {
        const u = userSkills[0].user;
        setProfileUser(u);
        // Ratings load karo
        API.get(`/ratings/user/${u._id}`).then(r => setRatings(r.data));
      }
    });
  }, [name]);

  if (!skills.length) return <h2 style={{ padding: '20px' }}>User not found</h2>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>

      {/* Profile Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea, #351851)',
        borderRadius: '16px', padding: '28px',
        color: 'white', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '20px'
      }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '28px', fontWeight: 'bold'
        }}>
          {name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>{name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <RatingStars value={Math.round(ratings.average)} readOnly />
            <span style={{ fontSize: '14px', opacity: 0.9 }}>
              {ratings.average} ({ratings.total} reviews)
            </span>
          </div>
        </div>
        {profileUser?._id !== user?.id && (
          <button
            onClick={() => navigate(`/chat/${profileUser?._id}`)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white', border: '1px solid rgba(255,255,255,0.4)',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'
            }}
          >
            💬 Chat karo
          </button>
        )}
      </div>

      {/* Skills */}
      <h2>Skills</h2>
      {skills.map(s => (
        <div key={s._id} className="card">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ background: '#ece9fc', color: '#5440e0', padding: '4px 10px', borderRadius: '20px', fontSize: '13px' }}>
              ✦ Offers: {s.offer}
            </span>
            <span style={{ background: '#e2f5ee', color: '#1a9e6e', padding: '4px 10px', borderRadius: '20px', fontSize: '13px' }}>
              → Needs: {s.need}
            </span>
            {s.category && (
              <span style={{ background: '#fff0d4', color: '#b86f00', padding: '4px 10px', borderRadius: '20px', fontSize: '13px' }}>
                📁 {s.category}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Reviews */}
      <h2 style={{ marginTop: '28px' }}>
        ⭐ Reviews ({ratings.total})
      </h2>
      {ratings.ratings.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#888' }}>
          Koi review nahi abhi tak.
        </div>
      )}
      {ratings.ratings.map(r => (
        <div key={r._id} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#667eea', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '14px'
            }}>
              {r.from?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <b style={{ fontSize: '14px' }}>{r.from?.name}</b>
              <div style={{ marginTop: '2px' }}>
                <RatingStars value={r.stars} readOnly />
              </div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#888' }}>
              {new Date(r.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
          {r.comment && (
            <p style={{ margin: 0, fontSize: '14px', color: '#444', paddingLeft: '46px' }}>
              "{r.comment}"
            </p>
          )}
        </div>
      ))}
    </div>
  );
}