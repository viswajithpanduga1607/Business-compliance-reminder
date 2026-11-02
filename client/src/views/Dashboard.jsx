import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/layout/Navbar';
import DocumentForm from '../components/documents/DocumentForm';
import ExecutiveStats from '../components/dashboard/ExecutiveStats';

/**
 * Dashboard view — Executive intelligence hub displaying KPI cards,
 * instant search filtering, and the prioritized renewal register.
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(clearSuccess, 4500);
    return () => clearTimeout(timer);
  }, [successMessage, clearSuccess]);

  // Filtered documents by both tab status and search query
  const filteredDocuments = useMemo(() => {
    let list = [...documents];
    if (statusFilter) {
      list = list.filter((d) => d.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.owner.toLowerCase().includes(q) ||
          d.documentType.toLowerCase().includes(q)
      );
    }
    return list;
  }, [documents, statusFilter, searchQuery]);

  // Count documents per status for badges on the tabs
  const statusCounts = useMemo(() => {
    const counts = { all: documents.length, Active: 0, 'Expiring Soon': 0, Expired: 0 };
    documents.forEach((d) => {
      if (counts[d.status] !== undefined) {
        counts[d.status]++;
      }
    });
    return counts;
  }, [documents]);

  const STATUS_TABS = [
    { label: 'All Instruments', value: '', count: statusCounts.all },
    { label: 'Active', value: 'Active', count: statusCounts.Active },
    { label: 'Expiring Soon', value: 'Expiring Soon', count: statusCounts['Expiring Soon'] },
    { label: 'Expired', value: 'Expired', count: statusCounts.Expired },
  ];

  return (
    <section>
      {/* ── View Header ─────────────────────────────────────────── */}
      <div className="view-header">
        <div>
          <span className="view-header__eyebrow">Executive Intelligence &amp; Registry</span>
          <h1 className="view-header__title">Prioritized Renewal Register</h1>
        </div>
        <div className="view-header__actions">
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className={`btn ${showAddForm ? 'btn--ghost' : 'btn--primary'} btn--glow`}
          >
            {showAddForm ? '✕ Close Entry Form' : '+ New Compliance Document'}
          </button>
        </div>
      </div>

      {/* ── Executive KPI Intelligence Cards ───────────────────── */}
      <ExecutiveStats documents={documents} />

      {/* ── Inline Add Document Form Container ──────────────────── */}
      {showAddForm && (
        <div className="card--form form-reveal">
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

      {/* ── Search & Filter Command Strip ───────────────────────── */}
      <div className="toolbar-strip">
        {/* Search input with vintage styling */}
        <div className="search-bar">
          <span className="search-bar__icon">🔍</span>
          <input
            type="text"
            className="search-bar__input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instruments by title, owner, or permit type..."
          />
          {searchQuery && (
            <button
              type="button"
              className="search-bar__clear"
              onClick={() => setSearchQuery('')}
              title="Clear search query"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter tabs */}
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
                <span>{tab.label}</span>
                <span className="filter-tab__count">{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table / Content ─────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Consulting document ledger…" />
      ) : filteredDocuments.length === 0 ? (
        <div className="card table-empty">
          <p>
            {searchQuery
              ? `No compliance instruments match "${searchQuery}".`
              : 'No compliance instruments recorded under this classification.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Instrument</th>
                  <th>Classification</th>
                  <th>Designated Owner</th>
                  <th>Expiry Date</th>
                  <th>Urgency Timeline</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => {
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
                    <tr key={doc._id} className="table-row-hover">
                      <td>
                        <Link to={`/documents/${doc._id}`} className="td-title">
                          {doc.title}
                        </Link>
                      </td>
                      <td className="td-meta">
                        <span className="doc-type-pill">{doc.documentType}</span>
                      </td>
                      <td className="td-owner">{doc.owner}</td>
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
                          <Link to={`/documents/${doc._id}`} className="btn-action-primary">
                            View / Renew
                          </Link>
                          <span className="td-divider">&bull;</span>
                          <button
                            type="button"
                            className="btn--danger"
                            onClick={() => {
                              if (window.confirm(`Permanently remove "${doc.title}" and its audit log?`)) {
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
            Displaying {filteredDocuments.length} of {documents.length} instruments &bull; Prioritized strictly by nearest expiry date
          </p>
        </>
      )}
    </section>
  );
}

export default Dashboard;
