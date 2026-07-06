export default function RatingStars({ value, onChange, readOnly = false }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => !readOnly && onChange && onChange(star)}
          style={{
            fontSize: readOnly ? '16px' : '24px',
            cursor:   readOnly ? 'default' : 'pointer',
            color:    star <= value ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}