import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = { Male: '#00d4ff', Female: '#a855f7', Other: '#f59e0b' }

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const total = payload[0].payload.total
  return (
    <div className="custom-tooltip">
      <div style={{ color: COLORS[name] || '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{name}</div>
      <div>Count: <b style={{ color: '#1e293b' }}>{value?.toLocaleString()}</b></div>
      {total && <div>Share: <b style={{ color: '#1e293b' }}>{((value/total)*100).toFixed(1)}%</b></div>}
    </div>
  )
}

export default function GenderPieChart({ data = [] }) {
  if (!data.length) return (
    <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>No data</div>
  )
  const total = data.reduce((s, d) => s + d.count, 0)
  const enriched = data.map(d => ({ ...d, total }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={enriched}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={4}
          dataKey="count"
          nameKey="gender"
          strokeWidth={0}
        >
          {enriched.map((entry, i) => (
            <Cell key={i} fill={COLORS[entry.gender] || `hsl(${i*120},70%,60%)`} fillOpacity={0.9} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ color: COLORS[value] || '#94a3b8', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
