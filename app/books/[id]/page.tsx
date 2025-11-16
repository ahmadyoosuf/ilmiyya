'use client'

import { use, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { Tree, TreeNode } from '@/components/Tree'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

type Book = Database['public']['Tables']['books']['Row']
type Hadith = Database['public']['Tables']['hadiths']['Row']

interface TOCStructure {
  parts: Map<string, Set<string>>
}

const HADITHS_PER_PAGE = 1

export default function BookReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const [book, setBook] = useState<Book | null>(null)
  const [hadiths, setHadiths] = useState<Hadith[]>([])
  const [tocTree, setTocTree] = useState<TreeNode[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  const [selectedPage, setSelectedPage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [backLink, setBackLink] = useState<string | null>(null)

  const supabase = getSupabaseBrowserClient()

  // Handle deep-linking by global_tid
  useEffect(() => {
    async function handleDeepLink() {
      const tid = searchParams.get('tid')
      const fromTopics = searchParams.get('from') === 'topics'
      const topicId = searchParams.get('topicId')
      const topicPage = searchParams.get('p')

      if (tid && fromTopics && topicId) {
        // Build back link
        const backPath = topicPage
          ? `/topics/${topicId}?p=${topicPage}`
          : `/topics/${topicId}`
        setBackLink(backPath)
      }

      if (tid) {
        try {
          // Fetch target hadith to get its id and position
          const { data: target, error } = await supabase
            .from('hadiths')
            .select('id, book_id')
            .eq('global_tid', Number(tid))
            .eq('book_id', id)
            .single()

          if (error || !target) return

          // Count hadiths with id < target.id to determine page
          const { count } = await supabase
            .from('hadiths')
            .select('*', { count: 'exact', head: true })
            .eq('book_id', target.book_id)
            .lt('id', target.id)

          // Set page (count + 1 because page 1 starts at count 0)
          setCurrentPage((count || 0) + 1)
        } catch (err) {
          console.error('Error handling deep link:', err)
        }
      }
    }

    handleDeepLink()
  }, [searchParams, id, supabase])

  // Fetch book info and build TOC
  useEffect(() => {
    async function fetchBook() {
      const { data: bookData } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single()
      
      if (bookData) {
        setBook(bookData)
      }

      // Fetch distinct parts and pages for TOC
      const { data: hadithsData } = await supabase
        .from('hadiths')
        .select('part, page')
        .eq('book_id', id)
        .order('id')
      
      if (hadithsData) {
        buildTOC(hadithsData)
      }
    }
    fetchBook()
  }, [id])

  // Fetch hadiths based on filters and pagination
  useEffect(() => {
    async function fetchHadiths() {
      setIsLoading(true)
      
      let countQuery = supabase
        .from('hadiths')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', id)
      
      if (selectedPart) {
        countQuery = countQuery.eq('part', selectedPart)
      }
      if (selectedPage) {
        countQuery = countQuery.eq('page', selectedPage)
      }

      const { count } = await countQuery
      const totalCount = count || 0
      setTotalPages(Math.ceil(totalCount / HADITHS_PER_PAGE))

      const from = (currentPage - 1) * HADITHS_PER_PAGE
      const to = from + HADITHS_PER_PAGE - 1

      let query = supabase
        .from('hadiths')
        .select('*')
        .eq('book_id', id)
        .order('id')
        .range(from, to)
      
      if (selectedPart) {
        query = query.eq('part', selectedPart)
      }
      if (selectedPage) {
        query = query.eq('page', selectedPage)
      }

      const { data } = await query
      
      if (data) {
        setHadiths(data)
      }
      
      setIsLoading(false)
    }

    fetchHadiths()
  }, [id, currentPage, selectedPart, selectedPage])

  function buildTOC(hadiths: Array<{ part: string | null; page: string | null }>) {
    const structure: TOCStructure = { parts: new Map() }
    
    hadiths.forEach((h) => {
      const part = h.part || 'بدون جزء'
      const page = h.page || 'بدون صفحة'
      
      if (!structure.parts.has(part)) {
        structure.parts.set(part, new Set())
      }
      structure.parts.get(part)!.add(page)
    })

    const tree: TreeNode[] = Array.from(structure.parts.entries()).map(([part, pages], idx) => ({
      id: `part-${idx}`,
      label: part,
      data: { type: 'part', value: part },
      children: Array.from(pages).map((page, pidx) => ({
        id: `page-${idx}-${pidx}`,
        label: `صفحة ${page}`,
        data: { type: 'page', value: page, part },
      })),
    }))

    setTocTree(tree)
  }

  function handleTOCSelect(node: TreeNode) {
    if (node.data?.type === 'part') {
      setSelectedPart(node.data.value)
      setSelectedPage(null)
    } else if (node.data?.type === 'page') {
      setSelectedPart(node.data.part)
      setSelectedPage(node.data.value)
    }
    setCurrentPage(1)
    setIsSidebarOpen(false)
  }

  function clearFilter() {
    setSelectedPart(null)
    setSelectedPage(null)
    setCurrentPage(1)
  }

  const TOCContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-bold font-arabic-sans mb-2">جدول المحتويات</h3>
        {(selectedPart || selectedPage) && (
          <button
            onClick={clearFilter}
            className="text-sm text-accent hover:underline font-arabic-sans"
          >
            إزالة التصفية
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Tree nodes={tocTree} selectedId={selectedPage ? undefined : selectedPart} onSelect={handleTOCSelect} />
      </div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Back Bar for Topics Navigation */}
        {backLink && (
          <div className="border-b border-border bg-muted/50 px-4 py-2 flex items-center gap-2">
            <Link
              href={backLink}
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-arabic-sans"
            >
              <ChevronRight className="w-4 h-4" />
              رجوع إلى الموضوع
            </Link>
            <button
              onClick={() => setBackLink(null)}
              className="ml-auto p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-border bg-card p-4 flex items-center gap-4">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 hover:bg-muted rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              {TOCContent}
            </SheetContent>
          </Sheet>
          
          <div className="flex-1">
            <h1 className="font-bold text-xl line-clamp-1">{book?.title || 'جاري التحميل...'}</h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse bg-muted h-32" />
              ))}
            </div>
          ) : hadiths.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-arabic-sans">
                لا توجد نصوص في هذا القسم
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {hadiths.map((hadith) => (
                <div key={hadith.id} className="card p-6 space-y-3">
                  <div className="flex gap-4 text-sm text-muted-foreground font-arabic-sans">
                    {hadith.part && <span>الجزء: {hadith.part}</span>}
                    {hadith.page && <span>الصفحة: {hadith.page}</span>}
                  </div>
                  <p className="text-lg leading-loose">{hadith.nass}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t border-border bg-card p-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform font-arabic-sans"
            >
              <ChevronRight className="w-5 h-5" />
              السابق
            </button>
            
            <span className="font-arabic-sans">
              صفحة {currentPage} من {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform font-arabic-sans"
            >
              التالي
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 border-r border-border bg-card overflow-hidden">
        {TOCContent}
      </div>
    </div>
  )
}

