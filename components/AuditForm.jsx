'use client';
import { useState } from 'react';

export default function AuditForm({ onResult }) {
  const [url, setUrl] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim() && !markdown.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const body = url.trim() ? { url: url.trim() } : { markdown: markdown.trim() };
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        onResult(data);
      }
    } catch {
      setError('Network error — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="audit-loading">Analyzing… ████████░░</div>;
  }

  return (
    <form className="audit-form" onSubmit={handleSubmit}>
      <input
        className="audit-input"
        type="url"
        placeholder="https://your-project.com/docs/getting-started"
        value={url}
        onChange={e => setUrl(e.target.value)}
        autoFocus
      />

      {!showMarkdown && (
        <button
          type="button"
          className="audit-expand-btn"
          onClick={() => setShowMarkdown(true)}
        >
          or paste markdown below ↓
        </button>
      )}

      {showMarkdown && (
        <>
          <p className="audit-divider">— or —</p>
          <textarea
            className="audit-input audit-textarea"
            placeholder="# Getting Started&#10;&#10;Paste your markdown here..."
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
          />
        </>
      )}

      {error && <p className="audit-error">{error}</p>}

      <button
        className="btn btn-primary"
        type="submit"
        disabled={!url.trim() && !markdown.trim()}
        style={{ alignSelf: 'flex-start' }}
      >
        Audit this doc →
      </button>
    </form>
  );
}
