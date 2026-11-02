import React from 'react';

/**
 * Class-based Error Boundary.
 * Catches render-time errors in any child subtree and renders a graceful
 * fallback instead of a blank screen.
 *
 * Usage:
 *   <ErrorBoundary fallback={<p>Something broke.</p>}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, swap this for a real logging service (Sentry, etc.)
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            {this.state.error?.message || 'An unexpected render error occurred.'}
          </p>
          <button onClick={this.handleReset}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

