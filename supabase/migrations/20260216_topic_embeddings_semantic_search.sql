-- Add multilingual semantic topic search with pgvector

BEGIN;

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.topic_embeddings (
  topic_id INTEGER PRIMARY KEY REFERENCES public.topics(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL,
  source_text TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'gemini-embedding-001',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topic_embeddings_model ON public.topic_embeddings(model);

-- HNSW is recommended for semantic search on pgvector
CREATE INDEX IF NOT EXISTS idx_topic_embeddings_embedding_hnsw
ON public.topic_embeddings
USING hnsw (embedding vector_cosine_ops);

ALTER TABLE public.topic_embeddings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.match_topics_hybrid(
  query_embedding_text TEXT,
  query_text TEXT DEFAULT '',
  match_count INTEGER DEFAULT 20,
  match_offset INTEGER DEFAULT 0,
  semantic_weight REAL DEFAULT 0.85,
  fts_weight REAL DEFAULT 0.15
)
RETURNS TABLE (
  topic_id INTEGER,
  title TEXT,
  level INTEGER,
  parent_id INTEGER,
  semantic_score REAL,
  fts_score REAL,
  hybrid_score REAL,
  total_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH params AS (
  SELECT
    query_embedding_text::vector(1536) AS query_embedding,
    NULLIF(TRIM(query_text), '') AS qtext,
    GREATEST(match_count, 1) AS k,
    GREATEST(match_offset, 0) AS o,
    GREATEST(LEAST(semantic_weight, 1), 0)::REAL AS w_sem,
    GREATEST(LEAST(fts_weight, 1), 0)::REAL AS w_fts
),
semantic AS (
  SELECT
    t.id AS topic_id,
    t.title,
    t.level,
    t.parent_id,
    (1 - (te.embedding <=> p.query_embedding))::REAL AS semantic_score
  FROM params p
  JOIN public.topic_embeddings te ON te.model = 'gemini-embedding-001'
  JOIN public.topics t ON t.id = te.topic_id
  ORDER BY te.embedding <=> p.query_embedding
  LIMIT (SELECT LEAST(500, GREATEST(k * 8, 80)) FROM params)
),
fts AS (
  SELECT
    t.id AS topic_id,
    ts_rank_cd(
      setweight(to_tsvector('arabic', COALESCE(t.title, '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE(t.title, '')), 'B'),
      websearch_to_tsquery('simple', p.qtext)
    )::REAL AS fts_score
  FROM params p
  JOIN public.topics t ON p.qtext IS NOT NULL
  WHERE p.qtext IS NOT NULL
    AND (
      setweight(to_tsvector('arabic', COALESCE(t.title, '')), 'A') ||
      setweight(to_tsvector('simple', COALESCE(t.title, '')), 'B')
    ) @@ websearch_to_tsquery('simple', p.qtext)
  ORDER BY fts_score DESC
  LIMIT (SELECT LEAST(500, GREATEST(k * 8, 80)) FROM params)
),
combined AS (
  SELECT
    COALESCE(s.topic_id, f.topic_id) AS topic_id,
    COALESCE(s.title, t.title) AS title,
    COALESCE(s.level, t.level) AS level,
    COALESCE(s.parent_id, t.parent_id) AS parent_id,
    COALESCE(s.semantic_score, 0)::REAL AS semantic_score,
    COALESCE(f.fts_score, 0)::REAL AS fts_score
  FROM semantic s
  FULL OUTER JOIN fts f ON f.topic_id = s.topic_id
  LEFT JOIN public.topics t ON t.id = f.topic_id
),
ranked AS (
  SELECT
    c.topic_id,
    c.title,
    c.level,
    c.parent_id,
    c.semantic_score,
    c.fts_score,
    (
      CASE
        WHEN p.qtext IS NULL THEN c.semantic_score
        WHEN (p.w_sem + p.w_fts) = 0 THEN c.semantic_score
        ELSE ((c.semantic_score * p.w_sem) + (c.fts_score * p.w_fts)) / (p.w_sem + p.w_fts)
      END
    )::REAL AS hybrid_score
  FROM combined c
  CROSS JOIN params p
)
SELECT
  r.topic_id,
  r.title,
  r.level,
  r.parent_id,
  r.semantic_score,
  r.fts_score,
  r.hybrid_score,
  COUNT(*) OVER() AS total_count
FROM ranked r
ORDER BY r.hybrid_score DESC
OFFSET (SELECT o FROM params)
LIMIT (SELECT k FROM params);
$$;

GRANT EXECUTE ON FUNCTION public.match_topics_hybrid(TEXT, TEXT, INTEGER, INTEGER, REAL, REAL) TO anon, authenticated;

COMMIT;
