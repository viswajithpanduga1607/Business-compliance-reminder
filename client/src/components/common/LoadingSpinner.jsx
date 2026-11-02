/**
 * LoadingSpinner — animated ring with optional message.
 */
function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="spinner" role="status" aria-label={message}>
      <div className="spinner__ring" />
      <span className="spinner__label">{message}</span>
    </div>
  );
}

export default LoadingSpinner;
