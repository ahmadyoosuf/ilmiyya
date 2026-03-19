import { createClient } from '@supabase/supabase-js'
import nextEnv from '@next/env'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'

const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

function forceLoadEnvFile(filePath) {
  if (!existsSync(filePath)) return

  const content = readFileSync(filePath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key) process.env[key] = value
  }
}

forceLoadEnvFile('.env.local')

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL')
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY')

const APPLY = process.argv.includes('--apply')
const MODEL = 'gemini-embedding-001'
const OUTPUT_DIM = 1536
const TOPIC_BATCH = 500
const EMBED_BATCH = Number(process.env.TOPICS_EMBED_BATCH_SIZE || 120)
const UPSERT_BATCH = Number(process.env.TOPICS_UPSERT_BATCH_SIZE || 60)
const MAX_RETRIES = 4
const UPSERT_MAX_RETRIES = Number(process.env.TOPICS_UPSERT_MAX_RETRIES || 5)
const MIN_REQUEST_INTERVAL_MS = Number(process.env.TOPICS_EMBED_MIN_INTERVAL_MS || 0)

let lastGeminiRequestAt = 0
const VERTEX_ENDPOINT = `https://aiplatform.googleapis.com/v1/publishers/google/models/${MODEL}:predict?key=${encodeURIComponent(GEMINI_API_KEY)}`

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function sha256(input) {
  return createHash('sha256').update(input).digest('hex')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toVectorLiteral(values) {
  return `[${values.join(',')}]`
}

async function fetchAllTopics() {
  const rows = []
  let from = 0

  while (true) {
    const to = from + TOPIC_BATCH - 1
    const { data, error } = await supabase
      .from('topics')
      .select('id, parent_id, title, level')
      .order('id', { ascending: true })
      .range(from, to)

    if (error) throw new Error(`Failed reading topics [${from}-${to}]: ${error.message}`)
    if (!data || data.length === 0) break

    rows.push(...data)
    if (data.length < TOPIC_BATCH) break

    from += TOPIC_BATCH
  }

  return rows
}

async function fetchExistingEmbeddings() {
  const rows = []
  let from = 0

  while (true) {
    const to = from + TOPIC_BATCH - 1
    const { data, error } = await supabase
      .from('topic_embeddings')
      .select('topic_id, content_hash, model')
      .range(from, to)

    if (error) throw new Error(`Failed reading existing embeddings [${from}-${to}]: ${error.message}`)
    if (!data || data.length === 0) break

    rows.push(...data)
    if (data.length < TOPIC_BATCH) break

    from += TOPIC_BATCH
  }

  return rows
}

function buildHierarchyPath(topic, byId) {
  const visited = new Set()
  const parts = []
  let current = topic

  while (current) {
    if (visited.has(current.id)) break
    visited.add(current.id)

    parts.unshift(current.title)

    if (current.parent_id == null) break
    current = byId.get(current.parent_id)
  }

  return parts.join(' > ')
}

function buildSourceText(topic, byId) {
  const path = buildHierarchyPath(topic, byId)

  return [
    `Arabic topic title: ${topic.title}`,
    `Topic hierarchy: ${path}`,
    `Topic level: ${topic.level}`,
    'Domain: Islamic hadith and fiqh taxonomy.',
    'Search intent: multilingual semantic retrieval including Arabic, English, and transliterated Islamic terms.',
  ].join('\n')
}

async function embedBatch(docs) {
  const body = {
    instances: docs.map((doc) => ({
      task_type: 'RETRIEVAL_DOCUMENT',
      title: doc.title,
      content: doc.source_text,
    })),
    parameters: {
      outputDimensionality: OUTPUT_DIM,
      autoTruncate: true,
    },
  }

  let attempt = 0

  while (attempt <= MAX_RETRIES) {
    const elapsed = Date.now() - lastGeminiRequestAt
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - elapsed)
    }

    lastGeminiRequestAt = Date.now()

    try {
      const response = await fetch(VERTEX_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const payload = await response.json()
        const predictions = payload?.predictions

        if (!Array.isArray(predictions) || predictions.length !== docs.length) {
          throw new Error('Vertex predict response shape mismatch')
        }

        const vectors = predictions.map((item) => item?.embeddings?.values)

        if (vectors.some((v) => !Array.isArray(v) || v.length !== OUTPUT_DIM)) {
          throw new Error('Vertex returned invalid vector dimensions')
        }

        return vectors
      }

      const errorText = await response.text()
      const dailyQuotaReached =
        response.status === 429 && /PerDay|RequestsPerDay|per day/i.test(errorText)

      if (dailyQuotaReached) {
        console.warn('Daily Vertex embedding quota reached. Stopping this run safely.')
        return null
      }

      const retriable = response.status === 429 || response.status >= 500

      if (!retriable || attempt === MAX_RETRIES) {
        throw new Error(`Vertex predict failed (${response.status}): ${errorText}`)
      }

      const retryMatch = errorText.match(/retry in\s+([\d.]+)s/i)
      const retryHintMs = retryMatch ? Math.ceil(Number(retryMatch[1]) * 1000) : 0
      const waitMs = Math.max(retryHintMs, Math.min(1000 * 2 ** attempt, 12000))
      console.log(`Retrying Vertex batch in ${waitMs}ms (attempt ${attempt + 1})`)
      await sleep(waitMs)
      attempt += 1
    } catch (error) {
      const retriable =
        error?.name === 'TypeError' ||
        /fetch failed|ECONNRESET|ETIMEDOUT|socket|closed|network/i.test(String(error?.message || error))

      if (!retriable || attempt === MAX_RETRIES) {
        throw error
      }

      const waitMs = Math.min(1000 * 2 ** attempt, 12000)
      console.log(`Retrying Vertex batch after network error in ${waitMs}ms (attempt ${attempt + 1})`)
      await sleep(waitMs)
      attempt += 1
    }
  }

  throw new Error('Unexpected embedding retry state')
}

async function connectivityCheck() {
  const body = {
    instances: [
      {
        task_type: 'RETRIEVAL_QUERY',
        content: 'بدعة',
      },
    ],
    parameters: {
      outputDimensionality: OUTPUT_DIM,
      autoTruncate: true,
    },
  }

  const response = await fetch(VERTEX_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Connectivity check failed (${response.status}): ${await response.text()}`)
  }

  const payload = await response.json()
  const values = payload?.predictions?.[0]?.embeddings?.values
  if (!Array.isArray(values) || values.length !== OUTPUT_DIM) {
    throw new Error('Connectivity check returned invalid vector dimensions')
  }

  console.log(`Vertex embedding connectivity check OK (${values.length} dims)`)
}

function isRetriableUpsertError(message) {
  return /\b429\b|\b500\b|\b502\b|\b503\b|\b504\b|cloudflare|internal server error|timeout|temporar|connection|reset/i.test(
    message
  )
}

async function upsertChunkWithRetry(chunk, startIndex, endIndex) {
  let attempt = 0

  while (attempt <= UPSERT_MAX_RETRIES) {
    const { error } = await supabase
      .from('topic_embeddings')
      .upsert(chunk, { onConflict: 'topic_id' })

    if (!error) return

    const message = error?.message || String(error)
    const retriable = isRetriableUpsertError(message)

    if (!retriable) {
      throw new Error(`Upsert failed [${startIndex}-${endIndex}]: ${message}`)
    }

    if (attempt === UPSERT_MAX_RETRIES) break

    const waitMs = Math.min(1000 * 2 ** attempt, 15000)
    console.log(
      `Retrying upsert [${startIndex}-${endIndex}] in ${waitMs}ms (attempt ${attempt + 1})`
    )
    await sleep(waitMs)
    attempt += 1
  }

  if (chunk.length > 1) {
    const mid = Math.floor(chunk.length / 2)
    const left = chunk.slice(0, mid)
    const right = chunk.slice(mid)

    console.log(`Splitting upsert chunk [${startIndex}-${endIndex}] into ${left.length}+${right.length}`)
    await upsertChunkWithRetry(left, startIndex, startIndex + left.length - 1)
    await upsertChunkWithRetry(right, startIndex + left.length, endIndex)
    return
  }

  throw new Error(`Upsert failed after retries [${startIndex}-${endIndex}]`)
}

async function upsertEmbeddings(rows) {
  for (let i = 0; i < rows.length; i += UPSERT_BATCH) {
    const chunk = rows.slice(i, i + UPSERT_BATCH)
    await upsertChunkWithRetry(chunk, i, i + chunk.length - 1)
  }
}

async function main() {
  console.log(`Using GEMINI_API_KEY prefix: ${GEMINI_API_KEY.slice(0, 8)}...`)
  await connectivityCheck()

  console.log('Loading topics...')
  const topics = await fetchAllTopics()
  const byId = new Map(topics.map((t) => [t.id, t]))

  console.log('Loading existing embeddings metadata...')
  const existing = await fetchExistingEmbeddings()
  const existingByTopicId = new Map(existing.map((row) => [row.topic_id, row]))

  const prepared = topics.map((topic) => {
    const sourceText = buildSourceText(topic, byId)
    const contentHash = sha256(sourceText)
    const existingRow = existingByTopicId.get(topic.id)

    return {
      topic_id: topic.id,
      title: topic.title,
      source_text: sourceText,
      content_hash: contentHash,
      needsEmbedding:
        !existingRow ||
        existingRow.model !== MODEL ||
        existingRow.content_hash !== contentHash,
    }
  })

  const toEmbed = prepared.filter((row) => row.needsEmbedding)

  console.log('\n=== Topic Embedding Analysis ===')
  console.log(`Topics found: ${topics.length}`)
  console.log(`Existing embeddings: ${existing.length}`)
  console.log(`Need (re)embedding: ${toEmbed.length}`)

  if (toEmbed.length > 0) {
    console.table(toEmbed.slice(0, 20).map((row) => ({
      topic_id: row.topic_id,
      title: row.title,
      content_hash: row.content_hash.slice(0, 12),
    })))
  }

  if (!APPLY) {
    console.log('\nDry run only. No embeddings were generated.')
    console.log('Run with --apply to generate and upsert vectors into topic_embeddings.')
    return
  }

  if (toEmbed.length === 0) {
    console.log('\nAll topics are already up to date. Nothing to do.')
    return
  }

  console.log('\nGenerating embeddings and upserting...')

  let done = 0
  let quotaStopped = false

  for (let i = 0; i < toEmbed.length; i += EMBED_BATCH) {
    const batch = toEmbed.slice(i, i + EMBED_BATCH)
    const vectors = await embedBatch(batch)

    if (!vectors) {
      quotaStopped = true
      break
    }

    const rows = batch.map((item, idx) => ({
      topic_id: item.topic_id,
      embedding: toVectorLiteral(vectors[idx]),
      source_text: item.source_text,
      content_hash: item.content_hash,
      model: MODEL,
      updated_at: new Date().toISOString(),
    }))

    await upsertEmbeddings(rows)

    done += batch.length
    console.log(`Processed ${done}/${toEmbed.length} topics`)
  }

  const { count } = await supabase
    .from('topic_embeddings')
    .select('*', { count: 'exact', head: true })

  console.log('\n=== Completed ===')
  console.log(`Embeddings rows in DB: ${count || 0}`)

  if (quotaStopped) {
    console.log('Embedding paused due to daily Vertex quota limit.')
    console.log('Re-run the same command later to continue from where it stopped.')
  }
}

main().catch((error) => {
  console.error('\nEmbedding script failed:')
  console.error(error)
  process.exit(1)
})
