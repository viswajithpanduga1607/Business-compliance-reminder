import { NavLink } from 'react-router-dom';

/**
 * StatusBadge — inline chip showing a document's status.
 * Accepts: 'Active' | 'Expiring Soon' | 'Expired'
 */
export function StatusBadge({ status }) {
  const colours = {
    Active:          { background: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
    'Expiring Soon': { background: '#fff3e0', color: '#e65100', border: '#ffcc80' },
    Expired:         { background: '#fdecea', color: '#b71c1c', border: '#ef9a9a' },
  };

  const c = colours[status] || { background: '#f5f5f5', color: '#555', border: '#ccc' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '0.78rem',
        fontWeight: 600,
        border: `1px solid ${c.border}`,
        background: c.background,
        color: c.color,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

/**
 * Navbar — top-level navigation bar.
 * Active links are highlighted via NavLink's default `active` class.
 */
function Navbar() {
  const navStyle = {
    wrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 2rem',
      background: '#1a0a0a',   // deep burgundy-black — placeholder for the luxury palette
      color: '#f5f0e8',
      borderBottom: '2px solid #8B1A1A',
    },
    brand: {
      fontWeight: 700,
      fontSize: '1.1rem',
      letterSpacing: '0.03em',
      color: '#f5f0e8',
      textDecoration: 'none',
    },
    navList: {
      display: 'flex',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      gap: '1.5rem',
    },
    link: {
      color: '#ccc',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: 500,
      paddingBottom: '2px',
      borderBottom: '2px solid transparent',
      transition: 'color 0.2s, border-color 0.2s',
    },
    activeLink: {
      color: '#f5f0e8',
      borderBottom: '2px solid #B87333',   // copper accent
    },
  };

  const getNavLinkStyle = ({ isActive }) => ({
    ...navStyle.link,
    ...(isActive ? navStyle.activeLink : {}),
  });

  return (
    <nav style={navStyle.wrapper} aria-label="Main navigation">
      <NavLink to="/" style={navStyle.brand}>
        BusinessDocument Expiry
      </NavLink>
      <ul style={navStyle.navList}>
        <li>
          <NavLink to="/" end style={getNavLinkStyle}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/documents" style={getNavLinkStyle}>
            Document Register
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
