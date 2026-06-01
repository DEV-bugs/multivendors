import React, { useState } from 'react';
import { motion } from 'motion/react';

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface AreaChartProps {
  data: DataPoint[];
  color?: string;
  secondaryColor?: string;
  height?: number;
  currencyPrefix?: string;
  showToggle?: boolean;
}

export const DynamicAreaChart: React.FC<AreaChartProps> = ({
  data,
  color = '#3B82F6', // Blue
  secondaryColor = '#10B981', // Green
  height = 200,
  currencyPrefix = '$',
  showToggle = false
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeSeries, setActiveSeries] = useState<'primary' | 'secondary'>('primary');

  const padding = 35;
  const chartWidth = 500;
  const chartHeight = height;

  const values = data.map(d => activeSeries === 'primary' ? d.value : (d.secondaryValue || 0));
  const maxVal = Math.max(...values, 100) * 1.15;
  const minVal = 0;

  // Coordinate mapping
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
    const currVal = activeSeries === 'primary' ? d.value : (d.secondaryValue || 0);
    const y = chartHeight - padding - ((currVal - minVal) / (maxVal - minVal)) * (chartHeight - padding * 2);
    return { x, y, label: d.label, val: currVal };
  });

  // Construct SVG Path
  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;
  }

  const activeColor = activeSeries === 'primary' ? color : secondaryColor;

  return (
    <div className="w-full">
      {showToggle && (
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => setActiveSeries('primary')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
              activeSeries === 'primary'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Gross Volume (GMV)
          </button>
          <button
            onClick={() => setActiveSeries('secondary')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
              activeSeries === 'secondary'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Fees Captured (10%)
          </button>
        </div>
      )}

      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id={`gradient-${activeColor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.32" />
              <stop offset="100%" stopColor={activeColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * (chartHeight - padding * 2);
            const val = maxVal - ratio * (maxVal - minVal);
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  fill="#94A3B8"
                  fontSize="9.5"
                  className="font-mono text-right"
                  textAnchor="end"
                >
                  {currencyPrefix}{Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Path and Area with nice animations */}
          {points.length > 0 && (
            <>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                d={pathD}
                fill="none"
                stroke={activeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                d={areaD}
                fill={`url(#gradient-${activeColor})`}
              />
            </>
          )}

          {/* X Axis labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={chartHeight - 12}
              fill="#94A3B8"
              fontSize="9"
              textAnchor="middle"
              className="font-mono"
            >
              {p.label}
            </text>
          ))}

          {/* Core Interactive dots */}
          {points.map((p, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible touch catcher */}
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
              
              {/* Interactive glowing outer ring */}
              {hoveredIndex === i && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="7"
                  fill={activeColor}
                  fillOpacity="0.25"
                  className="animate-ping"
                />
              )}
              
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? '5' : '3.5'}
                fill={hoveredIndex === i ? activeColor : '#FFFFFF'}
                stroke={activeColor}
                strokeWidth="2"
                className="transition-all duration-150"
              />
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute bg-slate-900 text-white rounded-lg px-2.5 py-1.5 shadow-xl text-xs pointer-events-none border border-slate-700 animate-fadeIn"
            style={{
              left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
              top: `${(points[hoveredIndex].y / chartHeight) * 100 - 45}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-slate-400">{points[hoveredIndex].label}</div>
            <div className="font-mono text-blue-400 font-bold">
              {currencyPrefix}{points[hoveredIndex].val.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DynamicBarChart: React.FC<{ data: DataPoint[]; height?: number; color?: string }> = ({
  data,
  height = 200,
  color = '#F59E0B'
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const padding = 30;
  const chartWidth = 500;
  const chartHeight = height;

  const maxVal = Math.max(...data.map(d => d.value), 10) * 1.1;
  const barWidth = Math.min(30, (chartWidth - padding * 2) / (data.length * 1.5));
  const spacing = (chartWidth - padding * 2) / data.length;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
        {/* Horizontal background grids */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * (chartHeight - padding * 2);
          const val = maxVal - ratio * maxVal;
          return (
            <g key={i} className="opacity-40">
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <text x={padding - 6} y={y + 3} fill="#94A3B8" fontSize="8.5" textAnchor="end" className="font-mono">
                {Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* Dynamic Bars */}
        {data.map((d, i) => {
          const x = padding + i * spacing + (spacing - barWidth) / 2;
          const barHeight = (d.value / maxVal) * (chartHeight - padding * 2);
          const y = chartHeight - padding - barHeight;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={padding}
                width={barWidth}
                height={chartHeight - padding * 2}
                fill="transparent"
              />
              <motion.rect
                initial={{ height: 0, y: chartHeight - padding }}
                animate={{ height: barHeight, y }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.04 }}
                x={x}
                width={barWidth}
                rx="3"
                fill={hoveredIdx === i ? '#475569' : color}
                className="transition-colors duration-150"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 12}
                fill="#94A3B8"
                fontSize="8"
                textAnchor="middle"
                className="font-mono truncate"
              >
                {d.label.length > 7 ? d.label.substring(0, 6) + '..' : d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="absolute bg-slate-900 text-white rounded-lg px-2 py-1 shadow-md text-xs pointer-events-none border border-slate-700 animate-fadeIn"
          style={{
            left: `${(padding + hoveredIdx * spacing + spacing / 2) / chartWidth * 100}%`,
            bottom: '40px',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold">{data[hoveredIdx].label}</div>
          <div className="font-bold text-amber-400 font-mono">{data[hoveredIdx].value} units</div>
        </div>
      )}
    </div>
  );
};

export const FunnelGauge: React.FC = () => {
  const stages = [
    { label: 'Storefront Impressions', count: 18450, rate: '100%' },
    { label: 'Product Clicks', count: 9120, rate: '49.4%' },
    { label: 'Add To Basket', count: 2430, rate: '26.6%' },
    { label: 'Completed Checkout', count: 680, rate: '27.9%' },
  ];

  return (
    <div className="space-y-3.5">
      {stages.map((st, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700">{st.label}</span>
            <span className="font-mono text-slate-500">{st.count.toLocaleString()} ({st.rate})</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: st.rate !== '100%' ? st.rate : '100%' }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className={`h-full rounded-full ${
                i === 0 ? 'bg-indigo-600' :
                i === 1 ? 'bg-blue-500' :
                i === 2 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
