import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const emptyForm = {
  preferredName: '',
  bio: '',
  currentCity: '',
  currentCountry: '',
  originStory: '',
  claimsToFame: '',
  hometownCity: '',
  hometownCountry: '',
  birthYear: '',
  currentJobTitle: '',
  currentEmployer: '',
  linkedinUrl: '',
  personalWebsiteUrl: '',
  languagesSpoken: '',
  commsVisibility: 'verified_only',
  searchParticipation: 'notify_only',
  notificationMode: 'in_app_only',
};

export default function ProfileEdit() {
  const { account } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!account) return;
    api
      .get('/profile/me')
      .then((p) => {
        setForm({
          preferredName: p.preferred_name || '',
          bio: p.bio || '',
          currentCity: p.current_city || '',
          currentCountry: p.current_country || '',
          originStory: p.origin_story || '',
          claimsToFame: p.claims_to_fame || '',
          hometownCity: p.detail?.hometown_city || '',
          hometownCountry: p.detail?.hometown_country || '',
          birthYear: p.detail?.birth_year || '',
          currentJobTitle: p.detail?.current_job_title || '',
          currentEmployer: p.detail?.current_employer || '',
          linkedinUrl: p.detail?.linkedin_url || '',
          personalWebsiteUrl: p.detail?.personal_website_url || '',
          languagesSpoken: p.detail?.languages_spoken || '',
          commsVisibility: p.commsVisibility,
          searchParticipation: p.searchParticipation,
          notificationMode: p.notificationMode,
        });
      })
      .finally(() => setLoading(false));
  }, [account]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/profile/me', { ...form, birthYear: form.birthYear ? Number(form.birthYear) : null });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!account) return <p className="muted"><Link to="/login">Log in</Link> to edit your profile.</p>;
  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="fun">Profile &amp; privacy</h2>
      <form onSubmit={onSubmit}>
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" value={form.bio} onChange={update('bio')} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="currentCity">Current city</label>
              <input id="currentCity" value={form.currentCity} onChange={update('currentCity')} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="currentCountry">Current country</label>
              <input id="currentCountry" value={form.currentCountry} onChange={update('currentCountry')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="originStory">Why I'm named Andy Dale</label>
            <textarea id="originStory" value={form.originStory} onChange={update('originStory')} />
          </div>
          <div className="field">
            <label htmlFor="claimsToFame">Claims to fame</label>
            <textarea id="claimsToFame" value={form.claimsToFame} onChange={update('claimsToFame')} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <p className="muted" style={{ fontSize: 12, marginTop: 0 }}>
            Visible only to verified Andys
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="hometownCity">Hometown</label>
              <input id="hometownCity" value={form.hometownCity} onChange={update('hometownCity')} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="hometownCountry">Hometown country</label>
              <input id="hometownCountry" value={form.hometownCountry} onChange={update('hometownCountry')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="birthYear">Birth year</label>
            <input id="birthYear" type="number" value={form.birthYear} onChange={update('birthYear')} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="currentJobTitle">Job title</label>
              <input id="currentJobTitle" value={form.currentJobTitle} onChange={update('currentJobTitle')} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="currentEmployer">Employer</label>
              <input id="currentEmployer" value={form.currentEmployer} onChange={update('currentEmployer')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="linkedinUrl">LinkedIn URL</label>
            <input id="linkedinUrl" value={form.linkedinUrl} onChange={update('linkedinUrl')} />
          </div>
          <div className="field">
            <label htmlFor="personalWebsiteUrl">Personal website</label>
            <input id="personalWebsiteUrl" value={form.personalWebsiteUrl} onChange={update('personalWebsiteUrl')} />
          </div>
          <div className="field">
            <label htmlFor="languagesSpoken">Languages spoken</label>
            <input id="languagesSpoken" value={form.languagesSpoken} onChange={update('languagesSpoken')} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <b style={{ fontSize: 13 }}>Who can message me</b>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, cursor: 'pointer' }}>
              <input
                type="radio"
                name="commsVisibility"
                checked={form.commsVisibility === 'verified_only'}
                onChange={() => setForm((f) => ({ ...f, commsVisibility: 'verified_only' }))}
              />{' '}
              Verified Andys only
            </label>
            <label style={{ fontSize: 13, cursor: 'pointer' }}>
              <input
                type="radio"
                name="commsVisibility"
                checked={form.commsVisibility === 'public'}
                onChange={() => setForm((f) => ({ ...f, commsVisibility: 'public' }))}
              />{' '}
              Anyone, including pending Andys
            </label>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <b style={{ fontSize: 13 }}>Find an Andy visibility</b>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['notify_only', "Notify me if I match a search — I stay hidden either way"],
              ['findable', 'Show me directly in search results'],
              ['invisible', 'Invisible — never notified, never shown'],
            ].map(([value, label]) => (
              <label key={value} style={{ fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="searchParticipation"
                  checked={form.searchParticipation === value}
                  onChange={() => setForm((f) => ({ ...f, searchParticipation: value }))}
                />{' '}
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <b style={{ fontSize: 13 }}>Message delivery</b>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, cursor: 'pointer' }}>
              <input
                type="radio"
                name="notificationMode"
                checked={form.notificationMode === 'in_app_only'}
                onChange={() => setForm((f) => ({ ...f, notificationMode: 'in_app_only' }))}
              />{' '}
              In-app only
            </label>
            <label style={{ fontSize: 13, cursor: 'pointer' }}>
              <input
                type="radio"
                name="notificationMode"
                checked={form.notificationMode === 'email_linked'}
                onChange={() => setForm((f) => ({ ...f, notificationMode: 'email_linked' }))}
              />{' '}
              Also email me new messages
            </label>
          </div>
        </div>

        {error && <p className="pill pill-locked">{error}</p>}
        {saved && <p className="pill pill-verified">Saved</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/profile')}>
            Back to profile
          </button>
        </div>
      </form>
    </div>
  );
}
