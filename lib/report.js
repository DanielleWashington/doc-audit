// Server-safe version of report.js — no chalk/fs imports.
// Used by the Next.js API route. Do not modify the root report.js.

export function buildReport(analysis, source) {
  return {
    source,
    generatedAt: new Date().toISOString(),
    fileName: analysis.fileName,
    wordCount: analysis.wordCount,
    detectedPhase: analysis.detectedPhase,
    confidence: analysis.confidence,
    isAmbiguous: analysis.isAmbiguous,
    ambiguityNote: analysis.ambiguityNote,
    phases: analysis.phases,
    agentReadability: analysis.agentReadability,
  };
}
