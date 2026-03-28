'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [theme, setTheme] = useState('dark');
  const [mode, setMode] = useState('human');

  useEffect(() => {
    const saved = localStorage.getItem('doc-audit-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved ?? (prefersDark ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    document.body.classList.toggle('agent-mode', mode === 'agent');
  }, [mode]);

  function applyTheme(next) {
    setTheme(next);
    localStorage.setItem('doc-audit-theme', next);
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function toggleTheme() {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <header>
      <Link className="logo" href="/">doc-audit</Link>
      <div className="header-right">
        <button
          className="theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle light/dark mode"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="toggle-group">
          <button
            className={`toggle-btn${mode === 'human' ? ' active' : ''}`}
            onClick={() => setMode('human')}
          >
            Human
          </button>
          <button
            className={`toggle-btn${mode === 'agent' ? ' active' : ''}`}
            onClick={() => setMode('agent')}
          >
            Agent
          </button>
        </div>
        <Link className="blog-link" href="/audit">Try the tool →</Link>
        <a
          className="blog-link"
          href="https://dev.to/daniellewashington/documentation-is-a-decision-system-not-a-knowledge-base-4139"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the post ↗
        </a>
      </div>
    </header>
  );
}
