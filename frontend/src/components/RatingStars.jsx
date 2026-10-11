import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, onChange, readOnly = false, size = 18 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: readOnly ? 'default' : 'pointer',
            color: star <= displayRating ? '#f59e0b' : '#334155',
            transition: 'color 0.15s ease, transform 0.15s ease',
          }}
        >
          <Star
            size={size}
            fill={star <= displayRating ? '#f59e0b' : 'transparent'}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
