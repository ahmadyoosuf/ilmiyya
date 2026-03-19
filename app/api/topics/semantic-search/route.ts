import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

type TopicSemanticRow = {
  topic_id: number
  title: string
  level: number
  parent_id: number | null
  semantic_score: number
  fts_score: number
  hybrid_score: number
  total_count: number
}

function toVectorLiteral(values: number[]): string {
  return `[${values.join(',')}]`
}

async function embedQuery(query: string, apiKey: string): Promise<number[]> {
  const endpoint = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-embedding-001:predict?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(
    endpoint,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [
          {
            task_type: 'RETRIEVAL_QUERY',
            content: query,
          },
        ],
        parameters: {
          outputDimensionality: 1536,
          autoTruncate: true,
        },
      }),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gemini query embedding failed (${response.status}): ${body}`)
  }

  const payload = await response.json()
  const values = payload?.predictions?.[0]?.embeddings?.values

  if (!Array.isArray(values) || values.length !== 1536) {
    throw new Error('Gemini query embedding response is invalid or dimension is not 1536')
  }

  return values
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = (searchParams.get('q') || '').trim()
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 20), 1), 50)
    const page = Math.max(Number(searchParams.get('page') || 1), 1)
    const offset = (page - 1) * limit

    if (!query) {
      return NextResponse.json({ results: [], total: 0, page, limit })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim()

    if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey) {
      return NextResponse.json(
        {
          error:
            'Missing required env vars. Ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and GEMINI_API_KEY are set.',
        },
        { status: 500 }
      )
    }

    const queryEmbedding = await embedQuery(query, geminiApiKey)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase.rpc('match_topics_hybrid', {
      query_embedding_text: toVectorLiteral(queryEmbedding),
      query_text: query,
      match_count: limit,
      match_offset: offset,
      semantic_weight: 0.85,
      fts_weight: 0.15,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (data || []) as TopicSemanticRow[]
    const total = rows[0]?.total_count ?? 0

    return NextResponse.json({
      results: rows.map((row) => ({
        id: row.topic_id,
        title: row.title,
        level: row.level,
        parent_id: row.parent_id,
        semantic_score: row.semantic_score,
        fts_score: row.fts_score,
        hybrid_score: row.hybrid_score,
      })),
      total,
      page,
      limit,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
