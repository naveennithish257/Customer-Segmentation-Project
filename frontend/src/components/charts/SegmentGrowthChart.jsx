import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const SEG_COLORS = {
  'High Income – High Spending': '#00d4ff',
  'High Income – Low Spending': '#a855f7',
  'Low Income – High Spending': '#f59e0b',
  'Low Income – Low Spending': '#ef4444',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: SEG_COLORS[p.name] || p.color, marginBottom: 2 }}>
          {p.name?.split('–')[1]?.trim() || p.name}: <b style={{ color: '#1e293b' }}>{p.value}</b>
        </div>
      ))}
    </div>
  )
}

export default function SegmentGrowthChart({ data = [] }) {
  if (!data.length) return (
    <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>
      No date data available for growth trends
    </div>
  )

  const segments = Object.keys(data[0] || {}).filter(k => k !== 'month')

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={v => <span style={{ color: SEG_COLORS[v] || '#94a3b8', fontSize: 11 }}>{v?.split('–')[1]?.trim() || v}</span>}
        />
        {segments.map(seg => (
          <Line
            key={seg}
            type="monotone"
            dataKey={seg}
            stroke={SEG_COLORS[seg] || '#64748b'}
            strokeWidth={2}
            dot={{ fill: SEG_COLORS[seg] || '#64748b', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
