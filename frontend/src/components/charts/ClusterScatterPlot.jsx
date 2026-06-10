import React from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts'

const CustomTooltip = ({ active, payload, xLabel, yLabel }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const formatVal = (val, label) => {
    if (val == null) return '—'
    if (/income/i.test(label)) return `$${val}k`
    return val
  }
  return (
    <div className="custom-tooltip">
      <div style={{ fontWeight: 700, color: d.segment_color || '#00d4ff', marginBottom: 6, fontSize: 13 }}>
        {d.segment || 'Customer'}
      </div>
      {d.customerid !== undefined && <div style={{ color: '#94a3b8', marginBottom: 3 }}>ID: {d.customerid}</div>}
      <div>{xLabel}: <b style={{ color: '#1e293b' }}>{formatVal(d.x, xLabel)}</b></div>
      <div>{yLabel}: <b style={{ color: '#1e293b' }}>{formatVal(d.y, yLabel)}</b></div>
      {d.age && <div>Age: <b style={{ color: '#1e293b' }}>{d.age}</b></div>}
    </div>
  )
}

const SEGMENT_COLORS = {
  'High Income – High Spending': '#00d4ff',
  'High Income – Low Spending': '#a855f7',
  'Low Income – High Spending': '#f59e0b',
  'Low Income – Low Spending': '#ef4444',
}

export default function ClusterScatterPlot({ data = [] }) {
  if (!data.length) return (
    <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 14 }}>
      No data available
    </div>
  )

  const xLabel = data[0]?.x_label || 'X'
  const yLabel = data[0]?.y_label || 'Y'
  const xAxisLabel = /income/i.test(xLabel) ? `${xLabel} (k$)` : xLabel
  const yDomain = /score|spending/i.test(yLabel) ? [0, 100] : ['auto', 'auto']

  const segments = [...new Set(data.map(d => d.segment))]
  const grouped = segments.reduce((acc, seg) => {
    acc[seg] = data.filter(d => d.segment === seg)
    return acc
  }, {})

  return (
    <ResponsiveContainer width="100%" height={380}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="x"
          name={xLabel}
          label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 12 }}
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          tickLine={false}
        />
        <YAxis
          dataKey="y"
          name={yLabel}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, fill: '#475569', fontSize: 12 }}
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
          tickLine={false}
          domain={yDomain}
        />
        <Tooltip content={<CustomTooltip xLabel={xLabel} yLabel={yLabel} />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
        <Legend
          wrapperStyle={{ paddingTop: 20, fontSize: 12, color: '#94a3b8' }}
          formatter={(value) => <span style={{ color: SEGMENT_COLORS[value] || '#94a3b8' }}>{value}</span>}
        />
        {segments.map(seg => (
          <Scatter
            key={seg}
            name={seg}
            data={grouped[seg]}
            fill={grouped[seg][0]?.segment_color || SEGMENT_COLORS[seg] || '#64748b'}
            fillOpacity={0.8}
          >
            {grouped[seg].map((entry, i) => (
              <Cell
                key={i}
                fill={entry.segment_color || SEGMENT_COLORS[seg] || '#64748b'}
                fillOpacity={0.75}
                r={4}
              />
            ))}
          </Scatter>
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
