import React from 'react';

function LogoMark({ size = 36, className = '' }) {
  const uid  = React.useId().replace(/:/g, '');
  const ttId = `tt${uid}`; // top tail gradient
  const btId = `bt${uid}`; // bottom tail gradient

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        {/* Top tail fades toward its tip (down-left) */}
        <linearGradient id={ttId} x1="24" y1="49" x2="10" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#42d6a4" stopOpacity="1"   />
          <stop offset="100%" stopColor="#42d6a4" stopOpacity="0.3" />
        </linearGradient>
        {/* Bottom tail fades toward its tip (up-right) */}
        <linearGradient id={btId} x1="76" y1="51" x2="90" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#42d6a4" stopOpacity="1"   />
          <stop offset="100%" stopColor="#42d6a4" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/*
        TOP chat bubble — body sits upper-right, tail exits bottom-left.
        Body: x 16–92, y 5–49  (rx 13)
        Tail tip: ~(10, 66)
      */}
      {/* Bubble body */}
      <rect x="16" y="5" width="76" height="44" rx="13" fill="#42d6a4" />
      {/* Tail — gently curved triangle, fades at tip */}
      <path
        d="M 28 49 Q 16 49 10 66 Q 20 55 32 49 Z"
        fill={`url(#${ttId})`}
      />

      {/*
        BOTTOM chat bubble — body sits lower-left, tail exits top-right.
        Body: x 8–84, y 51–95  (rx 13)
        Tail tip: ~(90, 34)
      */}
      {/* Bubble body */}
      <rect x="8" y="51" width="76" height="44" rx="13" fill="#42d6a4" />
      {/* Tail — gently curved triangle, fades at tip */}
      <path
        d="M 72 51 Q 84 51 90 34 Q 80 45 68 51 Z"
        fill={`url(#${btId})`}
      />
    </svg>
  );
}

export default function Logo({ showText = true, className = '', size = 36 }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span className="text-xl font-extrabold tracking-widest text-primary uppercase">
          Samuhik
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ className = '', size = 20 }) {
  return <LogoMark size={size} className={className} />;
}
