'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ activeView, onViewChange }) {
  const [theme, setTheme] = useState('dark');
  const pathname = usePathname();
  const isAuditPage = pathname === '/audit';

  useEffect(() => {
    const saved = localStorage.getItem('doc-audit-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = saved ?? (prefersDark ? 'dark' : 'light');
    setTheme(resolved);
    if (resolved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
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

  const navItems = [
    { id: 'argument', label: 'The Argument' },
    { id: 'tree',     label: 'The Tree' },
    { id: 'agents',   label: 'For Agents', isAgent: true },
  ];

  function handleNavClick(id) {
    if (onViewChange) onViewChange(id);
  }

  // Arrow-key navigation within primary nav
  const navRef = useRef(null);
  function handleNavKeyDown(e) {
    const items = [...navRef.current.querySelectorAll('.primary-nav-item:not([data-link])')];
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowRight' && idx < items.length - 1) { e.preventDefault(); items[idx + 1].focus(); }
    if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); items[idx - 1].focus(); }
  }

  return (
    <header className="site-header" role="banner">
      <Link href="/" className="site-logo" aria-label="doc-audit — go to home">
        doc-audit
      </Link>

      <nav
        className="primary-nav"
        aria-label="Site sections"
        role="tablist"
        ref={navRef}
        onKeyDown={handleNavKeyDown}
      >
        {navItems.map(item => {
          const isActive = isAuditPage ? false : activeView === item.id;
          if (isAuditPage) {
            // On audit page, render as links back to home with the view
            return (
              <Link
                key={item.id}
                href={`/?view=${item.id}`}
                className={`primary-nav-item${item.isAgent ? ' pni-agent' : ''}`}
                data-link="true"
                role="tab"
                aria-selected="false"
              >
                {item.label}
              </Link>
            );
          }
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`view-${item.id}`}
              className={`primary-nav-item${item.isAgent ? ' pni-agent' : ''}${isActive ? ' pni-active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          );
        })}

        <Link
          href="/audit"
          className={`primary-nav-item${isAuditPage ? ' pni-active' : ''}`}
          data-link="true"
          role="tab"
          aria-selected={isAuditPage}
        >
          Audit a Doc
        </Link>
      </nav>

      <div className="header-right">
        <button
          className="header-theme-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '○' : '●'}
        </button>
        <a
          href="https://dev.to/daniellewashington/documentation-is-a-decision-system-not-a-knowledge-base-4139"
          target="_blank"
          rel="noopener noreferrer"
          className="header-ext-link"
          aria-label="Read the post (opens in new tab)"
        >
          Read the post ↗
        </a>
      </div>
    </header>
  );
}
