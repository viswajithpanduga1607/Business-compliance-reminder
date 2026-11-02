import axios from 'axios';
import {
  getStoredProxyDocs,
  setStoredProxyDocs,
  getStoredProxyHistory,
  setStoredProxyHistory,
} from './proxyData';

/**
 * Axios client instance for BusinessDocument Expiry API.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000, // Quick fallback if backend proxy hangs or is down
});

// Helper: Check if error is a 502 Bad Gateway, 503, 504, or network connection failure
const isBackendUnreachable = (error) => {
  if (!error.response) return true; // Network error, ERR_CONNECTION_REFUSED
  const status = error.response.status;
  return status === 502 || status === 503 || status === 504;
};

// Generate 24-character hexadecimal pseudo-ObjectId
const generateObjectId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return (timestamp + random).toLowerCase();
};

// ── Document Endpoints with Proxy Fallback ────────────────────────────────────

/** GET /api/documents */
export const fetchDocuments = async (status = '') => {
  try {
    const res = await api.get('/documents', { params: status ? { status } : {} });
    return res;
  } catch (error) {
    if (isBackendUnreachable(error)) {
      console.warn('⚠️ [API Service] Backend on port 5000 not detected (502 / Offline). Serving local proxy data.');
      let docs = getStoredProxyDocs();
      if (status) {
        docs = docs.filter((d) => d.status === status);
      }
      docs.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

      return {
        data: {
          success: true,
          count: docs.length,
          data: docs,
          source: 'proxy',
        },
      };
    }
    throw error;
  }
};

/** GET /api/documents/:id */
export const fetchDocumentById = async (id) => {
  try {
    const res = await api.get(`/documents/${id}`);
    return res;
  } catch (error) {
    if (isBackendUnreachable(error)) {
      const docs = getStoredProxyDocs();
      const doc = docs.find((d) => d._id === id);
      if (!doc) {
        throw new Error(`No document found with id: ${id}`);
      }
      return { data: { success: true, data: doc, source: 'proxy' } };
    }
    throw error;
  }
};

/** POST /api/documents */
export const createDocument = async (payload) => {
  try {
    const res = await api.post('/documents', payload);
    return res;
  } catch (error) {
    if (isBackendUnreachable(error)) {
      const docs = getStoredProxyDocs();
      const newDoc = {
        _id: generateObjectId(),
        title: payload.title,
        owner: payload.owner,
        documentType: payload.documentType,
        expiryDate: new Date(payload.expiryDate).toISOString(),
        status: payload.status || 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      docs.push(newDoc);
      setStoredProxyDocs(docs);
      return { data: { success: true, data: newDoc, source: 'proxy' } };
    }
    throw error;
  }
};

/** PUT /api/documents/:id */
export const updateDocument = async (id, payload) => {
  try {
    const res = await api.put(`/documents/${id}`, payload);
    return res;
  } catch (error) {
    if (isBackendUnreachable(error)) {
      const docs = getStoredProxyDocs();
      const idx = docs.findIndex((d) => d._id === id);
      if (idx === -1) throw new Error(`No document found with id: ${id}`);

      docs[idx] = {
        ...docs[idx],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      setStoredProxyDocs(docs);
      return { data: { success: true, data: docs[idx], source: 'proxy' } };
    }
    throw error;
  }
};

/** DELETE /api/documents/:id */
export const deleteDocument = async (id) => {
  try {
    const res = await api.delete(`/documents/${id}`);
    return res;
  } catch (error) {
    if (isBackendUnreachable(error)) {
      let docs = getStoredProxyDocs();
      docs = docs.filter((d) => d._id !== id);
      setStoredProxyDocs(docs);

      let history = getStoredProxyHistory();
      history = history.filter((h) => h.documentId !== id);
      setStoredProxyHistory(history);

      return { data: { success: true, message: 'Document removed from proxy store.', source: 'proxy' } };
    }
    throw error;
  }
};

/** POST /api/documents/:id/renew */
export const renewDocument = async (id, payload) => {
  try {
    const res = await api.post(`/documents/${id}/renew`, payload);
    return res;
  } catch (error) {
    if (isBackendUnreachable(error)) {
      const docs = getStoredProxyDocs();
      const idx = docs.findIndex((d) => d._id === id);
      if (idx === -1) throw new Error(`No document found with id: ${id}`);

      const doc = docs[idx];
      const previousExpiryDate = doc.expiryDate;

      // Recompute status
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      let newStatus = 'Active';
      if (new Date(payload.newExpiryDate) <= now) {
        newStatus = 'Expired';
      } else if (new Date(payload.newExpiryDate) <= thirtyDays) {
        newStatus = 'Expiring Soon';
      }

      doc.expiryDate = new Date(payload.newExpiryDate).toISOString();
      doc.status = newStatus;
      doc.updatedAt = new Date().toISOString();
      setStoredProxyDocs(docs);

      const history = getStoredProxyHistory();
      const historyEntry = {
        _id: generateObjectId(),
        documentId: doc._id,
        previousExpiryDate,
        newExpiryDate: doc.expiryDate,
        renewalDate: new Date().toISOString(),
        completedBy: payload.completedBy,
        createdAt: new Date().toISOString(),
      };
      history.unshift(historyEntry);
      setStoredProxyHistory(history);

      return {
        data: {
          success: true,
          message: `Document renewed successfully (proxy mode). New status: ${newStatus}.`,
          data: { document: doc, renewalHistory: historyEntry },
          source: 'proxy',
        },
      };
    }
    throw error;
  }
};

/** GET /api/documents/:id/history */
export const fetchRenewalHistory = async (id) => {
  try {
    const res = await api.get(`/documents/${id}/history`);
    return res;
  } catch (error) {
    if (isBackendUnreachable(error)) {
      const docs = getStoredProxyDocs();
      const doc = docs.find((d) => d._id === id);
      const history = getStoredProxyHistory()
        .filter((h) => h.documentId === id)
        .sort((a, b) => new Date(b.renewalDate) - new Date(a.renewalDate));

      return {
        data: {
          success: true,
          count: history.length,
          document: doc ? { id: doc._id, title: doc.title } : { id },
          data: history,
          source: 'proxy',
        },
      };
    }
    throw error;
  }
};

/** GET /api/health */
export const fetchHealth = async () => {
  try {
    return await api.get('/health');
  } catch (error) {
    if (isBackendUnreachable(error)) {
      return { data: { status: 'proxy-mode', timestamp: new Date().toISOString() } };
    }
    throw error;
  }
};

export default api;
