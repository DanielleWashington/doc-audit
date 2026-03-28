'use client';
import { useEffect, useState } from 'react';

const PHASE_MAP = { day0: 'Day 0', day1: 'Day 1', day2: 'Day 2', unknown: '?' };

function CoverageBar({ phase, count, total }) {
  const [width, setWidth] = useState('0%');
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct + '%'), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="coverage-row">
      <span className={`coverage-label ${phase}`}>{PHASE_MAP[phase]}</span>
      <div className="coverage-bar-wrap">
        <div className={`coverage-bar-fill ${phase}`} style={{ width }} />
      </div>
      <span className="coverage-count">{count} of {total}</span>
    </div>
  );
}

export default function ReportView({ data, onBack }) {
  const source = data.source ?? data.docsPath ?? '';
  const total = data.summary?.total ?? 1;
  const counts = data.summary?.phaseCounts ?? {};
  const files = (data.files ?? []).filter(f => !f.skipped && !f.flaggedForDeletion);
  const recs = data.recommendations ?? [];

  return (
    <div className="report-view">
      <div className="report-header">
        <h2 className="report-title">Audit Report</h2>
        {source && <p className="report-path">{source}</p>}
      </div>

      <div className="section">
        <p className="section-label">Phase Coverage</p>
        {['day0', 'day1', 'day2'].map(phase => (
          <CoverageBar key={phase} phase={phase} count={counts[phase] ?? 0} total={total} />
        ))}
      </div>

      <div className="section">
        <p className="section-label">Decision Quality</p>
        <div className="file-cards">
          {files.map(f => {
            const score = f.qualityScore ?? 0;
            const max = f.maxQualityScore ?? 8;
            const tier = score >= 6 ? 'high' : score >= 3 ? 'mid' : 'low';
            const label = score >= 6 ? 'Strong decision doc' : score >= 3 ? 'Partially decision-oriented' : 'Knowledge dump';
            const phase = f.confirmedPhase ?? f.detectedPhase ?? 'unknown';
            return (
              <div className="file-card" key={f.fileName}>
                <div className={`file-score-ring ${tier}`}>{score}/{max}</div>
                <div className="file-info">
                  <div className="file-name">{f.fileName}</div>
                  <div className="file-meta">{PHASE_MAP[phase] ?? phase} · {f.wordCount ?? '?'} words · {label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {recs.length > 0 && (
        <div className="section">
          <p className="section-label">Recommendations</p>
          <div className="rec-list">
            {recs.map((rec, i) => (
              <div className="rec-item" key={i}>
                <span className="rec-num">{i + 1}.</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onBack && (
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      )}
    </div>
  );
}
