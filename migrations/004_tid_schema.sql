-- Migration: Add global_tid to hadiths and pivot on global_tid
-- Rationale: 'tid' is a global, corpus-wide identifier per hadith row/page.
-- We store it as hadiths.global_tid and pivot topics via this key.

BEGIN;

-- 1) Add global_tid column (unique) to hadiths
ALTER TABLE hadiths
ADD COLUMN IF NOT EXISTS global_tid BIGINT;

-- Enforce uniqueness when populated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uq_hadiths_global_tid'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uq_hadiths_global_tid ON hadiths(global_tid)';
  END IF;
END $$;

-- 2) Recreate hadith_topics to reference hadiths.global_tid (not (book_id,id))
DROP TABLE IF EXISTS hadith_topics;

CREATE TABLE hadith_topics (
  global_tid BIGINT NOT NULL REFERENCES hadiths(global_tid) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (global_tid, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_hadith_topics_topic_id ON hadith_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_hadith_topics_global_tid ON hadith_topics(global_tid);

COMMIT;


