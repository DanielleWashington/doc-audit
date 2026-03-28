#!/usr/bin/env node
import { existsSync, statSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { glob } from 'glob';
import { analyzeFile } from './analyze.js';
import { interviewFile } from './tree.js';
import { printReport, exportMarkdown, exportJSON } from './report.js';

const HELP = `
${chalk.bold.yellow('doc-audit')} — Audit your docs against the Day 0/1/2 decision-system framework

${chalk.bold('Usage:')}
  doc-audit <path>              Interactive audit of all .md files
  doc-audit <path> --auto       Auto-classify only, skip interview
  doc-audit <path> --json       Output JSON (pipe to file: --json > audit.json)
  doc-audit <path> --output <file>   Write markdown report to file

${chalk.bold('Examples:')}
  doc-audit ./docs
  doc-audit ./docs --auto
  doc-audit ./docs --json > audit.json
  doc-audit ./docs --output report.md

${chalk.bold('Based on the framework by Danielle Washington:')}
  ${chalk.dim('dev.to/daniellewashington/documentation-is-a-decision-system-not-a-knowledge-base-4139')}
`;

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  const docsPath = resolve(args.find(a => !a.startsWith('--')) ?? '.');
  const autoMode = args.includes('--auto');
  const jsonMode = args.includes('--json');
  const outputIdx = args.indexOf('--output');
  const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : null;

  if (!existsSync(docsPath)) {
    console.error(chalk.red(`\nPath not found: ${docsPath}\n`));
    process.exit(1);
  }

  const isFile = statSync(docsPath).isFile();
  const files = isFile
    ? [docsPath]
    : await glob('**/*.md', { cwd: docsPath, absolute: true, ignore: ['**/node_modules/**'] });

  if (files.length === 0) {
    console.error(chalk.yellow(`\nNo .md files found in: ${docsPath}\n`));
    process.exit(0);
  }

  if (!jsonMode) {
    console.log(chalk.bold.yellow('\ndoc-audit'));
    console.log(chalk.dim(`Found ${files.length} markdown file${files.length === 1 ? '' : 's'} in ${docsPath}\n`));
  }

  const analyses = files.map(analyzeFile);

  let results;

  if (autoMode || jsonMode) {
    results = analyses.map(a => ({ ...a, skipped: false, flaggedForDeletion: false }));
  } else {
    results = [];
    for (const analysis of analyses) {
      const result = await interviewFile(analysis);
      results.push(result);
    }
  }

  if (jsonMode) {
    process.stdout.write(exportJSON(results, docsPath));
    return;
  }

  if (outputFile) {
    const md = exportMarkdown(results, docsPath);
    writeFileSync(outputFile, md, 'utf-8');
    console.log(chalk.green(`\nReport written to: ${outputFile}\n`));
    return;
  }

  printReport(results, docsPath);
}

main().catch(err => {
  console.error(chalk.red('\nUnexpected error:'), err.message);
  process.exit(1);
});
