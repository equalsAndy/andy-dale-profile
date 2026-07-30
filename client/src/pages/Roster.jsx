import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Roster() {
  const [roster, setRoster] = useState(null);

  useEffect(() => {
    api.get('/directory/roster').then((r) => setRoster(r.roster)).catch(() => setRoster([]));
  }, []);

  return (
    <div>
      <h2 className="fun">Who's already here</h2>
      <p className="muted" style={{ maxWidth: '56ch' }}>
        Andys who've chosen to be publicly findable. No account needed to browse — log in to search
        by more specific details, or to get in touch.
      </p>
      {roster === null && <p className="muted">Loading…</p>}
      {roster?.length === 0 && <p className="muted">No one's opted into the public roster yet.</p>}
      {roster?.map((p) => (
        <div className="card" key={p.profile_id} style={{ marginBottom: 10 }}>
          <b>
            {p.first_name} {p.last_name}
            {p.preferred_name ? ` "${p.preferred_name}"` : ''}
          </b>
          {p.current_city && (
            <p className="muted" style={{ fontSize: 13, margin: '4px 0 0' }}>
              {p.current_city}
              {p.current_country ? `, ${p.current_country}` : ''}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
