'use client';
import { useState } from 'react';

export default function Gallery({ images, alt }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="ph big" />;
  return (
    <div className="gallery">
      <img className="main" src={images[i]} alt={alt} />
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((s, n) => (
            <button key={s} className={n === i ? 'on' : ''} onClick={() => setI(n)} aria-label={`ছবি ${n + 1}`}>
              <img src={s} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
