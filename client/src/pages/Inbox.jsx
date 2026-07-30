import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Inbox() {
  const { account } = useAuth();
  const [threads, setThreads] = useState([]);
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    if (!account) return;
    api.get('/threads').then((r) => setThreads(r.threads)).catch(() => {});
    api.get('/connection-requests').then(setRequests).catch(() => {});
  }, [account]);

  if (!account) return <p className="muted">Log in to see your inbox.</p>;

  return (
    <div>
      <h2 className="fun">Inbox</h2>

      {requests?.incoming?.length > 0 && (
        <>
          <h3 style={{ fontSize: 14 }}>Requests waiting on you</h3>
          {requests.incoming.map((r) => (
            <div className="card" key={r.request_id} style={{ marginBottom: 10 }}>
              <b>
                {r.first_name} {r.last_name}
              </b>
              <p className="muted" style={{ fontSize: 13 }}>
                {r.message}
              </p>
            </div>
          ))}
        </>
      )}

      <h3 style={{ fontSize: 14 }}>Conversations</h3>
      {threads.length === 0 && <p className="muted">No conversations yet.</p>}
      {threads.map((t) => (
        <div className="card" key={t.thread_id} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b>
              {t.first_name} {t.last_name}
              {t.current_city ? ` · ${t.current_city}` : ''}
            </b>
            {t.unread_count > 0 && <span className="pill pill-verified">{t.unread_count} new</span>}
          </div>
          <p className="muted" style={{ fontSize: 13, margin: '4px 0 0' }}>
            {t.last_message}
          </p>
        </div>
      ))}
    </div>
  );
}
