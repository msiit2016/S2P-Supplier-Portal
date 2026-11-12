import React, { useId } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  fillColor?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#10b981',
  fillColor,
  width = 90,
  height = 28,
  className = ''
}) => {
  const reactId = useId().replace(/:/g, '');
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const isFlat = max === min;
  const range = isFlat ? 1 : max - min;
  const padding = 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = isFlat 
      ? height / 2 
      : height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;
  const lastPoint = points[points.length - 1].split(',');
  const gradId = `spark-grad-${color.replace('#', '')}-${reactId}`;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={`overflow-visible shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path 
        d={areaD} 
        fill={`url(#${gradId})`} 
      />
      {/* Stroke line */}
      <path 
        d={pathD} 
        fill="none" 
        stroke={color} 
        strokeWidth="1.75" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* End pulse dot */}
      <circle 
        cx={lastPoint[0]} 
        cy={lastPoint[1]} 
        r="2.5" 
        fill={color} 
        stroke="#ffffff" 
        strokeWidth="1" 
      />
    </svg>
  );
};

