import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Ticker from '../components/Ticker';
import './Home.css';

export default function Home() {
  const { account } = useAuth();
  const [directory, setDirectory] = useState(null);

  useEffect(() => {
    api.get('/directory').then(setDirectory).catch(() => setDirectory(null));
  }, []);

  return (
    <div className="home">
      <div className="label eyebrow">andydale.me</div>
      <h1 className="fun home-title">Hi, my name is Andy Dale.</h1>
      <p className="home-lede">
        So is his. And hers, sort of. A small directory and message board for everyone who shares
        this exact name — to compare notes, prove you're really an Andy Dale, and talk to the
        others.
      </p>

      {!account && (
        <div className="home-ctas">
          <Link className="btn btn-primary" to="/join">
            Request to join
          </Link>
          <Link className="btn btn-ghost" to="/roster">
            See who's already here
          </Link>
        </div>
      )}

      {directory && (
        <div className="home-stats">
          <div className="stat">
            <b className="fun">{directory.verifiedCount}</b>verified Andys
          </div>
          <div className="stat">
            <b className="fun">{directory.countryCount}</b>countries so far
          </div>
        </div>
      )}

      <div className="board">
        <div className="name-badge hero-badge t1">
          <div className="badge-eyelet" />
          <div className="badge-hello">Hello, my name is</div>
          <div className="badge-name fun">Andy Dale</div>
          <div className="badge-sub">and this is where all of us end up</div>
        </div>

        {directory && (
          <>
            <Ticker label="Andy Dale lives in:" items={directory.cities} tilt="t2" />
            <Ticker label="Andy Dale can:" items={directory.skills} tilt="t3" />
            <Ticker label="Andy Dale's hobbies:" items={directory.hobbies} tilt="t1" />
          </>
        )}
      </div>
    </div>
  );
}
