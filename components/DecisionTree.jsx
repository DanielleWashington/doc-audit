'use client';
import { useState } from 'react';

const TREE = {
  'day0-q1': {
    phase: 'day0', phaseLabel: 'Day 0 — Pre-Commitment',
    question: "What's your biggest uncertainty?",
    choices: [
      { label: "Does it actually solve my problem?", sub: "Fit assessment", next: 'day0-a1' },
      { label: "How does it compare to alternatives?", sub: "Decision between options", next: 'day0-a2' },
      { label: "What's the real cost to adopt this?", sub: "Risk & investment", next: 'day0-a3' },
    ]
  },
  'day0-a1': {
    phase: 'day0', phaseLabel: 'Day 0 — Pre-Commitment', terminal: true,
    question: "Does it solve my problem?",
    good: { label: 'Decision system answer', title: 'A doc that navigates your decision:',
      body: `<span class="if-then">If you're managing distributed config at scale</span> — this is built for you. <span class="if-then">If you're building a prototype or have fewer than 10 services</span> — it's overkill; use environment variables instead. The core job it does: centralizes runtime configuration with audit trails.` },
    bad: { title: 'A knowledge base gives you this instead:', body: 'Our product supports YAML, JSON, TOML, and HCL configuration formats. It integrates with Kubernetes, Nomad, ECS, and 40+ other platforms. Features include: versioning, rollbacks, ACLs, audit logging, health checks, dynamic secrets, and service mesh support…' },
    annotation: '"Users lack confidence in their choices, not intelligence." Give them a clear fit assessment — not a feature catalog.'
  },
  'day0-a2': {
    phase: 'day0', phaseLabel: 'Day 0 — Pre-Commitment', terminal: true,
    question: "How does it compare to alternatives?",
    good: { label: 'Decision system answer', title: 'A doc that navigates your decision:',
      body: `<span class="if-then">If you're already on HashiCorp tools</span> — Vault Secrets is the natural fit. <span class="if-then">If your team lives in AWS</span> — Secrets Manager has less operational overhead. <span class="if-then">If you need open-source and self-hosted</span> — this is the strongest option. The tradeoff: more control, more setup.` },
    bad: { title: 'A knowledge base gives you this instead:', body: 'See our comprehensive comparison matrix below. We evaluated 12 vendors across 47 dimensions including performance, compliance, integration depth, roadmap, community activity, SLA tiers, support response time, pricing models…' },
    annotation: 'Visible tradeoffs build confidence. When docs hide the tradeoffs, readers assume the worst.'
  },
  'day0-a3': {
    phase: 'day0', phaseLabel: 'Day 0 — Pre-Commitment', terminal: true,
    question: "What's the real cost to adopt this?",
    good: { label: 'Decision system answer', title: 'A doc that navigates your decision:',
      body: `Realistically: <span class="if-then">if you have one engineer familiar with Kubernetes</span>, you're looking at 2–3 days to production. <span class="if-then">If you're starting from scratch</span>, budget a week. The highest-friction step is secret migration — not the install. Plan for that first.` },
    bad: { title: 'A knowledge base gives you this instead:', body: 'Installation requires Helm 3.0+, Kubernetes 1.19+, and a running etcd cluster. Refer to the prerequisites section. For HA deployments, consult the architecture guide. Enterprise features require a license key (contact sales)…' },
    annotation: '"Surface consequences before users commit to paths." The cost of switching is always higher than the cost of reading one honest paragraph.'
  },
  'day1-q1': {
    phase: 'day1', phaseLabel: 'Day 1 — Getting Started',
    question: "What's your starting point?",
    choices: [
      { label: "Starting completely from scratch", sub: "No existing setup", next: 'day1-a1' },
      { label: "Migrating from another tool", sub: "Bring existing config", next: 'day1-a2' },
      { label: "I have a specific, narrow use case", sub: "Just one thing to solve", next: 'day1-a3' },
    ]
  },
  'day1-a1': {
    phase: 'day1', phaseLabel: 'Day 1 — Getting Started', terminal: true,
    question: "Starting from scratch",
    good: { label: 'Decision system answer', title: 'A doc that gets you moving:',
      body: `<strong>Do this first:</strong> run <code style="font-family:var(--mono);background:var(--bg3);padding:1px 5px;border-radius:3px">brew install our-tool &amp;&amp; our-tool init</code>. You'll have a working local instance in 90 seconds. <span class="if-then">Skip the cluster setup for now</span> — you don't need it until you have 3+ services. Come back to the HA guide when you do.` },
    bad: { title: 'A knowledge base gives you this instead:', body: 'Welcome to the setup guide. Before you begin, choose your deployment model: single-node, multi-region active-active, multi-region active-passive, or Kubernetes operator. Each has different prerequisites. For single-node: see section 2.1. For multi-region…' },
    annotation: '"Provide clear defaults that work for most situations." The right first step is usually one step, not fourteen options.'
  },
  'day1-a2': {
    phase: 'day1', phaseLabel: 'Day 1 — Getting Started', terminal: true,
    question: "Migrating from another tool",
    good: { label: 'Decision system answer', title: 'A doc built for your exact situation:',
      body: `<span class="if-then">If you're coming from Consul</span>: your KV structure maps 1:1. Use <code style="font-family:var(--mono);background:var(--bg3);padding:1px 5px;border-radius:3px">migrate-from-consul</code> — it handles the namespace conversion. <span class="if-then">If you're coming from dotenv files</span>: bulk import with the CLI, then rotate keys. Do not skip the rotation step.` },
    bad: { title: 'A knowledge base gives you this instead:', body: 'The migration process involves backing up your existing configuration, installing the new tool, configuring the connection settings, importing data using the provided import utilities, and validating the import. Refer to the full migration documentation…' },
    annotation: "Migration docs fail when they're written generically. The reader has a very specific context. Meet them in it."
  },
  'day1-a3': {
    phase: 'day1', phaseLabel: 'Day 1 — Getting Started', terminal: true,
    question: "Specific, narrow use case",
    good: { label: 'Decision system answer', title: 'A doc that respects your scope:',
      body: `<span class="if-then">If you only need dynamic feature flags</span>: skip sections 2–4 entirely. Jump to the Feature Flags quickstart. You'll need just 3 config lines and won't need to run the agent. This path takes 15 minutes.` },
    bad: { title: 'A knowledge base gives you this instead:', body: 'To use feature flags, first complete the core installation (see section 1), configure TLS (section 2), set up the agent (section 3), configure ACLs (section 4), then proceed to the feature flags module (section 5.7)…' },
    annotation: 'When you force a narrow use case through a wide funnel, you lose users at every unnecessary step.'
  },
  'day2-q1': {
    phase: 'day2', phaseLabel: 'Day 2 — Production',
    question: "What's the symptom?",
    choices: [
      { label: "Something is running slow", sub: "Latency or throughput degraded", next: 'day2-a1' },
      { label: "Something is misconfigured", sub: "Behavior is wrong, not broken", next: 'day2-a2' },
      { label: "Something isn't connecting", sub: "Network or auth failure", next: 'day2-a3' },
    ]
  },
  'day2-a1': {
    phase: 'day2', phaseLabel: 'Day 2 — Production', terminal: true,
    question: "Something is running slow",
    good: { label: 'Decision system answer', title: 'A doc that triages before diving:',
      body: `Check in this order: <span class="if-then">if p99 latency is above 200ms</span> — check your watch interval, it's probably too short. <span class="if-then">If CPU is normal but memory is high</span> — you have a cache config issue, see Cache Tuning. <span class="if-then">If both are fine and it's still slow</span> — the bottleneck is network topology, not the tool itself.` },
    bad: { title: 'A knowledge base gives you this instead:', body: 'Performance tuning for production deployments involves many variables. See the Performance Guide (22 pages) for information on cache configuration, watch intervals, raft consensus timeouts, gRPC connection pooling, TLS overhead, and disk I/O patterns…' },
    annotation: 'An agent debugging at 2am cannot ask follow-up questions. Neither can your on-call engineer. The doc must triage for them.'
  },
  'day2-a2': {
    phase: 'day2', phaseLabel: 'Day 2 — Production', terminal: true,
    question: "Something is misconfigured",
    good: { label: 'Decision system answer', title: 'A doc that validates, not just describes:',
      body: `Run <code style="font-family:var(--mono);background:var(--bg3);padding:1px 5px;border-radius:3px">our-tool validate --config ./config.hcl</code>. <span class="if-then">If it says "unknown field"</span> — you're using a deprecated key, see the migration guide. <span class="if-then">If it passes but behavior is still wrong</span> — check environment variable precedence; they override file config silently.` },
    bad: { title: 'A knowledge base gives you this instead:', body: 'Configuration options are documented in the Configuration Reference (section 8). All configuration values can be set via config file, environment variables, or CLI flags. For precedence rules, see the Configuration Precedence Matrix in Appendix C…' },
    annotation: '"Write for the moment before the question forms." Misconfiguration is always specific. Generic reference docs don\'t resolve incidents.'
  },
  'day2-a3': {
    phase: 'day2', phaseLabel: 'Day 2 — Production', terminal: true,
    question: "Something isn't connecting",
    good: { label: 'Decision system answer', title: 'A doc that isolates the failure layer:',
      body: `<span class="if-then">If you get "connection refused"</span> — the agent isn't running. Check <code style="font-family:var(--mono);background:var(--bg3);padding:1px 5px;border-radius:3px">systemctl status our-tool</code>. <span class="if-then">If you get "permission denied"</span> — your token doesn't have the right policy. Run <code style="font-family:var(--mono);background:var(--bg3);padding:1px 5px;border-radius:3px">our-tool token check &lt;token&gt;</code> to see what it can access. <span class="if-then">If you get a TLS error</span> — certificate mismatch; see the TLS troubleshooting guide.` },
    bad: { title: 'A knowledge base gives you this instead:', body: 'Connectivity issues can have many causes including network configuration, TLS settings, authentication tokens, ACL policies, firewall rules, and DNS resolution. For network troubleshooting, see the Network Guide. For TLS, see the TLS Guide…' },
    annotation: "Every error message is a decision point. Map error → diagnosis → action. That's the decision system in its purest form."
  },
};

function TerminalCard({ node, onBack, onReset }) {
  const [badOpen, setBadOpen] = useState(false);

  return (
    <div className="card terminal-card">
      <div className={`phase-tag ${node.phase}`}>{node.phaseLabel}</div>
      <h2 className="card-question">{node.question}</h2>

      <div className="agent-note">
        Agent mode: narrative collapsed — If/then decision points highlighted
      </div>

      <div className="doc-panel good">
        <div className="doc-panel-label"><span>✓</span><span>{node.good.label ?? 'Decision system'}</span></div>
        <div className="doc-panel-title narrative">{node.good.title}</div>
        <div className="doc-panel-body" dangerouslySetInnerHTML={{ __html: node.good.body }} />
      </div>

      <button
        className={`bad-toggle-btn${badOpen ? ' open' : ''}`}
        onClick={() => setBadOpen(v => !v)}
      >
        <span>{badOpen ? '▼' : '▶'}</span>
        <span>Show me the knowledge base version</span>
      </button>
      <div className={`bad-panel-wrap${badOpen ? ' open' : ''}`}>
        <div className="doc-panel bad">
          <div className="doc-panel-label"><span>✗</span><span>Knowledge base approach</span></div>
          <div className="doc-panel-title">{node.bad.title}</div>
          <div className="doc-panel-body">{node.bad.body}</div>
        </div>
      </div>

      <div className="annotation">
        <div className="annotation-label">Framework note</div>
        <div className="annotation-body">{node.annotation}</div>
      </div>

      <div className="card-actions">
        <button className="btn btn-primary" onClick={onReset}>Start over</button>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}

function ChoiceCard({ node, onChoose, onBack }) {
  return (
    <div className="card">
      {node.phaseLabel && <div className={`phase-tag ${node.phase}`}>{node.phaseLabel}</div>}
      <h2 className="card-question">{node.question}</h2>
      <div className="choices">
        {node.choices.map((c, i) => (
          <button key={c.next} className="choice-btn" onClick={() => onChoose(c.next, c.label)}>
            <span className="choice-num">{String.fromCharCode(65 + i)}</span>
            <span className="choice-text">
              <span className="choice-label">{c.label}</span>
              {c.sub && <span className="choice-sub">{c.sub}</span>}
            </span>
          </button>
        ))}
      </div>
      {onBack && (
        <div className="card-actions">
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        </div>
      )}
    </div>
  );
}

export default function DecisionTree({ onReport }) {
  const [nodeId, setNodeId] = useState(null);
  const [history, setHistory] = useState([]); // [{ nodeId, label }]

  function goTo(id, label) {
    setHistory(prev => [...prev, { nodeId: id, label: label ?? TREE[id]?.question ?? id }]);
    setNodeId(id);
    window.scrollTo({ top: 65, behavior: 'smooth' });
  }

  function startBranch(phase) {
    setHistory([]);
    goTo(phase + '-q1', null);
  }

  function goBack() {
    if (history.length <= 1) { reset(); return; }
    const prev = history[history.length - 2];
    setHistory(h => h.slice(0, -2));
    goTo(prev.nodeId, prev.label);
  }

  function reset() {
    setNodeId(null);
    setHistory([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleJsonUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try { onReport(JSON.parse(ev.target.result)); } catch { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
  }

  const node = nodeId ? TREE[nodeId] : null;

  // ── Hero ──
  if (!nodeId) {
    return (
      <section id="hero">
        <p className="hero-eyebrow">Documentation Framework</p>
        <h1 className="hero-title">What are you<br />trying to <em>do</em>?</h1>
        <p className="hero-sub">
          Documentation that answers this question is a decision system.<br />
          Documentation that doesn't — isn't.
        </p>
        <div className="hero-cards">
          {[
            { phase: 'day0', day: 'Day 0', title: 'Evaluate if this is right for me', sub: 'Pre-Commitment' },
            { phase: 'day1', day: 'Day 1', title: 'Get up and running fast', sub: 'Getting Started' },
            { phase: 'day2', day: 'Day 2', title: 'Figure out why it broke', sub: 'Production' },
          ].map(({ phase, day, title, sub }) => (
            <button key={phase} className={`hero-card ${phase}`} onClick={() => startBranch(phase)}>
              <span className="hero-card-day">{day}</span>
              <span className="hero-card-title">{title}</span>
              <span className="hero-card-sub">{sub}</span>
            </button>
          ))}
        </div>
        <label className="drop-hint">
          Or drop audit.json to view a report ↓
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleJsonUpload} />
        </label>
      </section>
    );
  }

  // ── Breadcrumb + card ──
  return (
    <section id="tree-view">
      <div className="breadcrumb">
        {history.map((item, i) => (
          <span key={i}>
            {i > 0 && <span className="crumb-sep">→</span>}
            <span className={`crumb${i === history.length - 1 ? ' current' : ''}`}>
              {item.label.length > 30 ? item.label.slice(0, 28) + '…' : item.label}
            </span>
          </span>
        ))}
      </div>

      {node?.terminal ? (
        <TerminalCard node={node} onBack={goBack} onReset={reset} />
      ) : (
        <ChoiceCard
          node={node}
          onChoose={(nextId, label) => goTo(nextId, label)}
          onBack={history.length > 0 ? goBack : null}
        />
      )}
    </section>
  );
}
