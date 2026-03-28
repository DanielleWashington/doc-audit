import chalk from 'chalk';
import { writeFileSync } from 'fs';
import { phaseLabel } from './analyze.js';

function bar(filled, total, width = 10) {
  const blocks = Math.round((filled / total) * width);
  return '█'.repeat(blocks) + '░'.repeat(width - blocks);
}

function scoreColor(score, max) {
  const ratio = score / max;
  if (ratio >= 0.75) return chalk.green;
  if (ratio >= 0.4) return chalk.yellow;
  return chalk.red;
}

function phaseStatus(count, total) {
  const ratio = count / total;
  if (ratio === 0) return chalk.red('✗ Missing');
  if (ratio < 0.2) return chalk.red('⚠ Critical gap');
  if (ratio < 0.4) return chalk.yellow('⚠ Undercovered');
  return chalk.green('✓');
}

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

export function printReport(results, docsPath) {
  const audited = results.filter(r => !r.skipped && !r.flaggedForDeletion);
  const total = audited.length;
  if (total === 0) {
    console.log(chalk.yellow('\nNo files were audited.'));
    return;
  }

  const phaseCounts = { day0: 0, day1: 0, day2: 0, multi: 0, unknown: 0 };
  let totalQuality = 0;

  for (const r of audited) {
    const phase = r.confirmedPhase ?? r.detectedPhase;
    if (phaseCounts[phase] !== undefined) phaseCounts[phase]++;
    totalQuality += r.qualityScore;
  }

  const avgQuality = (totalQuality / total).toFixed(1);
  const width = 55;
  const border = '═'.repeat(width);

  console.log('\n' + chalk.bold.white(`╔${border}╗`));
  console.log(chalk.bold.white(`║`) + chalk.bold.yellow(`  doc-audit Report`.padEnd(width)) + chalk.bold.white(`║`));
  console.log(chalk.bold.white(`║`) + chalk.dim(`  ${docsPath}`.padEnd(width)) + chalk.bold.white(`║`));
  console.log(chalk.bold.white(`╚${border}╝`));

  console.log('\n' + chalk.bold('PHASE COVERAGE'));
  const phaseRows = [
    ['Day 0', phaseCounts.day0],
    ['Day 1', phaseCounts.day1],
    ['Day 2', phaseCounts.day2],
  ];
  for (const [label, count] of phaseRows) {
    const b = bar(count, Math.max(total, 1));
    const status = phaseStatus(count, total);
    console.log(`  ${label.padEnd(6)} ${chalk.cyan(b)}  ${String(count).padStart(2)} of ${total}   ${status}`);
  }

  if (results.filter(r => r.flaggedForDeletion).length > 0) {
    const flagged = results.filter(r => r.flaggedForDeletion).map(r => r.fileName);
    console.log(chalk.dim(`\n  Flagged for deletion: ${flagged.join(', ')}`));
  }

  console.log('\n' + chalk.bold(`DECISION QUALITY`) + chalk.dim(` (avg: ${avgQuality}/${audited[0]?.maxQualityScore ?? 8})`));
  for (const r of audited) {
    const col = scoreColor(r.qualityScore, r.maxQualityScore);
    const icon = r.qualityScore >= 6 ? '✓' : r.qualityScore >= 3 ? '⚠' : '✗';
    const label = r.qualityScore >= 6
      ? 'Strong decision doc'
      : r.qualityScore >= 3
      ? 'Partially decision-oriented'
      : 'Knowledge dump';
    console.log(`  ${col(icon)} ${r.fileName.padEnd(30)} ${col(r.qualityScore + '/' + r.maxQualityScore)}  — ${chalk.dim(label)}`);
  }

  const recs = buildRecommendations(results);
  if (recs.length > 0) {
    console.log('\n' + chalk.bold('RECOMMENDATIONS'));
    recs.forEach((rec, i) => {
      console.log(`  ${chalk.yellow(i + 1 + '.')} ${rec}`);
    });
  }

  console.log('\n' + chalk.dim(`  Inspired by: dev.to/daniellewashington/documentation-is-a-decision-system-not-a-knowledge-base-4139`));
  console.log(chalk.dim(`  And: dev.to/daniellewashington/humans-need-narrative-agents-need-decisions-your-docs-need-both-2ni8`));
  console.log('');
}

export function exportMarkdown(results, docsPath) {
  const audited = results.filter(r => !r.skipped && !r.flaggedForDeletion);
  const total = audited.length;
  const phaseCounts = { day0: 0, day1: 0, day2: 0 };

  for (const r of audited) {
    const phase = r.confirmedPhase ?? r.detectedPhase;
    if (phaseCounts[phase] !== undefined) phaseCounts[phase]++;
  }

  const recs = buildRecommendations(results);
  const lines = [
    `# doc-audit Report`,
    ``,
    `**Path:** \`${docsPath}\``,
    ``,
    `## Phase Coverage`,
    ``,
    `| Phase | Count | Status |`,
    `|-------|-------|--------|`,
    `| Day 0 — Pre-Commitment | ${phaseCounts.day0} | ${phaseCounts.day0 === 0 ? '✗ Missing' : phaseCounts.day0 < total * 0.2 ? '⚠ Undercovered' : '✓'} |`,
    `| Day 1 — Getting Started | ${phaseCounts.day1} | ${phaseCounts.day1 === 0 ? '✗ Missing' : phaseCounts.day1 < total * 0.2 ? '⚠ Undercovered' : '✓'} |`,
    `| Day 2 — Production | ${phaseCounts.day2} | ${phaseCounts.day2 === 0 ? '✗ Missing' : phaseCounts.day2 < total * 0.2 ? '⚠ Undercovered' : '✓'} |`,
    ``,
    `## Decision Quality`,
    ``,
    `| File | Score | Assessment |`,
    `|------|-------|------------|`,
    ...audited.map(r => {
      const label = r.qualityScore >= 6 ? 'Strong decision doc' : r.qualityScore >= 3 ? 'Partially decision-oriented' : 'Knowledge dump';
      return `| ${r.fileName} | ${r.qualityScore}/${r.maxQualityScore} | ${label} |`;
    }),
    ``,
    `## Recommendations`,
    ``,
    ...recs.map((r, i) => `${i + 1}. ${r}`),
    ``,
    `---`,
    `*Generated by [doc-audit](https://github.com) — inspired by Danielle Washington's documentation framework.*`,
  ];

  return lines.join('\n');
}

export function exportJSON(results, docsPath) {
  const audited = results.filter(r => !r.skipped && !r.flaggedForDeletion);
  const phaseCounts = { day0: 0, day1: 0, day2: 0 };

  for (const r of audited) {
    const phase = r.confirmedPhase ?? r.detectedPhase;
    if (phaseCounts[phase] !== undefined) phaseCounts[phase]++;
  }

  return JSON.stringify({
    docsPath,
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
  }, null, 2);
}
