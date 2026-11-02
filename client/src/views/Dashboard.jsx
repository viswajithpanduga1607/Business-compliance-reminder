import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/layout/Navbar';
import DocumentForm from '../components/documents/DocumentForm';

/**
 * Dashboard view — shows the Prioritized Renewal Register.
 *
 * Documents are already sorted closest-expiry-first by the API.
 * An optional status filter tabs strip lets the user narrow the view.
 */
function Dashboard() {
  const {
    documents, loading, error, successMessage,
    loadDocuments, removeDocument, clearError, clearSuccess,
    formLoading,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('');
  const [showAddForm, setShowAddForm]   = useState(false);

  useEffect(() => {
    loadDocuments(statusFilter);
  }, [statusFilter, loadDocuments]);

  // Auto-dismiss success banner after 4 s
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(clearSuccess, 4000);
    return () => clearTimeout(t);
  }, [successMessage, clearSuccess]);

  const STATUS_TABS = ['', 'Active', 'Expiring Soon', 'Expired'];

  const tabStyle = (active) => ({
    padding: '0.35rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '20px',
    background: active ? '#8B1A1A' : 'transparent',
    color: active ? '#fff' : '#555',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: active ? 600 : 400,
  });

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0 }}>Prioritized Renewal Register</h2>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          style={{ padding: '0.5rem 1.25rem', background: '#8B1A1A', color: '#fff',
                   border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          {showAddForm ? '— Cancel' : '+ Add Document'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: '#fafafa', border: '1px solid #e0e0e0',
                      borderRadius: '6px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <DocumentForm
            mode="add"
            onCancel={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
          />
        </div>
      )}

      {successMessage && <AlertBanner type="success" message={successMessage} onClose={clearSuccess} />}
      {error          && <AlertBanner type="error"   message={error.message}  onClose={clearError}  />}

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {STATUS_TABS.map((s) => (
          <button key={s || 'all'} style={tabStyle(statusFilter === s)} onClick={() => setStatusFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading documents…" />
      ) : documents.length === 0 ? (
        <p style={{ color: '#888', padding: '2rem 0', textAlign: 'center' }}>
          No documents found. Add one to get started.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f0e8', textAlign: 'left' }}>
                <th style={th}>Title</th>
                <th style={th}>Type</th>
                <th style={th}>Owner</th>
                <th style={th}>Expiry Date</th>
                <th style={th}>Days Left</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const daysLeft = Math.ceil(
                  (new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <tr key={doc._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={td}>
                      <Link to={`/documents/${doc._id}`} style={{ color: '#8B1A1A', textDecoration: 'none', fontWeight: 500 }}>
                        {doc.title}
                      </Link>
                    </td>
                    <td style={td}>{doc.documentType}</td>
                    <td style={td}>{doc.owner}</td>
                    <td style={td}>{new Date(doc.expiryDate).toLocaleDateString()}</td>
                    <td style={{ ...td, fontWeight: 600, color: daysLeft < 0 ? '#b71c1c' : daysLeft <= 30 ? '#e65100' : '#2e7d32' }}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`}
                    </td>
                    <td style={td}><StatusBadge status={doc.status} /></td>
                    <td style={td}>
                      <Link to={`/documents/${doc._id}`}
                            style={{ color: '#8B1A1A', marginRight: '0.75rem', fontSize: '0.82rem' }}>
                        View
                      </Link>
                      <button
                        onClick={() => { if (window.confirm(`Delete "${doc.title}"?`)) removeDocument(doc._id); }}
                        disabled={formLoading}
                        style={{ background: 'none', border: 'none', color: '#888',
                                 cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const th = { padding: '0.65rem 1rem', borderBottom: '2px solid #ddd', fontWeight: 600, whiteSpace: 'nowrap' };
const td = { padding: '0.6rem 1rem', verticalAlign: 'middle' };

export default Dashboard;
