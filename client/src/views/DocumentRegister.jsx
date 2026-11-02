import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/layout/Navbar';
import DocumentForm from '../components/documents/DocumentForm';

/**
 * DocumentRegister — tabular view of every document in the system.
 * Each row links to DocumentDetail and exposes an inline edit trigger.
 * Documents are sorted by expiryDate ASC (closest first) — enforced by the API.
 */
function DocumentRegister() {
  const {
    documents, loading, error, successMessage,
    loadDocuments, removeDocument, clearError, clearSuccess, formLoading,
  } = useApp();

  const [showAddForm, setShowAddForm]   = useState(false);
  const [editingDoc,  setEditingDoc]    = useState(null);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(clearSuccess, 4000);
    return () => clearTimeout(t);
  }, [successMessage, clearSuccess]);

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0 }}>Document Register</h2>
        <button
          onClick={() => { setShowAddForm((v) => !v); setEditingDoc(null); }}
          style={{ padding: '0.5rem 1.25rem', background: '#8B1A1A', color: '#fff',
                   border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          {showAddForm ? '— Cancel' : '+ Add Document'}
        </button>
      </div>

      {(showAddForm && !editingDoc) && (
        <div style={{ background: '#fafafa', border: '1px solid #e0e0e0',
                      borderRadius: '6px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <DocumentForm
            mode="add"
            onCancel={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
          />
        </div>
      )}

      {editingDoc && (
        <div style={{ background: '#fafafa', border: '1px solid #e0e0e0',
                      borderRadius: '6px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <DocumentForm
            mode="edit"
            initial={editingDoc}
            onCancel={() => setEditingDoc(null)}
            onSuccess={() => setEditingDoc(null)}
          />
        </div>
      )}

      {successMessage && <AlertBanner type="success" message={successMessage} onClose={clearSuccess} />}
      {error          && <AlertBanner type="error"   message={error.message}  onClose={clearError}  />}

      {loading ? (
        <LoadingSpinner message="Loading register…" />
      ) : documents.length === 0 ? (
        <p style={{ color: '#888', padding: '2rem 0', textAlign: 'center' }}>
          The register is empty. Add your first document above.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f0e8', textAlign: 'left' }}>
                <th style={th}>#</th>
                <th style={th}>Title</th>
                <th style={th}>Type</th>
                <th style={th}>Owner</th>
                <th style={th}>Expiry Date</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => (
                <tr key={doc._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={td}>{idx + 1}</td>
                  <td style={td}>
                    <Link to={`/documents/${doc._id}`}
                          style={{ color: '#8B1A1A', textDecoration: 'none', fontWeight: 500 }}>
                      {doc.title}
                    </Link>
                  </td>
                  <td style={td}>{doc.documentType}</td>
                  <td style={td}>{doc.owner}</td>
                  <td style={td}>{new Date(doc.expiryDate).toLocaleDateString()}</td>
                  <td style={td}><StatusBadge status={doc.status} /></td>
                  <td style={td}>
                    <button
                      onClick={() => { setEditingDoc(doc); setShowAddForm(false); }}
                      style={actionBtn}
                    >
                      Edit
                    </button>
                    <Link to={`/documents/${doc._id}/history`} style={{ ...actionLink, marginLeft: '0.75rem' }}>
                      History
                    </Link>
                    <button
                      onClick={() => { if (window.confirm(`Delete "${doc.title}"?`)) removeDocument(doc._id); }}
                      disabled={formLoading}
                      style={{ ...actionBtn, color: '#b71c1c', marginLeft: '0.75rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#aaa' }}>
        {documents.length} document{documents.length !== 1 ? 's' : ''} — sorted by nearest expiry date
      </p>
    </section>
  );
}

const th = { padding: '0.65rem 1rem', borderBottom: '2px solid #ddd', fontWeight: 600, whiteSpace: 'nowrap' };
const td = { padding: '0.6rem 1rem', verticalAlign: 'middle' };
const actionBtn  = { background: 'none', border: 'none', cursor: 'pointer',
                     color: '#555', fontSize: '0.82rem', padding: 0 };
const actionLink = { color: '#8B1A1A', fontSize: '0.82rem', textDecoration: 'none' };

export default DocumentRegister;
