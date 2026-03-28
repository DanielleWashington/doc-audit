'use client';
import { useState } from 'react';
import Link from 'next/link';

const AGENT_SIGNALS = [
  { num: '01', name: 'Explicit conditionals', desc: 'All decision points expressed as if/then — no implied choices' },
  { num: '02', name: 'Unambiguous defaults', desc: 'No "for most users" without defining who "most users" is' },
  { num: '03', name: 'Atomic steps', desc: 'Each step produces a single, verifiable state change' },
  { num: '04', name: 'Error recovery paths', desc: 'Each step names what to do when it fails, adjacent to the step itself' },
  { num: '05', name: 'Self-contained sections', desc: 'No cross-references that break context when a section is chunked' },
];

const AGENT_SCENARIOS = [
  {
    id: 'api-auth',
    label: 'API Auth',
    humanDoc: `If you are building a service that talks to another service with no human in the loop, use an API key. For most users this is the right choice. JWT is worth the overhead if a downstream service needs to read claims.`,
    humanNote: `"For most users" — an agent cannot evaluate this. "If a downstream service needs to" — an agent cannot infer whether this applies to the current situation.`,
    agentRules: [
      { condition: 'server-to-server, no user identity in scope', action: 'Use API key' },
      { condition: 'downstream service reads claims without calling back', action: 'Use JWT' },
      { condition: 'user logs in via browser', action: 'Use authorization code flow' },
      { condition: 'user logs in via mobile or CLI', action: 'Use PKCE' },
    ],
  },
  {
    id: 'deploy',
    label: 'Deployment',
    humanDoc: `Start with single-node for most use cases. If you need high availability or are already Kubernetes-native, other configurations are available. The right choice depends on your team's operational maturity.`,
    humanNote: `"Most use cases" and "operational maturity" cannot be evaluated by an agent without explicit definitions. An agent cannot decide what maturity level applies.`,
    agentRules: [
      { condition: 'fewer than 10 services, no on-call rotation', action: 'Use single-node' },
      { condition: 'already running Kubernetes', action: 'Use operator mode' },
      { condition: 'planned downtime acceptable, low ops complexity preferred', action: 'Use active-passive' },
      { condition: 'cost of downtime exceeds cost of operational complexity', action: 'Use active-active' },
    ],
  },
  {
    id: 'observability',
    label: 'Observability',
    humanDoc: `Start with the signal type that gives you the most value. Most teams begin with logs, then add metrics as needed. Tracing is typically added later when debugging cross-service issues.`,
    humanNote: `"Most value," "as needed," and "typically" require inference. An agent needs explicit conditions to know which signal type to instrument first.`,
    agentRules: [
      { condition: 'no observability in place yet', action: 'Start with structured logging' },
      { condition: 'logs exist, questions are about frequency or throughput', action: 'Add metrics' },
      { condition: 'multiple services, cross-boundary debugging needed', action: 'Add distributed tracing' },
      { condition: 'all three in place, need to reduce cardinality', action: 'Configure sampling policies' },
    ],
  },
];

export default function AgentsView() {
  const [activeScenario, setActiveScenario] = useState('api-auth');
  const scenario = AGENT_SCENARIOS.find(s => s.id === activeScenario) ?? AGENT_SCENARIOS[0];

  return (
    <section className="agents-wrap" aria-label="For agents">

      <div className="agents-hero">
        <div>
          <p className="agents-hero-eyebrow">For Agents — A new kind of reader</p>
          <h2 className="agents-hero-headline">
            Your docs have a second audience. They cannot ask for clarification.
          </h2>
          <p className="agents-hero-body">
            An agent acting on a developer&apos;s behalf reads documentation differently. It cannot ask follow-up questions. It cannot fill gaps by inference. If a step says &quot;most users should do X,&quot; an agent does not know if this developer is &quot;most users.&quot; It needs the doc to be a complete specification, not a guide with implied context.
          </p>
        </div>
        <div>
          <p className="agents-signals-label" aria-hidden="true">5 signals an agent needs</p>
          <ul className="agents-signal-list" aria-label="5 signals an agent needs in documentation">
            {AGENT_SIGNALS.map(signal => (
              <li key={signal.num} className="agents-signal-item">
                <span className="agents-signal-num" aria-hidden="true">{signal.num}</span>
                <span>
                  <span className="agents-signal-name">{signal.name}</span>
                  <span className="agents-signal-desc">{signal.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sub-tabs for scenario examples */}
      <div
        className="agents-subtabs"
        role="tablist"
        aria-label="Agent scenario examples"
      >
        {AGENT_SCENARIOS.map(s => (
          <button
            key={s.id}
            role="tab"
            aria-selected={activeScenario === s.id}
            aria-controls={`agent-scenario-${s.id}`}
            className={`agents-subtab${activeScenario === s.id ? ' ast-active' : ''}`}
            onClick={() => setActiveScenario(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        id={`agent-scenario-${scenario.id}`}
        role="tabpanel"
        aria-label={`${scenario.label} agent example`}
      >
        <div className="agents-compare-grid">
          <div className="agents-compare-col">
            <p className="agents-compare-kicker">Human doc (hard for agents)</p>
            <p className="agents-compare-body">{scenario.humanDoc}</p>
            <p className="agents-compare-note">{scenario.humanNote}</p>
          </div>
          <div className="agents-compare-col acc-right">
            <p className="agents-compare-kicker">Agent-readable (explicit)</p>
            <div className="agent-rules" role="list" aria-label="Agent decision rules">
              {scenario.agentRules.map((rule, i) => (
                <div key={i} className="agent-rule" role="listitem">
                  <p className="agent-rule-when">When</p>
                  <p className="agent-rule-condition">{rule.condition}</p>
                  <div className="agent-rule-then">
                    <span className="agent-rule-arrow" aria-hidden="true">→</span>
                    <span className="agent-rule-action">{rule.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="agents-cta">
        <p className="agents-cta-text">
          Does your documentation hold up<br />
          when the reader cannot ask questions?
        </p>
        <Link href="/audit" className="btn-agent-cta">
          Audit your doc for agent readability →
        </Link>
      </div>

    </section>
  );
}
