'use client'

import { use, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { Tree, TreeNode } from '@/components/Tree'
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type Book = Database['public']['Tables']['books']['Row']
type Hadith = Database['public']['Tables']['hadiths']['Row']
type Topic = Database['public']['Tables']['topics']['Row']

interface TOCStructure {
  parts: Map<string, Set<string>>
}

interface BookTOCEntry {
  tit: string  // title
  lvl: number  // level (1, 2, 3, etc.)
  sub: number  // sub-level
  id: number   // hadith id this section starts at
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
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
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
        await jumpToHadith(Number(tid), true)
      }
    }

    handleDeepLink()
  }, [searchParams, id, supabase])

  // Helper to jump to a specific hadith (by local ID or global TID)
  async function jumpToHadith(identifier: number, isGlobalTid: boolean = false) {
    try {
      let targetId = identifier
      
      if (isGlobalTid) {
        const { data: target, error } = await supabase
          .from('hadiths')
          .select('id')
          .eq('global_tid', identifier)
          .eq('book_id', id)
          .single()
        
        if (error || !target) return
        targetId = target.id
      }

      // Count hadiths with id < targetId to determine page
      const { count } = await supabase
        .from('hadiths')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', id)
        .lt('id', targetId)

      // Set page (count + 1 because page 1 starts at count 0)
      setCurrentPage(Math.ceil(((count || 0) + 1) / HADITHS_PER_PAGE))
    } catch (err) {
      console.error('Error jumping to hadith:', err)
    }
  }

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
        
        // Build TOC from book's toc column (stored from JSON file)
        if (bookData.toc && Array.isArray(bookData.toc)) {
          buildBookTOC(bookData.toc as unknown as BookTOCEntry[])
        } else {
          // Fallback to Part/Page TOC if no toc data
          const { data: hadithsData } = await supabase
            .from('hadiths')
            .select('part, page')
            .eq('book_id', id)
            .order('id')
          
          if (hadithsData) {
            buildTOC(hadithsData)
          }
        }
      }
    }
    fetchBook()
  }, [id])

  // Fetch hadiths based on filters and pagination
  useEffect(() => {
    async function fetchHadiths() {
      setIsLoading(true)
      
      let countQuery: any = supabase
        .from('hadiths')
        .select('*', { count: 'exact', head: true })
        .eq('book_id', id)
      
      if (selectedPart) {
        countQuery = countQuery.eq('part', selectedPart)
      }
      if (selectedPage) {
        countQuery = countQuery.eq('page', selectedPage)
      }
      // Note: We don't filter by selectedTopicId anymore because we want to jump to the start 
      // of the topic but allow reading subsequent hadiths (which might not be explicitly linked).
      // The jumping is handled by setting currentPage.

      const { count } = await countQuery
      const totalCount = count || 0
      setTotalPages(Math.ceil(totalCount / HADITHS_PER_PAGE))

      const from = (currentPage - 1) * HADITHS_PER_PAGE
      const to = from + HADITHS_PER_PAGE - 1

      let query: any = supabase
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
      // Don't filter by topic ID for the main query either
      
      const { data } = await query
      
      if (data) {
        setHadiths(data as unknown as Hadith[])
      }
      
      setIsLoading(false)
    }

    fetchHadiths()
  }, [id, currentPage, selectedPart, selectedPage])

  function buildBookTOC(tocEntries: BookTOCEntry[]) {
    // Build hierarchical tree from flat TOC array
    const entryMap = new Map<number, BookTOCEntry & { children: any[] }>()
    const roots: any[] = []

    // Initialize all entries
    tocEntries.forEach(entry => {
      entryMap.set(entry.id, { ...entry, children: [] })
    })

    // Build hierarchy based on levels
    tocEntries.forEach((entry, index) => {
      const node = entryMap.get(entry.id)!
      
      // Find parent: look backwards for nearest entry with lower level
      let parentIndex = -1
      for (let i = index - 1; i >= 0; i--) {
        if (tocEntries[i].lvl < entry.lvl) {
          parentIndex = i
          break
        }
      }
      
      if (parentIndex >= 0) {
        const parent = entryMap.get(tocEntries[parentIndex].id)
        if (parent) {
          parent.children.push(node)
        }
      } else {
        roots.push(node)
      }
    })

    // Convert to TreeNode format
    const convertToTreeNode = (node: BookTOCEntry & { children: any[] }): TreeNode => {
      return {
        id: `toc-${node.id}`,
        label: node.tit,
        data: { type: 'toc', hadithId: node.id, level: node.lvl },
        children: node.children.length > 0 ? node.children.map(convertToTreeNode) : undefined,
      }
    }

    setTocTree(roots.map(convertToTreeNode))
  }

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
      setSelectedTopicId(null)
      setCurrentPage(1)
    } else if (node.data?.type === 'page') {
      setSelectedPart(node.data.part)
      setSelectedPage(node.data.value)
      setSelectedTopicId(null)
      setCurrentPage(1)
    } else if (node.data?.type === 'toc') {
      // Jump to the hadith where this TOC section starts
      if (node.data.hadithId) {
        jumpToHadith(node.data.hadithId, false)
      }
      setSelectedPart(null)
      setSelectedPage(null)
      setSelectedTopicId(null)
    } else if (node.data?.type === 'topic') {
      setSelectedTopicId(node.data.value)
      setSelectedPart(null)
      setSelectedPage(null)
      
      // Jump to the starting hadith for this topic
      if (node.data.startHadithId) {
        jumpToHadith(node.data.startHadithId, false)
      } else {
        console.warn('No start hadith found for topic:', node.label)
      }
    }
    setIsSidebarOpen(false)
  }

  function clearFilter() {
    setSelectedPart(null)
    setSelectedPage(null)
    setSelectedTopicId(null)
    setCurrentPage(1)
  }

  const TOCContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-bold font-arabic-sans mb-2">جدول المحتويات</h3>
        {(selectedPart || selectedPage || selectedTopicId) && (
          <button
            onClick={clearFilter}
            className="text-sm text-accent hover:underline font-arabic-sans"
          >
            إزالة التصفية
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Tree nodes={tocTree} selectedId={selectedTopicId || (selectedPage ? undefined : selectedPart || undefined)} onSelect={handleTOCSelect} />
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
              {hadiths.map((hadith) => {
                // Process the hadith text: handle \r for line breaks
                const processedText = hadith.nass
                  .split('\r') // Split by \r to create line breaks
                  .filter(line => line.trim()) // Remove empty lines
                
                return (
                  <div key={hadith.id} className="card p-6 space-y-3">
                    <div className="flex gap-4 text-sm text-muted-foreground font-arabic-sans">
                      {hadith.part && <span>الجزء: {hadith.part}</span>}
                      {hadith.page && <span>الصفحة: {hadith.page}</span>}
                    </div>
                    <div className="text-lg leading-loose space-y-2">
                      {processedText.map((line, index) => (
                        <p key={index} className="text-right">
                          {line.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Premium Floating Navigation Arrows */}
        {totalPages > 1 && (
          <>
            {/* Next Button - Left Corner */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "fixed left-4 top-1/2 -translate-y-1/2 z-20",
                "w-12 h-12 md:w-14 md:h-14 rounded-full",
                "bg-accent/90 backdrop-blur-md text-accent-foreground",
                "shadow-lg hover:shadow-xl",
                "flex items-center justify-center",
                "transition-all duration-300 ease-out",
                "hover:scale-110 hover:bg-accent active:scale-95",
                "disabled:opacity-0 disabled:pointer-events-none",
                "group"
              )}
              aria-label="التالي"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Previous Button - Right Corner */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                "fixed right-4 top-1/2 -translate-y-1/2 z-20",
                "w-12 h-12 md:w-14 md:h-14 rounded-full",
                "bg-accent/90 backdrop-blur-md text-accent-foreground",
                "shadow-lg hover:shadow-xl",
                "flex items-center justify-center",
                "transition-all duration-300 ease-out",
                "hover:scale-110 hover:bg-accent active:scale-95",
                "disabled:opacity-0 disabled:pointer-events-none",
                "group"
              )}
              aria-label="السابق"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:-translate-x-0.5" />
            </button>
          </>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 border-r border-border bg-card overflow-hidden">
        {TOCContent}
      </div>
    </div>
  )
}

