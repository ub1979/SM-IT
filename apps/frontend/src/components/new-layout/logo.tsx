import Link from 'next/link';

export const Logo = () => (
  <Link href="/launches" className="app-brand" aria-label="SM-IT home">
    <img src="/logo.svg" width="42" height="42" alt="" />
    <span>
      <strong>SM-IT</strong>
      <small>Your publishing studio</small>
    </span>
  </Link>
);
