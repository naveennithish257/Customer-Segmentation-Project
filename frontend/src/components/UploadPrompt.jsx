import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudUpload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X, Database } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function UploadPrompt({ compact = false }) {
  const { uploadFile, loadSample, uploading, uploadError, dataLoaded, uploadInfo, clearData } = useApp()
  const [localError, setLocalError] = useState(null)

  const onDrop = useCallback(async (accepted, rejected) => {
    setLocalError(null)
    if (rejected.length > 0) {
      setLocalError('Supported formats: CSV, Excel (.xlsx/.xls), JSON, Pickle (.pkl), or Notebook (.ipynb).')
      return
    }
    if (accepted.length === 0) return
    const result = await uploadFile(accepted[0])
    if (!result.success) setLocalError(result.error)
  }, [uploadFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
      'application/octet-stream': ['.pkl', '.pickle'],
      'application/x-ipynb+json': ['.ipynb'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  const err = uploadError || localError

  if (dataLoaded && compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px',
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: 10,
      }}>
        <CheckCircle size={15} color="#22c55e" />
        <span style={{ fontSize: 12, color: '#86efac', fontWeight: 500 }}>
          {uploadInfo?.rows?.toLocaleString()} customers loaded
        </span>
        <button onClick={clearData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginLeft: 4, display: 'flex', padding: 0 }}>
          <X size={14} />
        </button>
      </div>
    )
  }

  if (!compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24, padding: '40px 20px' }}>
        {/* Floating icon */}
        <div className="animate-float" style={{
          width: 96, height: 96, borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
          border: '1px solid rgba(0,212,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileSpreadsheet size={42} color="#00d4ff" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Upload Your Customer Dataset
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0, maxWidth: 420 }}>
            Upload a <b>CSV</b>, <b>Excel</b>, <b>JSON</b>, <b>Pickle (.pkl)</b>, or <b>Jupyter Notebook (.ipynb)</b> file containing your customer data. The dashboard will automatically segment and analyse your customers.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`upload-zone${isDragActive ? ' dragging' : ''}`}
          style={{ width: '100%', maxWidth: 480, padding: 40, textAlign: 'center' }}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <Loader2 size={36} color="#00d4ff" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ color: '#00d4ff', fontWeight: 600, fontSize: 14 }}>Processing your data…</div>
              <div style={{ color: '#475569', fontSize: 12 }}>Running K-Means clustering & analysis</div>
            </div>
          ) : (
            <>
              <CloudUpload size={40} color={isDragActive ? '#00d4ff' : '#334155'} style={{ marginBottom: 14, transition: 'color 0.2s' }} />
              <div style={{ color: isDragActive ? '#00d4ff' : '#94a3b8', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </div>
              <div style={{ color: '#475569', fontSize: 12, marginBottom: 18 }}>or click to browse</div>
              <button className="btn-primary" style={{ pointerEvents: 'none' }}>
                <CloudUpload size={14} />
                Browse File
              </button>
            </>
          )}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 480 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>or try the demo</span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>

        {/* Load sample button */}
        <button
          onClick={async () => {
            setLocalError(null)
            const result = await loadSample()
            if (!result.success) setLocalError(result.error)
          }}
          disabled={uploading}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 28px',
            background: uploading ? '#f1f5f9' : 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.12))',
            border: '1px solid rgba(0,212,255,0.35)',
            borderRadius: 12, cursor: uploading ? 'not-allowed' : 'pointer',
            color: '#0284c7', fontWeight: 600, fontSize: 14,
            transition: 'all 0.2s',
            opacity: uploading ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.22), rgba(124,58,237,0.22))' }}
          onMouseLeave={e => { if (!uploading) e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.12))' }}
        >
          {uploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Database size={16} />}
          Load Sample Dataset (200 customers)
        </button>

        {err && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 18px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10, maxWidth: 480, width: '100%',
          }}>
            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#fca5a5' }}>{err}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`upload-zone${isDragActive ? ' dragging' : ''}`}
      style={{ padding: '16px 20px', textAlign: 'center', cursor: 'pointer' }}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#00d4ff', fontSize: 13 }}>
          <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
          Processing…
        </div>
      ) : (
        <div style={{ color: '#64748b', fontSize: 13 }}>
          {isDragActive ? '📂 Drop to upload' : '📤 Drop CSV/Excel or click to upload'}
        </div>
      )}
      {err && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{err}</div>}
    </div>
  )
}
