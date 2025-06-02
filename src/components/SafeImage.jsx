'use client';
import React, { useState } from 'react';

const SafeImage = ({ src, alt = 'image', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex justify-center">
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`w-auto h-auto border border-gray-900 rounded-2xl ${className}`}
        />
      ) : (
        <div className="w-full h-64 flex items-center justify-center bg-gray-200 text-gray-500 text-sm rounded-2xl border border-gray-900">
          Failed to load image
        </div>
      )}
    </div>
  );
};

export default SafeImage;
