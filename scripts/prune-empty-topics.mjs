import { createClient } from '@supabase/supabase-js'
import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in environment')
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment')
}

const APPLY = process.argv.includes('--apply')
const BATCH_SIZE = 1000
const DELETE_CHUNK_SIZE = 500

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function fetchAllTopics() {
  const topics = []
  let from = 0

  while (true) {
    const to = from + BATCH_SIZE - 1
    const { data, error } = await supabase
      .from('topics')
      .select('id, parent_id, title')
      .order('id', { ascending: true })
      .range(from, to)

    if (error) {
      throw new Error(`Failed to fetch topics [${from}-${to}]: ${error.message}`)
    }

    if (!data || data.length === 0) break

    topics.push(...data)
    if (data.length < BATCH_SIZE) break

    from += BATCH_SIZE
  }

  return topics
}

async function fetchTopicIdsWithHadiths() {
  const topicIds = new Set()
  let from = 0

  while (true) {
    const to = from + BATCH_SIZE - 1
    const { data, error } = await supabase
      .from('hadith_topics')
      .select('topic_id')
      .order('topic_id', { ascending: true })
      .range(from, to)

    if (error) {
      throw new Error(`Failed to fetch hadith_topics [${from}-${to}]: ${error.message}`)
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      if (typeof row.topic_id === 'number') {
        topicIds.add(row.topic_id)
      }
    }

    if (data.length < BATCH_SIZE) break

    from += BATCH_SIZE
  }

  return topicIds
}

function analyzeTree(topics, topicsWithDirectHadiths) {
  const byId = new Map(topics.map((t) => [t.id, t]))
  const childCount = new Map()

  for (const topic of topics) {
    if (topic.parent_id == null) continue
    childCount.set(topic.parent_id, (childCount.get(topic.parent_id) || 0) + 1)
  }

  const leafWithoutDirectHadith = topics.filter(
    (t) => (childCount.get(t.id) || 0) === 0 && !topicsWithDirectHadiths.has(t.id)
  )

  // Keep every topic with direct hadiths and all of its ancestors.
  const keep = new Set(topicsWithDirectHadiths)

  for (const topicId of topicsWithDirectHadiths) {
    let parentId = byId.get(topicId)?.parent_id ?? null

    while (parentId != null && !keep.has(parentId)) {
      keep.add(parentId)
      parentId = byId.get(parentId)?.parent_id ?? null
    }
  }

  const prune = topics.filter((t) => !keep.has(t.id))

  return {
    byId,
    childCount,
    keep,
    prune,
    leafWithoutDirectHadith,
  }
}

async function deleteTopics(topicIds) {
  let deleted = 0

  for (let i = 0; i < topicIds.length; i += DELETE_CHUNK_SIZE) {
    const chunk = topicIds.slice(i, i + DELETE_CHUNK_SIZE)

    const { error } = await supabase.from('topics').delete().in('id', chunk)

    if (error) {
      throw new Error(`Failed deleting topics chunk ${i}-${i + chunk.length - 1}: ${error.message}`)
    }

    deleted += chunk.length
    console.log(`Deleted ${deleted}/${topicIds.length} topics...`)
  }
}

async function main() {
  console.log('Loading topics and topic->hadith mappings...')

  const [topics, topicsWithDirectHadiths] = await Promise.all([
    fetchAllTopics(),
    fetchTopicIdsWithHadiths(),
  ])

  const { prune, leafWithoutDirectHadith } = analyzeTree(topics, topicsWithDirectHadiths)

  console.log('\n=== Analysis ===')
  console.log(`Total topics: ${topics.length}`)
  console.log(`Topics with direct hadith links: ${topicsWithDirectHadiths.size}`)
  console.log(`Leaf topics without direct hadith links: ${leafWithoutDirectHadith.length}`)
  console.log(`Topics to prune (entire empty branches): ${prune.length}`)

  if (prune.length > 0) {
    console.log('\nSample topics to prune:')
    console.table(
      prune.slice(0, 20).map((t) => ({
        id: t.id,
        parent_id: t.parent_id,
        title: t.title,
      }))
    )
  }

  if (!APPLY) {
    console.log('\nDry run only. No changes made.')
    console.log('Run with --apply to delete empty branches from topics.')
    return
  }

  if (prune.length === 0) {
    console.log('\nNothing to prune. Exiting.')
    return
  }

  console.log('\nApplying prune...')
  await deleteTopics(prune.map((t) => t.id))

  console.log('Re-validating...')
  const [remainingTopics, remainingTopicIdsWithHadiths] = await Promise.all([
    fetchAllTopics(),
    fetchTopicIdsWithHadiths(),
  ])

  const { leafWithoutDirectHadith: remainingLeafWithoutDirectHadith, prune: stillPrunable } =
    analyzeTree(remainingTopics, remainingTopicIdsWithHadiths)

  console.log('\n=== After prune ===')
  console.log(`Remaining topics: ${remainingTopics.length}`)
  console.log(`Remaining leaf topics without direct hadith links: ${remainingLeafWithoutDirectHadith.length}`)
  console.log(`Still-prunable topics (should be 0): ${stillPrunable.length}`)
}

main().catch((err) => {
  console.error('\nScript failed:')
  console.error(err)
  process.exit(1)
})
