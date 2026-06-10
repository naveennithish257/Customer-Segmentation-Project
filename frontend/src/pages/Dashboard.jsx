import React, { useEffect, useState } from 'react'
import { Users, DollarSign, ShoppingCart, TrendingUp, PieChart, Heart, RefreshCw } from 'lucide-react'
import axios from 'axios'
import KPICard from '../components/KPICard'
import UploadPrompt from '../components/UploadPrompt'
import { useApp } from '../context/AppContext'
import RevenueContributionChart from '../components/charts/RevenueContributionChart'
import GenderPieChart from '../components/charts/GenderPieChart'

export default function Dashboard() {
  const { dataLoaded, kpis } = useApp()
  const [analytics, setAnalytics] = useState(null)
  const [segSummary, setSegSummary] = useState([])

  useEffect(() => {
    if (!dataLoaded) return
    axios.get('/api/analytics').then(r => setAnalytics(r.data)).catch(() => {})
    axios.get('/api/segments').then(r => setSegSummary(r.data.summary || [])).catch(() => {})
  }, [dataLoaded])

  if (!dataLoaded) return <UploadPrompt />

  const fmt = (v, prefix='', suffix='', decimals=0) =>
    v != null ? `${prefix}${Number(v).toLocaleString(undefined, { maximumFractionDigits: decimals })}${suffix}` : '—'

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
          Dashboard Overview
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Real-time intelligence from your customer dataset
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KPICard title="Total Customers" value={fmt(kpis?.total_customers)} icon={Users} color="#00d4ff" />
        <KPICard title="Total Revenue" value={fmt(kpis?.total_revenue, '$')} icon={DollarSign} color="#22c55e" subtitle="Estimated from dataset" />
        <KPICard title="Avg Spending Score" value={fmt(kpis?.avg_spending_score, '', '/100', 1)} icon={ShoppingCart} color="#f59e0b" />
        <KPICard title="Avg Annual Income" value={fmt(kpis?.avg_annual_income, '$', 'k', 1)} icon={TrendingUp} color="#a855f7" />
        <KPICard title="Customer Segments" value={fmt(kpis?.num_segments)} icon={PieChart} color="#00d4ff" />
        <KPICard title="Retention Rate" value={fmt(kpis?.retention_rate, '', '%', 1)} icon={Heart} color="#f43f5e" subtitle="Score ≥ 50 benchmark" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 18px' }}>Revenue by Segment</h3>
          <RevenueContributionChart data={analytics?.revenue_by_segment || []} />
        </div>
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 18px' }}>Gender Distribution</h3>
          <GenderPieChart data={analytics?.gender_distribution || []} />
        </div>
      </div>

      {/* Segment summary table */}
      {segSummary.length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 18px' }}>Segment Summary</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Customers</th>
                  <th>Share</th>
                  <th>Avg Income</th>
                  <th>Avg Spending</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {segSummary.map((s, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ color: s.color, fontWeight: 600 }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.color, marginRight: 8 }} />
                        {s.segment}
                      </span>
                    </td>
                    <td>{s.count?.toLocaleString()}</td>
                    <td>{s.pct}%</td>
                    <td>{s.avg_income ? `$${s.avg_income}k` : '—'}</td>
                    <td>{s.avg_spending ?? '—'}</td>
                    <td>{s.total_revenue ? `$${s.total_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
