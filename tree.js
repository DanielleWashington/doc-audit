import inquirer from 'inquirer';
import chalk from 'chalk';
import { phaseLabel } from './analyze.js';

const PHASE_CHOICES = [
  { name: 'Day 0 — Pre-Commitment (evaluate if this is right for me)', value: 'day0' },
  { name: 'Day 1 — Getting Started (fastest path to working)', value: 'day1' },
  { name: 'Day 2 — Production (troubleshoot, scale, maintain)', value: 'day2' },
  { name: 'Spans multiple phases', value: 'multi' },
];

const QUALITY_CHOICES = [
  { name: 'Yes — it recommends a clear path or answers a specific decision', value: 'decision' },
  { name: 'Partially — it presents options but leaves the choice to the reader', value: 'partial' },
  { name: 'No — it mostly describes or lists without guiding action', value: 'reference' },
];

export async function interviewFile(analysis) {
  const divider = chalk.dim('─'.repeat(50));
  const phaseGuess = phaseLabel(analysis.detectedPhase);
  const scoreColor = analysis.qualityScore >= 6
    ? chalk.green
    : analysis.qualityScore >= 3
    ? chalk.yellow
    : chalk.red;

  console.log('\n' + divider);
  console.log(chalk.bold.white(`  ${analysis.fileName}`));
  console.log(chalk.dim(`  ${analysis.wordCount} words  ·  Auto-detected: ${chalk.cyan(phaseGuess)}`));
  console.log(chalk.dim(`  Decision quality: ${scoreColor(analysis.qualityScore + '/' + analysis.maxQualityScore)}`));
  console.log(divider);

  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'What do you want to do with this file?',
    choices: [
      { name: 'Audit it', value: 'audit' },
      { name: 'Skip it', value: 'skip' },
      { name: 'Flag for deletion', value: 'delete' },
    ],
  }]);

  if (action === 'skip') return { ...analysis, skipped: true };
  if (action === 'delete') return { ...analysis, flaggedForDeletion: true };

  const { phase } = await inquirer.prompt([{
    type: 'list',
    name: 'phase',
    message: `Is "${analysis.fileName}" classified correctly?`,
    choices: PHASE_CHOICES,
    default: PHASE_CHOICES.findIndex(c => c.value === analysis.detectedPhase),
  }]);

  const { quality } = await inquirer.prompt([{
    type: 'list',
    name: 'quality',
    message: 'Does this doc help the reader make a specific decision?',
    choices: QUALITY_CHOICES,
  }]);

  const { hasIfThen } = await inquirer.prompt([{
    type: 'confirm',
    name: 'hasIfThen',
    message: 'Does it include explicit "If X → do Y" guidance?',
    default: analysis.qualityScore >= 2,
  }]);

  const { hasClearNext } = await inquirer.prompt([{
    type: 'confirm',
    name: 'hasClearNext',
    message: 'Does it end with a clear next step?',
    default: false,
  }]);

  return {
    ...analysis,
    confirmedPhase: phase,
    qualityOverride: quality,
    hasIfThen,
    hasClearNext,
    skipped: false,
    flaggedForDeletion: false,
  };
}
