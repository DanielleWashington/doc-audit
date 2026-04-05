'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header.jsx';
import AuditForm from '../../components/AuditForm.jsx';
import IntentConfirm from '../../components/IntentConfirm.jsx';
import AuditReport from '../../components/AuditReport.jsx';

function AuditPageInner() {
  const searchParams = useSearchParams();
  const autoUrl = searchParams.get('url');

  const [step, setStep] = useState('idle');
  const [analysis, setAnalysis] = useState(null);
  const [intendedPhase, setIntendedPhase] = useState(null);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoError, setAutoError] = useState(null);

  function handleAnalysis(data) {
    setAnalysis(data);
    setStep('confirming');
  }

  function handleConfirm(phase) {
    setIntendedPhase(phase);
    setStep('done');
  }

  function reset() {
    setStep('idle');
    setAnalysis(null);
    setIntendedPhase(null);
    setAutoRunning(false);
    setAutoError(null);
  }

  useEffect(() => {
    if (!autoUrl) return;
    setAutoRunning(true);
    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: autoUrl }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setAutoError(data.error);
          setAutoRunning(false);
        } else {
          handleAnalysis(data);
        }
      })
      .catch(() => {
        setAutoError('Network error — check your connection and try again.');
        setAutoRunning(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main>
        <div className="audit-layout">

          {step === 'idle' && autoRunning && (
            <div className="audit-loading">Analyzing… ████████░░</div>
          )}

          {step === 'idle' && !autoRunning && (
            <>
              <h1 className="audit-heading">Audit a doc.</h1>
              <p className="audit-sub">
                Paste a URL or markdown. Find out what day your doc is,
                and whether that is the experience you meant to create for developers.
              </p>
              {autoError && <p className="audit-error">{autoError}</p>}
              <AuditForm onResult={handleAnalysis} />
            </>
          )}

          {step === 'confirming' && (
            <IntentConfirm
              analysis={analysis}
              onConfirm={handleConfirm}
              onBack={reset}
            />
          )}

          {step === 'done' && (
            <AuditReport
              analysis={analysis}
              intendedPhase={intendedPhase}
              onReset={reset}
            />
          )}

        </div>
      </main>
    </>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={null}>
      <AuditPageInner />
    </Suspense>
  );
}
