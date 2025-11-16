'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { BookCard } from '@/components/BookCard'
import { Pagination } from '@/components/Pagination'
import { Database } from '@/lib/supabase/types'
import { Search, X, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type Book = Database['public']['Tables']['books']['Row'] & {
  categories: { name_ar: string } | null
}

type Category = Database['public']['Tables']['categories']['Row']

const ITEMS_PER_PAGE = 12

export default function CategoryBooksPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: categoryId } = use(params)
  const numCategoryId = parseInt(categoryId)

  const [category, setCategory] = useState<Category | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  // Fetch category info
  useEffect(() => {
    async function fetchCategory() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('id', numCategoryId)
        .single()

      if (data) {
        setCategory(data)
      } else {
        // Redirect if category not found
        router.push('/books')
      }
    }

    fetchCategory()
  }, [numCategoryId, supabase, router])

  // Fetch books for this category
  useEffect(() => {
    async function fetchBooks() {
      setIsLoading(true)

      // Count total books
      let countQuery = supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', numCategoryId)

      if (searchQuery.trim()) {
        countQuery = countQuery.ilike('title', `%${searchQuery}%`)
      }

      const { count } = await countQuery
      const totalCount = count || 0
      setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE))

      // Fetch books for current page
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('books')
        .select('*, categories(name_ar)')
        .eq('category_id', numCategoryId)
        .order('title')
        .range(from, to)

      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery}%`)
      }

      const { data } = await query

      if (data) {
        setBooks(data)
      }

      setIsLoading(false)
    }

    if (category) {
      fetchBooks()
    }
  }, [numCategoryId, currentPage, searchQuery, supabase, category])

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    const timer = setTimeout(() => {
      // Search will be triggered by the useEffect dependency
    }, 300)

    setSearchDebounceTimer(timer)
  }

  if (!category && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-arabic-sans">التصنيف غير موجود</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8 animate-entrance">
        {/* Back Button and Header */}
        <div className="space-y-4">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-accent hover:underline font-arabic-sans mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            رجوع إلى التصنيفات
          </Link>

          {category && (
            <>
              <h1 className="text-4xl font-bold">{category.name_ar}</h1>
              <p className="text-lg text-muted-foreground font-arabic-sans">
                {totalPages > 0
                  ? `${Math.min(totalPages * ITEMS_PER_PAGE, (totalPages - 1) * ITEMS_PER_PAGE + books.length)} كتاب`
                  : 'لا توجد كتب'}
              </p>
            </>
          )}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3 w-full md:w-96">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="ابحث عن كتاب..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="flex-1 bg-muted outline-none text-sm md:text-base font-arabic-sans placeholder-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setCurrentPage(1)
              }}
              className="p-1 hover:bg-background rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 h-32 animate-pulse bg-muted" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-arabic-sans">
              {searchQuery
                ? 'لا توجد كتب تطابق البحث'
                : 'لا توجد كتب في هذا التصنيف'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                categoryName={book.categories?.name_ar}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}

