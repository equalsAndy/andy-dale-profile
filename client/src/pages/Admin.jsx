import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Admin() {
  const { account } = useAuth();
  const [requests, setRequests] = useState([]);

  const load = () => api.get('/admin/join-requests').then((r) => setRequests(r.requests)).catch(() => {});

  useEffect(() => {
    if (account?.is_admin) load();
  }, [account]);

  if (!account?.is_admin) return <p className="muted">Admins only.</p>;

  const decide = (id, action) => async () => {
    await api.post(`/admin/join-requests/${id}/${action}`);
    load();
  };

  return (
    <div>
      <h2 className="fun">Approval queue</h2>
      {requests.map((r) => (
        <div className="card" key={r.request_id} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b>
              {r.first_name} {r.last_name} — {r.login_email}
            </b>
            <span className={`pill ${r.status === 'pending' ? 'pill-pending' : 'pill-verified'}`}>
              {r.status}
            </span>
          </div>
          {r.notes && (
            <p className="muted" style={{ fontSize: 13 }}>
              {r.notes}
            </p>
          )}
          {r.status === 'pending' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={decide(r.request_id, 'approve')}>
                Approve
              </button>
              <button className="btn btn-deny" onClick={decide(r.request_id, 'deny')}>
                Deny
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
