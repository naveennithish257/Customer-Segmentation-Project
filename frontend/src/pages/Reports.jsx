import React, { useEffect, useState } from 'react'
import apiClient from '../utils/api'
import UploadPrompt from '../components/UploadPrompt'
import DataTable from '../components/DataTable'
import { useApp } from '../context/AppContext'
import { FileText, Download, FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react'

export default function Reports() {
  const { dataLoaded, kpis, uploadInfo } = useApp()
  const [tableData, setTableData] = useState({ data: [], columns: [], total: 0, page: 1, per_page: 20, total_pages: 1 })
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(null)
  const [exportDone, setExportDone] = useState(null)

  const fetchTable = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/api/data', { params: { page, per_page: 20, search } })
      setTableData(data)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => {
    if (dataLoaded) fetchTable()
  }, [dataLoaded])

  const handleExport = async (type) => {
    setExporting(type)
    setExportDone(null)
    try {
      const res = await apiClient.get(`/api/export/${type}`, { responseType: 'blob' })
      const contentType = res.headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        const text = await res.data.text()
        const err = JSON.parse(text)
        throw new Error(err.error || 'Export failed')
      }
      const ext = type === 'pdf' ? 'pdf' : 'xlsx'
      const mime = type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      const url = URL.createObjectURL(new Blob([res.data], { type: mime }))
      const a = document.createElement('a')
      a.href = url
      a.download = `customer_segmentation_report.${ext}`
      a.click()
      URL.revokeObjectURL(url)
      setExportDone(type)
      setTimeout(() => setExportDone(null), 3000)
    } catch (e) {
      console.error('Export failed', e)
      alert(e.message || 'Export failed. Please try again.')
    }
    setExporting(null)
  }

  if (!dataLoaded) return <UploadPrompt />

  const fmt = (v, prefix='', suffix='') => v != null ? `${prefix}${Number(v).toLocaleString()}${suffix}` : '—'

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1400 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Reports</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Generate and export comprehensive customer analysis reports</p>
      </div>

      {/* Export cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
        {/* Dataset summary card */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#00d4ff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>Dataset Summary</div>
              <div style={{ fontSize: 11, color: '#475569' }}>Loaded dataset info</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Total Customers', value: fmt(kpis?.total_customers) },
              { label: 'Segments', value: fmt(kpis?.num_segments) },
              { label: 'Avg Income', value: fmt(kpis?.avg_annual_income, '$', 'k') },
              { label: 'Retention', value: fmt(kpis?.retention_rate, '', '%') },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF export */}
        <div className="glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>PDF Report</div>
                <div style={{ fontSize: 11, color: '#475569' }}>Full analysis with charts</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
              Includes KPI summary, segment analysis, and customer data sample in a professional PDF format.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => handleExport('pdf')}
            disabled={exporting === 'pdf'}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {exporting === 'pdf' ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</> :
             exportDone === 'pdf' ? <><CheckCircle size={14} /> Downloaded!</> :
             <><Download size={14} /> Export PDF</>}
          </button>
        </div>

        {/* Excel export */}
        <div className="glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSpreadsheet size={18} color="#22c55e" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>Excel Report</div>
                <div style={{ fontSize: 11, color: '#475569' }}>Multi-sheet workbook</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>
              3-sheet workbook: full customer data, segment summary, and statistical analysis.
            </p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => handleExport('excel')}
            disabled={exporting === 'excel'}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {exporting === 'excel' ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</> :
             exportDone === 'excel' ? <><CheckCircle size={14} /> Downloaded!</> :
             <><Download size={14} /> Export Excel</>}
          </button>
        </div>
      </div>

      {/* Data preview */}
      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 18px' }}>
          Data Preview
          <span style={{ fontSize: 12, color: '#475569', fontWeight: 400, marginLeft: 10 }}>
            {tableData.total?.toLocaleString()} rows total
          </span>
        </h3>
        <DataTable
          columns={tableData.columns}
          data={tableData.data}
          total={tableData.total}
          page={tableData.page}
          perPage={tableData.per_page}
          totalPages={tableData.total_pages}
          loading={loading}
          onPageChange={(p) => fetchTable(p, '')}
          onSearch={(s) => fetchTable(1, s)}
        />
      </div>
    </div>
  )
}
