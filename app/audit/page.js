'use client';
import { useState } from 'react';
import Header from '../../components/Header.jsx';
import AuditForm from '../../components/AuditForm.jsx';
import IntentConfirm from '../../components/IntentConfirm.jsx';
import AuditReport from '../../components/AuditReport.jsx';

export default function AuditPage() {
  const [step, setStep] = useState('idle');      // idle | confirming | done
  const [analysis, setAnalysis] = useState(null);
  const [intendedPhase, setIntendedPhase] = useState(null);

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
  }

  return (
    <>
      <Header />
      <main>
        <div className="audit-layout">

          {step === 'idle' && (
            <>
              <h1 className="audit-heading">Audit a doc.</h1>
              <p className="audit-sub">
                Paste a URL or markdown. Find out what day your doc is,
                and whether that is the experience you meant to create for developers.
              </p>
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
