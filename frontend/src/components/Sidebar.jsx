import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, BarChart3, FileText,
  Sparkles, Settings, ChevronLeft, ChevronRight,
  Brain, Upload,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const NAV = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/segments',       icon: Users,           label: 'Customer Segments' },
  { to: '/analytics',      icon: BarChart3,       label: 'Analytics' },
  { to: '/reports',        icon: FileText,        label: 'Reports' },
  { to: '/ai-insights',    icon: Sparkles,        label: 'AI Insights' },
  { to: '/settings',       icon: Settings,        label: 'Settings' },
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, dataLoaded, uploadInfo } = useApp()

  return (
    <aside
      style={{
        width: sidebarOpen ? 240 : 68,
        minWidth: sidebarOpen ? 240 : 68,
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        zIndex: 40,
        flexShrink: 0,
        boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={18} color="#fff" />
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>SegmentIQ</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>AI Analytics</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            title={!sidebarOpen ? label : undefined}
            style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Dataset info */}
      {sidebarOpen && dataLoaded && uploadInfo && (
        <div style={{
          margin: '0 10px 12px',
          padding: '12px',
          background: 'rgba(0,212,255,0.06)',
          border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Upload size={13} color="#00d4ff" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#00d4ff' }}>Dataset Loaded</span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{uploadInfo.rows?.toLocaleString()} customers</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
            {uploadInfo.columns_detected?.length} columns detected
          </div>
        </div>
      )}

      {/* Collapse button */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: sidebarOpen ? 'space-between' : 'center',
            padding: '8px 10px', borderRadius: 8, background: 'transparent',
            border: '1px solid #e2e8f0', cursor: 'pointer',
            color: '#94a3b8', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#0ea5e9'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          {sidebarOpen && <span style={{ fontSize: 12, fontWeight: 500 }}>Collapse</span>}
          {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>
    </aside>
  )
}
