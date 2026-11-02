/**
 * AlertBanner — success / error feedback bar.
 */
function AlertBanner({ type = 'error', message, onClose }) {
  if (!message) return null;
  return (
    <div role="alert" className={`alert alert--${type}`}>
      <span className="alert__message">{message}</span>
      {onClose && (
        <button className="alert__close" onClick={onClose} aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}

export default AlertBanner;
