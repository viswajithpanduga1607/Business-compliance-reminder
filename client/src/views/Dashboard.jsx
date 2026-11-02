import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/layout/Navbar';
import DocumentForm from '../components/documents/DocumentForm';

/**
 * Dashboard view — shows the Prioritized Renewal Register.
 * Ranked automatically closest to expiry date first.
 */
function Dashboard() {
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

  const [statusFilter, setStatusFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadDocuments(statusFilter);
  }, [statusFilter, loadDocuments]);

  // Auto-dismiss success notifications
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(clearSuccess, 4500);
    return () => clearTimeout(timer);
  }, [successMessage, clearSuccess]);

  const STATUS_TABS = [
    { label: 'All Documents', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Expiring Soon', value: 'Expiring Soon' },
    { label: 'Expired', value: 'Expired' },
  ];

  return (
    <section>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="view-header">
        <div>
          <span className="view-header__eyebrow">Executive Ledger</span>
          <h1 className="view-header__title">Prioritized Renewal Register</h1>
        </div>
        <div className="view-header__actions">
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className={`btn ${showAddForm ? 'btn--ghost' : 'btn--primary'}`}
          >
            {showAddForm ? 'Close Entry Form' : '+ New Compliance Document'}
          </button>
        </div>
      </div>

      {/* ── Inline Add Document Form Container ──────────────────── */}
      {showAddForm && (
        <div className="card--form">
          <DocumentForm
            mode="add"
            onCancel={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
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

      {/* ── Filter Tabs ─────────────────────────────────────────── */}
      <div className="filter-tabs" role="tablist" aria-label="Filter documents by status">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value || 'all'}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`filter-tab ${isActive ? 'filter-tab--active' : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Table / Content ─────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Consulting document ledger…" />
      ) : documents.length === 0 ? (
        <div className="card table-empty">
          <p>No compliance documents recorded under this classification.</p>
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Classification</th>
                  <th>Designated Owner</th>
                  <th>Expiry Date</th>
                  <th>Timeline</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const daysLeft = Math.ceil(
                    (new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );

                  let daysChipClass = 'days-chip--ok';
                  if (daysLeft < 0) {
                    daysChipClass = 'days-chip--urgent';
                  } else if (daysLeft <= 30) {
                    daysChipClass = 'days-chip--warn';
                  }

                  return (
                    <tr key={doc._id}>
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
                        <span className={`days-chip ${daysChipClass}`}>
                          {daysLeft < 0
                            ? `${Math.abs(daysLeft)}d overdue`
                            : `${daysLeft}d remaining`}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={doc.status} />
                      </td>
                      <td>
                        <div className="td-actions" style={{ justifyContent: 'flex-end' }}>
                          <Link to={`/documents/${doc._id}`} className="td-action-link">
                            View / Renew
                          </Link>
                          <span className="td-divider">&bull;</span>
                          <button
                            type="button"
                            className="btn--danger"
                            onClick={() => {
                              if (window.confirm(`Permanently remove "${doc.title}" and its renewal log?`)) {
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
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="table-meta">
            Displaying {documents.length} recorded item{documents.length !== 1 ? 's' : ''} &bull; Prioritized by nearest expiry date
          </p>
        </>
      )}
    </section>
  );
}

export default Dashboard;
