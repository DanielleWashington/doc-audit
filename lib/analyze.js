// Server-safe version of analyze.js — no fs/path imports.
// Used by the Next.js API route. Do not modify the root analyze.js.

const PHASE_SIGNALS = {
  day0: [
    {
      key: 'fit-framing',
      label: "Fit framing ('who this is for / not for')",
      test: (lower) =>
        /\b(who (this|it) is for|is this right for|should (i|you) use this|not for you|this is (not for|designed for|built for)|meant for|right tool for)\b/.test(lower),
    },
    {
      key: 'tradeoffs',
      label: 'Visible tradeoffs or limitations',
      test: (lower) =>
        /\b(trade.?off|limitation|caveat|when not to|not recommended|consider instead|the downside|not (ideal|suitable|designed) for|doesn.t (support|handle))\b/.test(lower),
    },
    {
      key: 'alternatives',
      label: 'Comparison to alternatives',
      test: (lower) =>
        /\b(alternatives?|instead of|compared to|rather than)\b/.test(lower) || lower.includes(' vs '),
    },
    {
      key: 'problem-statement',
      label: 'Problem statement (what specific problem this solves)',
      test: (lower) =>
        /\b(designed to (solve|address)|the problem (this|it)|built (for|to solve)|what (this|it) (does|solves)|solves the problem|use case|the challenge)\b/.test(lower),
    },
    {
      key: 'adoption-cost',
      label: 'Adoption cost or migration context',
      test: (lower) =>
        /\b(migration|cost to adopt|takes (about|roughly)? ?\d|budget (for|about)|expect (to )?spend|what (you.ll|it will) (cost|take)|switching from|moving from)\b/.test(lower),
    },
  ],
  day1: [
    {
      key: 'install-command',
      label: 'Install or first run command',
      test: (lower, raw) =>
        /\b(npm (install|i )|pip install|brew install|apt(-get)? install|curl -[a-z]|wget |docker (pull|run)|helm install|go install|npx |yarn (add|install)|cargo (add|install))\b/.test(lower) ||
        /^```[\s\S]*?\b(install|init)\b/m.test(raw),
    },
    {
      key: 'numbered-steps',
      label: 'Numbered steps or clear sequence',
      test: (lower, raw) =>
        /^\d+\. /m.test(raw) ||
        /\b(step \d|step one|step two|first[,:]|then[,:]|next[,:]|finally[,:])\b/.test(lower),
    },
    {
      key: 'outcome',
      label: "Outcome statement ('you'll have X when done')",
      test: (lower) =>
        /\b(by the end|you.ll (have|be able|see)|you will (have|be able|see)|you now have|what you.ll (learn|build|get|end up with)|after (this|completing)|you should (see|have|be))\b/.test(lower),
    },
    {
      key: 'time-estimate',
      label: 'Time estimate',
      test: (lower) =>
        /\b(\d+.?minutes?|takes? (about|roughly)|\d+ (min|hour)s?|quick(ly)?|in under \d|less than \d+ min)\b/.test(lower),
    },
    {
      key: 'defaults',
      label: "Explicit recommended defaults ('start with X')",
      test: (lower) =>
        /\b(by default|to start[, ]|for most (users|cases|teams|people)|the simplest( option| approach)?|recommended (approach|option|path|starting point)|start with this|good starting point)\b/.test(lower),
    },
  ],
  day2: [
    {
      key: 'if-then',
      label: 'If/then diagnostic branches',
      test: (_lower, raw) =>
        /\bif\b.{0,80}(then|→|[:,] (use|do|try|run|go|check|set))/i.test(raw),
    },
    {
      key: 'error-text',
      label: 'Quoted error messages or exit codes',
      test: (_lower, raw) =>
        /("([A-Z][a-z]+ )?[Ee]rror[^"]{0,60}"|`[^`]*[Ee]rror[^`]{0,60}`|ECONNREFUSED|ENOENT|ETIMEDOUT|permission denied|command not found|exit code \d|status \d{3}|exit status \d)/i.test(raw),
    },
    {
      key: 'diagnostic-order',
      label: "Diagnostic ordering ('check this first')",
      test: (lower) =>
        /\b(check (first|this|that|your)|verify (that|your|the)|first (check|verify|look at)|start (by checking|with diagnosing)|look (for|at) (this|the error|the logs?)|common (causes?|reasons?))\b/.test(lower),
    },
    {
      key: 'recovery',
      label: 'Recovery or rollback steps',
      test: (lower) =>
        /\b(rollback|roll back|revert|restore (from|to a)|recover(y)?( steps?)?|undo|fall ?back|previous (version|state)|known.good|safe state|re-?deploy)\b/.test(lower),
    },
    {
      key: 'escalation',
      label: 'Escalation guidance',
      test: (lower) =>
        /\b(if (this|that) (doesn.t|does not) (work|help|resolve|fix)|if you (still |continue to )?(see|experience|get) (this|the error)|open an? (issue|bug|ticket)|contact (support|us)|file a bug|reach out( to)?)\b/.test(lower),
    },
  ],
};

const PHASE_SUGGESTIONS = {
  day0: {
    'fit-framing':
      "Add a 'Who this is for' section early in the doc. The developer arriving here needs to know if they should keep reading.",
    'tradeoffs':
      "Be explicit about what this does not do well. Visible tradeoffs build trust and help readers decide faster.",
    'alternatives':
      "Address at least one obvious alternative directly. 'If you need X instead, consider Y' is more useful than pretending no alternatives exist.",
    'problem-statement':
      "Open with the specific problem this solves, not a description of what the tool is. Readers are here because they have a problem.",
    'adoption-cost':
      "Surface the real cost of adopting this before the developer commits. Migration effort, learning curve, and prerequisites belong up front.",
  },
  day1: {
    'install-command':
      "The first thing a reader should be able to do is copy-paste one command. Put that command first, before any explanation.",
    'numbered-steps':
      "Structure the setup process as a numbered list. It reduces cognitive load and lets developers track where they are.",
    'outcome':
      "End with a concrete 'you now have X working' statement. Developers need to know when they are done.",
    'time-estimate':
      "Add a time estimate at the top. 'This takes about 10 minutes' sets expectations and reduces abandonment.",
    'defaults':
      "Explicitly recommend a starting point. 'For most teams, start with X' is more useful than listing every option with equal weight.",
  },
  day2: {
    'if-then':
      "Structure troubleshooting as explicit 'if you see X, do Y' branches. Narrative descriptions of problems do not help engineers under pressure.",
    'error-text':
      "Quote the actual error messages developers will encounter. Engineers search for error text when debugging, not for descriptions of errors.",
    'diagnostic-order':
      "Add a 'check these first' sequence. When something is broken, the order in which you investigate matters.",
    'recovery':
      "Document what to do if the primary fix does not work, including rollback steps or how to get back to a known-good state.",
    'escalation':
      "Tell developers when to stop self-diagnosing and escalate. 'If you still see this after X, open an issue' is genuinely useful.",
  },
};

const AGENT_SIGNALS = [
  {
    key: 'explicit-conditionals',
    label: 'Explicit conditionals — all decision points expressed as if/then',
    test: (lower) => /\bif\b.{0,80}(then|[:,]\s*(use|do|run|call|set|add|deploy|configure|install|return))/i.test(lower),
  },
  {
    key: 'unambiguous-defaults',
    label: 'Unambiguous defaults — no "for most users" without defining the user',
    test: (lower) => !/for most users|typically,|usually,|in most cases|generally speaking|most teams/i.test(lower),
  },
  {
    key: 'atomic-steps',
    label: 'Atomic steps — each step produces a verifiable state',
    test: (lower) => /\b(step \d|\d+\.\s|\byou (will|should) (see|have|get|receive)|should (return|output|display|show|print))/i.test(lower),
  },
  {
    key: 'error-recovery',
    label: 'Error recovery paths — what to do when a step fails',
    test: (lower) => /if (this|the|it) (fails|errors|doesn.t work)|on error|if you (see|get) an error|if that (doesn.t|does not)|troubleshoot|recovery|roll.?back/i.test(lower),
  },
  {
    key: 'self-contained',
    label: 'Self-contained sections — no cross-references that break chunking',
    test: (lower) => !/see (also|above|below|the previous|chapter|section \d)|refer to (the|section|chapter)|as (mentioned|described|explained) (above|below|earlier|previously|in (the|section))/i.test(lower),
  },
];

const AMBIGUITY_NOTES = {
  'day0-day1':
    "This doc is mixing evaluation content with setup content. A developer arriving here may not know whether they are supposed to be deciding or doing. Those are different mental states and they do not coexist well in the same document.",
  'day0-day2':
    "This doc is mixing fit assessment content with troubleshooting content, which is an unusual combination. It may be trying to serve two very different developers at once, the one deciding whether to adopt and the one already debugging production.",
  'day1-day2':
    "This doc is mixing getting-started content with troubleshooting content. These serve developers at completely different moments. A first-run guide and an incident runbook are not the same document, and trying to make them one tends to serve neither well.",
  'all':
    "This doc is hitting signals from all three phases. That is the pattern the framework is describing: a knowledge base that contains everything but routes nobody. It may be worth asking which one moment this doc is optimized for.",
};

function getPhaseBreakdown(lower, raw) {
  const result = {};
  for (const [phase, signals] of Object.entries(PHASE_SIGNALS)) {
    const fired = [];
    const missed = [];
    for (const sig of signals) {
      if (sig.test(lower, raw)) {
        fired.push(sig.key);
      } else {
        missed.push(sig.key);
      }
    }
    result[phase] = {
      signalCount: fired.length,
      signalsFired: fired,
      signalsFiredLabels: fired.map(k => signals.find(s => s.key === k).label),
      signalsMissed: missed,
      signalsMissedLabels: missed.map(k => signals.find(s => s.key === k).label),
      qualityScore: fired.length,
      maxScore: signals.length,
      suggestions: missed.map(k => PHASE_SUGGESTIONS[phase][k]),
    };
  }
  return result;
}

export function analyzeContent(text, fileName = 'pasted-content') {
  const raw = text;
  const lower = raw.toLowerCase();
  const words = raw.trim().split(/\s+/).length;

  const phases = getPhaseBreakdown(lower, raw);
  const counts = {
    day0: phases.day0.signalCount,
    day1: phases.day1.signalCount,
    day2: phases.day2.signalCount,
  };

  // Detect dominant phase
  const max = Math.max(counts.day0, counts.day1, counts.day2);
  let detectedPhase = 'unknown';
  if (max > 0) {
    if (counts.day0 === max) detectedPhase = 'day0';
    else if (counts.day1 === max) detectedPhase = 'day1';
    else detectedPhase = 'day2';
  }

  // Confidence: how much does the top phase dominate?
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][1];
  const second = sorted[1][1];
  let confidence = 'low';
  if (top >= 3 && top >= second * 2) confidence = 'high';
  else if (top >= 2 && top > second) confidence = 'medium';

  // Ambiguity: top two phases both have ≥ 2 signals within 1 of each other
  const isAmbiguous =
    sorted[0][1] >= 2 && sorted[1][1] >= 2 && (sorted[0][1] - sorted[1][1]) <= 1;

  let ambiguityNote = null;
  if (isAmbiguous) {
    if (sorted[2][1] >= 2) {
      ambiguityNote = AMBIGUITY_NOTES['all'];
    } else {
      const pair = [sorted[0][0], sorted[1][0]].sort().join('-');
      ambiguityNote = AMBIGUITY_NOTES[pair] ?? null;
    }
  }

  // Agent readability scoring
  const agentFired = AGENT_SIGNALS.filter(s => s.test(lower));
  const agentMissed = AGENT_SIGNALS.filter(s => !s.test(lower));
  const agentReadability = {
    score: agentFired.length,
    maxScore: 5,
    signalsFiredKeys: agentFired.map(s => s.key),
    signalsFiredLabels: agentFired.map(s => s.label),
    signalsMissedKeys: agentMissed.map(s => s.key),
    signalsMissedLabels: agentMissed.map(s => s.label),
  };

  return {
    fileName,
    wordCount: words,
    detectedPhase,
    confidence,
    isAmbiguous,
    ambiguityNote,
    phases,
    agentReadability,
  };
}

export function phaseLabel(phase) {
  return {
    day0: 'Day 0 — Pre-Commitment',
    day1: 'Day 1 — Getting Started',
    day2: 'Day 2 — Production',
    unknown: 'Unknown',
  }[phase] ?? 'Unknown';
}
