import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function KPICard({ title, value, subtitle, icon: Icon, color = '#00d4ff', trend, trendValue }) {
  const isPositive = trend === 'up'

  return (
    <div className="kpi-card animate-slide-up" style={{ cursor: 'default' }}>
      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: color, opacity: 0.06, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `rgba(${hexToRgb(color)}, 0.12)`,
          border: `1px solid rgba(${hexToRgb(color)}, 0.2)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        {trendValue !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: isPositive ? '#22c55e' : '#ef4444',
            fontSize: 12, fontWeight: 600,
          }}>
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trendValue}
          </div>
        )}
      </div>

      <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 4 }}>
        {value ?? <span className="skeleton" style={{ display: 'inline-block', width: 80, height: 28 }} />}
      </div>
      <div style={{ fontSize: 13, color: '#475569', fontWeight: 500, marginBottom: 2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{subtitle}</div>}
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
