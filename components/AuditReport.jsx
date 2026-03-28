'use client';

const PHASE_INFO = {
  day0: { name: 'Day 0', label: 'Pre-Commitment', colorClass: 'phase-day0' },
  day1: { name: 'Day 1', label: 'Getting Started', colorClass: 'phase-day1' },
  day2: { name: 'Day 2', label: 'Production',      colorClass: 'phase-day2' },
};

function SignalList({ items, variant }) {
  if (!items?.length) return null;
  return (
    <ul className="ar-signal-list">
      {items.map((label, i) => (
        <li key={i} className={`ar-signal-item ar-signal-${variant}`}>
          <span className="ar-signal-marker">{variant === 'present' ? '✓' : '○'}</span>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AuditReport({ analysis, intendedPhase, onReset }) {
  const isMatch = analysis.detectedPhase === intendedPhase;
  const detected = PHASE_INFO[analysis.detectedPhase];
  const intended = PHASE_INFO[intendedPhase];
  const intendedData = analysis.phases?.[intendedPhase];
  const detectedData = analysis.phases?.[analysis.detectedPhase];

  const scoreLabel =
    intendedData?.qualityScore === intendedData?.maxScore
      ? 'All signals present.'
      : intendedData?.qualityScore >= Math.ceil(intendedData?.maxScore * 0.6)
      ? 'Most signals present.'
      : 'Missing several key signals.';

  return (
    <div className="ar-wrap">

      {/* Header */}
      <div className="ar-header">
        {analysis.source && analysis.source !== 'pasted-content' && (
          <p className="ar-source">{analysis.source}</p>
        )}

        {isMatch ? (
          <h2 className="ar-title">
            This is a{' '}
            <span className={`ar-phase ${intended?.colorClass}`}>{intended?.name} doc,</span>{' '}
            {intended?.label.toLowerCase()}.
          </h2>
        ) : (
          <h2 className="ar-title">
            This reads like a{' '}
            <span className={`ar-phase ${detected?.colorClass}`}>{detected?.name} doc,</span>{' '}
            but you intended{' '}
            <span className={`ar-phase ${intended?.colorClass}`}>{intended?.name}.</span>
          </h2>
        )}

        {!isMatch && (
          <p className="ar-title-sub">
            Here is what is pulling it in the wrong direction, and what it is missing to serve a {intended?.name} reader.
          </p>
        )}
      </div>

      {/* Ambiguity callout */}
      {analysis.isAmbiguous && (
        <div className="ar-ambiguity">
          <p className="ar-ambiguity-label">Note on ambiguity</p>
          <p className="ar-ambiguity-body">{analysis.ambiguityNote}</p>
        </div>
      )}

      {/* Mismatch diff: what's making it read as the detected phase */}
      {!isMatch && detectedData?.signalsFiredLabels?.length > 0 && (
        <div className="ar-section">
          <p className="ar-section-label">
            What is making it read like a {detected?.name} doc
          </p>
          <SignalList items={detectedData.signalsFiredLabels} variant="present" />
        </div>
      )}

      {/* Score for intended phase */}
      <div className="ar-section">
        <p className="ar-section-label">
          {isMatch
            ? `How well it serves a ${intended?.name} reader`
            : `What it is missing for a ${intended?.name} reader`}
        </p>

        <div className="ar-score">
          <span className="ar-score-num">{intendedData?.qualityScore}</span>
          <span className="ar-score-denom">/ {intendedData?.maxScore}</span>
          <span className="ar-score-phrase">{intended?.label} signals present. {scoreLabel}</span>
        </div>

        {intendedData?.signalsFiredLabels?.length > 0 && (
          <SignalList items={intendedData.signalsFiredLabels} variant="present" />
        )}
        {intendedData?.signalsMissedLabels?.length > 0 && (
          <SignalList items={intendedData.signalsMissedLabels} variant="missing" />
        )}
      </div>

      {/* Suggestions */}
      {intendedData?.suggestions?.length > 0 && (
        <div className="ar-section">
          <p className="ar-section-label">How to make it stronger</p>
          <div className="ar-suggestions">
            {intendedData.suggestions.map((s, i) => (
              <div key={i} className="ar-suggestion">
                <span className="ar-suggestion-num">{i + 1}.</span>
                <span className="ar-suggestion-text">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ar-actions">
        <button className="btn-tree-reset" onClick={onReset}>Audit another doc</button>
      </div>

    </div>
  );
}
