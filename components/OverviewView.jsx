'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FRAMEWORK = [
  {
    day: 'Day 0',
    label: 'Pre-Commitment',
    color: 'var(--day0, #A78BFA)',
    question: 'Does this actually solve my problem?',
    who: 'Someone evaluating whether to adopt your tool, framework, or approach.',
    signals: ['Frames the problem clearly', 'States tradeoffs honestly', 'Names alternatives', 'Gives a cost-of-adoption estimate'],
    mistake: 'Writing a tutorial when the reader has not decided to use you yet.',
  },
  {
    day: 'Day 1',
    label: 'Getting Started',
    color: 'var(--day1, #34D399)',
    question: 'How do I go from zero to working?',
    who: 'Someone who has committed and is trying to get a first successful result.',
    signals: ['Has an install or first-run command', 'Numbered steps with a clear sequence', 'States what success looks like', 'Gives a time estimate'],
    mistake: 'Covering every option when the reader just needs the default path.',
  },
  {
    day: 'Day 2',
    label: 'Production',
    color: 'var(--day2, #FB923C)',
    question: 'What do I do when something goes wrong?',
    who: 'Someone operating your tool in production who needs to diagnose and recover.',
    signals: ['If/then diagnostic structure', 'Exact error text to search for', 'Steps in diagnostic order', 'Recovery steps per failure mode'],
    mistake: 'Writing conceptual explanations when the reader is already on fire.',
  },
];

const TOOLS = [
  {
    id: 'argument',
    view: 'argument',
    num: '01',
    name: 'The Argument',
    desc: 'See the same technical content written two ways — once as a knowledge base, once as a decision system. Three scenarios: API authentication, deployment model, observability stack. Plus a fourth showing how the same content reads when an agent is the reader instead of a human.',
    use: 'Use this to understand what "documentation as a decision system" actually looks like in practice.',
  },
  {
    id: 'tree',
    view: 'tree',
    num: '02',
    name: 'The Tree',
    desc: 'A live decision tree for each scenario. Two questions, one recommendation. It is the decision system format in its simplest form — answer what applies to you, get a concrete direction.',
    use: 'Use this to see how a small number of well-chosen questions can replace paragraphs of "it depends."',
  },
  {
    id: 'agents',
    view: 'agents',
    num: '03',
    name: 'For Agents',
    desc: 'An agent acting on a developer\'s behalf reads documentation differently. It cannot ask follow-up questions or fill gaps by inference. This section explains the five signals that make a doc machine-readable, with examples of human prose rewritten into explicit, conditional structures.',
    use: 'Use this if you are writing docs that will be consumed by AI coding tools, agents, or automated systems.',
  },
  {
    id: 'audit',
    view: null,
    href: '/audit',
    num: '04',
    name: 'Audit a Doc',
    desc: 'Paste a URL or markdown and the tool detects which day the doc reads as, asks if that is what you intended, then shows you a scored breakdown of what signals are present and what is missing. The report has two tabs: how it reads for humans, and how it holds up when an agent is the reader.',
    use: 'Use this on your own documentation to find out which phase it actually serves.',
  },
];

export default function OverviewView({ onViewChange }) {
  const router = useRouter();
  const [ctaUrl, setCtaUrl] = useState('');

  function handleCtaSubmit(e) {
    e.preventDefault();
    if (!ctaUrl.trim()) return;
    router.push('/audit?url=' + encodeURIComponent(ctaUrl.trim()));
  }

  return (
    <div className="overview-wrap">

      {/* ── What this is ── */}
      <section className="ov-hero" aria-labelledby="ov-hero-heading">
        <div className="ov-hero-left">
          <p className="ov-eyebrow">What this is</p>
          <h2 className="ov-hero-headline" id="ov-hero-heading">
            Documentation is not a knowledge base.<br />
            It is a decision system.
          </h2>
          <p className="ov-hero-body">
            A knowledge base answers: what does this do? A decision system answers: given my situation, what should I do next? Most technical documentation is written as the first and used as the second. That mismatch is where developers get stuck.
          </p>
          <p className="ov-hero-body">
            This tool is built around one framework and four features. The framework is the Day 0 / Day 1 / Day 2 model. The features let you see it, use it, and apply it to your own docs.
          </p>
        </div>
        <div className="ov-hero-right" aria-hidden="true">
          <div className="ov-stat">
            <span className="ov-stat-num">3</span>
            <span className="ov-stat-label">Phases of the developer journey</span>
          </div>
          <div className="ov-stat">
            <span className="ov-stat-num">5</span>
            <span className="ov-stat-label">Signals per phase the tool checks for</span>
          </div>
          <div className="ov-stat">
            <span className="ov-stat-num">5</span>
            <span className="ov-stat-label">Agent readability signals</span>
          </div>
        </div>
      </section>

      {/* ── The framework ── */}
      <section className="ov-section" aria-labelledby="ov-framework-heading">
        <div className="ov-section-header">
          <p className="ov-section-kicker">The framework</p>
          <h2 className="ov-section-title" id="ov-framework-heading">
            Every doc serves one phase of the developer journey.
          </h2>
          <p className="ov-section-sub">
            The mistake is writing one doc to serve all three. A reader evaluating adoption, a reader getting started, and a reader debugging production are not asking the same question. Writing one document for all of them means it does not fully serve any of them.
          </p>
        </div>

        <div className="ov-phases" role="list">
          {FRAMEWORK.map(phase => (
            <div key={phase.day} className="ov-phase" role="listitem">
              <div className="ov-phase-header">
                <span className="ov-phase-day" style={{ color: phase.color }}>{phase.day}</span>
                <span className="ov-phase-label">{phase.label}</span>
              </div>
              <p className="ov-phase-question">"{phase.question}"</p>
              <p className="ov-phase-who">{phase.who}</p>
              <ul className="ov-phase-signals" aria-label={`${phase.day} signals`}>
                {phase.signals.map((s, i) => (
                  <li key={i} className="ov-phase-signal">
                    <span className="ov-phase-signal-mark" aria-hidden="true">—</span>
                    {s}
                  </li>
                ))}
              </ul>
              <div className="ov-phase-mistake">
                <span className="ov-phase-mistake-label">Common mistake</span>
                <span className="ov-phase-mistake-text">{phase.mistake}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The tools ── */}
      <section className="ov-section" aria-labelledby="ov-tools-heading">
        <div className="ov-section-header">
          <p className="ov-section-kicker">What's in this tool</p>
          <h2 className="ov-section-title" id="ov-tools-heading">Four features, one idea.</h2>
        </div>

        <div className="ov-tools" role="list">
          {TOOLS.map(tool => (
            <div key={tool.id} className="ov-tool" role="listitem">
              <div className="ov-tool-header">
                <span className="ov-tool-num" aria-hidden="true">{tool.num}</span>
                {tool.href ? (
                  <Link href={tool.href} className="ov-tool-name-link">
                    {tool.name}
                  </Link>
                ) : (
                  <button
                    className="ov-tool-name-btn"
                    onClick={() => onViewChange?.(tool.view)}
                  >
                    {tool.name}
                  </button>
                )}
              </div>
              <p className="ov-tool-desc">{tool.desc}</p>
              <p className="ov-tool-use">{tool.use}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to use it ── */}
      <section className="ov-section ov-flow-section" aria-labelledby="ov-flow-heading">
        <div className="ov-section-header">
          <p className="ov-section-kicker">Where to start</p>
          <h2 className="ov-section-title" id="ov-flow-heading">Suggested path through the tool.</h2>
        </div>
        <ol className="ov-flow" aria-label="Suggested path">
          <li className="ov-flow-step">
            <span className="ov-flow-num" aria-label="Step 1">1</span>
            <div>
              <button className="ov-flow-link" onClick={() => onViewChange?.('argument')}>
                Read The Argument
              </button>
              <p className="ov-flow-detail">Pick any scenario and read both columns. Notice what the knowledge base does versus what the decision system does. The difference is not about tone — it is about structure and intent.</p>
            </div>
          </li>
          <li className="ov-flow-step">
            <span className="ov-flow-num" aria-label="Step 2">2</span>
            <div>
              <button className="ov-flow-link" onClick={() => onViewChange?.('tree')}>
                Try The Tree
              </button>
              <p className="ov-flow-detail">Answer two questions for a scenario you know. See what a minimal decision system looks like — and how much clarity two well-placed questions can provide.</p>
            </div>
          </li>
          <li className="ov-flow-step">
            <span className="ov-flow-num" aria-label="Step 3">3</span>
            <div>
              <Link href="/audit" className="ov-flow-link">
                Audit one of your own docs
              </Link>
              <p className="ov-flow-detail">Paste a URL or markdown. Find out which day it reads as, whether that matches what you intended, and what one or two changes would make the biggest difference.</p>
            </div>
          </li>
          <li className="ov-flow-step">
            <span className="ov-flow-num" aria-label="Step 4">4</span>
            <div>
              <button className="ov-flow-link" onClick={() => onViewChange?.('agents')}>
                Check the agent readability tab
              </button>
              <p className="ov-flow-detail">In the audit report, switch to "For agents." If you are writing docs that will be consumed by AI coding tools or agents acting on developers' behalf, this tab tells you what to fix first.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* ── CTA ── */}
      <div className="ov-cta">
        <h2 className="ov-cta-heading">Ready to audit your own docs?</h2>
        <p className="ov-cta-sub">
          Paste a URL and find out which day it reads as — and what one change would make the biggest difference.
        </p>
        <form className="ov-cta-form" onSubmit={handleCtaSubmit}>
          <input
            className="audit-input ov-cta-input"
            type="url"
            placeholder="https://your-project.com/docs/getting-started"
            value={ctaUrl}
            onChange={e => setCtaUrl(e.target.value)}
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={!ctaUrl.trim()}
          >
            Audit this doc →
          </button>
        </form>
        <p className="ov-cta-footnote">
          Built on the ideas in{' '}
          <a
            href="https://dev.to/daniellewashington/documentation-is-a-decision-system-not-a-knowledge-base-4139"
            target="_blank"
            rel="noopener noreferrer"
            className="ov-footer-link"
          >
            Documentation Is a Decision System, Not a Knowledge Base ↗
          </a>
        </p>
      </div>

    </div>
  );
}
