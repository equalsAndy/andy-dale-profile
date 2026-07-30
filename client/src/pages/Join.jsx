import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Join() {
  const { signup, account } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    loginEmail: '',
    password: '',
    firstName: 'Andy',
    lastName: 'Dale',
    note: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const acc = await signup(fields);
      if (acc?.membership_status === 'verified') {
        navigate('/');
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted || account?.membership_status === 'pending') {
    return (
      <div className="card" style={{ maxWidth: 420, margin: '0 auto', background: 'var(--teal-bg)' }}>
        <div className="pill pill-pending">Pending review</div>
        <p style={{ marginTop: 10 }}>
          We'll let you know once an admin has reviewed your request. Most requests are handled
          within a few days.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2 className="fun" style={{ marginTop: 0 }}>
        Request to join
      </h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="firstName">First name</label>
          <input id="firstName" value={fields.firstName} onChange={update('firstName')} />
        </div>
        <div className="field">
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" value={fields.lastName} onChange={update('lastName')} />
        </div>
        <div className="field">
          <label htmlFor="loginEmail">Login email — private, never shown to other Andys</label>
          <input
            id="loginEmail"
            type="email"
            required
            value={fields.loginEmail}
            onChange={update('loginEmail')}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password (at least 10 characters)</label>
          <input
            id="password"
            type="password"
            required
            minLength={10}
            value={fields.password}
            onChange={update('password')}
          />
        </div>
        <div className="field">
          <label htmlFor="note">Anything that helps us confirm it's really you (optional)</label>
          <textarea id="note" value={fields.note} onChange={update('note')} />
        </div>
        {error && (
          <p className="pill pill-locked" style={{ display: 'block', marginBottom: 12 }}>
            {error}
          </p>
        )}
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
      <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
