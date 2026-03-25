'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo">
          <div className="logo-icon">🍽️</div>
          <span>MenuAI</span>
        </Link>
        <span className="navbar-badge">AI Powered</span>
      </div>
    </nav>
  );
}
