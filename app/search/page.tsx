'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { Pagination } from '@/components/Pagination'
import { BookCard } from '@/components/BookCard'
import { Search as SearchIcon, BookOpen, List, FileText } from 'lucide-react'
import Link from 'next/link'

type Book = Database['public']['Tables']['books']['Row'] & {
  categories: { name_ar: string } | null
}
type Topic = Database['public']['Tables']['topics']['Row']
type Hadith = Database['public']['Tables']['hadiths']['Row'] & {
  books: { title: string } | null
}

type SearchType = 'all' | 'hadiths' | 'books' | 'topics'

const ITEMS_PER_PAGE = 10

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('all')
  const [hadiths, setHadiths] = useState<Hadith[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const supabase = getSupabaseBrowserClient()

  // Load search state from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    const urlType = searchParams.get('type') as SearchType
    const urlPage = searchParams.get('sp')

    if (urlQuery) {
      setQuery(urlQuery)
      setHasSearched(true)
      if (urlType && ['all', 'hadiths', 'books', 'topics'].includes(urlType)) {
        setSearchType(urlType)
      }
      if (urlPage) {
        setCurrentPage(parseInt(urlPage))
      }
    }
  }, [])

  // Perform search when URL params are loaded
  useEffect(() => {
    if (hasSearched && query.trim()) {
      performSearch()
    }
  }, [hasSearched])

  useEffect(() => {
    if (query.trim()) {
      performSearch()
    }
  }, [currentPage, searchType])

  async function performSearch() {
    if (!query.trim()) {
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    if (searchType === 'all' || searchType === 'hadiths') {
      const { data: hadithsData, count } = await supabase
        .from('hadiths')
        .select('id, global_tid, nass, book_id, books(title)', { count: 'exact' })
        .textSearch('nass', query, { config: 'arabic', type: 'websearch' })
        .range(from, to)
      
      if (hadithsData) {
        setHadiths(hadithsData as unknown as Hadith[])
        if (searchType === 'hadiths') {
          setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
        }
      }
    }

    if (searchType === 'all' || searchType === 'books') {
      const { data: booksData, count } = await supabase
        .from('books')
        .select('*, categories(name_ar)', { count: 'exact' })
        .textSearch('title', query, { config: 'arabic', type: 'websearch' })
        .range(from, to)
      
      if (booksData) {
        setBooks(booksData)
        if (searchType === 'books') {
          setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
        }
      }
    }

    if (searchType === 'all' || searchType === 'topics') {
      const { data: topicsData, count } = await supabase
        .from('topics')
        .select('*', { count: 'exact' })
        .textSearch('title', query, { config: 'arabic', type: 'websearch' })
        .range(from, to)
      
      if (topicsData) {
        setTopics(topicsData)
        if (searchType === 'topics') {
          setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
        }
      }
    }

    setIsLoading(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setCurrentPage(1)
    
    // Update URL with search params
    const params = new URLSearchParams()
    params.set('q', query)
    params.set('type', searchType)
    params.set('sp', '1')
    router.push(`/search?${params.toString()}`, { scroll: false })
    
    performSearch()
  }

  function handleTypeChange(type: SearchType) {
    setSearchType(type)
    setCurrentPage(1)
    
    // Update URL
    const params = new URLSearchParams()
    params.set('q', query)
    params.set('type', type)
    params.set('sp', '1')
    router.push(`/search?${params.toString()}`, { scroll: false })
    
    if (hasSearched) {
      performSearch()
    }
  }

  function handlePageChange(page: number) {
    setCurrentPage(page)
    
    // Update URL
    const params = new URLSearchParams()
    params.set('q', query)
    params.set('type', searchType)
    params.set('sp', page.toString())
    router.push(`/search?${params.toString()}`, { scroll: false })
  }

  const totalResults = hadiths.length + books.length + topics.length

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8 animate-entrance">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">البحث</h1>
          <p className="text-lg text-muted-foreground font-arabic-sans">
            ابحث في محتوى الكتب والأحاديث والمواضيع
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث هنا..."
                className="w-full pr-10 pl-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent font-arabic-sans"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:scale-105 transition-transform font-arabic-sans font-bold"
            >
              بحث
            </button>
          </div>

          {/* Search Type Filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'الكل', icon: FileText },
              { value: 'hadiths', label: 'الأحاديث', icon: FileText },
              { value: 'books', label: 'الكتب', icon: BookOpen },
              { value: 'topics', label: 'المواضيع', icon: List },
            ].map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value as SearchType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-arabic-sans transition-all ${
                    searchType === type.value
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-card hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              )
            })}
          </div>
        </form>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse bg-muted h-24" />
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-arabic-sans text-lg">
              أدخل كلمة أو عبارة للبحث
            </p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-arabic-sans text-lg">
              لم يتم العثور على نتائج
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hadiths Results */}
            {(searchType === 'all' || searchType === 'hadiths') && hadiths.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-arabic-sans flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  الأحاديث ({hadiths.length})
                </h2>
                <div className="space-y-4">
                  {hadiths.map((hadith) => {
                    // Create link to book viewer with this specific hadith and back navigation
                    let bookLink = hadith.global_tid
                      ? `/books/${hadith.book_id}?tid=${hadith.global_tid}&from=search&q=${encodeURIComponent(query)}&type=${searchType}&sp=${currentPage}`
                      : `/books/${hadith.book_id}?from=search&q=${encodeURIComponent(query)}&type=${searchType}&sp=${currentPage}`
                    
                    return (
                      <Link
                        key={hadith.id}
                        href={bookLink}
                        className="card p-6 space-y-3 block hover:bg-muted hover:shadow-lg transition-all cursor-pointer group"
                      >
                        <div className="flex gap-4 text-sm text-muted-foreground font-arabic-sans">
                          {hadith.books && (
                            <span className="font-bold group-hover:text-accent transition-colors">
                              الكتاب: {hadith.books.title}
                            </span>
                          )}
                        </div>
                        <p className="text-lg leading-loose line-clamp-3">{hadith.nass}</p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Books Results */}
            {(searchType === 'all' || searchType === 'books') && books.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-arabic-sans flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  الكتب ({books.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      categoryName={book.categories?.name_ar}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Topics Results */}
            {(searchType === 'all' || searchType === 'topics') && topics.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-arabic-sans flex items-center gap-2">
                  <List className="w-6 h-6" />
                  المواضيع ({topics.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {topics.map((topic) => (
                    <Link 
                      key={topic.id} 
                      href={`/topics/${topic.id}?from=search&q=${encodeURIComponent(query)}&type=${searchType}&sp=${currentPage}`} 
                      className="block group"
                    >
                      <div className="card p-6 hover:shadow-lg transition-all">
                        <h3 className="font-bold text-lg group-hover:text-accent transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-arabic-sans mt-2">
                          المستوى {topic.level}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {searchType !== 'all' && totalPages > 1 && (
              <div className="pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8 animate-entrance">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">البحث</h1>
            <p className="text-lg text-muted-foreground font-arabic-sans">
              ابحث في محتوى الكتب والأحاديث والمواضيع
            </p>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse bg-muted h-24" />
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

