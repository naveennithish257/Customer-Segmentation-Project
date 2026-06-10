import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import axios from 'axios'

// In production (GitHub Pages), use the Render backend URL injected at build time.
// In development, use relative /api paths so Vite proxy handles them.
const API_BASE = (typeof __API_BASE__ !== 'undefined' && __API_BASE__ && !__API_BASE__.includes('localhost'))
  ? __API_BASE__
  : ''

const api = (path) => `${API_BASE}${path}`

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [dataLoaded, setDataLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadInfo, setUploadInfo] = useState(null)   // { rows, columns_detected }
  const [kpis, setKpis] = useState(null)
  const [filters, setFilters] = useState({
    age_min: '', age_max: '', gender: 'All',
    income_min: '', income_max: '',
    spending_min: '', spending_max: '',
    segment: 'All', date_from: '', date_to: '',
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { data } = await axios.get(api('/api/health'))
        if (data.data_loaded) {
          setDataLoaded(true)
          if (data.info) {
            setUploadInfo(data.info)
          }
          const kpiRes = await axios.get(api('/api/kpis'))
          setKpis(kpiRes.data)
        }
      } catch (err) {
        console.error('Error restoring session:', err)
      }
    }
    checkHealth()
  }, [])

  const uploadFile = useCallback(async (file) => {
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await axios.post(api('/api/upload'), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDataLoaded(true)
      setKpis(data.kpis)
      setUploadInfo({ rows: data.rows, columns_detected: data.columns_detected })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed. Please try again.'
      setUploadError(msg)
      return { success: false, error: msg }
    } finally {
      setUploading(false)
    }
  }, [])

  const loadSample = useCallback(async () => {
    setUploading(true)
    setUploadError(null)
    try {
      const { data } = await axios.post(api('/api/load-sample'))
      setDataLoaded(true)
      setKpis(data.kpis)
      setUploadInfo({ rows: data.rows, columns_detected: data.columns_detected })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load sample dataset.'
      setUploadError(msg)
      return { success: false, error: msg }
    } finally {
      setUploading(false)
    }
  }, [])

  const clearData = useCallback(async () => {
    try { await axios.post(api('/api/clear')) } catch (_) {}
    setDataLoaded(false)
    setKpis(null)
    setUploadInfo(null)
    setUploadError(null)
    setFilters({
      age_min: '', age_max: '', gender: 'All',
      income_min: '', income_max: '',
      spending_min: '', spending_max: '',
      segment: 'All', date_from: '', date_to: '',
    })
  }, [])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      age_min: '', age_max: '', gender: 'All',
      income_min: '', income_max: '',
      spending_min: '', spending_max: '',
      segment: 'All', date_from: '', date_to: '',
    })
  }, [])

  const filterParams = useMemo(() => (
    Object.entries(filters).reduce((acc, [k, v]) => {
      if (v !== '' && v !== 'All') acc[k] = v
      return acc
    }, {})
  ), [filters])

  return (
    <AppContext.Provider value={{
      dataLoaded, uploading, uploadError, uploadInfo,
      kpis, setKpis,
      filters, filterParams, updateFilter, resetFilters,
      uploadFile, loadSample, clearData,
      sidebarOpen, setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
