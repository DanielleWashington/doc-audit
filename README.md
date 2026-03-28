# doc-audit

Audit your documentation against the Day 0/1/2 decision-system framework.

`doc-audit` scans your markdown files, classifies each one by decision phase, scores how well it guides the reader toward action, and tells you exactly what to fix. It runs in your terminal and takes about two minutes per docs folder.

---

## The Framework

Most documentation fails not because something is missing, but because it answers the wrong question. We've built encyclopedias when people need guides. The Day 0/1/2 framework maps the decision landscape your users actually navigate.

| Phase | Reader's question | What they need |
|-------|-------------------|----------------|
| **Day 0, Pre-Commitment** | Should I use this at all? | Evaluation, comparison, tradeoffs |
| **Day 1, Getting Started** | How do I get it working? | Quickstart, installation, first steps |
| **Day 2, Production** | Something broke. What now? | Troubleshooting, scaling, incident guides |

A healthy docs suite covers all three. Most repos over-index on Day 1 and leave Day 0 and Day 2 nearly empty.

> Built on the framework from [Documentation is a Decision System, Not a Knowledge Base](https://dev.to/daniellewashington/documentation-is-a-decision-system-not-a-knowledge-base-4139) and [Humans Need Narrative, Agents Need Decisions, Your Docs Need Both](https://dev.to/daniellewashington/humans-need-narrative-agents-need-decisions-your-docs-need-both-2ni8) by Danielle Washington.

---

## Installation

Node.js 18 or higher required.

```bash
git clone <repo-url>
cd doc-audit
npm install

# Link globally to use doc-audit anywhere
npm link
```

---

## Usage

```
doc-audit <path>                       Interactive audit of all .md files
doc-audit <path> --auto                Auto-classify only, no interview
doc-audit <path> --json                Output raw JSON
doc-audit <path> --output <file>       Write a markdown report to a file
doc-audit --help                       Show usage
```

### Interactive mode (default)

```bash
doc-audit ./docs
```

For each `.md` file found, `doc-audit` shows the auto-detected phase and quality score, then asks four questions: whether to audit, skip, or flag the file for deletion; whether the detected phase is correct; whether the doc helps the reader make a specific decision; and whether it includes explicit if/then guidance and a clear next step.

After all files are processed, a summary report prints with phase coverage, per-file quality scores, and prioritized recommendations.

### Auto mode

```bash
doc-audit ./docs --auto
```

Skips the interview entirely. Runs the static analyzer on every file and prints the report. Good for CI or a fast first pass.

### JSON export

```bash
doc-audit ./docs --json > audit.json
```

Outputs a structured JSON object with the full summary, per-file results, and recommendations. Pipe it into whatever you want.

### Markdown export

```bash
doc-audit ./docs --output report.md
```

Writes a formatted markdown report to disk.

---

## How classification works

`doc-audit` reads each file and scores it against three signal dictionaries.

**Day 0 signals:** `overview`, `why use`, `what is`, `compare`, `vs`, `should i`, `when to use`, `use case`, `is this right`, `evaluation`, `choosing`, `alternatives`, `not for`, `who is this for`

**Day 1 signals:** `install`, `setup`, `quickstart`, `tutorial`, `step 1`, `getting started`, `first time`, `how to`, `walkthrough`, `your first`, `prerequisites`, `requirements`

**Day 2 signals:** `troubleshoot`, `debug`, `error`, `production`, `scale`, `monitor`, `faq`, `fix`, `broken`, `failing`, `issues`, `problems`, `performance`, `incident`, `rollback`, `outage`

The phase with the most signal matches wins. In interactive mode, you can override the detected classification.

---

## Decision quality score

Each file gets a score out of 8 based on structural signals.

| Signal | Points | What it checks |
|--------|--------|----------------|
| If/then guidance | 2 | Regex for `if ... then/→/do/try/run` patterns |
| Tradeoff language | 2 | "when not to", "caveat", "⚠", "limitation", "not recommended" |
| Ordered steps | 1 | Numbered list present |
| Learning outcome | 1 | "by the end", "you will learn", "after completing" |
| Next steps | 1 | "next steps", "proceed to", "go to section" |
| Focused length | 1 | Under 1,000 words |

The if/then and tradeoff signals carry double weight because they're the hardest to fake. A doc can have ordered steps and a next steps section and still be a knowledge dump. Explicit "if your use case is X, do Y" language is what separates a decision doc from a reference doc.

**Score interpretation:**

- `6–8`, Strong decision doc ✓
- `3–5`, Partially decision-oriented ⚠
- `0–2`, Knowledge dump ✗

---

## Output

### Terminal report

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

### JSON schema

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

## Project structure

```
doc-audit/
├── index.js        Entry point, CLI args, file discovery, orchestration
├── analyze.js      Static analyzer, signal matching, quality scoring
├── tree.js         Interactive interview flow (inquirer)
├── report.js       Terminal output, markdown export, JSON export
├── package.json
└── test-docs/      Sample docs for local testing
    ├── overview.md
    ├── quickstart.md
    ├── troubleshooting.md
    └── api-reference.md
```

**`index.js`** parses `process.argv`, resolves the target path, discovers `.md` files via `glob`, and routes to either `analyzeFile` (auto mode) or `interviewFile` (interactive mode), then sends output to `printReport`, `exportMarkdown`, or `exportJSON`.

**`analyze.js`** is pure functions. `analyzeFile(filePath)` reads a file, runs signal matching, calculates the quality score, and returns a plain analysis object. `phaseLabel(phase)` maps phase keys to human-readable strings.

**`tree.js`** is the async interactive flow using `inquirer`. `interviewFile(analysis)` takes an analysis object, shows context, prompts four questions, and returns an enriched result with confirmed phase and quality overrides.

**`report.js`** has three export functions: `printReport` for colored terminal output via chalk, `exportMarkdown` returning a markdown string, and `exportJSON` returning a JSON string. `buildRecommendations` inspects the full results array and surfaces up to 8 prioritized action items.

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

A standalone browser-based version lives in `docs/index.html`. Open it directly in any browser, no server required. Drag and drop markdown files and it classifies and scores them in real time.

---

## Try it on the test docs

```bash
# Interactive audit
node index.js ./test-docs

# Auto mode
node index.js ./test-docs --auto

# JSON export
node index.js ./test-docs --json > sample-audit.json
```

---

## Credits

Built on the documentation framework by [Danielle Washington](https://dev.to/daniellewashington).
