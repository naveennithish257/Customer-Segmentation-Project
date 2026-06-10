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
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '80vh', padding: '24px 32px',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 32, width: '100%', maxWidth: 900,
          alignItems: 'center',
        }}>
          {/* Left: Info + Sample button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))',
              border: '1px solid rgba(0,212,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileSpreadsheet size={34} color="#00d4ff" />
            </div>

            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.2 }}>
                Upload Your Customer Dataset
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                Drop a <b>CSV</b>, <b>Excel</b>, <b>JSON</b>, <b>Pickle</b>, or <b>Notebook</b> file and the dashboard will auto-segment and analyse your customers using K-Means clustering.
              </p>
            </div>

            {/* Supported formats */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['.csv', '.xlsx', '.xls', '.json', '.pkl', '.ipynb'].map(ext => (
                <span key={ext} style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 8px',
                  background: 'rgba(15,23,42,0.06)', borderRadius: 6, color: '#475569',
                  border: '1px solid #e2e8f0',
                }}>{ext}</span>
              ))}
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>or try with sample data</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            {/* Load Sample button — always visible */}
            <button
              id="load-sample-btn"
              onClick={async () => {
                setLocalError(null)
                const result = await loadSample()
                if (!result.success) setLocalError(result.error)
              }}
              disabled={uploading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '13px 24px',
                background: uploading ? '#f1f5f9' : 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.12))',
                border: '1.5px solid rgba(0,212,255,0.4)',
                borderRadius: 12, cursor: uploading ? 'not-allowed' : 'pointer',
                color: '#0284c7', fontWeight: 700, fontSize: 14,
                transition: 'all 0.2s', opacity: uploading ? 0.6 : 1,
                width: '100%',
              }}
              onMouseEnter={e => { if (!uploading) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.22), rgba(124,58,237,0.22))'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.7)' } }}
              onMouseLeave={e => { if (!uploading) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.12))'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)' } }}
            >
              {uploading
                ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                : <Database size={16} />}
              Load Sample Dataset (200 customers)
            </button>

            {err && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10,
              }}>
                <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#fca5a5' }}>{err}</span>
              </div>
            )}
          </div>

          {/* Right: Drag-and-drop zone */}
          <div
            {...getRootProps()}
            className={`upload-zone${isDragActive ? ' dragging' : ''}`}
            style={{ padding: '40px 24px', textAlign: 'center', height: '100%', minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Loader2 size={36} color="#00d4ff" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ color: '#00d4ff', fontWeight: 600, fontSize: 14 }}>Processing your data…</div>
                <div style={{ color: '#475569', fontSize: 12 }}>Running K-Means clustering & analysis</div>
              </div>
            ) : (
              <>
                <CloudUpload size={44} color={isDragActive ? '#00d4ff' : '#334155'} style={{ marginBottom: 16, transition: 'color 0.2s' }} />
                <div style={{ color: isDragActive ? '#00d4ff' : '#94a3b8', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </div>
                <div style={{ color: '#475569', fontSize: 12, marginBottom: 20 }}>or click to browse your files</div>
                <button className="btn-primary" style={{ pointerEvents: 'none' }}>
                  <CloudUpload size={14} />
                  Browse File
                </button>
              </>
            )}
          </div>
        </div>
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
