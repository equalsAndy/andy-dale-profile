import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Profile() {
  const { account, logout } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (account) api.get('/profile/me').then(setProfile).catch(() => {});
  }, [account]);

  if (!account) {
    return <p className="muted"><Link to="/login">Log in</Link> to see your profile.</p>;
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2 className="fun" style={{ marginTop: 0 }}>
        {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading…'}
      </h2>
      <p className="muted">{account.login_email}</p>
      <span className={`pill ${account.membership_status === 'verified' ? 'pill-verified' : 'pill-pending'}`}>
        {account.membership_status}
      </span>
      {account.is_admin ? <span className="pill pill-verified" style={{ marginLeft: 6 }}>Admin</span> : null}
      <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
        Full profile &amp; privacy editing is coming in the next pass — for now this confirms the
        API is wired up correctly.
      </p>
      <button className="btn btn-ghost" onClick={logout} style={{ marginTop: 8 }}>
        Log out
      </button>
    </div>
  );
}
