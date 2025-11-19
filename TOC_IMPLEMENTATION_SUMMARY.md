# TOC Implementation Summary

## Problem Identified
The book reader was showing meaningless page numbers ("صفحة 7", "صفحة 8", etc.) in the sidebar instead of the actual book Table of Contents (TOC) like "(35) باب ما يرجى من رحمة الله يوم القيامة", etc.

## Root Cause
1. The `books` table in the database only had basic fields (id, title, file_path, category_id)
2. **The `toc` column did NOT exist** to store the book-specific TOC from JSON files
3. The app was incorrectly trying to build TOC from the global `topics` table (which is separate)
4. The fallback was building a simple Part/Page list from hadiths table

## Solution Implemented

### 1. Database Schema (✅ Code Ready, ⏳ User Must Apply)
- Created migration `migrations/005_add_book_toc.sql`
- Adds `toc` JSONB column to `books` table
- Adds GIN index for performance
- Structure: `[{tit: "chapter title", lvl: 2, sub: 0, id: 5894}, ...]`

### 2. TypeScript Types (✅ Complete)
- Updated `lib/supabase/types.ts`
- Added `toc: Json | null` to Books table Row/Insert/Update types

### 3. Book Reader Logic (✅ Complete)
File: `app/books/[id]/page.tsx`

**New Interface:**
```typescript
interface BookTOCEntry {
  tit: string  // title
  lvl: number  // level (1, 2, 3, etc.)
  sub: number  // sub-level
  id: number   // hadith id this section starts at
}
```

**New Function: `buildBookTOC()`**
- Takes TOC array from database
- Builds hierarchical tree based on `lvl` field
- Finds parent by looking backwards for nearest lower level
- Each node stores the `hadithId` it starts at

**Updated Function: `handleTOCSelect()`**
- When TOC node clicked → jumps to hadith using `jumpToHadith(hadithId)`
- Clears any part/page/topic filters
- Sets correct page number based on hadith position

**Data Flow:**
1. Load book → check if `book.toc` exists
2. If yes → `buildBookTOC()` → displays hierarchical TOC tree
3. If no → fallback to Part/Page list
4. Click TOC entry → jump to starting hadith → continue reading sequentially

### 4. Scripts (✅ Complete)
- `scripts/check-toc-data.mjs` - Verify TOC column and data
- `MIGRATION_INSTRUCTIONS.md` - Step-by-step guide

## What You Need to Do

### Step 1: Apply Migration ⚠️ REQUIRED
Open Supabase SQL Editor and run:

```sql
ALTER TABLE books ADD COLUMN IF NOT EXISTS toc JSONB;
CREATE INDEX IF NOT EXISTS idx_books_toc ON books USING gin(toc);
COMMENT ON COLUMN books.toc IS 'Book-specific table of contents from JSON "toc" array';
```

### Step 2: Populate TOC Data ⚠️ REQUIRED
Update your seeding script to include the `toc` field:

```javascript
// Example seeding code
const bookJson = JSON.parse(fs.readFileSync('path/to/book.json'))

await supabase
  .from('books')
  .upsert({
    id: bookId,
    title: bookTitle,
    category_id: categoryId,
    file_path: filePath,
    toc: bookJson.toc  // ← ADD THIS LINE!
  })
```

Then re-seed all books.

### Step 3: Verify
Run the check script:
```bash
node scripts/check-toc-data.mjs
```

You should see:
- ✅ TOC column exists
- ✅ All books have TOC data
- Sample TOC entries displayed

## Expected Result
After completing the steps, the book reader sidebar will show:
- ✅ Hierarchical book structure (chapters, sections, subsections)
- ✅ Arabic titles from the book JSON (e.g., "باب البغي")
- ✅ Clicking any entry jumps to that exact hadith
- ✅ Smooth navigation through the book

❌ NO MORE meaningless "صفحة 7", "صفحة 8" lists!

## Key Design Decisions

1. **Book TOC ≠ Global Topics**: Book-specific TOC is stored in `books.toc`, separate from the global hierarchical topics tree
2. **Jump, Don't Filter**: Clicking TOC entry jumps to starting hadith but allows continuous reading (doesn't filter to only that section)
3. **Level-based Hierarchy**: Parent-child relationships inferred from `lvl` field (lower lvl = parent)
4. **Graceful Fallback**: If `toc` is null, falls back to Part/Page list

## Files Modified
- ✅ `migrations/005_add_book_toc.sql` (NEW)
- ✅ `lib/supabase/types.ts` (UPDATED)
- ✅ `app/books/[id]/page.tsx` (UPDATED)
- ✅ `scripts/check-toc-data.mjs` (NEW)
- ✅ `MIGRATION_INSTRUCTIONS.md` (NEW)
- ✅ `TOC_IMPLEMENTATION_SUMMARY.md` (NEW)

## Testing Checklist
- [ ] Migration applied successfully
- [ ] Books table has `toc` column
- [ ] All books populated with TOC data
- [ ] Book reader displays TOC tree
- [ ] Clicking TOC entry jumps to correct hadith
- [ ] No console errors
- [ ] Mobile sidebar also shows TOC correctly

