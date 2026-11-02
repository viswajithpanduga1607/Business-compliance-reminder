import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/layout/Navbar';
import DocumentForm from '../components/documents/DocumentForm';

/**
 * DocumentRegister — Master catalog ledger of all corporate compliance records.
 * Provides unified search, filtering, inline editing, and direct audit trail links.
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(clearSuccess, 4500);
    return () => clearTimeout(timer);
  }, [successMessage, clearSuccess]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q) ||
        d.documentType.toLowerCase().includes(q)
    );
  }, [documents, searchQuery]);

  return (
    <section>
      {/* ── View Header ─────────────────────────────────────────── */}
      <div className="view-header">
        <div>
          <span className="view-header__eyebrow">Inventory Catalog &amp; Master Register</span>
          <h1 className="view-header__title">Compliance Document Register</h1>
        </div>
        <div className="view-header__actions">
          <button
            onClick={() => {
              setShowAddForm((prev) => !prev);
              setEditingDoc(null);
            }}
            className={`btn ${showAddForm ? 'btn--ghost' : 'btn--primary'} btn--glow`}
          >
            {showAddForm ? '✕ Close Entry Form' : '+ Register Document'}
          </button>
        </div>
      </div>

      {/* ── Inline Add Form ─────────────────────────────────────── */}
      {showAddForm && !editingDoc && (
        <div className="card--form form-reveal">
          <DocumentForm
            mode="add"
            onCancel={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* ── Inline Edit Form ────────────────────────────────────── */}
      {editingDoc && (
        <div className="card--form form-reveal">
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

      {/* ── Search Toolbar ──────────────────────────────────────── */}
      <div className="toolbar-strip">
        <div className="search-bar" style={{ maxWidth: '480px' }}>
          <span className="search-bar__icon">🔍</span>
          <input
            type="text"
            className="search-bar__input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search register by title, owner, or category..."
          />
          {searchQuery && (
            <button
              type="button"
              className="search-bar__clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Table Content ───────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Retrieving compliance register…" />
      ) : filteredDocs.length === 0 ? (
        <div className="card table-empty">
          <p>
            {searchQuery
              ? `No matching compliance instruments found for "${searchQuery}".`
              : 'The register is currently empty. Add your first compliance instrument above.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '44px' }}>#</th>
                  <th>Document Title</th>
                  <th>Classification</th>
                  <th>Designated Owner</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc, idx) => (
                  <tr key={doc._id} className="table-row-hover">
                    <td className="td-meta td-num">{idx + 1}</td>
                    <td>
                      <Link to={`/documents/${doc._id}`} className="td-title">
                        {doc.title}
                      </Link>
                    </td>
                    <td className="td-meta">
                      <span className="doc-type-pill">{doc.documentType}</span>
                    </td>
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
                          className="btn-action-ghost"
                          onClick={() => {
                            setEditingDoc(doc);
                            setShowAddForm(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Edit
                        </button>
                        <span className="td-divider">&bull;</span>
                        <Link to={`/documents/${doc._id}/history`} className="btn-action-ghost">
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
            Showing {filteredDocs.length} of {documents.length} recorded items &bull; Sequenced by compliance timeline
          </p>
        </>
      )}
    </section>
  );
}

export default DocumentRegister;
