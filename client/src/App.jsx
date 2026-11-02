import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import Dashboard from './views/Dashboard';
import DocumentRegister from './views/DocumentRegister';
import DocumentDetail from './views/DocumentDetail';
import RenewalHistoryLog from './views/RenewalHistoryLog';

/**
 * App — root component.
 *
 * Route map:
 *   /                          → Dashboard          (Prioritized Renewal Register)
 *   /documents                 → DocumentRegister   (Full document table)
 *   /documents/:id             → DocumentDetail     (Single document + edit + renew)
 *   /documents/:id/history     → RenewalHistoryLog  (Audit trail)
 */
function App() {
  return (
    <Router>
      <AppProvider>
        <ErrorBoundary>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* ── Top navigation ─────────────────────────────────── */}
            <Navbar />

            {/* ── Page content ───────────────────────────────────── */}
            <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '1200px',
                           width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
              <Routes>
                {/* Dashboard — shows the prioritized expiry list */}
                <Route
                  path="/"
                  element={
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  }
                />

                {/* Document Register — full tabular view of all documents */}
                <Route
                  path="/documents"
                  element={
                    <ErrorBoundary>
                      <DocumentRegister />
                    </ErrorBoundary>
                  }
                />

                {/* Document Detail — single document with edit & renewal */}
                <Route
                  path="/documents/:id"
                  element={
                    <ErrorBoundary>
                      <DocumentDetail />
                    </ErrorBoundary>
                  }
                />

                {/* Renewal History audit log for a document */}
                <Route
                  path="/documents/:id/history"
                  element={
                    <ErrorBoundary>
                      <RenewalHistoryLog />
                    </ErrorBoundary>
                  }
                />

                {/* 404 fallback */}
                <Route
                  path="*"
                  element={
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                      <h2>404 — Page Not Found</h2>
                      <p style={{ color: '#888' }}>The page you are looking for does not exist.</p>
                      <a href="/" style={{ color: '#8B1A1A' }}>← Return to Dashboard</a>
                    </div>
                  }
                />
              </Routes>
            </main>

            {/* ── Footer ─────────────────────────────────────────── */}
            <footer style={{ borderTop: '1px solid #e0d8cc', padding: '0.75rem 2rem',
                             textAlign: 'center', fontSize: '0.78rem', color: '#999' }}>
              BusinessDocument Expiry © {new Date().getFullYear()}
            </footer>

          </div>
        </ErrorBoundary>
      </AppProvider>
    </Router>
  );
}

export default App;
