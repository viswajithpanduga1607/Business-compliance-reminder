import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AlertBanner from '../common/AlertBanner';

const DOCUMENT_TYPES = [
  'Permit', 'Insurance Policy', 'Vendor Agreement',
  'License', 'Certification', 'Contract', 'Other',
];

const STATUS_OPTIONS = ['Active', 'Expiring Soon', 'Expired'];

/**
 * DocumentForm — handles both ADD and EDIT modes.
 *
 * Props:
 *   mode       : 'add' | 'edit'
 *   initial    : document object (edit mode only)
 *   onCancel   : () => void
 *   onSuccess  : () => void  (called after successful submit)
 */
function DocumentForm({ mode = 'add', initial = null, onCancel, onSuccess }) {
  const { addDocument, editDocument, formLoading, formError, clearError } = useApp();

  const [fields, setFields] = useState({
    title:        initial?.title        ?? '',
    owner:        initial?.owner        ?? '',
    expiryDate:   initial?.expiryDate
                    ? new Date(initial.expiryDate).toISOString().split('T')[0]
                    : '',
    status:       initial?.status       ?? 'Active',
    documentType: initial?.documentType ?? '',
  });

  const [localErrors, setLocalErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!fields.title.trim())        errs.title        = 'Title is required.';
    if (!fields.owner.trim())        errs.owner        = 'Owner is required.';
    if (!fields.expiryDate)          errs.expiryDate   = 'Expiry date is required.';
    if (!fields.documentType.trim()) errs.documentType = 'Document type is required.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear the field error on change
    if (localErrors[name]) setLocalErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setLocalErrors(errs); return; }

    const payload = {
      ...fields,
      expiryDate: new Date(fields.expiryDate).toISOString(),
    };

    if (mode === 'add') {
      await addDocument(payload, onSuccess);
    } else {
      await editDocument(initial._id, payload, onSuccess);
    }
  };

  const fieldStyle = (name) => ({
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: `1px solid ${localErrors[name] ? '#e53935' : '#ccc'}`,
    borderRadius: '4px',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
  });

  const labelStyle = { display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.85rem' };
  const fieldWrap  = { marginBottom: '1rem' };
  const errorTip   = { color: '#e53935', fontSize: '0.78rem', marginTop: '0.2rem' };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 style={{ marginTop: 0 }}>{mode === 'add' ? 'Add New Document' : 'Edit Document'}</h3>

      {formError && (
        <AlertBanner type="error" message={formError.message} onClose={clearError} />
      )}

      <div style={fieldWrap}>
        <label style={labelStyle} htmlFor="title">Title *</label>
        <input id="title" name="title" value={fields.title}
               onChange={handleChange} style={fieldStyle('title')} placeholder="e.g. Fire Safety Permit" />
        {localErrors.title && <p style={errorTip}>{localErrors.title}</p>}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle} htmlFor="owner">Owner *</label>
        <input id="owner" name="owner" value={fields.owner}
               onChange={handleChange} style={fieldStyle('owner')} placeholder="e.g. Admin Office" />
        {localErrors.owner && <p style={errorTip}>{localErrors.owner}</p>}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle} htmlFor="documentType">Document Type *</label>
        <select id="documentType" name="documentType" value={fields.documentType}
                onChange={handleChange} style={fieldStyle('documentType')}>
          <option value="">— Select type —</option>
          {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {localErrors.documentType && <p style={errorTip}>{localErrors.documentType}</p>}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle} htmlFor="expiryDate">Expiry Date *</label>
        <input id="expiryDate" name="expiryDate" type="date"
               value={fields.expiryDate} onChange={handleChange} style={fieldStyle('expiryDate')} />
        {localErrors.expiryDate && <p style={errorTip}>{localErrors.expiryDate}</p>}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle} htmlFor="status">Status</label>
        <select id="status" name="status" value={fields.status}
                onChange={handleChange} style={fieldStyle('status')}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button type="button" onClick={onCancel} disabled={formLoading}
                style={{ padding: '0.5rem 1.25rem', cursor: 'pointer' }}>
          Cancel
        </button>
        <button type="submit" disabled={formLoading}
                style={{ padding: '0.5rem 1.25rem', background: '#8B1A1A',
                         color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {formLoading ? 'Saving…' : mode === 'add' ? 'Add Document' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default DocumentForm;
