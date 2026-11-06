'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const DEFAULT_FALLBACK = '/Fondpeace.jpg';

/**
 * ⚡ SafeImage: Next.js Optimized Image with Automatic Fallback & Zero Layout Shift
 * Uses modern Next.js Image optimization (AVIF/WebP) when dimensions are provided,
 * with resilient fallback to asynchronous native img decoding.
 */
export default function SafeImage({
  src,
  alt = 'FondPeace media',
  className = '',
  width,
  height,
  fill = false,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 700px, 800px',
  fallbackSrc = DEFAULT_FALLBACK,
  onClick,
  style,
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const cleanSrc = (!hasError && src && typeof src === 'string' && src.trim() !== '') 
    ? src.trim() 
    : fallbackSrc;

  // Use Next.js Image when fill or explicit width/height is provided
  const canUseNextImage = Boolean(cleanSrc && (fill || (width && height)));

  if (canUseNextImage) {
    return (
      <div 
        className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''} ${className}`} 
        style={style} 
        onClick={onClick}
      >
        <Image
          src={cleanSrc}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          priority={priority}
          sizes={sizes}
          loading={priority ? undefined : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${fill ? 'object-contain' : ''}`}
        />
      </div>
    );
  }

  // Universal Fallback img with lazy loading, no-referrer policy, and async decoding
  return (
    <img
      src={cleanSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      onClick={onClick}
      style={style}
      className={`transition-opacity duration-200 ${className}`}
    />
  );
}
