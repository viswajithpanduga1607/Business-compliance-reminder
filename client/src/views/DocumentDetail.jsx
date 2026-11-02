import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/layout/Navbar';
import DocumentForm from '../components/documents/DocumentForm';
import RenewalForm from '../components/documents/RenewalForm';

/**
 * DocumentDetail — shows a single document with full field detail,
 * inline edit form, inline renewal form, and a link to its audit log.
 */
function DocumentDetail() {
  const { id }  = useParams();
  const {
    activeDocument, loading, error, successMessage,
    loadDocument, clearError, clearSuccess,
  } = useApp();

  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'renew'

  useEffect(() => {
    loadDocument(id);
  }, [id, loadDocument]);

  // Auto-dismiss success banner
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(clearSuccess, 4000);
    return () => clearTimeout(t);
  }, [successMessage, clearSuccess]);

  if (loading) return <LoadingSpinner message="Loading document…" />;
  if (error)   return (
    <div>
      <AlertBanner type="error" message={error.message} onClose={clearError} />
      <Link to="/">← Back to Dashboard</Link>
    </div>
  );
  if (!activeDocument) return null;

  const doc = activeDocument;

  const rowStyle = { display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.9rem' };
  const labelStyle = { fontWeight: 600, minWidth: '130px', color: '#555' };

  return (
    <section>
      <Link to="/" style={{ fontSize: '0.85rem', color: '#8B1A1A', textDecoration: 'none' }}>
        ← Back to Dashboard
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    margin: '1rem 0', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>{doc.title}</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {mode === 'view' && (
            <>
              <button onClick={() => setMode('edit')}
                style={btnStyle('#555')}>Edit</button>
              <button onClick={() => setMode('renew')}
                style={btnStyle('#B87333')}>Renew</button>
            </>
          )}
          {mode !== 'view' && (
            <button onClick={() => setMode('view')} style={btnStyle('#555')}>
              ← Back to Detail
            </button>
          )}
        </div>
      </div>

      {successMessage && <AlertBanner type="success" message={successMessage} onClose={clearSuccess} />}
      {error          && <AlertBanner type="error"   message={error.message}  onClose={clearError}  />}

      {mode === 'view' && (
        <div style={{ background: '#fafafa', border: '1px solid #e0e0e0',
                      borderRadius: '6px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={rowStyle}><span style={labelStyle}>Title</span><span>{doc.title}</span></div>
          <div style={rowStyle}><span style={labelStyle}>Owner</span><span>{doc.owner}</span></div>
          <div style={rowStyle}><span style={labelStyle}>Type</span><span>{doc.documentType}</span></div>
          <div style={rowStyle}>
            <span style={labelStyle}>Expiry Date</span>
            <span>{new Date(doc.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div style={rowStyle}><span style={labelStyle}>Status</span><StatusBadge status={doc.status} /></div>
          <div style={rowStyle}>
            <span style={labelStyle}>Created</span>
            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <Link to={`/documents/${doc._id}/history`}
                  style={{ color: '#8B1A1A', fontWeight: 500, fontSize: '0.9rem' }}>
              View Renewal History →
            </Link>
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <div style={{ background: '#fafafa', border: '1px solid #e0e0e0',
                      borderRadius: '6px', padding: '1.5rem' }}>
          <DocumentForm
            mode="edit"
            initial={doc}
            onCancel={() => setMode('view')}
            onSuccess={() => { loadDocument(id); setMode('view'); }}
          />
        </div>
      )}

      {mode === 'renew' && (
        <div style={{ background: '#fafafa', border: '1px solid #e0e0e0',
                      borderRadius: '6px', padding: '1.5rem' }}>
          <RenewalForm
            document={doc}
            onCancel={() => setMode('view')}
            onSuccess={() => { loadDocument(id); setMode('view'); }}
          />
        </div>
      )}
    </section>
  );
}

const btnStyle = (bg) => ({
  padding: '0.4rem 1rem', background: bg, color: '#fff',
  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem',
});

export default DocumentDetail;
