import { useEffect, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function Ticker({ label, items, tilt = '' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2 || prefersReducedMotion()) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 2200);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <div className={`name-badge ${tilt}`}>
      <div className="badge-eyelet" />
      <div className="badge-label label">{label}</div>
      {items.length === 0 ? (
        <div className="ticker-empty muted">Not enough Andys yet — check back soon</div>
      ) : (
        <div className="ticker-item fun">{items[index % items.length]}</div>
      )}
    </div>
  );
}
