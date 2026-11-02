import { Route, BrowserRouter as Router, Routes, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import Dashboard from './views/Dashboard';
import DocumentRegister from './views/DocumentRegister';
import DocumentDetail from './views/DocumentDetail';
import RenewalHistoryLog from './views/RenewalHistoryLog';

/**
 * App — Root application container with luxury aesthetic shell.
 *
 * Route map:
 *   /                          → Dashboard          (Prioritized Renewal Register)
 *   /documents                 → DocumentRegister   (Full compliance document table)
 *   /documents/:id             → DocumentDetail     (Single document + edit + renew)
 *   /documents/:id/history     → RenewalHistoryLog  (Audit trail)
 */
function App() {
  return (
    <Router>
      <AppProvider>
        <ErrorBoundary>
          <div className="app-shell">
            {/* ── Top Navigation ─────────────────────────────────── */}
            <Navbar />

            {/* ── Page Content ───────────────────────────────────── */}
            <main className="app-main">
              <Routes>
                {/* Dashboard — prioritized expiry list */}
                <Route
                  path="/"
                  element={
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  }
                />

                {/* Document Register — full tabular view */}
                <Route
                  path="/documents"
                  element={
                    <ErrorBoundary>
                      <DocumentRegister />
                    </ErrorBoundary>
                  }
                />

                {/* Document Detail — single view with edit and renewal */}
                <Route
                  path="/documents/:id"
                  element={
                    <ErrorBoundary>
                      <DocumentDetail />
                    </ErrorBoundary>
                  }
                />

                {/* Renewal History audit log */}
                <Route
                  path="/documents/:id/history"
                  element={
                    <ErrorBoundary>
                      <RenewalHistoryLog />
                    </ErrorBoundary>
                  }
                />

                {/* 404 Fallback */}
                <Route
                  path="*"
                  element={
                    <div className="card" style={{ textAlign: 'center', margin: '3rem auto', maxWidth: '500px' }}>
                      <h2 style={{ marginBottom: '0.75rem' }}>Document Not Located</h2>
                      <p style={{ color: 'var(--clr-ink-muted)', marginBottom: '1.5rem' }}>
                        The ledger or page requested does not exist or has been archived.
                      </p>
                      <Link to="/" className="btn btn--primary">
                        Return to Dashboard
                      </Link>
                    </div>
                  }
                />
              </Routes>
            </main>

            {/* ── Footer ─────────────────────────────────────────── */}
            <footer className="app-footer">
              BusinessDocument Expiry &bull; Bespoke Executive Compliance &bull; &copy; {new Date().getFullYear()}
            </footer>
          </div>
        </ErrorBoundary>
      </AppProvider>
    </Router>
  );
}

export default App;
