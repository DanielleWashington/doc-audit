'use client';

const PHASE_INFO = {
  day0: {
    name: 'Day 0',
    label: 'Pre-Commitment',
    description: 'A developer deciding whether to adopt this at all. They have not committed yet. They need fit assessment, tradeoffs, and honest comparison.',
  },
  day1: {
    name: 'Day 1',
    label: 'Getting Started',
    description: 'A developer trying to get from zero to working for the first time. They need a clear first step, a sequence, and a definition of done.',
  },
  day2: {
    name: 'Day 2',
    label: 'Production',
    description: 'A developer debugging, tuning, or operating this in a live environment. They are under pressure and need triage, not context.',
  },
  unknown: {
    name: 'Unclear',
    label: 'No dominant phase',
    description: 'The doc did not match strongly against any one phase. It may be too short, too general, or genuinely trying to serve multiple moments at once.',
  },
};

const CONFIDENCE_COPY = {
  high: null,
  medium: 'The signals lean this way, but a few point in other directions.',
  low: 'The signals are mixed. This could be a short doc, a general one, or something genuinely ambiguous.',
};

export default function IntentConfirm({ analysis, onConfirm, onBack }) {
  const detected = analysis.detectedPhase;
  const info = PHASE_INFO[detected] ?? PHASE_INFO.unknown;
  const confidenceCopy = CONFIDENCE_COPY[analysis.confidence];
  const isUnknown = detected === 'unknown';

  return (
    <div className="ic-wrap">

      <p className="ic-kicker">Analysis complete — {analysis.wordCount} words analyzed</p>

      <div className="ic-detection">
        {isUnknown ? (
          <>
            <p className="ic-detected-label">No dominant phase detected.</p>
            <p className="ic-detected-desc">{info.description}</p>
          </>
        ) : (
          <>
            <p className="ic-detected-label">This reads like a</p>
            <p className="ic-detected-phase">
              <strong>{info.name}</strong> doc, {info.label.toLowerCase()}.
            </p>
            <p className="ic-detected-desc">{info.description}</p>
          </>
        )}

        {confidenceCopy && (
          <p className="ic-confidence">{confidenceCopy}</p>
        )}
      </div>

      {analysis.isAmbiguous && (
        <div className="ic-ambiguity">
          <p className="ic-ambiguity-label">Ambiguity detected</p>
          <p className="ic-ambiguity-body">{analysis.ambiguityNote}</p>
        </div>
      )}

      <div className="ic-question-block">
        <p className="ic-question">
          Is that the experience you want developers to have when they arrive here?
        </p>

        <div className="ic-actions">
          {!isUnknown && (
            <button className="ic-btn-yes" onClick={() => onConfirm(detected)}>
              Yes, {info.name} is what I intended
            </button>
          )}

          <p className="ic-or">
            {isUnknown ? 'What did you intend this doc to be?' : 'No, I intended this to be a'}
          </p>

          <div className="ic-day-btns">
            {(['day0', 'day1', 'day2']).filter(d => isUnknown || d !== detected).map(d => {
              const p = PHASE_INFO[d];
              return (
                <button key={d} className="ic-day-btn" onClick={() => onConfirm(d)}>
                  <span className="ic-day-name">{p.name}</span>
                  <span className="ic-day-label">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button className="btn-tree-back" onClick={onBack} style={{ marginTop: '36px' }}>
        ← Audit a different doc
      </button>

    </div>
  );
}
