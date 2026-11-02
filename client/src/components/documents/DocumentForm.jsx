import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AlertBanner from '../common/AlertBanner';

const DOCUMENT_TYPES = [
  'Permit', 'Insurance Policy', 'Vendor Agreement',
  'License', 'Certification', 'Contract', 'Other',
];
const STATUS_OPTIONS = ['Active', 'Expiring Soon', 'Expired'];

/**
 * DocumentForm — ADD (mode="add") or EDIT (mode="edit") a compliance document.
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
    setFields((p) => ({ ...p, [name]: value }));
    if (localErrors[name]) setLocalErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setLocalErrors(errs); return; }
    const payload = { ...fields, expiryDate: new Date(fields.expiryDate).toISOString() };
    if (mode === 'add') await addDocument(payload, onSuccess);
    else                await editDocument(initial._id, payload, onSuccess);
  };

  const inputCls = (name) =>
    `form-group__input${localErrors[name] ? ' form-group__input--error' : ''}`;
  const selectCls = (name) =>
    `form-group__select${localErrors[name] ? ' form-group__select--error' : ''}`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 className="lux-form__title">
        {mode === 'add' ? 'Register New Document' : 'Edit Document'}
      </h3>

      {formError && (
        <AlertBanner type="error" message={formError.message} onClose={clearError} />
      )}

      <div className="form-grid">
        {/* Title */}
        <div className="form-group form-group--full">
          <label className="form-group__label" htmlFor="title">
            Document Title <span className="req">*</span>
          </label>
          <input
            id="title" name="title" className={inputCls('title')}
            value={fields.title} onChange={handleChange}
            placeholder="e.g. Fire Safety Permit 2027"
          />
          {localErrors.title && <span className="form-group__error">⚠ {localErrors.title}</span>}
        </div>

        {/* Owner */}
        <div className="form-group">
          <label className="form-group__label" htmlFor="owner">
            Document Owner <span className="req">*</span>
          </label>
          <input
            id="owner" name="owner" className={inputCls('owner')}
            value={fields.owner} onChange={handleChange}
            placeholder="e.g. Administration Office"
          />
          {localErrors.owner && <span className="form-group__error">⚠ {localErrors.owner}</span>}
        </div>

        {/* Document Type */}
        <div className="form-group">
          <label className="form-group__label" htmlFor="documentType">
            Document Type <span className="req">*</span>
          </label>
          <div className="select-wrap">
            <select
              id="documentType" name="documentType"
              className={selectCls('documentType')}
              value={fields.documentType} onChange={handleChange}
            >
              <option value="">— Select a type —</option>
              {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {localErrors.documentType && <span className="form-group__error">⚠ {localErrors.documentType}</span>}
        </div>

        {/* Expiry Date */}
        <div className="form-group">
          <label className="form-group__label" htmlFor="expiryDate">
            Expiry Date <span className="req">*</span>
          </label>
          <input
            id="expiryDate" name="expiryDate" type="date"
            className={inputCls('expiryDate')}
            value={fields.expiryDate} onChange={handleChange}
          />
          {localErrors.expiryDate && <span className="form-group__error">⚠ {localErrors.expiryDate}</span>}
        </div>

        {/* Status */}
        <div className="form-group">
          <label className="form-group__label" htmlFor="status">Status</label>
          <div className="select-wrap">
            <select
              id="status" name="status"
              className="form-group__select"
              value={fields.status} onChange={handleChange}
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={formLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={formLoading}>
          {formLoading
            ? 'Saving…'
            : mode === 'add' ? 'Register Document' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default DocumentForm;
