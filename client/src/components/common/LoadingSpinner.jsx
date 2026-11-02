/**
 * LoadingSpinner — minimal, zero-dependency inline spinner.
 * Replace the inline styles with CSS classes once the design system is in place.
 */
function LoadingSpinner({ message = 'Loading…', size = 40 }) {
  const style = {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '0.75rem',
    },
    ring: {
      width: size,
      height: size,
      border: `4px solid #e0e0e0`,
      borderTop: `4px solid #8B1A1A`,   // deep red — matches the project palette
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    label: {
      fontSize: '0.9rem',
      color: '#666',
    },
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={style.wrapper} role="status" aria-label={message}>
        <div style={style.ring} />
        <span style={style.label}>{message}</span>
      </div>
    </>
  );
}

export default LoadingSpinner;
