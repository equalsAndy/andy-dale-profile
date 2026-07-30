import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function FindAndy() {
  const { account } = useAuth();
  const [hometownCity, setHometownCity] = useState('');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  if (!account) return <p className="muted"><Link to="/login">Log in</Link> to search.</p>;
  if (account.membership_status !== 'verified') {
    return <p className="muted">Find an Andy is available to verified accounts.</p>;
  }

  const onSearch = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const r = await api.post('/search', { hometownCity, message });
      setResults(r.findableMatches);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="fun">Find an Andy</h2>
      <form onSubmit={onSearch} className="card" style={{ maxWidth: 420 }}>
        <div className="field">
          <label htmlFor="hometownCity">Grew up near</label>
          <input id="hometownCity" value={hometownCity} onChange={(e) => setHometownCity(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="message">Message (shown to matches who don't appear directly)</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        {error && <p className="pill pill-locked">{error}</p>}
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {results && (
        <div style={{ marginTop: 16 }}>
          {results.length === 0 && <p className="muted">No directly-findable matches.</p>}
          {results.map((r) => (
            <div className="card" key={r.profile_id} style={{ marginBottom: 10 }}>
              <b>
                {r.first_name} {r.last_name}
              </b>
              <p className="muted" style={{ fontSize: 13 }}>
                {r.current_city}
                {r.current_country ? `, ${r.current_country}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
