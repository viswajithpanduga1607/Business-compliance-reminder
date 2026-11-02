import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AlertBanner from '../common/AlertBanner';

/**
 * RenewalForm — collects newExpiryDate and completedBy for a document renewal.
 *
 * Props:
 *   document  : the Document object being renewed
 *   onCancel  : () => void
 *   onSuccess : () => void
 */
function RenewalForm({ document, onCancel, onSuccess }) {
  const { submitRenewal, formLoading, formError, clearError } = useApp();

  const [fields, setFields] = useState({ newExpiryDate: '', completedBy: '' });
  const [localErrors, setLocalErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!fields.newExpiryDate) {
      errs.newExpiryDate = 'New expiry date is required.';
    } else if (new Date(fields.newExpiryDate) <= new Date()) {
      errs.newExpiryDate = 'New expiry date must be a future date.';
    }
    if (!fields.completedBy.trim()) errs.completedBy = 'Completed by is required.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (localErrors[name]) setLocalErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setLocalErrors(errs); return; }

    await submitRenewal(
      document._id,
      { newExpiryDate: new Date(fields.newExpiryDate).toISOString(), completedBy: fields.completedBy },
      onSuccess
    );
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
      <h3 style={{ marginTop: 0 }}>Renew: {document?.title}</h3>

      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
        Current expiry:{' '}
        <strong>{document?.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : '—'}</strong>
      </p>

      {formError && (
        <AlertBanner type="error" message={formError.message} onClose={clearError} />
      )}

      <div style={fieldWrap}>
        <label style={labelStyle} htmlFor="newExpiryDate">New Expiry Date *</label>
        <input id="newExpiryDate" name="newExpiryDate" type="date"
               value={fields.newExpiryDate} onChange={handleChange} style={fieldStyle('newExpiryDate')} />
        {localErrors.newExpiryDate && <p style={errorTip}>{localErrors.newExpiryDate}</p>}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle} htmlFor="completedBy">Completed By *</label>
        <input id="completedBy" name="completedBy" value={fields.completedBy}
               onChange={handleChange} style={fieldStyle('completedBy')}
               placeholder="Full name of the person completing this renewal" />
        {localErrors.completedBy && <p style={errorTip}>{localErrors.completedBy}</p>}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button type="button" onClick={onCancel} disabled={formLoading}
                style={{ padding: '0.5rem 1.25rem', cursor: 'pointer' }}>
          Cancel
        </button>
        <button type="submit" disabled={formLoading}
                style={{ padding: '0.5rem 1.25rem', background: '#B87333',
                         color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {formLoading ? 'Processing…' : 'Confirm Renewal'}
        </button>
      </div>
    </form>
  );
}

export default RenewalForm;
