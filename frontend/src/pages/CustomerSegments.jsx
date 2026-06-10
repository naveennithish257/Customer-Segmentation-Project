import React, { useEffect, useState } from 'react'
import apiClient from '../utils/api'
import UploadPrompt from '../components/UploadPrompt'
import ClusterScatterPlot from '../components/charts/ClusterScatterPlot'
import DataTable from '../components/DataTable'
import { useApp } from '../context/AppContext'
import { Users, TrendingUp, DollarSign } from 'lucide-react'

const SEG_COLORS = {
  'High Income – High Spending': '#00d4ff',
  'High Income – Low Spending': '#a855f7',
  'Low Income – High Spending': '#f59e0b',
  'Low Income – Low Spending': '#ef4444',
}

const SEG_ICONS = {
  'High Income – High Spending': '💎',
  'High Income – Low Spending': '🎯',
  'Low Income – High Spending': '🔥',
  'Low Income – Low Spending': '📈',
}

export default function CustomerSegments() {
  const { dataLoaded } = useApp()
  const [scatter, setScatter] = useState([])
  const [summary, setSummary] = useState([])
  const [tableData, setTableData] = useState({ data: [], columns: [], total: 0, page: 1, per_page: 20, total_pages: 1 })
  const [loading, setLoading] = useState(false)
  const [selectedSeg, setSelectedSeg] = useState(null)

  const fetchTable = async (page = 1, search = '', seg = null) => {
    setLoading(true)
    try {
      const params = { page, per_page: 20, search }
      if (seg) params.segment = seg
      const { data } = await apiClient.get('/api/data', { params })
      setTableData(data)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => {
    if (!dataLoaded) return
    apiClient.get('/api/segments').then(r => {
      setScatter(r.data.scatter || [])
      setSummary(r.data.summary || [])
    }).catch(() => {})
    fetchTable()
  }, [dataLoaded])

  if (!dataLoaded) return <UploadPrompt />

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1400 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Customer Segments</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>K-Means clustering — Income vs Spending Score</p>
      </div>

      {/* Scatter plot */}
      <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>Cluster Scatter Plot</h3>
          <span style={{ fontSize: 12, color: '#475569' }}>{scatter.length.toLocaleString()} data points</span>
        </div>
        <ClusterScatterPlot data={scatter} />
      </div>

      {/* Segment cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 24 }}>
        {summary.map((seg, i) => {
          const color = seg.color || SEG_COLORS[seg.segment] || '#64748b'
          const isSelected = selectedSeg === seg.segment
          return (
            <div
              key={i}
              onClick={() => {
                const next = isSelected ? null : seg.segment
                setSelectedSeg(next)
                fetchTable(1, '', next)
              }}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${color}18, ${color}08)`
                  : '#ffffff',
                border: `1px solid ${isSelected ? color : '#e2e8f0'}`,
                borderRadius: 14, padding: 20, cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isSelected ? `0 4px 16px ${color}22` : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{SEG_ICONS[seg.segment] || '📊'}</span>
                <div style={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{seg.segment}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Customers', value: seg.count?.toLocaleString(), icon: Users },
                  { label: 'Share', value: `${seg.pct}%`, icon: TrendingUp },
                  seg.avg_income ? { label: 'Avg Income', value: `$${seg.avg_income}k` } : null,
                  seg.avg_spending ? { label: 'Avg Score', value: seg.avg_spending } : null,
                ].filter(Boolean).map((item, j) => (
                  <div key={j} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {isSelected && (
                <div style={{ marginTop: 10, fontSize: 11, color, textAlign: 'center', fontWeight: 600 }}>
                  ✓ Filtered below
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Customer table */}
      <div className="glass" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Customer Records {selectedSeg && <span style={{ color: SEG_COLORS[selectedSeg], fontSize: 13 }}>— {selectedSeg}</span>}
          </h3>
          {selectedSeg && (
            <button className="btn-outline" onClick={() => { setSelectedSeg(null); fetchTable(1, '') }} style={{ fontSize: 12, padding: '5px 12px' }}>
              Clear filter
            </button>
          )}
        </div>
        <DataTable
          columns={tableData.columns}
          data={tableData.data}
          total={tableData.total}
          page={tableData.page}
          perPage={tableData.per_page}
          totalPages={tableData.total_pages}
          loading={loading}
          onPageChange={(p) => fetchTable(p, '', selectedSeg)}
          onSearch={(s) => fetchTable(1, s, selectedSeg)}
        />
      </div>
    </div>
  )
}
