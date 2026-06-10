import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CustomerSegments from './pages/CustomerSegments'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import AIInsights from './pages/AIInsights'
import Settings from './pages/Settings'
import { useApp } from './context/AppContext'
import { Search } from 'lucide-react'

function Topbar() {
  const { } = useApp()

  return (
    <div style={{
      height: 60, borderBottom: '1px solid #e2e8f0',
      background: '#ffffff',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 30,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Search placeholder */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 8, padding: '6px 12px', width: 220,
      }}>
        <Search size={13} color="#94a3b8" />
        <span style={{ fontSize: 13, color: '#94a3b8' }}>Search…</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/segments" element={<CustomerSegments />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
