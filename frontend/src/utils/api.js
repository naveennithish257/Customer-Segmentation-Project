/**
 * api.js - Shared API base URL helper
 *
 * In development:  API calls go to /api/... (proxied by Vite to localhost:5000)
 * In production:   API calls go to the Render backend URL set in .env.production
 */
import axios from 'axios'

const API_BASE =
  typeof __API_BASE__ !== 'undefined' &&
  __API_BASE__ &&
  !__API_BASE__.includes('localhost')
    ? __API_BASE__
    : ''

export const apiUrl = (path) => `${API_BASE}${path}`

const apiClient = axios.create({
  baseURL: API_BASE || undefined,
})

export default apiClient
