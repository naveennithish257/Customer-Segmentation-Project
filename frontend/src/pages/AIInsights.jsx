import React, { useEffect, useState } from 'react'
import axios from 'axios'
import UploadPrompt from '../components/UploadPrompt'
import { useApp } from '../context/AppContext'
import { Sparkles, Users, TrendingUp, AlertTriangle, Heart, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

const RISK_COLOR = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444', Unknown: '#64748b' }

function InsightCard({ insight }) {
  const [expanded, setExpanded] = useState(false)
  const color = insight.badge_color || '#00d4ff'

  return (
    <div className="insight-card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{insight.icon || '📊'}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{insight.title || insight.segment}</span>
              <span className="badge" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                {insight.badge}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              {insight.churn_risk && (
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Churn Risk: <b style={{ color: RISK_COLOR[insight.churn_risk] }}>{insight.churn_risk}</b>
                </span>
              )}
              {insight.loyalty_potential && (
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Loyalty: <b style={{ color }}>{insight.loyalty_potential}</b>
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4, flexShrink: 0 }}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Stats row */}
      {insight.stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Customers', value: insight.stats.count?.toLocaleString() },
            { label: 'Share', value: `${insight.stats.pct}%` },
            insight.stats.avg_income && { label: 'Avg Income', value: `$${insight.stats.avg_income}k` },
            insight.stats.avg_spending && { label: 'Avg Score', value: insight.stats.avg_spending },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '7px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Behavior */}
      <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 12px' }}>
        {insight.behavior}
      </p>

      {/* Strategies (expandable) */}
      {expanded && insight.strategy && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recommended Strategies
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insight.strategy.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                <span style={{ color, flexShrink: 0, fontWeight: 700 }}>→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function CustomerList({ title, icon: Icon, color, customers }) {
  if (!customers?.length) return null
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {Object.keys(customers[0] || {}).map(k => <th key={k}>{k.replace(/_/g,' ')}</th>)}
            </tr>
          </thead>
          <tbody>
            {customers.slice(0, 8).map((c, i) => (
              <tr key={i}>
                {Object.entries(c).map(([k, v]) => (
                  <td key={k} style={k === 'segment' ? { color: '#00d4ff', fontWeight: 600 } : {}}>
                    {v != null ? (typeof v === 'number' ? v.toFixed ? Number(v.toFixed(1)) : v : v) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AIInsights() {
  const { dataLoaded } = useApp()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/insights')
      setInsights(data)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { if (dataLoaded) fetch() }, [dataLoaded])

  if (!dataLoaded) return <UploadPrompt />

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1400 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            <span className="gradient-text">AI Insights</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Intelligent analysis and marketing recommendations derived from your customer data
          </p>
        </div>
        <button className="btn-outline" onClick={fetch} disabled={loading}>
          <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      {insights?.summary && (
        <div className="glass" style={{ padding: 20, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="#00d4ff" />
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Largest Segment: <b style={{ color: '#00d4ff' }}>{insights.summary.largest_segment}</b></span>
          </div>
          {insights.summary.dominant_age_group && (
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              Dominant Age: <b style={{ color: '#a855f7' }}>{insights.summary.dominant_age_group}</b>
            </div>
          )}
          {insights.summary.high_engagers_pct != null && (
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              High Engagers: <b style={{ color: '#22c55e' }}>{insights.summary.high_engagers_pct}%</b>
            </div>
          )}
          {insights.summary.dominant_gender && (
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              Dominant Gender: <b style={{ color: '#f59e0b' }}>{insights.summary.dominant_gender}</b>
            </div>
          )}
        </div>
      )}

      {/* Segment insight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16, marginBottom: 24 }}>
        {loading
          ? Array.from({length: 4}).map((_, i) => (
              <div key={i} className="glass" style={{ padding: 22 }}>
                {[80, 60, 100, 70].map((w, j) => (
                  <div key={j} className="skeleton" style={{ height: 14, width: `${w}%`, marginBottom: 12 }} />
                ))}
              </div>
            ))
          : (insights?.segments || []).map((s, i) => <InsightCard key={i} insight={s} />)
        }
      </div>

      {/* High-value & Churn risk tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 16 }}>
        <CustomerList
          title="High-Value Customers"
          icon={TrendingUp}
          color="#00d4ff"
          customers={insights?.high_value_customers}
        />
        <CustomerList
          title="Churn Risk Customers"
          icon={AlertTriangle}
          color="#ef4444"
          customers={insights?.churn_risks}
        />
        <CustomerList
          title="Predicted Loyal Customers"
          icon={Heart}
          color="#22c55e"
          customers={insights?.loyalty_predictions}
        />
      </div>
    </div>
  )
}
