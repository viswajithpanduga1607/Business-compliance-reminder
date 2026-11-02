import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AlertBanner from '../common/AlertBanner';

/**
 * RenewalForm — collects newExpiryDate and completedBy for a document renewal.
 */
function RenewalForm({ document, onCancel, onSuccess }) {
  const { submitRenewal, formLoading, formError, clearError } = useApp();

  const [fields, setFields]       = useState({ newExpiryDate: '', completedBy: '' });
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
    setFields((p) => ({ ...p, [name]: value }));
    if (localErrors[name]) setLocalErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setLocalErrors(errs); return; }
    await submitRenewal(
      document._id,
      {
        newExpiryDate: new Date(fields.newExpiryDate).toISOString(),
        completedBy: fields.completedBy,
      },
      onSuccess
    );
  };

  const inputCls = (name) =>
    `form-group__input${localErrors[name] ? ' form-group__input--error' : ''}`;

  const currentExpiry = document?.expiryDate
    ? new Date(document.expiryDate).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 className="lux-form__title">Renew — {document?.title}</h3>
      <p className="lux-form__subtitle">
        Current expiry: <strong>{currentExpiry}</strong>
      </p>

      {formError && (
        <AlertBanner type="error" message={formError.message} onClose={clearError} />
      )}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-group__label" htmlFor="newExpiryDate">
            New Expiry Date <span className="req">*</span>
          </label>
          <input
            id="newExpiryDate" name="newExpiryDate" type="date"
            className={inputCls('newExpiryDate')}
            value={fields.newExpiryDate} onChange={handleChange}
          />
          {localErrors.newExpiryDate && (
            <span className="form-group__error">⚠ {localErrors.newExpiryDate}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-group__label" htmlFor="completedBy">
            Completed By <span className="req">*</span>
          </label>
          <input
            id="completedBy" name="completedBy"
            className={inputCls('completedBy')}
            value={fields.completedBy} onChange={handleChange}
            placeholder="Full name of the responsible officer"
          />
          {localErrors.completedBy && (
            <span className="form-group__error">⚠ {localErrors.completedBy}</span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={formLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn--secondary" disabled={formLoading}>
          {formLoading ? 'Processing…' : 'Confirm Renewal'}
        </button>
      </div>
    </form>
  );
}

export default RenewalForm;
