-- Add IP address and user agent columns to visits table for better tracking
ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Create index on ip_address and created_at for faster lookups
CREATE INDEX IF NOT EXISTS idx_visits_ip_created 
ON visits(ip_address, created_at DESC);

-- Add comment to table
COMMENT ON COLUMN visits.ip_address IS 'Visitor IP address for unique visit tracking';
COMMENT ON COLUMN visits.user_agent IS 'Visitor user agent for additional context';
