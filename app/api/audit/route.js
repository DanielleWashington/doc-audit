import { analyzeContent } from '../../../lib/analyze.js';
import { buildReport } from '../../../lib/report.js';

function extractTextFromHtml(html) {
  // Priority: <article>, then <main>, then <body>
  let content = html;
  for (const tag of ['article', 'main', 'body']) {
    const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (match) { content = match[1]; break; }
  }
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { url, markdown } = body ?? {};

  if (!url && !markdown) {
    return Response.json(
      { error: 'Provide either url or markdown in the request body' },
      { status: 400 }
    );
  }

  let text = '';
  let fileName = 'pasted-content';
  let source = 'pasted-content';

  if (url) {
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return Response.json({ error: 'Invalid URL' }, { status: 400 });
    }

    let res;
    try {
      res = await fetch(url, {
        headers: { 'User-Agent': 'doc-audit/1.0' },
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      return Response.json({ error: 'Failed to fetch URL — check it is publicly accessible' }, { status: 400 });
    }

    if (!res.ok) {
      return Response.json({ error: `URL returned ${res.status}` }, { status: 400 });
    }

    const contentType = res.headers.get('content-type') ?? '';
    const rawBody = await res.text();

    if (contentType.includes('text/plain') || url.endsWith('.md')) {
      text = rawBody;
    } else {
      text = extractTextFromHtml(rawBody);
    }

    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    fileName = pathSegments[pathSegments.length - 1] ?? 'page';
    source = url;
  } else {
    text = markdown;
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 50) {
    return Response.json(
      { error: `Not enough content to analyze — extracted ${wordCount} words (minimum 50). Try a longer doc or a different URL.` },
      { status: 400 }
    );
  }

  const analysis = analyzeContent(text, fileName);
  const result = { ...analysis, skipped: false, flaggedForDeletion: false };
  const report = buildReport([result], source);

  return Response.json(report);
}
