# How to Audit Your Documentation with doc-audit

Your docs are probably lying to you. Not intentionally — they're just answering the wrong question.

Most documentation is written to *explain things*. It describes what a function does, lists every configuration option, or summarizes the architecture. But the developer reading it at 11pm with a broken deploy isn't asking "what does this do?" They're asking "what do I do *right now*?" That's a completely different question, and most docs never answer it.

This tutorial walks through `doc-audit`, a CLI tool that scans your markdown files, classifies them by decision phase, scores how well they guide readers toward action, and tells you exactly what's missing. By the end you'll know how to run a full audit, interpret the results, and use the output to make targeted improvements to your docs.

---

## Before You Start: The Day 0/1/2 Framework

`doc-audit` is built around a specific model of how people actually use documentation. Rather than thinking about docs by type (reference, guide, tutorial), it thinks about *when* someone reaches for them and *what decision they need to make*.

**Day 0 — Pre-Commitment.** The reader hasn't adopted your tool yet. They're evaluating whether it's right for their situation. They need answers to: "Should I use this? What are the trade-offs? What's it not good for?" If your docs skip this phase entirely, you're losing people before they ever install anything.

**Day 1 — Getting Started.** The reader has committed. They want the fastest path to something working. They need a quickstart, a clear sequence of steps, and a success signal at the end. If this is the *only* phase you've covered (extremely common), your docs are onboarding docs and nothing else.

**Day 2 — Production.** The reader is past the happy path. Something broke, or they're scaling, or they hit an edge case. They need troubleshooting guides, operational runbooks, and "if X is happening, do Y" callouts. This phase is almost universally underdocumented.

A documentation suite that covers all three is actually useful at every stage of the adoption lifecycle. Most repos cover only Day 1, weakly cover Day 0, and treat Day 2 as an afterthought.

---

## Step 1: Installation

You'll need Node.js 18 or higher. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd doc-audit
npm install
```

To make the `doc-audit` command available system-wide:

```bash
npm link
```

Verify it's working:

```bash
doc-audit --help
```

You should see the usage output with all available flags.

---

## Step 2: Run Your First Audit

Point `doc-audit` at any directory containing `.md` files. If you want to try it against the bundled sample docs first:

```bash
node index.js ./test-docs
```

This launches interactive mode. For each file, the tool will show you what it auto-detected and ask you four questions. Let's walk through what happens.

### What the Auto-Detection Does

Before any prompts appear, `doc-audit` has already analyzed every file. It reads the raw text and looks for signal words associated with each phase. Day 0 signals include words like `overview`, `why use`, `compare`, `alternatives`, and `when to use`. Day 1 signals include `install`, `quickstart`, `tutorial`, `getting started`, and `how to`. Day 2 signals include `troubleshoot`, `debug`, `error`, `production`, `failing`, and `incident`.

Whichever set of signals appears most often wins. The file is tagged with that phase as its detected classification.

Alongside phase detection, `doc-audit` calculates a quality score out of 8. It's looking for six structural signals:

- **If/then guidance** (2 pts) — does the doc contain `if ... then`, `if ... →`, or `if ... do/try/run` patterns? These are the clearest markers of a document that actually guides decisions.
- **Trade-off language** (2 pts) — does it include "when not to", "limitation", "caveat", "⚠", or "not recommended"? Docs that surface trade-offs are more honest and more useful.
- **Ordered steps** (1 pt) — numbered lists signal a sequence the reader should follow.
- **Learning outcome** (1 pt) — phrases like "by the end" or "you will learn" set expectations and help readers self-select.
- **Next steps** (1 pt) — does it end by pointing somewhere? Docs that don't hand off leave readers stranded.
- **Focused length** (1 pt) — under 1,000 words. Long documents often try to do too many things.

### The Interactive Interview

When you're in interactive mode, the tool surfaces each file one at a time. You'll see something like:

```
──────────────────────────────────────────────────
  quickstart.md
  387 words  ·  Auto-detected: Day 1 — Getting Started
  Decision quality: 5/8
──────────────────────────────────────────────────

? What do you want to do with this file?
❯ Audit it
  Skip it
  Flag for deletion
```

**Action.** Choose "Audit it" to continue. "Skip it" excludes the file from the report entirely (useful for auto-generated files or changelogs). "Flag for deletion" marks it as a candidate for removal — these show up separately in the report.

**Phase confirmation.** The tool asks whether the auto-detected phase is correct. If your `api-reference.md` was auto-tagged as Day 1 because it mentions `how to use`, but it's really a reference doc, you'd correct it here.

**Decision quality.** You're asked whether the doc "recommends a clear path", "presents options but leaves the choice to the reader", or "mostly describes or lists without guiding action." These become qualitative annotations on the report.

**If/then and next step.** Two quick yes/no confirmations. These override the static analysis when your human judgment disagrees with the regex.

Once you've worked through all the files, the report prints.

---

## Step 3: Read the Report

Here's an example of what the terminal report looks like:

```
╔═══════════════════════════════════════════════════════╗
║  doc-audit Report                                     ║
║  /projects/my-tool/docs                               ║
╚═══════════════════════════════════════════════════════╝

PHASE COVERAGE
  Day 0  ██░░░░░░░░   1 of 4    ⚠ Undercovered
  Day 1  ██████░░░░   2 of 4    ✓
  Day 2  ░░░░░░░░░░   0 of 4    ✗ Missing

DECISION QUALITY (avg: 3.8/8)
  ✓ quickstart.md                  6/8  — Strong decision doc
  ⚠ overview.md                    4/8  — Partially decision-oriented
  ✗ api-reference.md               2/8  — Knowledge dump
  ✗ architecture.md                3/8  — Knowledge dump

RECOMMENDATIONS
  1. Missing Day 2 content — add a troubleshooting or production guide
  2. api-reference.md — low decision quality. Add "If X → do Y" callouts...
  3. architecture.md — no If/then guidance detected...
```

**Phase Coverage** tells you whether your docs address the full adoption lifecycle. A `✗ Missing` for any phase means readers at that stage have nothing to reach for. `⚠ Undercovered` means the phase exists but represents less than 20% of your docs — probably not enough.

**Decision Quality** is the per-file assessment. A "Knowledge dump" score (0–2) means the file explains things but doesn't help the reader make a decision or take action. A "Strong decision doc" (6–8) has explicit guidance, surfaces trade-offs, and ends with a next step.

**Recommendations** are prioritized. Phase gaps always surface first because they represent the largest structural problem. Per-file recommendations follow, ordered by how actionable they are.

---

## Step 4: Use Auto Mode and JSON for CI

If you want to run `doc-audit` as part of a CI pipeline or just want a fast snapshot without the interview, use `--auto`:

```bash
doc-audit ./docs --auto
```

This runs the static analyzer on every file and prints the report without prompting for anything. It won't have the benefit of your human phase confirmations, but it's useful for tracking trends over time.

To capture results for downstream processing or a custom dashboard:

```bash
doc-audit ./docs --json > audit.json
```

The JSON output includes the full summary, per-file data, and the recommendations array. You can pipe this into a script that fails CI if a phase is missing or the average quality score drops below a threshold.

For a persistent written record:

```bash
doc-audit ./docs --output docs-audit-2026-03.md
```

---

## Step 5: Act on the Results

The report tells you *what* to fix. Here's how to think about *how* to fix each category of finding.

**Missing Day 0 content.** Write a document that explicitly answers "Should I use this?" It should cover: what problem it solves, what it's not good for, and how it compares to obvious alternatives. End it with a clear decision branch: "If your use case is X, proceed to the quickstart. If it's Y, you might want Z instead."

**Missing Day 2 content.** Write a troubleshooting guide. The fastest way to seed it is to mine your issue tracker, Slack history, or support queue for the five most common things that go wrong. For each one, write an `If X is happening → do Y` entry. Link to relevant configuration options and end with escalation paths.

**Low quality score on an existing doc.** The most common fix is adding if/then guidance. Find every place where the doc describes a choice and add an explicit recommendation: "If you're using PostgreSQL, use the connection pool strategy. If you're using SQLite, skip this section entirely." Even a single well-placed callout can meaningfully move the score.

**"Partially decision-oriented" docs.** These typically present options but hedge on recommending one. That's often appropriate — but it should be intentional. If the doc is hedging because you haven't thought it through, commit to a recommended path and move the edge cases into a collapsible section or footnote.

---

## Going Further

The `web/index.html` file in the repo is a standalone browser-based version. Open it directly in Chrome or Firefox — no server needed — and drag in your markdown files for a real-time analysis. It's useful for auditing files outside your local environment or sharing results with non-technical stakeholders.

The quality score thresholds and signal dictionaries in `analyze.js` are intentionally opinionated but not sacred. If your docs use different patterns — say, you prefer `NOTE:` over `⚠` or your if/then guidance uses `→` exclusively — the regex patterns are easy to extend.

The broader argument behind all of this is that documentation quality isn't about completeness, it's about decision-enabling. A doc that lists every API parameter is not better than a shorter doc that tells the reader which parameter to use and when. `doc-audit` is a forcing function for asking that question systematically across an entire docs suite.

---

## Summary

`doc-audit` works in four stages: static analysis classifies and scores every `.md` file, an optional interactive interview lets you correct and annotate the results, the report surfaces phase gaps and quality findings, and the recommendations give you a prioritized action list.

The most common pattern when teams run this for the first time: Day 1 coverage is solid, Day 0 is weak, Day 2 is almost entirely absent, and the average quality score hovers around 3–4 because most files explain without guiding. The fix isn't to rewrite everything — it's to add a troubleshooting guide, sharpen the evaluation doc, and add if/then callouts to the three files that get the most traffic.

That's usually enough to make documentation actually useful again.
