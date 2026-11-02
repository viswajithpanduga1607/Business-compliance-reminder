import React from 'react';

/**
 * Class-based Error Boundary — catches render-time errors in child subtrees.
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
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="card" style={{ textAlign: 'center', margin: '3rem auto', maxWidth: 480 }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Something went wrong</h2>
          <p style={{ color: 'var(--clr-ink-muted)', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'An unexpected render error occurred.'}
          </p>
          <button className="btn btn--ghost" onClick={this.handleReset}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
