'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '../components/Header.jsx';
import ContrastDemo from '../components/ContrastDemo.jsx';
import DecisionTree from '../components/DecisionTree.jsx';
import AgentsView from '../components/AgentsView.jsx';

const SCENARIOS = [
  { id: 'api-auth',      label: 'API Authentication' },
  { id: 'deploy',        label: 'Deployment Model' },
  { id: 'observability', label: 'Observability Stack' },
];

function HomePageInner() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') ?? 'argument';
  const [activeView, setActiveView] = useState(initialView);
  const [scenario, setScenario] = useState('api-auth');

  // Scenario subnav: visible for argument + tree views, not agents
  const showSubnav = activeView === 'argument' || activeView === 'tree';
  // Agent Consumption tab only shows in argument view
  const showAgentScenarioTab = activeView === 'argument';

  function handleViewChange(view) {
    setActiveView(view);
    // Reset scenario to api-auth when switching to tree (no agent tab there)
    if (view === 'tree' && scenario === 'agent') setScenario('api-auth');
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header activeView={activeView} onViewChange={handleViewChange} />

      {/* Scenario sub-nav */}
      {showSubnav && (
        <div
          className="subnav-bar"
          role="tablist"
          aria-label="Select scenario"
        >
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              role="tab"
              aria-selected={scenario === s.id}
              className={`subnav-tab${scenario === s.id ? ' st-active' : ''}`}
              onClick={() => setScenario(s.id)}
            >
              {s.label}
            </button>
          ))}
          {showAgentScenarioTab && (
            <button
              role="tab"
              aria-selected={scenario === 'agent'}
              className={`subnav-tab st-agent${scenario === 'agent' ? ' st-active' : ''}`}
              onClick={() => setScenario('agent')}
            >
              Agent Consumption
              <span className="subnav-new-badge" aria-label="new">new</span>
            </button>
          )}
        </div>
      )}

      <main id="main-content" tabIndex={-1}>

        {/* ── The Argument ── */}
        <div
          id="view-argument"
          className={`view-panel${activeView === 'argument' ? ' vp-active' : ''}`}
          role="tabpanel"
          aria-labelledby="pni-argument"
          hidden={activeView !== 'argument'}
        >
          <ContrastDemo scenario={scenario} />
        </div>

        {/* ── The Tree ── */}
        <div
          id="view-tree"
          className={`view-panel${activeView === 'tree' ? ' vp-active' : ''}`}
          role="tabpanel"
          aria-labelledby="pni-tree"
          hidden={activeView !== 'tree'}
        >
          <div className="tree-view-wrap">
            <DecisionTree scenario={scenario} />
          </div>
        </div>

        {/* ── For Agents ── */}
        <div
          id="view-agents"
          className={`view-panel${activeView === 'agents' ? ' vp-active' : ''}`}
          role="tabpanel"
          aria-labelledby="pni-agents"
          hidden={activeView !== 'agents'}
        >
          <AgentsView />
        </div>

      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  );
}
