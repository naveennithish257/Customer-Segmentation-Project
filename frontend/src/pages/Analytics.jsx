import React, { useEffect, useState, useCallback } from 'react'
import apiClient from '../utils/api'
import UploadPrompt from '../components/UploadPrompt'
import FilterPanel from '../components/FilterPanel'
import AgeDistributionChart from '../components/charts/AgeDistributionChart'
import GenderPieChart from '../components/charts/GenderPieChart'
import PurchaseFrequencyChart from '../components/charts/PurchaseFrequencyChart'
import RevenueContributionChart from '../components/charts/RevenueContributionChart'
import CLVChart from '../components/charts/CLVChart'
import SegmentGrowthChart from '../components/charts/SegmentGrowthChart'
import { useApp } from '../context/AppContext'
import { RefreshCw } from 'lucide-react'

export default function Analytics() {
  const { dataLoaded, filterParams } = useApp()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/analytics', { params: filterParams })
      setAnalytics(data)
    } catch (_) {}
    setLoading(false)
  }, [filterParams])

  useEffect(() => {
    if (dataLoaded) fetchAnalytics()
  }, [dataLoaded, fetchAnalytics])

  if (!dataLoaded) return <UploadPrompt />

  const ChartCard = ({ title, subtitle, children }) => (
    <div className="glass" style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>{subtitle}</p>}
      </div>
      {loading ? (
        <div style={{ height: 260 }}>
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 16, marginBottom: 10, width: `${60+Math.random()*35}%` }} />
          ))}
        </div>
      ) : children}
    </div>
  )

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1400 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Analytics</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Deep-dive into customer behaviour and patterns</p>
        </div>
        <button className="btn-outline" onClick={fetchAnalytics} disabled={loading}>
          <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <FilterPanel showDate={true} showSegment={true} />
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}>
        <ChartCard title="Age Distribution" subtitle="Customer count by age bracket">
          <AgeDistributionChart data={analytics?.age_distribution || []} />
        </ChartCard>

        <ChartCard title="Gender Distribution" subtitle="Breakdown by gender">
          <GenderPieChart data={analytics?.gender_distribution || []} />
        </ChartCard>

        <ChartCard title="Purchase Frequency" subtitle="Number of purchases per customer">
          <PurchaseFrequencyChart data={analytics?.purchase_frequency || []} />
        </ChartCard>

        <ChartCard title="Revenue by Segment" subtitle="Estimated revenue contribution per cluster">
          <RevenueContributionChart data={analytics?.revenue_by_segment || []} />
        </ChartCard>

        <ChartCard title="Customer Lifetime Value" subtitle="Avg CLV by segment (3-year projection)">
          <CLVChart data={analytics?.clv || []} />
        </ChartCard>

        <ChartCard title="Segment Growth Trends" subtitle="Monthly customer additions per segment (requires date column)">
          <SegmentGrowthChart data={analytics?.segment_growth || []} />
        </ChartCard>
      </div>
    </div>
  )
}
