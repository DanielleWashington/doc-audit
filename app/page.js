'use client';
import { useState } from 'react';
import Header from '../components/Header.jsx';
import ContrastDemo from '../components/ContrastDemo.jsx';
import DecisionTree from '../components/DecisionTree.jsx';

const SCENARIOS = [
  { id: 'api-auth',      label: 'API Authentication' },
  { id: 'deploy',        label: 'Deployment Model' },
  { id: 'observability', label: 'Observability Stack' },
];

export default function HomePage() {
  const [scenario, setScenario] = useState('api-auth');

  return (
    <>
      <Header />
      <main>

        {/* ── Section 1: Masthead ── */}
        <section id="masthead">
          <p className="masthead-kicker">Vol. I — The Argument</p>
          <h1 className="masthead-headline">
            Documentation<br />
            is a decision<br />
            system.
          </h1>
          <p className="masthead-deck">
            Not a knowledge base. The difference is not what you write, it is what
            you make the reader do next. Below is the same technical content,
            restructured with that one question in mind.
          </p>
          <div className="scenario-tabs" role="tablist" aria-label="Select scenario">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                role="tab"
                aria-selected={scenario === s.id}
                className={`scenario-tab${scenario === s.id ? ' active' : ''}`}
                onClick={() => setScenario(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Section 2: Contrast demo ── */}
        <ContrastDemo scenario={scenario} />

        <hr className="section-rule" />

        {/* ── Section 3: Decision tree ── */}
        <DecisionTree scenario={scenario} />

      </main>
    </>
  );
}
