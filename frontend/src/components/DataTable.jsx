import React, { useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function DataTable({ columns, data, total, page, perPage, totalPages, onPageChange, onSearch, loading }) {
  const [searchVal, setSearchVal] = useState('')

  const handleSearch = useCallback((e) => {
    const v = e.target.value
    setSearchVal(v)
    onSearch?.(v)
  }, [onSearch])

  const formatCell = (val) => {
    if (val === null || val === undefined) return '—'
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return val.toLocaleString()
      return val.toFixed(2)
    }
    return String(val)
  }

  const getSegmentStyle = (val) => {
    const v = String(val)
    if (v.includes('High Income') && v.includes('High Spending')) return { color: '#00d4ff', fontWeight: 600 }
    if (v.includes('High Income') && v.includes('Low Spending'))  return { color: '#a855f7', fontWeight: 600 }
    if (v.includes('Low Income')  && v.includes('High Spending')) return { color: '#f59e0b', fontWeight: 600 }
    if (v.includes('Low Income')  && v.includes('Low Spending'))  return { color: '#ef4444', fontWeight: 600 }
    return {}
  }

  return (
    <div>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} color="#475569" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: 32 }}
            placeholder="Search customers…"
            value={searchVal}
            onChange={handleSearch}
          />
        </div>
        <span style={{ fontSize: 12, color: '#475569' }}>
          {total?.toLocaleString()} total records
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        <table className="data-table">
          <thead>
            <tr>
              {(columns || []).map(col => (
                <th key={col}>{col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {(columns || ['a','b','c','d','e']).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 14, width: '70%' }} /></td>
                  ))}
                </tr>
              ))
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={columns?.length || 1} style={{ textAlign: 'center', color: '#64748b', padding: '32px 16px' }}>
                  No records found
                </td>
              </tr>
            ) : (
              (data || []).map((row, i) => (
                <tr key={i}>
                  {(columns || Object.keys(row)).map(col => (
                    <td key={col} style={col === 'segment' ? getSegmentStyle(row[col]) : {}}>
                      {formatCell(row[col])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#475569' }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { icon: ChevronsLeft,  action: () => onPageChange(1),           disabled: page === 1 },
              { icon: ChevronLeft,   action: () => onPageChange(page - 1),    disabled: page === 1 },
              { icon: ChevronRight,  action: () => onPageChange(page + 1),    disabled: page === totalPages },
              { icon: ChevronsRight, action: () => onPageChange(totalPages),  disabled: page === totalPages },
            ].map(({ icon: Icon, action, disabled }, i) => (
              <button
                key={i}
                onClick={action}
                disabled={disabled}
                className="btn-outline"
                style={{ padding: '6px 10px', opacity: disabled ? 0.35 : 1 }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
