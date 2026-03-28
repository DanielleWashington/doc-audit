// Server-safe version of report.js — no chalk/fs imports.
// Used by the Next.js API route. Do not modify the root report.js.

import { phaseLabel } from './analyze.js';

function buildRecommendations(results) {
  const recs = [];
  const phases = { day0: 0, day1: 0, day2: 0 };
  const audited = results.filter(r => !r.skipped && !r.flaggedForDeletion);

  for (const r of audited) {
    const phase = r.confirmedPhase ?? r.detectedPhase;
    if (phases[phase] !== undefined) phases[phase]++;
  }

  if (phases.day0 === 0) recs.push('Missing Day 0 content — add a "Should I use this?" or evaluation guide');
  if (phases.day1 === 0) recs.push('Missing Day 1 content — add a quickstart or getting-started guide');
  if (phases.day2 === 0) recs.push('Missing Day 2 content — add a troubleshooting or production guide');

  for (const r of audited) {
    if (r.qualityOverride === 'reference' || r.qualityScore <= 2) {
      recs.push(`${r.fileName} — low decision quality. Add "If X → do Y" callouts and a clear next step`);
    } else if (r.qualityOverride === 'partial') {
      recs.push(`${r.fileName} — partially decision-oriented. Commit to a recommended path; surface tradeoffs explicitly`);
    }
    const hasIfThen = r.hasIfThen ?? false;
    if (!hasIfThen && !r.skipped) {
      recs.push(`${r.fileName} — no If/then guidance detected. Add at least one explicit decision branch`);
    }
  }

  return [...new Set(recs)].slice(0, 8);
}

export function buildReport(results, source) {
  const audited = results.filter(r => !r.skipped && !r.flaggedForDeletion);
  const phaseCounts = { day0: 0, day1: 0, day2: 0 };

  for (const r of audited) {
    const phase = r.confirmedPhase ?? r.detectedPhase;
    if (phaseCounts[phase] !== undefined) phaseCounts[phase]++;
  }

  return {
    source,
    generatedAt: new Date().toISOString(),
    summary: {
      total: audited.length,
      phaseCounts,
      avgQualityScore: audited.length > 0
        ? +(audited.reduce((s, r) => s + r.qualityScore, 0) / audited.length).toFixed(1)
        : 0,
    },
    files: results.map(r => ({
      fileName: r.fileName,
      wordCount: r.wordCount,
      detectedPhase: r.detectedPhase,
      confirmedPhase: r.confirmedPhase ?? r.detectedPhase,
      qualityScore: r.qualityScore,
      maxQualityScore: r.maxQualityScore,
      skipped: r.skipped ?? false,
      flaggedForDeletion: r.flaggedForDeletion ?? false,
    })),
    recommendations: buildRecommendations(results),
  };
}
