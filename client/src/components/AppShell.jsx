import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppShell.css';

const LOGGED_IN_ITEMS = [
  { to: '/', label: 'Home', icon: '🪪', end: true },
  { to: '/find', label: 'Find', icon: '🔎' },
  { to: '/inbox', label: 'Inbox', icon: '✉️' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const LOGGED_OUT_ITEMS = [
  { to: '/', label: 'Home', icon: '🪪', end: true },
  { to: '/find', label: 'Find', icon: '🔎' },
  { to: '/roster', label: 'Roster', icon: '📋' },
  { to: '/join', label: 'Join', icon: '🙋' },
  { to: '/login', label: 'Log in', icon: '🔑' },
];

export default function AppShell() {
  const { account, loading } = useAuth();
  const navItems = account ? LOGGED_IN_ITEMS : LOGGED_OUT_ITEMS;

  return (
    <div className="shell">
      <header className="shell-topnav">
        <div className="shell-brand fun">
          <span className="shell-badge fun">AD</span> Andy Dale
        </div>
        {!loading && (
          <nav className="shell-toplinks">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="shell-toplink">
                {item.label}
              </NavLink>
            ))}
            {!!account?.is_admin && (
              <NavLink to="/admin" className="shell-toplink">
                Admin
              </NavLink>
            )}
          </nav>
        )}
      </header>

      <main className="shell-content">
        <Outlet />
      </main>

      {!loading && (
        <nav className="shell-tabbar">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="shell-tab">
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
