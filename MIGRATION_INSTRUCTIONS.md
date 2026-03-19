# Database Migration Instructions

## Add IP Tracking to Visits Table

To enable IP-based visitor tracking (preventing duplicate counts on page refresh), you need to run the migration:

### Option 1: Using Supabase CLI (Recommended)

```bash
npx supabase migration up
```

### Option 2: Manual SQL Execution

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/add_ip_tracking_to_visits.sql`
4. Click "Run" to execute the migration

### What This Does

- Adds `ip_address` column to track visitor IPs
- Adds `user_agent` column for additional context
- Creates an index for faster lookups
- Visitor count now tracks unique IPs within 24-hour windows (not every page refresh)

### After Migration

After running the migration, the visitor count will:
- Only increment for new unique visitors
- Not count the same IP address more than once per 24 hours
- Provide more accurate visitor statistics
