'use client';
import { useState } from 'react';
import Header from '../../components/Header.jsx';
import AuditForm from '../../components/AuditForm.jsx';
import ReportView from '../../components/ReportView.jsx';

export default function AuditPage() {
  const [result, setResult] = useState(null);
  return (
    <>
      <Header />
      <main>
        {result
          ? <div className="audit-layout">
              <ReportView data={result} />
              <button className="btn btn-ghost" onClick={() => setResult(null)}>← Audit another</button>
            </div>
          : <div className="audit-layout">
              <h1 className="audit-heading">Audit a doc</h1>
              <p className="audit-sub">Paste a URL or markdown to analyze against the Day 0/1/2 framework.</p>
              <AuditForm onResult={setResult} />
            </div>}
      </main>
    </>
  );
}
