import React from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'

const GENDERS = ['All', 'Male', 'Female', 'Other']
const SEGMENTS = [
  'All',
  'High Income – High Spending',
  'High Income – Low Spending',
  'Low Income – High Spending',
  'Low Income – Low Spending',
]

export default function FilterPanel({ showSegment = true, showDate = true }) {
  const { filters, updateFilter, resetFilters } = useApp()

  return (
    <div className="glass" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={15} color="#00d4ff" />
          <span style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>Filters</span>
        </div>
        <button className="btn-outline" onClick={resetFilters} style={{ padding: '5px 10px', fontSize: 12 }}>
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {/* Age range */}
        <div>
          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age Range</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="input-field" type="number" placeholder="Min" value={filters.age_min}
              onChange={e => updateFilter('age_min', e.target.value)} min={0} max={100} />
            <input className="input-field" type="number" placeholder="Max" value={filters.age_max}
              onChange={e => updateFilter('age_max', e.target.value)} min={0} max={100} />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</label>
          <select className="input-field" value={filters.gender} onChange={e => updateFilter('gender', e.target.value)}>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Income */}
        <div>
          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Income (k$)</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="input-field" type="number" placeholder="Min" value={filters.income_min}
              onChange={e => updateFilter('income_min', e.target.value)} min={0} />
            <input className="input-field" type="number" placeholder="Max" value={filters.income_max}
              onChange={e => updateFilter('income_max', e.target.value)} min={0} />
          </div>
        </div>

        {/* Spending score */}
        <div>
          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spending Score</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="input-field" type="number" placeholder="Min" value={filters.spending_min}
              onChange={e => updateFilter('spending_min', e.target.value)} min={0} max={100} />
            <input className="input-field" type="number" placeholder="Max" value={filters.spending_max}
              onChange={e => updateFilter('spending_max', e.target.value)} min={0} max={100} />
          </div>
        </div>

        {/* Segment */}
        {showSegment && (
          <div>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Segment</label>
            <select className="input-field" value={filters.segment} onChange={e => updateFilter('segment', e.target.value)}>
              {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Date range */}
        {showDate && (
          <>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date From</label>
              <input className="input-field" type="date" value={filters.date_from}
                onChange={e => updateFilter('date_from', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date To</label>
              <input className="input-field" type="date" value={filters.date_to}
                onChange={e => updateFilter('date_to', e.target.value)} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
