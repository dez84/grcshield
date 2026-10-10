import { NextRequest } from 'next/server';
import { apiError, apiOk } from '@/lib/api';
import { matchGlossary, findGlossaryEntry } from '@/lib/content/glossary';

export const dynamic = 'force-dynamic';

/**
 * Translates legal or framework jargon into plain English. Uses a curated
 * glossary directly when no model key is configured, and otherwise asks the
 * model with the glossary as grounding context so answers stay on-topic.
 * Body: { text }.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { text } = (body ?? {}) as { text?: string };
  const query = (text ?? '').toString().trim().slice(0, 2000);
  if (!query) return apiError('Provide text to explain');
  if (query.length < 3) return apiError('Provide at least a few words');

  const matches = matchGlossary(query);
  const primary = findGlossaryEntry(query);

  if (!process.env.OPENAI_API_KEY) {
    return apiOk({
      mode: 'offline',
      summary:
        primary?.plain ??
        'No glossary match was found. Try naming the regulation or concept, for example "data minimisation" or "SOC 2 Type II".',
      whyItMatters: primary?.whyItMatters ?? null,
      example: primary?.example ?? null,
      related: matches.map((m) => m.term),
    });
  }

  try {
    const grounding = matches
      .map((m) => `- ${m.term}: ${m.plain} (Why it matters: ${m.whyItMatters}. Example: ${m.example})`)
      .join('\n');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content:
              'You translate governance, risk, compliance and privacy jargon into plain English for a busy professional. Be accurate and concise. Reply as JSON with keys summary, whyItMatters, example. Each is a short string. Do not add legal advice disclaimers.',
          },
          {
            role: 'user',
            content: `Explain: ${query}\n\nGrounding glossary entries you may use:\n${grounding || 'none'}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) throw new Error(`model responded ${res.status}`);
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    const parsed = content ? (JSON.parse(content) as Record<string, string>) : {};

    return apiOk({
      mode: 'model',
      summary: parsed.summary ?? primary?.plain ?? '',
      whyItMatters: parsed.whyItMatters ?? primary?.whyItMatters ?? null,
      example: parsed.example ?? primary?.example ?? null,
      related: matches.map((m) => m.term),
    });
  } catch {
    // Never fail the learner because the model is down; fall back to the glossary.
    return apiOk({
      mode: 'offline-fallback',
      summary: primary?.plain ?? 'The explainer is unavailable right now. Try again shortly.',
      whyItMatters: primary?.whyItMatters ?? null,
      example: primary?.example ?? null,
      related: matches.map((m) => m.term),
    });
  }
}
