/// <reference types="vite/client" />
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function* streamIntelligenceReport(
  contentTitle: string,
  contentGenre: string[],
  contentDescription: string,
  topGenres: string[]
): AsyncGenerator<string, void, unknown> {
  if (!API_KEY) {
    yield "LUMORA's intelligence engine is initializing. Please configure your API key.";
    return;
  }

  const prompt = `You are LUMORA's AI Intelligence Engine — cinematic, precise, never generic. 

A user with affinity for [${topGenres.join(', ') || 'diverse content'}] is viewing "${contentTitle}" (${contentGenre.join('/')}).

Write an "Intelligence Report" of exactly 2 sentences:
1. Why this title resonates with their specific viewing pattern
2. One unexpected thematic layer that makes it worth watching

Voice: cinematic and slightly poetic. Under 70 words total. No bullet points. No filler phrases like "this film" or "this series".`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    if (!res.ok || !res.body) {
      yield "Our quantum processors are recalibrating. The intelligence report will be available shortly.";
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        try {
          const json = JSON.parse(line.slice(6));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch { /* skip malformed chunks */ }
      }
    }
  } catch {
    yield "Our quantum processors are recalibrating. The intelligence report will be available shortly.";
  }
}

// Keeping a non-generator version for backward compatibility if needed, but updated with new logic
export async function getRecommendation(
  content: { title: string; genre: string[]; description: string }
): Promise<string> {
  if (!API_KEY) return "LUMORA's intelligence engine is initializing. Please configure your API key.";
  
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are LUMORA's AI Intelligence Engine. A user is viewing "${content.title}" (Genre: ${content.genre.join('/')}). Write an "Intelligence Report" of exactly 2 sentences. Voice: cinematic and slightly poetic.`
            }]
          }]
        })
      }
    );
    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || "Our quantum processors suggest this title will resonate deeply with your aesthetic synchronization frequency.";
  } catch {
    return "Our quantum processors suggest this title will resonate deeply with your aesthetic synchronization frequency.";
  }
}
