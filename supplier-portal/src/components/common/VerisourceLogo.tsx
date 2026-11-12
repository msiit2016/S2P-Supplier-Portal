import React, { useId } from 'react';

export interface VerisourceLogoProps {
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Display mode */
  variant?: 'full' | 'mark' | 'stacked';
  /** Mark container style */
  markStyle?: 'tile' | 'flat';
  /** Color theme for text (dark = white text for dark navbars, light = dark text for white pages) */
  theme?: 'dark' | 'light';
  /** Show subtle enterprise tagline beneath wordmark */
  showTagline?: boolean;
  /** Custom tagline text */
  taglineText?: string;
  /** Custom className for the container */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

export const VerisourceLogo: React.FC<VerisourceLogoProps> = ({
  size = 'md',
  variant = 'full',
  markStyle = 'tile',
  theme = 'dark',
  showTagline = false,
  taglineText = 'Autonomous Supplier Network',
  className = '',
  onClick
}) => {
  const reactId = useId().replace(/:/g, '');

  // Dimensions configuration
  const sizeMap = {
    xs: { mark: 22, text: 'text-xs', sub: 'text-[9px]', gap: 'gap-2' },
    sm: { mark: 28, text: 'text-sm', sub: 'text-[10px]', gap: 'gap-2.5' },
    md: { mark: 34, text: 'text-base', sub: 'text-[10px]', gap: 'gap-2.5' },
    lg: { mark: 42, text: 'text-xl', sub: 'text-xs', gap: 'gap-3' },
    xl: { mark: 52, text: 'text-2xl', sub: 'text-xs', gap: 'gap-3.5' }
  };

  const currentSize = sizeMap[size];

  // SVG Geometric Logomark: The Verisource Interlocking Trust "V"
  // Features two converging precision geometric facets forming an aerodynamic "V"
  // with an embedded cryptographic verification diamond at the apex.
  const markElement = (
    <div
      style={{ width: `${currentSize.mark}px`, height: `${currentSize.mark}px` }}
      className={`relative shrink-0 flex items-center justify-center select-none group ${
        markStyle === 'tile' ? 'shadow-lg shadow-emerald-950/20' : ''
      }`}
    >
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform transition-all duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Tile Background Gradient */}
          <linearGradient id={`vs-bg-${reactId}`} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="60%" stopColor="#091024" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Left Wing Gradient (Deep Emerald -> Electric Teal) */}
          <linearGradient id={`vs-left-${reactId}`} x1="8" y1="8" x2="22" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Right Verification Wing Gradient (Electric Teal -> Vivid Cyan -> Azure) */}
          <linearGradient id={`vs-right-${reactId}`} x1="18" y1="34" x2="36" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="45%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Core Apex Diamond Glow */}
          <linearGradient id={`vs-core-${reactId}`} x1="16" y1="18" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Ambient Drop Shadow for Right Wing Elevation */}
          <filter id={`vs-shadow-${reactId}`} x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#06b6d4" floodOpacity="0.35" />
          </filter>
        </defs>

        {markStyle === 'tile' && (
          <>
            {/* 1. Squircle Badge Canvas */}
            <rect
              width="44"
              height="44"
              rx="12"
              fill={`url(#vs-bg-${reactId})`}
            />
            {/* Subtle Ambient Border Ring */}
            <rect
              width="43"
              height="43"
              x="0.5"
              y="0.5"
              rx="11.5"
              stroke="#334155"
              strokeOpacity="0.6"
              strokeWidth="1"
            />
          </>
        )}

        {/* 2. Left Wing of Monogram "V" (Descending anchor facet) */}
        <path
          d="M10.5 11C10.5 9.9 11.4 9 12.5 9H16.2C17.05 9 17.8 9.5 18.15 10.3L22 20.8L17.5 30.5C17.2 31.15 16.5 31.6 15.7 31.6H12.5C11.4 31.6 10.5 30.7 10.5 29.6V11Z"
          fill={`url(#vs-left-${reactId})`}
        />

        {/* 3. Sweeping Right Verification Wing (Intersects apex, shoots upward) */}
        <path
          d="M17.2 32.2L22 22L27.2 10.4C27.55 9.55 28.35 9 29.3 9H32C33.1 9 34 9.9 34 11V11.8C34 12.4 33.7 12.95 33.2 13.3L23.8 32.2C23.3 33.2 22.25 33.8 21.1 33.8H18.8C17.9 33.8 17.2 33.1 17.2 32.2Z"
          fill={`url(#vs-right-${reactId})`}
          filter={`url(#vs-shadow-${reactId})`}
        />

        {/* 4. Precision Luminous Apex Diamond (Represents verified truth/data node) */}
        <path
          d="M22 17.5L25.8 23L22 27.5L18.2 23L22 17.5Z"
          fill={`url(#vs-core-${reactId})`}
        />

        {/* 5. Micro Check Notch Overlay */}
        <path
          d="M19.5 23L21.2 24.7L24.5 20.5"
          stroke="#091024"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  if (variant === 'mark') {
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex items-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        {markElement}
      </div>
    );
  }

  // Wordmark element
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const dotColor = isDark ? 'text-emerald-400' : 'text-emerald-600';
  const subColor = isDark ? 'text-slate-400' : 'text-slate-500';

  const wordmark = (
    <div className={`flex flex-col ${variant === 'stacked' ? 'items-center text-center mt-1.5' : 'justify-center min-w-0'}`}>
      <div className={`font-black tracking-tight leading-none ${currentSize.text} ${textColor} flex items-center`}>
        <span>Verisource</span>
        <span className={`${dotColor} ml-0.5 font-bold`}>.</span>
      </div>
      {showTagline && (
        <span className={`font-medium tracking-normal mt-0.5 truncate ${currentSize.sub} ${subColor}`}>
          {taglineText}
        </span>
      )}
    </div>
  );

  return (
    <div
      onClick={onClick}
      className={`inline-flex ${
        variant === 'stacked' ? 'flex-col items-center' : `items-center ${currentSize.gap}`
      } ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {markElement}
      {wordmark}
    </div>
  );
};
