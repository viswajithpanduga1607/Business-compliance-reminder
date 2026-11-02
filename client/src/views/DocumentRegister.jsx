import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/layout/Navbar';
import DocumentForm from '../components/documents/DocumentForm';

/**
 * DocumentRegister — Master ledger table of every registered document.
 * Provides entry creation, inline editing, and direct history inspection.
 */
function DocumentRegister() {
  const {
    documents,
    loading,
    error,
    successMessage,
    loadDocuments,
    removeDocument,
    clearError,
    clearSuccess,
    formLoading,
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(clearSuccess, 4500);
    return () => clearTimeout(timer);
  }, [successMessage, clearSuccess]);

  return (
    <section>
      {/* ── View Header ─────────────────────────────────────────── */}
      <div className="view-header">
        <div>
          <span className="view-header__eyebrow">Inventory Ledger</span>
          <h1 className="view-header__title">Compliance Document Register</h1>
        </div>
        <div className="view-header__actions">
          <button
            onClick={() => {
              setShowAddForm((prev) => !prev);
              setEditingDoc(null);
            }}
            className={`btn ${showAddForm ? 'btn--ghost' : 'btn--primary'}`}
          >
            {showAddForm ? 'Close Entry Form' : '+ Register Document'}
          </button>
        </div>
      </div>

      {/* ── Inline Add Form ─────────────────────────────────────── */}
      {showAddForm && !editingDoc && (
        <div className="card--form">
          <DocumentForm
            mode="add"
            onCancel={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* ── Inline Edit Form ────────────────────────────────────── */}
      {editingDoc && (
        <div className="card--form">
          <DocumentForm
            mode="edit"
            initial={editingDoc}
            onCancel={() => setEditingDoc(null)}
            onSuccess={() => setEditingDoc(null)}
          />
        </div>
      )}

      {/* ── Notifications ───────────────────────────────────────── */}
      {successMessage && (
        <AlertBanner type="success" message={successMessage} onClose={clearSuccess} />
      )}
      {error && (
        <AlertBanner type="error" message={error.message} onClose={clearError} />
      )}

      {/* ── Table Content ───────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Retrieving compliance register…" />
      ) : documents.length === 0 ? (
        <div className="card table-empty">
          <p>The register is currently empty. Add your first compliance instrument above.</p>
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Document Title</th>
                  <th>Type</th>
                  <th>Owner</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, idx) => (
                  <tr key={doc._id}>
                    <td className="td-meta td-num">{idx + 1}</td>
                    <td>
                      <Link to={`/documents/${doc._id}`} className="td-title">
                        {doc.title}
                      </Link>
                    </td>
                    <td className="td-meta">{doc.documentType}</td>
                    <td>{doc.owner}</td>
                    <td className="td-num">
                      {new Date(doc.expiryDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td>
                      <div className="td-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="td-action-link"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          onClick={() => {
                            setEditingDoc(doc);
                            setShowAddForm(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Edit
                        </button>
                        <span className="td-divider">&bull;</span>
                        <Link to={`/documents/${doc._id}/history`} className="td-action-link">
                          Audit Trail
                        </Link>
                        <span className="td-divider">&bull;</span>
                        <button
                          type="button"
                          className="btn--danger"
                          onClick={() => {
                            if (window.confirm(`Permanently remove "${doc.title}"?`)) {
                              removeDocument(doc._id);
                            }
                          }}
                          disabled={formLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="table-meta">
            Total of {documents.length} registered compliance instrument{documents.length !== 1 ? 's' : ''} &bull; Ranked by expiry schedule
          </p>
        </>
      )}
    </section>
  );
}

export default DocumentRegister;
