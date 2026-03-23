-- Create visitors analytics table
CREATE TABLE IF NOT EXISTS visitors (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  country_code TEXT,
  country_name TEXT,
  city TEXT,
  user_agent TEXT,
  page_path TEXT,
  referrer TEXT,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_visitors_timestamp ON visitors(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_country ON visitors(country_code);
CREATE INDEX IF NOT EXISTS idx_visitors_page ON visitors(page_path);
CREATE INDEX IF NOT EXISTS idx_visitors_session ON visitors(session_id);

-- Create daily aggregation view
CREATE OR REPLACE VIEW visitor_daily_stats AS
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) as total_visits,
  COUNT(DISTINCT country_code) as countries,
  COUNT(DISTINCT CAST(timestamp::DATE AS TEXT) || ip_address) as unique_ips
FROM visitors
GROUP BY DATE(timestamp)
ORDER BY DATE(timestamp) DESC;

-- Create country breakdown view
CREATE OR REPLACE VIEW visitor_country_stats AS
SELECT 
  country_code,
  country_name,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) as total_visits,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM visitors), 2) as percentage
FROM visitors
WHERE country_code IS NOT NULL
GROUP BY country_code, country_name
ORDER BY total_visits DESC;

-- Create page breakdown view
CREATE OR REPLACE VIEW visitor_page_stats AS
SELECT 
  page_path,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) as total_visits,
  COUNT(DISTINCT referrer) as referrer_count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM visitors), 2) as percentage
FROM visitors
GROUP BY page_path
ORDER BY total_visits DESC;
