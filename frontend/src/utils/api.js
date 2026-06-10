/**
 * api.js - Shared API base URL helper
 *
 * In development:  API calls go to /api/... (proxied by Vite to localhost:5000)
 * In production:   API calls go to the Render backend URL set in .env.production
 */
import axios from 'axios'

// Helper to generate or retrieve a unique session ID for this browser session
const getSessionId = () => {
  let id = sessionStorage.getItem('segment_iq_session_id')
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessionStorage.setItem('segment_iq_session_id', id)
  }
  return id
}

const sessionId = getSessionId()

// Set session ID header for the default axios instance
axios.defaults.headers.common['X-Session-ID'] = sessionId

const API_BASE =
  typeof __API_BASE__ !== 'undefined' &&
  __API_BASE__ &&
  !__API_BASE__.includes('localhost')
    ? __API_BASE__
    : ''

export const apiUrl = (path) => `${API_BASE}${path}`

const apiClient = axios.create({
  baseURL: API_BASE || undefined,
  headers: {
    'X-Session-ID': sessionId,
  },
})

export default apiClient

