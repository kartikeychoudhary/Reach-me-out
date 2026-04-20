import { useState } from 'react';
import { getInitials } from '../utils/initials.js';

export default function Avatar({ name, src }) {
  const [broken, setBroken] = useState(false);
  const showImage = src && !broken;

  return (
    <div className="avatar-wrap">
      <div className="avatar-ring" />
      <div className="avatar-ring-gap" />
      <div className="avatar-inner">
        {showImage ? (
          <img
            className="avatar-img"
            src={src}
            alt={name || ''}
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="avatar-initials">{getInitials(name)}</span>
        )}
      </div>
    </div>
  );
}
