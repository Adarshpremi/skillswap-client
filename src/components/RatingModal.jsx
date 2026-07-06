import { useState } from 'react';
import RatingStars from './RatingStars';
import API from '../api/axios';

export default function RatingModal({ request, onClose, onDone }) {
  const [stars,   setStars]   = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async () => {
    if (!stars) return setError('Please select stars');
    setLoading(true);
    try {
      await API.post('/ratings', {
        to:        request.from?._id || request.from,
        requestId: request._id,
        stars,
        comment
      });
      onDone();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', borderRadius: '16px',
        padding: '28px', width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginBottom: '6px' }}>⭐ Rate this user</h2>
        <p style={{ color: '#888', marginBottom: '20px', fontSize: '14px' }}>
          Rate {request.from?.name}
        </p>

        {error && <p style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>
            Stars
          </label>
          <RatingStars value={stars} onChange={setStars} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>
            Review (optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            style={{
              width: '100%', padding: '10px',
              borderRadius: '8px', border: '1px solid #ddd',
              fontSize: '14px', resize: 'vertical',
              fontFamily: 'Arial', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={submit}
            disabled={loading}
            style={{
              flex: 1, padding: '10px', background: '#667eea',
              color: 'white', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px', background: '#f1f5f9',
              border: 'none', borderRadius: '8px', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}