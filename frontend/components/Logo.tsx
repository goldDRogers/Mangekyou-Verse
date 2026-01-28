
import React from 'react';

interface LogoProps {
  className?: string;
  glow?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", glow = true }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Glow Effect */}
      {glow && (
        <div className="absolute inset-0 rounded-full bg-brand-primary/30 blur-xl animate-pulse-glow"></div>
      )}
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_0_10px_rgba(183,148,244,0.8)]"
      >
        {/* Eye Base Gradient */}
        <defs>
          <radialGradient id="eyeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#2D1152" />
            <stop offset="70%" stopColor="#5a2e98" />
            <stop offset="100%" stopColor="#0f1011" />
          </radialGradient>
          
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="transparent" />
            <stop offset="100%" stopColor="#b794f4" stopOpacity="0.6" />
          </radialGradient>

          {/* Tomoe Shape Definition */}
          <path id="tomoe" d="M0 -4C0 -4 3 -4 4 -1C5 2 2 4 0 4C-2 4 -4 2 -4 0C-4 -2 -2 -4 0 -4ZM0 -4C-1 -6 -3 -7 -5 -7C-8 -7 -10 -5 -10 -2C-10 1 -7 4 -4 4" fill="black" />
        </defs>

        {/* Outer Border */}
        <circle cx="50%" cy="50%" r="48" stroke="#b794f4" strokeWidth="0.5" fill="url(#eyeGradient)" />
        <circle cx="50%" cy="50%" r="48" fill="url(#glowGradient)" />

        {/* Ripple Rings */}
        <circle cx="50" cy="50" r="15" stroke="black" strokeWidth="1" opacity="0.4" fill="none" />
        <circle cx="50" cy="50" r="30" stroke="black" strokeWidth="1" opacity="0.4" fill="none" />

        {/* Central Pupil */}
        <circle cx="50" cy="50" r="5" fill="black" />

        {/* Tomoes - 6 patterns (3 inner, 3 outer) */}
        <g transform="translate(50, 50)">
          {/* Inner 3 Tomoes */}
          <g transform="rotate(0)">
            <use href="#tomoe" transform="translate(0, -15) scale(0.6)" />
          </g>
          <g transform="rotate(120)">
            <use href="#tomoe" transform="translate(0, -15) scale(0.6)" />
          </g>
          <g transform="rotate(240)">
            <use href="#tomoe" transform="translate(0, -15) scale(0.6)" />
          </g>

          {/* Outer 3 Tomoes */}
          <g transform="rotate(60)">
            <use href="#tomoe" transform="translate(0, -30) scale(0.8)" />
          </g>
          <g transform="rotate(180)">
            <use href="#tomoe" transform="translate(0, -30) scale(0.8)" />
          </g>
          <g transform="rotate(300)">
            <use href="#tomoe" transform="translate(0, -30) scale(0.8)" />
          </g>
        </g>
        
        {/* Reflection Highlight */}
        <circle cx="35" cy="35" r="2" fill="white" fillOpacity="0.6" />
      </svg>
    </div>
  );
};

export default Logo;
