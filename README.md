# doc-audit

**Audit your documentation against the Day 0/1/2 decision-system framework.**

`doc-audit` is a CLI tool that scans your markdown docs, classifies each file by decision phase, scores how well they guide the reader toward action, and surfaces specific recommendations for improvement — all in your terminal.

---

## The Framework

Most documentation fails not because it lacks information, but because it doesn't help the reader make a decision. `doc-audit` is built around the Day 0/1/2 framework:

| Phase | Reader's Question | Doc Purpose |
|-------|-------------------|-------------|
| **Day 0 — Pre-Commitment** | "Should I use this at all?" | Evaluation, comparison, trade-offs |
| **Day 1 — Getting Started** | "How do I get it working?" | Quickstart, installation, first tutorial |
| **Day 2 — Production** | "Something broke. What now?" | Troubleshooting, scaling, incident guides |

A healthy documentation suite covers all three phases. Most repos over-index on Day 1 and leave Day 0 and Day 2 nearly empty.

> Originally articulated in [Documentation is a Decision System, Not a Knowledge Base](https://dev.to/daniellewashington/documentation-is-a-decision-system-not-a-knowledge-base-4139) and [Humans Need Narrative, Agents Need Decisions — Your Docs Need Both](https://dev.to/daniellewashington/humans-need-narrative-agents-need-decisions-your-docs-need-both-2ni8) by Danielle Washington.

---

## Installation

**Requirements:** Node.js 18 or higher.

```bash
# Clone the repo
git clone <repo-url>
cd doc-audit

# Install dependencies
npm install

# Run directly
node index.js ./your-docs-folder

# Or link globally to use the `doc-audit` command anywhere
npm link
doc-audit ./your-docs-folder
```

---

## Usage

```
doc-audit <path>                       Interactive audit of all .md files
doc-audit <path> --auto                Auto-classify only, skip the interview
doc-audit <path> --json                Output raw JSON (pipe to a file)
doc-audit <path> --output <file>       Write a markdown report to a file
doc-audit --help                       Show usage
```

### Interactive Mode (default)

```bash
doc-audit ./docs
```

For each `.md` file found, `doc-audit` shows its auto-detected phase and quality score, then walks you through a short interview:

1. **Action** — audit it, skip it, or flag it for deletion
2. **Phase confirmation** — verify or correct the detected Day 0/1/2 classification
3. **Decision quality** — does it recommend a path, present options, or just describe?
4. **If/then guidance** — does it include explicit `If X → do Y` callouts?
5. **Next step** — does it end by pointing the reader somewhere?

After all files are processed, a summary report prints to the terminal with phase coverage, per-file quality scores, and prioritized recommendations.

### Auto Mode

```bash
doc-audit ./docs --auto
```

Skips the interactive interview. Runs the static analyzer on every file and prints the report immediately. Useful for CI checks or a quick first pass.

### JSON Export

```bash
doc-audit ./docs --json > audit.json
```

Outputs a structured JSON object with the full audit summary, per-file results, and recommendations. The JSON schema is described below.

### Markdown Export

```bash
doc-audit ./docs --output report.md
```

Writes a formatted markdown report to the specified file.

---

## How Classification Works

`doc-audit` reads each `.md` file and scores it against three signal dictionaries:

**Day 0 signals** (evaluation keywords):
`overview`, `why use`, `what is`, `compare`, `vs`, `should i`, `when to use`, `use case`, `is this right`, `evaluation`, `choosing`, `alternatives`, `not for`, `who is this for`

**Day 1 signals** (onboarding keywords):
`install`, `setup`, `quickstart`, `tutorial`, `step 1`, `getting started`, `first time`, `how to`, `walkthrough`, `your first`, `prerequisites`, `requirements`

**Day 2 signals** (operational keywords):
`troubleshoot`, `debug`, `error`, `production`, `scale`, `monitor`, `faq`, `fix`, `broken`, `failing`, `issues`, `problems`, `performance`, `incident`, `rollback`, `outage`

The phase with the most signal matches wins. In interactive mode, you can override the detected classification.

---

## Decision Quality Score

Each file receives a quality score out of **8 points** based on structural signals:

| Signal | Points | What it checks |
|--------|--------|----------------|
| If/then guidance | 2 | Regex for `if ... then/→/do/try/run` patterns |
| Trade-off language | 2 | "when not to", "caveat", "⚠", "limitation", "not recommended" |
| Ordered steps | 1 | Numbered list (`1.`) present |
| Learning outcome | 1 | "by the end", "you will learn", "after completing" |
| Next steps | 1 | "next steps", "proceed to", "go to section" |
| Focused length | 1 | Under 1,000 words |

**Score interpretation:**

- `6–8` — Strong decision doc ✓
- `3–5` — Partially decision-oriented ⚠
- `0–2` — Knowledge dump ✗

---

## Output

### Terminal Report

```
╔═══════════════════════════════════════════════════════╗
║  doc-audit Report                                     ║
║  /your/docs/path                                      ║
╚═══════════════════════════════════════════════════════╝

PHASE COVERAGE
  Day 0  ████░░░░░░   2 of 5    ✓
  Day 1  ██████░░░░   3 of 5    ✓
  Day 2  ░░░░░░░░░░   0 of 5    ✗ Missing

DECISION QUALITY (avg: 4.2/8)
  ✓ quickstart.md                  7/8  — Strong decision doc
  ⚠ overview.md                    4/8  — Partially decision-oriented
  ✗ api-reference.md               2/8  — Knowledge dump

RECOMMENDATIONS
  1. Missing Day 2 content — add a troubleshooting or production guide
  2. api-reference.md — low decision quality. Add "If X → do Y" callouts...
```

### JSON Schema

```json
{
  "docsPath": "/your/docs",
  "generatedAt": "2026-03-28T00:00:00.000Z",
  "summary": {
    "total": 4,
    "phaseCounts": { "day0": 1, "day1": 2, "day2": 1 },
    "avgQualityScore": 5.2
  },
  "files": [
    {
      "fileName": "quickstart.md",
      "wordCount": 420,
      "detectedPhase": "day1",
      "confirmedPhase": "day1",
      "qualityScore": 7,
      "maxQualityScore": 8,
      "skipped": false,
      "flaggedForDeletion": false
    }
  ],
  "recommendations": [
    "Missing Day 2 content — add a troubleshooting or production guide"
  ]
}
```

---

## Project Structure

```
doc-audit/
├── index.js        Entry point. CLI argument parsing, file discovery, orchestration
├── analyze.js      Static file analyzer. Signal matching, quality scoring
├── tree.js         Interactive interview flow (uses inquirer)
├── report.js       Terminal printer, markdown exporter, JSON exporter
├── package.json
└── test-docs/      Sample docs for local testing
    ├── overview.md
    ├── quickstart.md
    ├── troubleshooting.md
    └── api-reference.md
```

### Module Responsibilities

**`index.js`** — Parses `process.argv`, resolves the target path, discovers `.md` files via `glob`, fans out to either `analyzeFile` (auto mode) or `interviewFile` (interactive mode), then routes output to `printReport`, `exportMarkdown`, or `exportJSON`.

**`analyze.js`** — Pure functions. `analyzeFile(filePath)` reads a file, runs signal matching, calculates the quality score, and returns a plain analysis object. `phaseLabel(phase)` maps internal phase keys to human-readable strings.

**`tree.js`** — Async interactive flow using `inquirer`. `interviewFile(analysis)` takes an analysis object, displays context, prompts the user with four questions, and returns an enriched result object with confirmed phase and quality overrides.

**`report.js`** — Three export functions: `printReport` (colored terminal output via chalk), `exportMarkdown` (returns a markdown string), `exportJSON` (returns a JSON string). Also contains `buildRecommendations`, which inspects the full results array and surfaces up to 8 prioritized action items.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `chalk` ^5.3.0 | Terminal color output |
| `glob` ^10.3.10 | Recursive `.md` file discovery |
| `inquirer` ^9.2.15 | Interactive terminal prompts |

All three are ESM-compatible. The project uses `"type": "module"` in `package.json`.

---

## Web UI

A standalone browser-based version of the auditor lives in `web/index.html`. Open it directly in any browser — no server required. It supports drag-and-drop of markdown files and renders the phase classification and quality score in real time.

---

## Running Against the Test Docs

```bash
# Interactive audit of the bundled sample docs
node index.js ./test-docs

# Auto mode — no prompts
node index.js ./test-docs --auto

# Export JSON
node index.js ./test-docs --json > sample-audit.json
```

---

## Credits

Built on the documentation framework developed by [Danielle Washington](https://dev.to/daniellewashington):

- [Documentation is a Decision System, Not a Knowledge Base](https://dev.to/daniellewashington/documentation-is-a-decision-system-not-a-knowledge-base-4139)
- [Humans Need Narrative, Agents Need Decisions — Your Docs Need Both](https://dev.to/daniellewashington/humans-need-narrative-agents-need-decisions-your-docs-need-both-2ni8)
