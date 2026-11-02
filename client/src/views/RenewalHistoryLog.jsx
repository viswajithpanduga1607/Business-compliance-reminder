import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * RenewalHistoryLog — Permanent audit trail ledger for a specific document.
 * Displays all historical renewals chronologically descending (newest first).
 */
function RenewalHistoryLog() {
  const { id } = useParams();
  const {
    activeDocument,
    renewalHistory,
    loading,
    error,
    loadDocument,
    loadRenewalHistory,
    clearError,
  } = useApp();

  useEffect(() => {
    loadDocument(id);
    loadRenewalHistory(id);
  }, [id, loadDocument, loadRenewalHistory]);

  if (loading) return <LoadingSpinner message="Auditing ledger transactions…" />;

  return (
    <section>
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <Link to={`/documents/${id}`} className="back-link">
        &larr; Return to Document Record
      </Link>

      {/* ── View Header ─────────────────────────────────────────── */}
      <div className="view-header">
        <div>
          <span className="view-header__eyebrow">Audit Trail Ledger</span>
          <h1 className="view-header__title">
            Renewal History {activeDocument ? `— ${activeDocument.title}` : ''}
          </h1>
        </div>
        {activeDocument && (
          <div className="view-header__actions">
            <Link to={`/documents/${id}`} className="btn btn--secondary btn--sm">
              Manage Record
            </Link>
          </div>
        )}
      </div>

      {error && <AlertBanner type="error" message={error.message} onClose={clearError} />}

      {/* ── Audit Trail Table ───────────────────────────────────── */}
      {renewalHistory.length === 0 ? (
        <div className="card table-empty">
          <p>No historical renewals have been logged for this document yet.</p>
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Transaction Date</th>
                  <th>Previous Expiry</th>
                  <th>Renewed Expiry</th>
                  <th>Extension Granted</th>
                  <th>Authorized Officer</th>
                </tr>
              </thead>
              <tbody>
                {renewalHistory.map((entry, idx) => {
                  const extensionDays = Math.round(
                    (new Date(entry.newExpiryDate) - new Date(entry.previousExpiryDate)) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={entry._id}>
                      <td className="td-meta td-num">{idx + 1}</td>
                      <td className="td-num">
                        {new Date(entry.renewalDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="td-num history-prev">
                        {new Date(entry.previousExpiryDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="td-num history-new">
                        {new Date(entry.newExpiryDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <span className="history-ext td-num">
                          +{extensionDays} days
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{entry.completedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="table-meta">
            Permanent ledger contains {renewalHistory.length} verified transaction{renewalHistory.length !== 1 ? 's' : ''} &bull; Sequenced newest first
          </p>
        </>
      )}
    </section>
  );
}

export default RenewalHistoryLog;
