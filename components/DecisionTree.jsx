'use client';
import { useState } from 'react';

const TREES = {
  'api-auth': {
    start: 'q1',
    nodes: {
      'q1': {
        question: 'What are you building?',
        choices: [
          { label: 'A service talking to another service', sub: 'No humans in the loop', next: 'leaf-apikey' },
          { label: 'An app where a real person logs in', sub: 'User-facing authentication', next: 'q2' },
          { label: 'Something passing identity downstream', sub: 'Claims-aware architecture', next: 'leaf-jwt' },
        ],
      },
      'q2': {
        question: 'How does your user interact with it?',
        choices: [
          { label: 'A web app running in a browser', sub: 'Redirect-based flow', next: 'leaf-authcode' },
          { label: 'A mobile app or CLI tool', sub: 'Native client, cannot keep a secret', next: 'leaf-pkce' },
        ],
      },
      'leaf-apikey': {
        terminal: true,
        recommendation: 'Use an API key.',
        rationale: 'Generate one, store it in your secrets manager, rotate it on a schedule. Everything else is complexity you do not need for this use case.',
        watch: 'API keys are only as safe as how you store them. The most common failure is treating them like configuration rather than secrets, which means they end up in source control or logs.',
      },
      'leaf-jwt': {
        terminal: true,
        recommendation: 'Use JWT, but only if you actually need it.',
        rationale: 'JWT earns its complexity in one scenario: a downstream service needs to read claims without calling back to validate the token. If nothing in your system needs that, an opaque token with a lookup endpoint is simpler and easier to revoke.',
        watch: 'JWT revocation is genuinely hard. If your threat model requires immediate revocation on logout or compromise, JWT will fight you. Make sure the tradeoff is worth it before you commit.',
      },
      'leaf-authcode': {
        terminal: true,
        recommendation: 'Use the authorization code flow.',
        rationale: 'Your framework almost certainly has a library that handles this. Read the redirect URI and state parameter sections carefully, those are where most mistakes happen.',
        watch: 'The implicit flow is deprecated. If you find documentation pointing you there, it is out of date. Authorization code with PKCE is the current best practice even for web apps.',
      },
      'leaf-pkce': {
        terminal: true,
        recommendation: 'Use PKCE.',
        rationale: 'It was designed for exactly this, public clients that cannot keep a secret. The spec is clear, the libraries are good, and it does not require a client secret on the backend.',
        watch: 'Do not use the device code flow unless your user genuinely cannot use a browser. It has a longer interaction window and is harder to explain than a redirect.',
      },
    },
  },
  'deploy': {
    start: 'q1',
    nodes: {
      'q1': {
        question: 'How many services are you running in production right now?',
        choices: [
          { label: 'Fewer than ten, this is still early', sub: 'Pre-scale, moving fast', next: 'leaf-single' },
          { label: 'Ten or more, not on Kubernetes', sub: 'Growing, infrastructure-managed', next: 'q2' },
          { label: 'We are Kubernetes-native already', sub: 'Orchestrated environment', next: 'leaf-operator' },
        ],
      },
      'q2': {
        question: 'What is your actual relationship with downtime?',
        choices: [
          { label: 'Planned downtime is acceptable, complexity is not', sub: 'Operations-light team', next: 'leaf-passive' },
          { label: 'Downtime is a business incident, full stop', sub: 'High availability required', next: 'leaf-active' },
        ],
      },
      'leaf-single': {
        terminal: true,
        recommendation: 'Start with single-node.',
        rationale: 'A single node will handle more load than most teams expect. The operational overhead of a cluster before you actually need one is the thing that slows teams down and makes infrastructure feel like a tax.',
        watch: 'Document your migration path before you need it. When you do outgrow single-node, you will want to move fast, and that is not the time to be reading upgrade documentation for the first time.',
      },
      'leaf-operator': {
        terminal: true,
        recommendation: 'Use the Kubernetes operator.',
        rationale: 'You already understand the mental model and the tooling is mature. Start with the Helm chart and read the CRD reference before you customize anything.',
        watch: 'Operator upgrades occasionally have breaking changes in the CRD schema. Pin your version in your IaC and read the release notes before upgrading in production.',
      },
      'leaf-passive': {
        terminal: true,
        recommendation: 'Use active-passive.',
        rationale: 'You get redundancy without the coordination complexity of active-active replication. For most teams at this stage, this is the right tradeoff until downtime becomes a genuine business problem.',
        watch: 'Write your failover runbook before you need it. The worst time to figure out how to promote a passive node is during an incident at 2am.',
      },
      'leaf-active': {
        terminal: true,
        recommendation: 'Use active-active, and go in clear-eyed.',
        rationale: 'This is the right call when it is the right call. The operational weight is real, the complexity is real, and so is the availability gain.',
        watch: 'Most incidents in active-active come from write conflicts nobody planned for. Read the conflict resolution documentation before you enable it, not after your first conflict in production.',
      },
    },
  },
  'observability': {
    start: 'q1',
    nodes: {
      'q1': {
        question: 'What problem are you actually trying to solve right now?',
        choices: [
          { label: 'Know when something breaks before users tell me', sub: 'Alerting and incident detection', next: 'leaf-logs' },
          { label: 'Understand throughput, latency, or error rates', sub: 'Metrics and dashboards', next: 'q2' },
          { label: 'Debug something crossing service boundaries', sub: 'Distributed request tracing', next: 'q3' },
        ],
      },
      'q2': {
        question: 'Do you have structured, queryable logs in place already?',
        choices: [
          { label: 'No, logging is still ad hoc or unstructured', sub: 'Foundation is not there yet', next: 'leaf-fix-logs' },
          { label: 'Yes, logs are structured and I can query them', sub: 'Ready to layer on metrics', next: 'leaf-metrics' },
        ],
      },
      'q3': {
        question: 'Are trace IDs propagating through your services already?',
        choices: [
          { label: 'No, we do not have request ID propagation yet', sub: 'Missing correlation foundation', next: 'leaf-fix-tracing' },
          { label: 'Yes, correlation IDs or trace headers are flowing', sub: 'Ready for distributed tracing', next: 'leaf-tracing' },
        ],
      },
      'leaf-logs': {
        terminal: true,
        recommendation: 'Start with structured logs and one alert.',
        rationale: 'Get your logs into a queryable format and set a single alert on error rate. This two-step catches the majority of incidents and costs almost nothing to maintain.',
        watch: 'The trap is adding too many alerts before you understand the noise floor. Start with one alert you trust completely, then expand. Alert fatigue is worse than no alerts.',
      },
      'leaf-fix-logs': {
        terminal: true,
        recommendation: 'Fix your logging foundation first.',
        rationale: 'Metrics on top of unstructured logs are noise with a dashboard. Structure your logs, get consistent field names across services, and make sure you can actually query them before adding another signal layer.',
        watch: 'The single highest-leverage thing you can do right now is add a request ID that flows through every log line for a given request. Everything else gets easier from there.',
      },
      'leaf-metrics': {
        terminal: true,
        recommendation: 'Add Prometheus metrics, starting with the four golden signals.',
        rationale: 'Latency, traffic, errors, saturation. Wire those four first and you will have a dashboard worth looking at. Everything else is refinement once those are working.',
        watch: 'Cardinality is the thing that makes metrics expensive and slow. Keep label values bounded. User IDs and full request paths are not labels.',
      },
      'leaf-fix-tracing': {
        terminal: true,
        recommendation: 'Add request ID propagation before you add tracing.',
        rationale: 'Distributed tracing without correlation IDs is just more disconnected logs. Propagate a trace ID through your service boundaries first, even if it is just a header you log on entry and exit.',
        watch: 'This is usually a smaller change than it sounds. Most frameworks have middleware that handles header propagation. The work is making sure every service in the chain actually uses it.',
      },
      'leaf-tracing': {
        terminal: true,
        recommendation: 'Use OpenTelemetry.',
        rationale: 'It gives you portability across backends and the auto-instrumentation for HTTP and database calls gets you most of the way there without writing custom code.',
        watch: 'Start with auto-instrumentation only and resist the urge to add manual spans everywhere on day one. Add manual spans where auto-instrumentation leaves a gap you are actively trying to debug.',
      },
    },
  },
};

export default function DecisionTree({ scenario }) {
  const [nodeId, setNodeId] = useState(null);
  const [history, setHistory] = useState([]);

  const tree = TREES[scenario] ?? TREES['api-auth'];

  // Reset when scenario changes
  const currentScenario = scenario;
  const [lastScenario, setLastScenario] = useState(scenario);
  if (currentScenario !== lastScenario) {
    setLastScenario(currentScenario);
    setNodeId(null);
    setHistory([]);
  }

  const activeNodeId = nodeId ?? tree.start;
  const node = tree.nodes[activeNodeId];

  function goTo(id, label) {
    setHistory(prev => [...prev, { nodeId: id, label }]);
    setNodeId(id);
    document.getElementById('decision-tree')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function goBack() {
    if (history.length === 0) return;
    if (history.length === 1) {
      setNodeId(null);
      setHistory([]);
      return;
    }
    const prev = history[history.length - 2];
    setHistory(h => h.slice(0, -2));
    setNodeId(prev.nodeId);
  }

  function reset() {
    setNodeId(null);
    setHistory([]);
  }

  const isStart = !nodeId;

  return (
    <section id="decision-tree">
      <div className="tree-section-header">
        <div>
          <p className="tree-section-eyebrow">Section 03 — The Theory in Action</p>
          <h2 className="tree-section-title">The live decision tree.</h2>
        </div>
        <p className="tree-section-note">Answer two questions,<br />get a recommendation.</p>
      </div>

      <div className="tree-body">
        {/* Breadcrumb */}
        {history.length > 0 && (
          <div className="tree-breadcrumb">
            <span className="crumb">Start</span>
            {history.map((item, i) => (
              <span key={i} style={{ display: 'contents' }}>
                <span className="crumb-sep">›</span>
                <span className={`crumb${i === history.length - 1 ? ' current' : ''}`}>
                  {item.label.length > 32 ? item.label.slice(0, 30) + '…' : item.label}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Node */}
        {node?.terminal ? (
          <div className="tree-leaf" key={activeNodeId}>
            <p className="leaf-kicker">Recommendation</p>
            <p className="leaf-recommendation">{node.recommendation}</p>
            <p className="leaf-rationale">{node.rationale}</p>
            <p className="leaf-watch-kicker">What to watch for</p>
            <p className="leaf-watch">{node.watch}</p>
            <div className="tree-actions">
              <button className="btn-tree-reset" onClick={reset}>Start over</button>
              {!isStart && <button className="btn-tree-back" onClick={goBack}>← Back</button>}
            </div>
          </div>
        ) : (
          <div className="tree-node" key={activeNodeId}>
            <h3 className="tree-question">{node?.question}</h3>
            <div className="tree-choices">
              {node?.choices.map((c, i) => (
                <button
                  key={c.next}
                  className="tree-choice"
                  onClick={() => goTo(c.next, c.label)}
                >
                  <span className="t-choice-num">{String.fromCharCode(65 + i)}</span>
                  <span className="t-choice-text">
                    <span className="t-choice-label">{c.label}</span>
                    {c.sub && <span className="t-choice-sub">{c.sub}</span>}
                  </span>
                </button>
              ))}
            </div>
            {!isStart && (
              <div className="tree-actions">
                <button className="btn-tree-back" onClick={goBack}>← Back</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
