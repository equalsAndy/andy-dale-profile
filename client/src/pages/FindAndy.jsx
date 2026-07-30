import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function FindAndy() {
  const { account } = useAuth();
  const [hometownCity, setHometownCity] = useState('');
  const [message, setMessage] = useState('');
  const [searcherEmail, setSearcherEmail] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const onSearch = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const r = await api.post('/search', {
        hometownCity,
        message,
        searcherEmail: account ? undefined : searcherEmail || undefined,
      });
      setResults(r.findableMatches);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="fun">Find an Andy</h2>
      <p className="muted" style={{ maxWidth: '56ch' }}>
        Looking for a specific Andy Dale you already know — an old classmate, a relative, whoever?
        Search by anything you remember about them.
      </p>
      <form onSubmit={onSearch} className="card" style={{ maxWidth: 420 }}>
        <div className="field">
          <label htmlFor="hometownCity">Grew up near</label>
          <input id="hometownCity" value={hometownCity} onChange={(e) => setHometownCity(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="message">Message (shown to matches who don't appear directly)</label>
          <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        {!account && (
          <div className="field">
            <label htmlFor="searcherEmail">Your email (so a match can get back to you — optional)</label>
            <input
              id="searcherEmail"
              type="email"
              value={searcherEmail}
              onChange={(e) => setSearcherEmail(e.target.value)}
            />
          </div>
        )}
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
