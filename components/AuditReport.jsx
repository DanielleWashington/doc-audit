'use client';
import { useState } from 'react';

const PHASE_INFO = {
  day0: { name: 'Day 0', label: 'Pre-Commitment', colorClass: 'phase-day0' },
  day1: { name: 'Day 1', label: 'Getting Started', colorClass: 'phase-day1' },
  day2: { name: 'Day 2', label: 'Production',      colorClass: 'phase-day2' },
};

const AGENT_SUGGESTIONS = {
  'explicit-conditionals': 'Add explicit if/then conditionals for every decision point. An agent cannot interpret implied choices — write "if X then do Y, otherwise do Z" rather than leaving the agent to infer the condition.',
  'unambiguous-defaults': 'Replace vague qualifiers like "for most users" or "typically" with explicit conditions. Define exactly who should take each path, so an agent can evaluate whether it applies to the current context.',
  'atomic-steps': 'Make each step produce a single, verifiable outcome. State what the developer should see or have after completing the step — an agent needs a concrete success condition to know whether to proceed.',
  'error-recovery': 'Add a recovery path directly after each step that can fail. State whether to retry, roll back, or stop. An agent that encounters a failure needs adjacent instructions, not a troubleshooting section at the end.',
  'self-contained': 'Remove cross-references that require reading other sections to proceed. An agent processing one section at a time cannot follow "see section 3" — each section must be a complete unit of instruction.',
};

function SignalList({ items, variant, showStatus = false }) {
  if (!items?.length) return null;
  return (
    <ul className="ar-signal-list" aria-label={variant === 'present' ? 'Signals present' : 'Signals missing'}>
      {items.map((label, i) => (
        <li key={i} className={`ar-signal-item ar-signal-${variant}`}>
          <span className="ar-signal-marker" aria-hidden="true">{variant === 'present' ? '✓' : '○'}</span>
          <span>{label}</span>
          {showStatus && (
            <span className="ar-signal-status">
              {variant === 'present' ? 'Present' : 'Missing'}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function AuditReport({ analysis, intendedPhase, onReset }) {
  const [reportTab, setReportTab] = useState('human');

  const isMatch = analysis.detectedPhase === intendedPhase;
  const detected = PHASE_INFO[analysis.detectedPhase];
  const intended = PHASE_INFO[intendedPhase];
  const intendedData = analysis.phases?.[intendedPhase];
  const detectedData = analysis.phases?.[analysis.detectedPhase];
  const agentData = analysis.agentReadability;

  const scoreLabel =
    intendedData?.qualityScore === intendedData?.maxScore
      ? 'All signals present.'
      : intendedData?.qualityScore >= Math.ceil(intendedData?.maxScore * 0.6)
      ? 'Most signals present.'
      : 'Missing several key signals.';

  const agentScoreLabel = agentData
    ? agentData.score === agentData.maxScore
      ? 'All agent signals present.'
      : agentData.score >= 3
      ? 'Missing some agent signals.'
      : 'Missing several agent signals.'
    : '';

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

      {/* Report tabs */}
      <div className="report-tabs" role="tablist" aria-label="Analysis perspective">
        <button
          role="tab"
          aria-selected={reportTab === 'human'}
          aria-controls="report-panel-human"
          id="rtab-human"
          className={`report-tab${reportTab === 'human' ? ' rt-human-active' : ''}`}
          onClick={() => setReportTab('human')}
        >
          For humans
        </button>
        <button
          role="tab"
          aria-selected={reportTab === 'agent'}
          aria-controls="report-panel-agent"
          id="rtab-agent"
          className={`report-tab${reportTab === 'agent' ? ' rt-agent-active' : ''}`}
          onClick={() => setReportTab('agent')}
        >
          For agents
          {agentData && (
            <span className="report-tab-badge" aria-label={`Agent score: ${agentData.score} out of ${agentData.maxScore}`}>
              {agentData.score}/{agentData.maxScore}
            </span>
          )}
        </button>
      </div>

      {/* Human analysis panel */}
      <div
        id="report-panel-human"
        className={`report-panel${reportTab === 'human' ? ' rp-active' : ''}`}
        role="tabpanel"
        aria-labelledby="rtab-human"
        hidden={reportTab !== 'human'}
      >
        {/* Mismatch diff */}
        {!isMatch && detectedData?.signalsFiredLabels?.length > 0 && (
          <div className="ar-section">
            <p className="ar-section-label">
              What is making it read like a {detected?.name} doc
            </p>
            <SignalList items={detectedData.signalsFiredLabels} variant="present" showStatus />
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
            <span className="ar-score-num" aria-label={`Score: ${intendedData?.qualityScore} out of ${intendedData?.maxScore}`}>
              {intendedData?.qualityScore}
            </span>
            <span className="ar-score-denom" aria-hidden="true">/ {intendedData?.maxScore}</span>
            <span className="ar-score-phrase">{intended?.label} signals present. {scoreLabel}</span>
          </div>
          {intendedData?.signalsFiredLabels?.length > 0 && (
            <SignalList items={intendedData.signalsFiredLabels} variant="present" showStatus />
          )}
          {intendedData?.signalsMissedLabels?.length > 0 && (
            <SignalList items={intendedData.signalsMissedLabels} variant="missing" showStatus />
          )}
        </div>

        {/* Suggestions */}
        {intendedData?.suggestions?.length > 0 && (
          <div className="ar-section">
            <p className="ar-section-label">How to make it stronger</p>
            <div className="ar-suggestions" role="list">
              {intendedData.suggestions.map((s, i) => (
                <div key={i} className="ar-suggestion" role="listitem">
                  <span className="ar-suggestion-num" aria-label={`Suggestion ${i + 1}`}>{i + 1}.</span>
                  <span className="ar-suggestion-text">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Agent analysis panel */}
      <div
        id="report-panel-agent"
        className={`report-panel${reportTab === 'agent' ? ' rp-active' : ''}`}
        role="tabpanel"
        aria-labelledby="rtab-agent"
        hidden={reportTab !== 'agent'}
      >
        {agentData ? (
          <>
            <div className="ar-section">
              <p className="ar-section-label">Agent readability — 5 signals</p>
              <div className="ar-score">
                <span
                  className="ar-score-num ans-agent"
                  aria-label={`Agent score: ${agentData.score} out of ${agentData.maxScore}`}
                >
                  {agentData.score}
                </span>
                <span className="ar-score-denom" aria-hidden="true">/ {agentData.maxScore}</span>
                <span className="ar-score-phrase">{agentScoreLabel}</span>
              </div>
              {agentData.signalsFiredLabels?.length > 0 && (
                <SignalList items={agentData.signalsFiredLabels} variant="present" showStatus />
              )}
              {agentData.signalsMissedLabels?.length > 0 && (
                <SignalList items={agentData.signalsMissedLabels} variant="missing" showStatus />
              )}
            </div>

            {agentData.signalsMissedLabels?.length > 0 && (
              <div className="ar-section">
                <p className="ar-section-label">How to make it stronger for agents</p>
                <div className="ar-suggestions" role="list">
                  {agentData.signalsMissedLabels.map((label, i) => {
                    const key = Object.keys(AGENT_SUGGESTIONS).find(k =>
                      label.toLowerCase().includes(k.replace(/-/g, ' ').split(' ')[0])
                    );
                    const suggestion = key ? AGENT_SUGGESTIONS[key] : label;
                    return (
                      <div key={i} className="ar-suggestion" role="listitem">
                        <span className="ar-suggestion-num ans-agent" aria-label={`Suggestion ${i + 1}`}>{i + 1}.</span>
                        <span className="ar-suggestion-text">{suggestion}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <p style={{padding: '28px 0', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: '12px'}}>
            Agent readability data not available for this doc.
          </p>
        )}
      </div>

      <div className="ar-actions">
        <button className="btn-tree-reset" onClick={onReset}>Audit another doc</button>
      </div>

    </div>
  );
}
