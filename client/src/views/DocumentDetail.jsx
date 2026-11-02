import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/layout/Navbar';
import DocumentForm from '../components/documents/DocumentForm';
import RenewalForm from '../components/documents/RenewalForm';

/**
 * DocumentDetail — Comprehensive record view for a single compliance document.
 * Includes interactive tab modes for Inspection, Editing, and Renewal processing.
 */
function DocumentDetail() {
  const { id } = useParams();
  const {
    activeDocument,
    loading,
    error,
    successMessage,
    loadDocument,
    clearError,
    clearSuccess,
  } = useApp();

  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'renew'

  useEffect(() => {
    loadDocument(id);
  }, [id, loadDocument]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(clearSuccess, 4500);
    return () => clearTimeout(timer);
  }, [successMessage, clearSuccess]);

  if (loading) return <LoadingSpinner message="Consulting instrument ledger…" />;

  if (error) {
    return (
      <section>
        <Link to="/" className="back-link">&larr; Return to Dashboard</Link>
        <AlertBanner type="error" message={error.message} onClose={clearError} />
      </section>
    );
  }

  if (!activeDocument) return null;

  const doc = activeDocument;

  return (
    <section>
      {/* ── Navigation Breadcrumb ───────────────────────────────── */}
      <Link to="/" className="back-link">
        &larr; Return to Dashboard
      </Link>

      {/* ── View Header ─────────────────────────────────────────── */}
      <div className="view-header">
        <div>
          <span className="view-header__eyebrow">{doc.documentType} Record</span>
          <h1 className="view-header__title">{doc.title}</h1>
        </div>

        {/* ── Mode Switcher ─────────────────────────────────────── */}
        <div className="mode-tabs" role="tablist" aria-label="Document view modes">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'view'}
            className={`mode-tab ${mode === 'view' ? 'mode-tab--active' : ''}`}
            onClick={() => setMode('view')}
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'edit'}
            className={`mode-tab ${mode === 'edit' ? 'mode-tab--active' : ''}`}
            onClick={() => setMode('edit')}
          >
            Edit Record
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'renew'}
            className={`mode-tab ${mode === 'renew' ? 'mode-tab--active' : ''}`}
            onClick={() => setMode('renew')}
          >
            Log Renewal
          </button>
        </div>
      </div>

      {/* ── Notifications ───────────────────────────────────────── */}
      {successMessage && (
        <AlertBanner type="success" message={successMessage} onClose={clearSuccess} />
      )}
      {error && (
        <AlertBanner type="error" message={error.message} onClose={clearError} />
      )}

      {/* ── Mode: View / Overview ──────────────────────────────── */}
      {mode === 'view' && (
        <div className="detail-card">
          <div className="detail-grid">
            <div className="detail-row">
              <span className="detail-label">Legal / Document Title</span>
              <span className="detail-value">{doc.title}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Designated Owner / Department</span>
              <span className="detail-value">{doc.owner}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Instrument Classification</span>
              <span className="detail-value">{doc.documentType}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Current Expiry Deadline</span>
              <span className="detail-value">
                {new Date(doc.expiryDate).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Compliance Status</span>
              <div style={{ marginTop: '4px' }}>
                <StatusBadge status={doc.status} />
              </div>
            </div>

            <div className="detail-row">
              <span className="detail-label">Initial Registration Date</span>
              <span className="detail-value td-num">
                {new Date(doc.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="detail-actions-row">
            <Link to={`/documents/${doc._id}/history`} className="btn btn--ghost btn--sm">
              View Permanent Audit Log &rarr;
            </Link>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setMode('renew')}
            >
              Extend / Renew Expiry
            </button>
          </div>
        </div>
      )}

      {/* ── Mode: Edit ─────────────────────────────────────────── */}
      {mode === 'edit' && (
        <div className="card--form">
          <DocumentForm
            mode="edit"
            initial={doc}
            onCancel={() => setMode('view')}
            onSuccess={() => {
              loadDocument(id);
              setMode('view');
            }}
          />
        </div>
      )}

      {/* ── Mode: Renew ────────────────────────────────────────── */}
      {mode === 'renew' && (
        <div className="card--form">
          <RenewalForm
            document={doc}
            onCancel={() => setMode('view')}
            onSuccess={() => {
              loadDocument(id);
              setMode('view');
            }}
          />
        </div>
      )}
    </section>
  );
}

export default DocumentDetail;
