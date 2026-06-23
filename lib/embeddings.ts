// Turns text into a 768-dim vector using Google Gemini's free embedding model.
// Used by both ingestion (embed meeting notes) and retrieval (embed the question).

const GEMINI_EMBED_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent'

const EMBED_DIMS = 768 // must match vector(768) in rag-schema.sql

export async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${GEMINI_EMBED_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: EMBED_DIMS,
    }),
  })

  if (!res.ok) {
    throw new Error(`Gemini embed failed (${res.status}): ${await res.text()}`)
  }

  const data = await res.json()
  const values: number[] | undefined = data?.embedding?.values
  if (!values) throw new Error('Gemini embed: no values returned')

  return values
}

// Split a meeting's text into overlapping chunks small enough to embed well.
// Meeting notes are usually short, so paragraph-ish chunks with light overlap.
export function chunkText(text: string, maxChars = 800, overlap = 100): string[] {
  const clean = text.replace(/\s+\n/g, '\n').trim()
  if (clean.length <= maxChars) return clean ? [clean] : []

  const chunks: string[] = []
  let start = 0
  while (start < clean.length) {
    const end = Math.min(start + maxChars, clean.length)
    chunks.push(clean.slice(start, end).trim())
    if (end === clean.length) break
    start = end - overlap
  }
  return chunks.filter(Boolean)
}
