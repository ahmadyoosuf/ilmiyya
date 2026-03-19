import json
import os
import time
import hashlib
import urllib.parse
import urllib.request
import urllib.error
from datetime import datetime, timezone

MODEL = "gemini-embedding-001"
OUTPUT_DIM = 1536
TOPIC_BATCH = int(os.getenv("TOPIC_BATCH", "500"))
EMBED_BATCH = int(os.getenv("TOPICS_EMBED_BATCH_SIZE", "64"))
UPSERT_BATCH = int(os.getenv("TOPICS_UPSERT_BATCH_SIZE", "200"))
MIN_REQUEST_INTERVAL_MS = int(os.getenv("TOPICS_EMBED_MIN_INTERVAL_MS", "800"))
MAX_RETRIES = int(os.getenv("TOPICS_EMBED_MAX_RETRIES", "4"))
APPLY = "--apply" in os.sys.argv


def load_env_file(path: str) -> None:
    if not os.path.exists(path):
        return

    with open(path, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key:
                os.environ[key] = value


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def to_vector_literal(values):
    return "[" + ",".join(str(v) for v in values) + "]"


def parse_predict_vector(payload):
    predictions = payload.get("predictions", []) if isinstance(payload, dict) else []
    if not predictions:
        raise RuntimeError("Vertex embedding response missing predictions")

    emb = predictions[0].get("embeddings", {}) if isinstance(predictions[0], dict) else {}
    values = emb.get("values", []) if isinstance(emb, dict) else []

    if not isinstance(values, list) or len(values) != OUTPUT_DIM:
        raise RuntimeError("Vertex embedding response has invalid vector dimensions")

    return values


def vertex_predict_embedding(api_key: str, text: str, task_type: str, title: str | None = None):
    endpoint = (
        f"https://aiplatform.googleapis.com/v1/publishers/google/models/{MODEL}:predict"
        f"?key={urllib.parse.quote(api_key, safe='')}"
    )

    instance = {
        "task_type": task_type,
        "content": text,
    }
    if title and task_type == "RETRIEVAL_DOCUMENT":
        instance["title"] = title

    body = {
        "instances": [instance],
        "parameters": {
            "outputDimensionality": OUTPUT_DIM,
            "autoTruncate": True,
        },
    }

    req = urllib.request.Request(
        url=endpoint,
        method="POST",
        headers={"Content-Type": "application/json"},
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            payload = json.loads(raw) if raw else {}
            return parse_predict_vector(payload)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Vertex predict failed ({exc.code}): {detail}")


class SupabaseRest:
    def __init__(self, url: str, service_key: str):
        self.base = url.rstrip("/") + "/rest/v1"
        self.headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, path: str, params=None, body=None, extra_headers=None):
        query = ""
        if params:
            query = "?" + urllib.parse.urlencode(params, doseq=True)

        headers = dict(self.headers)
        if extra_headers:
            headers.update(extra_headers)

        data = None
        if body is not None:
            data = json.dumps(body, ensure_ascii=False).encode("utf-8")

        req = urllib.request.Request(
            url=f"{self.base}/{path}{query}",
            method=method,
            headers=headers,
            data=data,
        )

        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            if not raw:
                return None
            return json.loads(raw)

    def fetch_topics(self):
        rows = []
        offset = 0

        while True:
            params = {
                "select": "id,parent_id,title,level",
                "order": "id.asc",
                "limit": TOPIC_BATCH,
                "offset": offset,
            }
            data = self._request("GET", "topics", params=params)
            if not data:
                break
            rows.extend(data)
            if len(data) < TOPIC_BATCH:
                break
            offset += TOPIC_BATCH

        return rows

    def fetch_existing_embeddings(self):
        rows = []
        offset = 0

        while True:
            params = {
                "select": "topic_id,content_hash,model",
                "order": "topic_id.asc",
                "limit": TOPIC_BATCH,
                "offset": offset,
            }
            data = self._request("GET", "topic_embeddings", params=params)
            if not data:
                break
            rows.extend(data)
            if len(data) < TOPIC_BATCH:
                break
            offset += TOPIC_BATCH

        return rows

    def upsert_embeddings(self, rows):
        for i in range(0, len(rows), UPSERT_BATCH):
            chunk = rows[i : i + UPSERT_BATCH]
            self._request(
                "POST",
                "topic_embeddings",
                params={"on_conflict": "topic_id"},
                body=chunk,
                extra_headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
            )

    def count_embeddings(self):
        params = {"select": "topic_id", "limit": 1}
        req = urllib.request.Request(
            url=f"{self.base}/topic_embeddings?{urllib.parse.urlencode(params)}",
            method="GET",
            headers={
                **self.headers,
                "Prefer": "count=exact",
            },
        )

        with urllib.request.urlopen(req) as resp:
            count = resp.headers.get("Content-Range", "*/0").split("/")[-1]
            return int(count or 0)


def build_hierarchy_path(topic, by_id):
    visited = set()
    parts = []
    current = topic

    while current:
        topic_id = current.get("id")
        if topic_id in visited:
            break
        visited.add(topic_id)

        parts.insert(0, current.get("title", ""))
        parent_id = current.get("parent_id")
        if parent_id is None:
            break
        current = by_id.get(parent_id)

    return " > ".join(parts)


def build_source_text(topic, by_id):
    path = build_hierarchy_path(topic, by_id)
    return "\n".join(
        [
            f"Arabic topic title: {topic.get('title', '')}",
            f"Topic hierarchy: {path}",
            f"Topic level: {topic.get('level')}",
            "Domain: Islamic hadith and fiqh taxonomy.",
            "Search intent: multilingual semantic retrieval including Arabic, English, and transliterated Islamic terms.",
        ]
    )


def main():
    load_env_file(".env.local")

    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    gemini_api_key = os.getenv("GEMINI_API_KEY")

    if not supabase_url:
        raise RuntimeError("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL")
    if not service_key:
        raise RuntimeError("Missing SUPABASE_SERVICE_ROLE_KEY")
    if not gemini_api_key:
        raise RuntimeError("Missing GEMINI_API_KEY")

    print(f"Using GEMINI_API_KEY prefix: {gemini_api_key[:8]}...")

    # Quick connectivity check to fail fast with actionable context
    test_vector = vertex_predict_embedding(
        api_key=gemini_api_key,
        text="بدعة",
        task_type="RETRIEVAL_QUERY",
    )
    print(f"Vertex embedding connectivity check OK ({len(test_vector)} dims)")

    print("Loading topics...")
    db = SupabaseRest(supabase_url, service_key)
    topics = db.fetch_topics()
    by_id = {t["id"]: t for t in topics}

    print("Loading existing embeddings metadata...")
    existing = db.fetch_existing_embeddings()
    existing_by_topic_id = {r["topic_id"]: r for r in existing}

    prepared = []
    for topic in topics:
        source_text = build_source_text(topic, by_id)
        content_hash = sha256_text(source_text)
        existing_row = existing_by_topic_id.get(topic["id"])
        needs_embedding = (
            not existing_row
            or existing_row.get("model") != MODEL
            or existing_row.get("content_hash") != content_hash
        )
        prepared.append(
            {
                "topic_id": topic["id"],
                "title": topic.get("title", ""),
                "source_text": source_text,
                "content_hash": content_hash,
                "needs_embedding": needs_embedding,
            }
        )

    to_embed = [p for p in prepared if p["needs_embedding"]]

    print("\n=== Topic Embedding Analysis ===")
    print(f"Topics found: {len(topics)}")
    print(f"Existing embeddings: {len(existing)}")
    print(f"Need (re)embedding: {len(to_embed)}")

    if not APPLY:
        print("\nDry run only. No embeddings were generated.")
        print("Run with --apply to generate and upsert vectors into topic_embeddings.")
        return

    if len(to_embed) == 0:
        print("\nAll topics are already up to date. Nothing to do.")
        return

    done = 0
    quota_stopped = False
    last_request_at = 0.0

    print("\nGenerating embeddings and upserting...")

    for i in range(0, len(to_embed), EMBED_BATCH):
        batch = to_embed[i : i + EMBED_BATCH]
        vectors = []

        for item in batch:
            attempt = 0
            vector = None

            while attempt <= MAX_RETRIES:
                elapsed_ms = int((time.time() - last_request_at) * 1000)
                if elapsed_ms < MIN_REQUEST_INTERVAL_MS:
                    time.sleep((MIN_REQUEST_INTERVAL_MS - elapsed_ms) / 1000)

                try:
                    vector = vertex_predict_embedding(
                        api_key=gemini_api_key,
                        text=item["source_text"],
                        task_type="RETRIEVAL_DOCUMENT",
                        title=item["title"],
                    )
                    last_request_at = time.time()
                    break
                except Exception as exc:
                    last_request_at = time.time()
                    msg = str(exc)

                    daily_quota = "PerDay" in msg or "RequestsPerDay" in msg or "per day" in msg
                    if daily_quota:
                        print("Daily embedding quota reached. Stopping this run safely.")
                        quota_stopped = True
                        break

                    retriable = "429" in msg or "RESOURCE_EXHAUSTED" in msg or "500" in msg
                    if (not retriable) or attempt == MAX_RETRIES:
                        raise

                    wait_s = min(2 ** attempt, 12)
                    print(f"Retrying Vertex predict in {wait_s}s (attempt {attempt + 1})")
                    time.sleep(wait_s)
                    attempt += 1

            if quota_stopped:
                break

            if vector is None:
                raise RuntimeError("Embedding item failed unexpectedly")

            vectors.append(vector)

        if quota_stopped:
            break

        if vectors is None:
            raise RuntimeError("Embedding batch failed unexpectedly")

        upserts = []
        for j, item in enumerate(batch):
            upserts.append(
                {
                    "topic_id": item["topic_id"],
                    "embedding": to_vector_literal(vectors[j]),
                    "source_text": item["source_text"],
                    "content_hash": item["content_hash"],
                    "model": MODEL,
                    "updated_at": now_iso(),
                }
            )

        db.upsert_embeddings(upserts)
        done += len(batch)
        print(f"Processed {done}/{len(to_embed)} topics")

    total = db.count_embeddings()
    print("\n=== Completed ===")
    print(f"Embeddings rows in DB: {total}")
    if quota_stopped:
        print("Embedding paused due to daily quota; rerun same command to resume.")


if __name__ == "__main__":
    main()
