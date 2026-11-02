import axios from 'axios';

/**
 * Axios instance pre-configured for the BusinessDocument Expiry API.
 * All relative paths are resolved via the Vite dev-proxy (or the same
 * origin in production), so no hardcoded hostname is needed here.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────────────────────
// Normalise error shape so components always receive { message, errors? }
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    const serverErrors = error.response?.data?.errors || null;

    const normalised = new Error(serverMessage);
    normalised.status = error.response?.status;
    normalised.errors = serverErrors;

    return Promise.reject(normalised);
  }
);

// ── Document endpoints ───────────────────────────────────────────────────────

/** GET /api/documents — sorted closest-expiry first, optional status filter */
export const fetchDocuments = (status = '') =>
  api.get('/documents', { params: status ? { status } : {} });

/** GET /api/documents/:id */
export const fetchDocumentById = (id) => api.get(`/documents/${id}`);

/** POST /api/documents */
export const createDocument = (payload) => api.post('/documents', payload);

/** PUT /api/documents/:id */
export const updateDocument = (id, payload) => api.put(`/documents/${id}`, payload);

/** DELETE /api/documents/:id */
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

/** POST /api/documents/:id/renew */
export const renewDocument = (id, payload) => api.post(`/documents/${id}/renew`, payload);

/** GET /api/documents/:id/history */
export const fetchRenewalHistory = (id) => api.get(`/documents/${id}/history`);

/** GET /api/health */
export const fetchHealth = () => api.get('/health');

export default api;
