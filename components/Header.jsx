'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('doc-audit-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved ?? (prefersDark ? 'dark' : 'light'));
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('doc-audit-theme', next);
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  return (
    <header className="util-bar">
      <Link href="/" className="util-logo">doc-audit</Link>
      <div className="util-right">
        <button
          className="theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '○' : '●'}
        </button>
        <Link href="/audit" className="util-link is-accent">Audit a doc</Link>
        <a
          href="https://dev.to/daniellewashington/documentation-is-a-decision-system-not-a-knowledge-base-4139"
          target="_blank"
          rel="noopener noreferrer"
          className="util-link"
        >
          Read the post ↗
        </a>
      </div>
    </header>
  );
}
