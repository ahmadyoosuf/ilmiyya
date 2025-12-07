# Migration Instructions: Add TOC Column

## The Problem
The `toc` column doesn't exist in the `books` table yet, so the app is falling back to showing page numbers instead of the actual Table of Contents.

## Solution

You need to apply the migration I created. Here are **3 ways** to do it:

### Option 1: Supabase SQL Editor (EASIEST)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ycmylngpaxkuksbgapfl
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste this SQL:

```sql
-- Add toc column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS toc JSONB;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_books_toc ON books USING gin(toc);

-- Add comment
COMMENT ON COLUMN books.toc IS 'Book-specific table of contents from JSON "toc" array with structure: [{"tit": "title", "lvl": level, "sub": 0, "id": hadith_id}]';
```

5. Click "Run" or press `Ctrl+Enter`
6. You should see "Success. No rows returned"

### Option 2: Using Supabase CLI with proper config
If you have the project linked properly:

```bash
cd C:\Users\Abdul\Downloads\ilmiyya
npx supabase migration up
```

### Option 3: psql command line
If you have PostgreSQL client tools installed:

```bash
psql "postgresql://postgres.[YOUR-PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require" -f migrations/005_add_book_toc.sql
```

## After Migration: Populate TOC Data

Once the column exists, you need to UPDATE each book row to populate the `toc` column with data from the original JSON files.

The seeding script should do something like:

```javascript
// When inserting/updating a book:
const bookJson = JSON.parse(fs.readFileSync('path/to/book.json'))

await supabase
  .from('books')
  .upsert({
    id: bookId,
    title: bookJson.book[0].someTitle,
    // ... other fields
    toc: bookJson.toc  // ← Add this!
  })
```

## Verify It Worked

Run this to check:
```bash
node check-toc.js
```

You should see books with TOC data populated.







