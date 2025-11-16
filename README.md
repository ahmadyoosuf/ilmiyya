# المكتبة العلمية - Ilmiyya Digital Library

A premium Arabic Islamic digital library app with full-text search, hierarchical topic browsing, and an elegant book reader interface.

## Features

### 🎨 4 Premium Themes
- **Sepia (رق البردي)** - Default warm parchment theme for comfortable reading
- **Light (مضيء)** - Crisp white theme with cool undertones
- **Midnight (منتصف الليل)** - Blue-dark theme optimized for night reading
- **Forest (غابة)** - Green-dark theme with natural, calming tones

All themes transition smoothly (0.3s) and persist via localStorage.

### 📖 Book Reader
- Split-view layout with TOC sidebar (right side on desktop)
- Navigate by Parts (أجزاء) and Pages (صفحات)
- Paginated content with smooth prev/next navigation
- Mobile: Drawer-based TOC accessible via button
- Desktop: Persistent sidebar with tree navigation

### 🗂️ Topics Browser
- Hierarchical tree structure with expandable/collapsible nodes (7,000+ topics)
- All 5 root categories loaded: العقيدة, الآداب الشرعية, السير والمناقب, التفسير, الفقه
- **Navigation flow**: 
  - Non-leaf nodes: expand/collapse to show children
  - Leaf nodes: click redirects to dedicated page with hadiths
- **Breadcrumb navigation**: Full parent chain shown at top (الرئيسية > category > subcategory > ...)
- **Mobile (<768px)**: Native vertical list tree navigation
- **Desktop (≥768px)**: Split-view with persistent sidebar + empty state
- Progressive loading: root topics load instantly (<1s), children load on-demand
- Background batch loading for remaining topics (non-blocking)

### 🔍 Full-Text Search
- Search across hadiths, books, and topics
- Arabic-optimized FTS using PostgreSQL `websearch`
- Filter by content type (All/Hadiths/Books/Topics)
- Instant results with pagination

### 📱 Responsive Design
- **Mobile (<768px)**: 
  - Fixed bottom tab navigation (Home, Books, Topics, Search)
  - Topics: Native vertical list (tree + content inline, no sidebar)
  - Book Reader: Drawer-based TOC
  - Card-based tree nodes with proper spacing and borders
- **Desktop (≥768px)**: 
  - Persistent header with theme switcher
  - Topics: Split-view sidebar + content
  - Book Reader: Persistent sidebar on right
- RTL layout throughout (`dir="rtl"`)
- Safe area inset support for mobile browsers

## Typography

- **Amiri** (serif) - Arabic content with line-height 1.8 for optimal readability
- **Tajawal** (sans-serif) - UI elements and navigation

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** - PostgreSQL database with real-time subscriptions
- **TypeScript** - Type-safe queries with generated types
- **Tailwind CSS v4** - Utility-first styling with custom themes
- **Radix UI** - Accessible primitives (Sheet, Dialog, Dropdown, etc.)
- **Lucide React** - Beautiful icons

## Database Schema

### Tables
- `categories` - Book categories (أقسام الكتب)
- `books` - Book metadata with category relationships
- `hadiths` - Core hadith content with FTS indexes
- `topics` - Hierarchical topic structure (self-referencing)
- `hadith_topics` - Many-to-many pivot table

### Indexes
- Full-text search indexes on `books.title`, `hadiths.nass`, `topics.title` (Arabic config)
- B-tree indexes on foreign keys and commonly filtered columns

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Environment variables are already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://ycmylngpaxkuksbgapfl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx              # Landing hero with 3 CTAs
├── layout.tsx            # RTL root layout with fonts
├── globals.css           # Theme system with 4 data-theme variants
├── books/
│   ├── page.tsx         # Books grid with category filter
│   └── [id]/page.tsx    # Book reader with TOC sidebar
├── topics/
│   ├── page.tsx         # Hierarchical topics tree (navigation only)
│   └── [id]/page.tsx    # Topic detail page with breadcrumb + hadiths
└── search/page.tsx      # Full-text search across all content

components/
├── Header.tsx           # Desktop header with nav links
├── BottomNav.tsx        # Mobile bottom tab navigation
├── ThemeSwitcher.tsx    # 4-option theme dropdown
├── BookCard.tsx         # Reusable book card component
├── Tree.tsx             # Expandable/collapsible tree with selection
├── Pagination.tsx       # Pagination controls with RTL support
└── ui/                  # Radix UI primitives (shadcn/ui style)

lib/
└── supabase/
    ├── client.ts        # Browser client singleton
    ├── server.ts        # Server client with cookie support
    └── types.ts         # Generated TypeScript types
```

## Design Principles

- **RTL-First**: All layouts and interactions optimized for Arabic
- **Generous Spacing**: 0.75rem border radius, ample padding/gaps
- **Card-Based Layouts**: Subtle hover states, smooth transitions
- **Accessibility**: Semantic HTML, keyboard navigation, WCAG AAA contrast
- **Performance**: Paginated queries, lazy loading, optimized FTS

## Data Fetching Patterns

All queries use the Supabase browser client with type-safe operations:

```typescript
// Books with category join
const { data } = await supabase
  .from('books')
  .select('*, categories(name_ar)')
  .order('title')
  .range(from, to)

// Full-text search on hadiths
const { data } = await supabase
  .from('hadiths')
  .select('*, books(title)')
  .textSearch('nass', query, { config: 'arabic', type: 'websearch' })
  .range(from, to)

// Hierarchical topics - batch loading for large datasets
// Supabase has a default 1000-row limit per query
let allTopics = []
let from = 0
const batchSize = 1000

while (true) {
  const { data } = await supabase
    .from('topics')
    .select('*')
    .order('id')
    .range(from, from + batchSize - 1)
  
  if (!data || data.length === 0) break
  allTopics = [...allTopics, ...data]
  if (data.length < batchSize) break
  from += batchSize
}
```

### Handling Supabase Limits
- **Default row limit**: 1,000 rows per query
- **Solution**: Use `.range(from, to)` with batch loading for large datasets
- **Pro subscription**: No additional configuration needed, limits are already optimal for this app

## License

MIT

