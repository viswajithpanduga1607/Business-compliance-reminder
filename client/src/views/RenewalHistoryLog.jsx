import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * RenewalHistoryLog — permanent audit trail for a specific document.
 * Shows all RenewalHistory entries newest-first (enforced by the API).
 */
function RenewalHistoryLog() {
  const { id } = useParams();
  const {
    activeDocument, renewalHistory, loading, error,
    loadDocument, loadRenewalHistory, clearError,
  } = useApp();

  useEffect(() => {
    loadDocument(id);
    loadRenewalHistory(id);
  }, [id, loadDocument, loadRenewalHistory]);

  if (loading) return <LoadingSpinner message="Loading audit trail…" />;

  return (
    <section>
      <Link to={`/documents/${id}`}
            style={{ fontSize: '0.85rem', color: '#8B1A1A', textDecoration: 'none' }}>
        ← Back to Document
      </Link>

      <h2 style={{ margin: '1rem 0 0.25rem' }}>
        Renewal History
      </h2>
      {activeDocument && (
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.25rem' }}>
          Document: <strong>{activeDocument.title}</strong> — {activeDocument.documentType}
        </p>
      )}

      {error && <AlertBanner type="error" message={error.message} onClose={clearError} />}

      {renewalHistory.length === 0 ? (
        <p style={{ color: '#888', padding: '2rem 0', textAlign: 'center' }}>
          No renewals recorded yet for this document.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f0e8', textAlign: 'left' }}>
                <th style={th}>#</th>
                <th style={th}>Renewal Date</th>
                <th style={th}>Previous Expiry</th>
                <th style={th}>New Expiry</th>
                <th style={th}>Extension</th>
                <th style={th}>Completed By</th>
              </tr>
            </thead>
            <tbody>
              {renewalHistory.map((entry, idx) => {
                const extensionDays = Math.round(
                  (new Date(entry.newExpiryDate) - new Date(entry.previousExpiryDate)) /
                  (1000 * 60 * 60 * 24)
                );
                return (
                  <tr key={entry._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={td}>{idx + 1}</td>
                    <td style={td}>{new Date(entry.renewalDate).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}</td>
                    <td style={{ ...td, color: '#b71c1c' }}>
                      {new Date(entry.previousExpiryDate).toLocaleDateString()}
                    </td>
                    <td style={{ ...td, color: '#2e7d32', fontWeight: 500 }}>
                      {new Date(entry.newExpiryDate).toLocaleDateString()}
                    </td>
                    <td style={td}>
                      <span style={{ fontWeight: 600, color: '#B87333' }}>
                        +{extensionDays}d
                      </span>
                    </td>
                    <td style={td}>{entry.completedBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#aaa' }}>
        {renewalHistory.length} renewal record{renewalHistory.length !== 1 ? 's' : ''} — most recent first
      </p>
    </section>
  );
}

const th = { padding: '0.65rem 1rem', borderBottom: '2px solid #ddd', fontWeight: 600, whiteSpace: 'nowrap' };
const td = { padding: '0.6rem 1rem', verticalAlign: 'middle' };

export default RenewalHistoryLog;
