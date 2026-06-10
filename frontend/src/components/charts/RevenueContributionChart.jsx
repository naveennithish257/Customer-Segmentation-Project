import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

const SEG_COLORS = {
  'High Income – High Spending': '#00d4ff',
  'High Income – Low Spending': '#a855f7',
  'Low Income – High Spending': '#f59e0b',
  'Low Income – Low Spending': '#ef4444',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="custom-tooltip">
      <div style={{ color: SEG_COLORS[label] || '#94a3b8', fontWeight: 700, marginBottom: 6, fontSize: 12 }}>{label}</div>
      <div>Revenue: <b style={{ color: '#1e293b' }}>${(d.total_revenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</b></div>
      <div>Share: <b style={{ color: '#1e293b' }}>{d.revenue_pct}%</b></div>
      <div>Customers: <b style={{ color: '#1e293b' }}>{d.count?.toLocaleString()}</b></div>
    </div>
  )
}

export default function RevenueContributionChart({ data = [] }) {
  if (!data.length) return (
    <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>No data</div>
  )

  // Short segment labels for x-axis
  const chartData = data.map(d => ({
    ...d,
    shortName: d.segment?.split(' – ').map(p => p.split(' ')[0][0]).join('/') + ' ' + d.segment?.split(' – ').map(p => p.split(' ').slice(-1)[0][0]).join('/'),
    label: d.segment,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="segment" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false}
          tickFormatter={v => v?.split('–')[1]?.trim().slice(0, 12) || v?.slice(0, 12)} />
        <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
        <Bar dataKey="total_revenue" radius={[6,6,0,0]} maxBarSize={52}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={SEG_COLORS[entry.segment] || '#64748b'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
