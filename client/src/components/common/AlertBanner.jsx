/**
 * AlertBanner — transient success / error banner.
 *
 * Props:
 *   type    : 'success' | 'error'
 *   message : string
 *   onClose : () => void
 */
function AlertBanner({ type = 'error', message, onClose }) {
  if (!message) return null;

  const colours = {
    success: { background: '#e8f5e9', border: '#43a047', color: '#1b5e20' },
    error:   { background: '#fdecea', border: '#e53935', color: '#7f0000' },
  };

  const c = colours[type] || colours.error;

  const style = {
    wrapper: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '1rem',
      padding: '0.85rem 1.25rem',
      marginBottom: '1rem',
      borderLeft: `4px solid ${c.border}`,
      background: c.background,
      color: c.color,
      borderRadius: '4px',
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
    close: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '1rem',
      color: c.color,
      flexShrink: 0,
    },
  };

  return (
    <div role="alert" style={style.wrapper}>
      <span>{message}</span>
      {onClose && (
        <button style={style.close} onClick={onClose} aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}

export default AlertBanner;
