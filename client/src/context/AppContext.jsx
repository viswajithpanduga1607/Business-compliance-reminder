import React, { createContext, useCallback, useContext, useReducer } from 'react';
import {
  createDocument,
  deleteDocument,
  fetchDocumentById,
  fetchDocuments,
  fetchRenewalHistory,
  renewDocument,
  updateDocument,
} from '../services/api';

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  documents: [],          // prioritised list (sorted by expiryDate ASC from API)
  activeDocument: null,   // single document loaded for detail / renewal
  renewalHistory: [],     // audit trail for the active document
  loading: false,         // global loading flag
  formLoading: false,     // scoped flag for form submit operations
  error: null,            // { message: string, errors?: array }
  formError: null,        // scoped error for form submissions
  successMessage: null,   // transient success banner text
};

// ── Action types ──────────────────────────────────────────────────────────────
const A = {
  LOADING_START:       'LOADING_START',
  LOADING_END:         'LOADING_END',
  FORM_LOADING_START:  'FORM_LOADING_START',
  FORM_LOADING_END:    'FORM_LOADING_END',
  SET_DOCUMENTS:       'SET_DOCUMENTS',
  SET_ACTIVE_DOCUMENT: 'SET_ACTIVE_DOCUMENT',
  SET_HISTORY:         'SET_HISTORY',
  SET_ERROR:           'SET_ERROR',
  SET_FORM_ERROR:      'SET_FORM_ERROR',
  CLEAR_ERROR:         'CLEAR_ERROR',
  SET_SUCCESS:         'SET_SUCCESS',
  CLEAR_SUCCESS:       'CLEAR_SUCCESS',
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case A.LOADING_START:       return { ...state, loading: true,      error: null };
    case A.LOADING_END:         return { ...state, loading: false };
    case A.FORM_LOADING_START:  return { ...state, formLoading: true,  formError: null };
    case A.FORM_LOADING_END:    return { ...state, formLoading: false };
    case A.SET_DOCUMENTS:       return { ...state, documents: action.payload };
    case A.SET_ACTIVE_DOCUMENT: return { ...state, activeDocument: action.payload };
    case A.SET_HISTORY:         return { ...state, renewalHistory: action.payload };
    case A.SET_ERROR:           return { ...state, error: action.payload,     loading: false };
    case A.SET_FORM_ERROR:      return { ...state, formError: action.payload, formLoading: false };
    case A.CLEAR_ERROR:         return { ...state, error: null, formError: null };
    case A.SET_SUCCESS:         return { ...state, successMessage: action.payload, formLoading: false };
    case A.CLEAR_SUCCESS:       return { ...state, successMessage: null };
    default:                    return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const loadDocuments = useCallback(async (statusFilter = '') => {
    dispatch({ type: A.LOADING_START });
    try {
      const { data } = await fetchDocuments(statusFilter);
      dispatch({ type: A.SET_DOCUMENTS, payload: data.data });
    } catch (err) {
      dispatch({ type: A.SET_ERROR, payload: { message: err.message, errors: err.errors } });
    } finally {
      dispatch({ type: A.LOADING_END });
    }
  }, []);

  const loadDocument = useCallback(async (id) => {
    dispatch({ type: A.LOADING_START });
    try {
      const { data } = await fetchDocumentById(id);
      dispatch({ type: A.SET_ACTIVE_DOCUMENT, payload: data.data });
    } catch (err) {
      dispatch({ type: A.SET_ERROR, payload: { message: err.message } });
    } finally {
      dispatch({ type: A.LOADING_END });
    }
  }, []);

  const loadRenewalHistory = useCallback(async (id) => {
    dispatch({ type: A.LOADING_START });
    try {
      const { data } = await fetchRenewalHistory(id);
      dispatch({ type: A.SET_HISTORY, payload: data.data });
    } catch (err) {
      dispatch({ type: A.SET_ERROR, payload: { message: err.message } });
    } finally {
      dispatch({ type: A.LOADING_END });
    }
  }, []);

  const addDocument = useCallback(async (payload, onSuccess) => {
    dispatch({ type: A.FORM_LOADING_START });
    try {
      await createDocument(payload);
      dispatch({ type: A.SET_SUCCESS, payload: 'Document added successfully.' });
      await loadDocuments();
      onSuccess?.();
    } catch (err) {
      dispatch({ type: A.SET_FORM_ERROR, payload: { message: err.message, errors: err.errors } });
    } finally {
      dispatch({ type: A.FORM_LOADING_END });
    }
  }, [loadDocuments]);

  const editDocument = useCallback(async (id, payload, onSuccess) => {
    dispatch({ type: A.FORM_LOADING_START });
    try {
      await updateDocument(id, payload);
      dispatch({ type: A.SET_SUCCESS, payload: 'Document updated successfully.' });
      await loadDocuments();
      onSuccess?.();
    } catch (err) {
      dispatch({ type: A.SET_FORM_ERROR, payload: { message: err.message, errors: err.errors } });
    } finally {
      dispatch({ type: A.FORM_LOADING_END });
    }
  }, [loadDocuments]);

  const removeDocument = useCallback(async (id, onSuccess) => {
    dispatch({ type: A.FORM_LOADING_START });
    try {
      await deleteDocument(id);
      dispatch({ type: A.SET_SUCCESS, payload: 'Document deleted.' });
      await loadDocuments();
      onSuccess?.();
    } catch (err) {
      dispatch({ type: A.SET_FORM_ERROR, payload: { message: err.message } });
    } finally {
      dispatch({ type: A.FORM_LOADING_END });
    }
  }, [loadDocuments]);

  const submitRenewal = useCallback(async (id, payload, onSuccess) => {
    dispatch({ type: A.FORM_LOADING_START });
    try {
      const { data } = await renewDocument(id, payload);
      dispatch({ type: A.SET_SUCCESS, payload: `Renewed successfully. New status: ${data.data.document.status}.` });
      // Refresh both the document list and active document
      dispatch({ type: A.SET_ACTIVE_DOCUMENT, payload: data.data.document });
      await loadDocuments();
      onSuccess?.();
    } catch (err) {
      dispatch({ type: A.SET_FORM_ERROR, payload: { message: err.message, errors: err.errors } });
    } finally {
      dispatch({ type: A.FORM_LOADING_END });
    }
  }, [loadDocuments]);

  const clearError   = useCallback(() => dispatch({ type: A.CLEAR_ERROR }),   []);
  const clearSuccess = useCallback(() => dispatch({ type: A.CLEAR_SUCCESS }), []);

  const value = {
    ...state,
    loadDocuments,
    loadDocument,
    loadRenewalHistory,
    addDocument,
    editDocument,
    removeDocument,
    submitRenewal,
    clearError,
    clearSuccess,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Hook — throws if used outside <AppProvider> */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}

export default AppContext;

