import React from 'react';

interface Props {
  size?: number;
  color?: string;
}

/** Simple static pickleball paddle + ball icon — no emoji, no animation */
export default function PickleballIcon({ size = 32, color = '#fff' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Paddle head — circle */}
      <circle cx="13" cy="13" r="9" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
      {/* Paddle holes */}
      <circle cx="10" cy="10" r="1.5" fill={color} />
      <circle cx="14" cy="10" r="1.5" fill={color} />
      <circle cx="12" cy="14" r="1.5" fill={color} />
      {/* Paddle handle */}
      <line x1="19.5" y1="19.5" x2="27" y2="27" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Ball */}
      <circle cx="26" cy="7" r="3.5" fill={color} fillOpacity="0.9" stroke={color} strokeWidth="1" />
    </svg>
  );
}
