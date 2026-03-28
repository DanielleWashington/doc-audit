// Server-safe version of analyze.js — no fs/path imports.
// Used by the Next.js API route. Do not modify the root analyze.js.

const DAY0_SIGNALS = [
  'overview', 'why use', 'what is', 'compare', ' vs ', 'should i',
  'when to use', 'use case', 'is this right', 'evaluation', 'choosing',
  'alternatives', 'fits', 'not for', 'who is this for'
];

const DAY1_SIGNALS = [
  'install', 'setup', 'set up', 'quickstart', 'quick start',
  'tutorial', 'step 1', 'getting started', 'first time',
  'how to', 'walkthrough', 'your first', 'prerequisites', 'requirements'
];

const DAY2_SIGNALS = [
  'troubleshoot', 'debug', 'error', 'production', 'scale', 'monitor',
  'faq', 'frequently asked', 'fix', 'broken', 'failing', 'issues',
  'problems', 'performance', 'incident', 'rollback', 'outage'
];

const IF_THEN = /\bif\b.{0,80}(then|→|—|[:,] (use|do|try|run|go|check|set))/i;
const ORDERED_LIST = /^\d+\. /m;
const BY_END = /by the end|what you.ll (learn|accomplish|build)|you will (be able|learn|have)|after (this|completing)/i;
const TRADEOFF = /when not to|trade.?off|caveat|limitation|warning:|caution:|⚠|don.t use this if|not recommended|consider instead/i;
const NEXT_STEPS = /next steps?|what.s next|continue (to|with)|proceed to|go to section/i;
const WORD_LIMIT = 1000;

export function analyzeContent(text, fileName = 'pasted-content') {
  const raw = text;
  const lower = raw.toLowerCase();
  const words = raw.trim().split(/\s+/).length;

  const day0 = DAY0_SIGNALS.filter(s => lower.includes(s)).length;
  const day1 = DAY1_SIGNALS.filter(s => lower.includes(s)).length;
  const day2 = DAY2_SIGNALS.filter(s => lower.includes(s)).length;

  const max = Math.max(day0, day1, day2);
  let detectedPhase = 'unknown';
  if (max > 0) {
    if (day0 === max) detectedPhase = 'day0';
    else if (day1 === max) detectedPhase = 'day1';
    else detectedPhase = 'day2';
  }

  const hasIfThen = IF_THEN.test(raw);
  const hasOrderedList = ORDERED_LIST.test(raw);
  const hasByEnd = BY_END.test(raw);
  const hasTradeoff = TRADEOFF.test(raw);
  const hasNextSteps = NEXT_STEPS.test(raw);
  const isFocused = words <= WORD_LIMIT;

  const qualityScore =
    (hasIfThen ? 2 : 0) +
    (hasOrderedList ? 1 : 0) +
    (hasByEnd ? 1 : 0) +
    (hasTradeoff ? 2 : 0) +
    (hasNextSteps ? 1 : 0) +
    (isFocused ? 1 : 0);

  return {
    filePath: fileName,
    fileName,
    wordCount: words,
    detectedPhase,
    phaseSignals: { day0, day1, day2 },
    qualityScore,
    maxQualityScore: 8,
    hasIfThen,
  };
}

export function phaseLabel(phase) {
  return {
    day0: 'Day 0 — Pre-Commitment',
    day1: 'Day 1 — Getting Started',
    day2: 'Day 2 — Production',
    unknown: 'Unknown phase',
  }[phase] ?? 'Unknown phase';
}
