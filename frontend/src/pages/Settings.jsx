import React, { useState } from 'react'
import UploadPrompt from '../components/UploadPrompt'
import { useApp } from '../context/AppContext'
import { Trash2, Upload, Moon, Bell, Globe, Shield, Cpu } from 'lucide-react'

export default function Settings() {
  const { dataLoaded, clearData, uploadInfo } = useApp()
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000')
  const [clusters, setClusters] = useState('4')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Section = ({ title, icon: Icon, children }) => (
    <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Icon size={16} color="#00d4ff" />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )

  const ToggleSetting = ({ label, description, defaultChecked = false }) => {
    const [on, setOn] = useState(defaultChecked)
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', marginBottom: 2 }}>{label}</div>
          {description && <div style={{ fontSize: 11, color: '#475569' }}>{description}</div>}
        </div>
        <button
          onClick={() => setOn(!on)}
          style={{
            width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: on ? 'linear-gradient(135deg, #00d4ff, #0ea5e9)' : 'rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.25s ease', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: on ? 21 : 3,
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            transition: 'left 0.25s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }} />
        </button>
      </div>
    )
  }

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Settings</h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Configure your dashboard preferences and data options</p>
      </div>

      {/* Data Management */}
      <Section title="Data Management" icon={Upload}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>Current Dataset</div>
          {dataLoaded && uploadInfo ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#86efac' }}>✓ Dataset loaded</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{uploadInfo.rows?.toLocaleString()} rows · {uploadInfo.columns_detected?.join(', ')}</div>
              </div>
              <button
                onClick={clearData}
                className="btn-outline"
                style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '6px 12px', fontSize: 12 }}
              >
                <Trash2 size={13} /> Clear Data
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <UploadPrompt compact />
            </div>
          )}
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            K-Means Clusters
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['3','4','5','6'].map(n => (
              <button
                key={n}
                onClick={() => setClusters(n)}
                style={{
                  padding: '6px 16px', borderRadius: 8, border: `1px solid ${clusters === n ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`,
                  background: clusters === n ? 'rgba(0,212,255,0.1)' : 'transparent',
                  color: clusters === n ? '#00d4ff' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Number of customer segments. Default: 4 (optimal for standard datasets)</p>
        </div>
      </Section>

      {/* API Configuration */}
      <Section title="API Configuration" icon={Globe}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Backend URL</label>
          <input
            className="input-field"
            value={backendUrl}
            onChange={e => setBackendUrl(e.target.value)}
            placeholder="http://localhost:5000"
          />
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={Moon}>
        <ToggleSetting label="Dark Mode" description="Currently active dark theme" defaultChecked={true} />
        <ToggleSetting label="Glassmorphism Effects" description="Blur and transparency effects on cards" defaultChecked={true} />
        <ToggleSetting label="Smooth Animations" description="Page and chart transition animations" defaultChecked={true} />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <ToggleSetting label="Upload Success Alerts" description="Show notification on successful file upload" defaultChecked={true} />
        <ToggleSetting label="Export Completion Alerts" description="Notify when PDF/Excel export is ready" defaultChecked={true} />
      </Section>

      {/* About */}
      <Section title="About SegmentIQ" icon={Cpu}>
        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>
          <div style={{ marginBottom: 8 }}><b style={{ color: '#94a3b8' }}>Version:</b> 1.0.0</div>
          <div style={{ marginBottom: 8 }}><b style={{ color: '#94a3b8' }}>ML Engine:</b> Scikit-learn K-Means Clustering</div>
          <div style={{ marginBottom: 8 }}><b style={{ color: '#94a3b8' }}>Frontend:</b> React 19 + Tailwind CSS v4 + Recharts</div>
          <div><b style={{ color: '#94a3b8' }}>Backend:</b> Python Flask + Pandas + NumPy</div>
        </div>
      </Section>

      <button className="btn-primary" onClick={handleSave} style={{ marginTop: 8 }}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
