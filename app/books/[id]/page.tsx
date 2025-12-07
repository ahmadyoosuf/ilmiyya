'use client'

import type React from 'react'
import { use, useEffect, useState, useMemo, useCallback, useRef } from 'react'
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
  const [isTocLoading, setIsTocLoading] = useState(true) // Separate loading state for TOC
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [backLink, setBackLink] = useState<string | null>(null)
  const [tocError, setTocError] = useState<string | null>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const [tocNodeMappings, setTocNodeMappings] = useState<{ nodeId: string | number; hadithId: number }[]>([])
  const [currentTocNodeId, setCurrentTocNodeId] = useState<string | number | undefined>(undefined)

  const supabase = getSupabaseBrowserClient()

  const currentHadithId = useMemo<number | undefined>(() => {
    if (hadiths.length === 0) return undefined
    return Math.min(...hadiths.map((hadith) => hadith.id))
  }, [hadiths])

  // Handle deep-linking by global_tid and back navigation
  useEffect(() => {
    async function handleDeepLink() {
      const tid = searchParams.get('tid')
      const fromTopics = searchParams.get('from') === 'topics'
      const fromSearch = searchParams.get('from') === 'search'
      const topicId = searchParams.get('topicId')
      const topicPage = searchParams.get('p')
      const searchQuery = searchParams.get('q')
      const searchType = searchParams.get('type')
      const searchPage = searchParams.get('sp')

      // Build back link based on source
      if (fromSearch && searchQuery) {
        // Coming from search results
        let backPath = `/search?q=${encodeURIComponent(searchQuery)}`
        if (searchType) backPath += `&type=${searchType}`
        if (searchPage) backPath += `&sp=${searchPage}`
        setBackLink(backPath)
      } else if (tid && fromTopics && topicId) {
        // Coming from topics
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
    let isCancelled = false
    
    async function fetchBook() {
      setIsTocLoading(true)
      setTocError(null)
      
      try {
        // Fetch only the book metadata first (fast)
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('id, title, category_id, file_path, toc')
          .eq('id', id)
          .single()
        
        if (bookError) throw bookError
        if (isCancelled) return
        
        if (bookData) {
          setBook(bookData as Book)
          
          // Build TOC from book's toc column (stored from JSON file)
          if (bookData.toc && Array.isArray(bookData.toc)) {
            // Fast path: TOC is already in database, build immediately (optimized for very large arrays)
            const tocArray = bookData.toc as unknown as BookTOCEntry[]
            buildBookTOC(tocArray)
          } else {
            // Slow path: No TOC in database, build simplified structure
            // Use a more aggressive limit and timeout
            await fetchPartPageStructure()
          }
        }
      } catch (error) {
        console.error('Error fetching book:', error)
        if (!isCancelled) {
          setTocError('فشل تحميل الفهرس')
          setIsTocLoading(false)
          // Show a simple fallback
          setTocNodeMappings([])
          setTocTree([{
            id: 'error',
            label: 'فشل تحميل الفهرس',
            data: { type: 'error' }
          }])
        }
      }
    }
    
    async function fetchPartPageStructure() {
      try {
        // Create a timeout promise (5 seconds max)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        )
        
        // Query with aggressive limit
        const queryPromise = supabase
          .from('hadiths')
          .select('part, page')
          .eq('book_id', id)
          .order('part', { ascending: true })
          .order('page', { ascending: true })
          .limit(500) // Reduced from 1000
        
        // Race between query and timeout
        const { data: hadithsData, error } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any
        
        if (error) throw error
        if (isCancelled) return
        
        if (hadithsData && hadithsData.length > 0) {
          buildTOC(hadithsData)
        } else {
          // No data, show empty state
          setTocNodeMappings([])
          setTocTree([{
            id: 'empty',
            label: 'لا يوجد فهرس',
            data: { type: 'empty' }
          }])
        }
      } catch (error) {
        console.error('Error fetching part/page structure:', error)
        if (!isCancelled) {
          // Show minimal TOC on error
          setTocNodeMappings([])
          setTocTree([{
            id: 'error',
            label: 'فشل تحميل الفهرس',
            data: { type: 'error' }
          }])
        }
      } finally {
        if (!isCancelled) {
          setIsTocLoading(false)
        }
      }
    }
    
    fetchBook()
    
    return () => {
      isCancelled = true
    }
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

  useEffect(() => {
    if (typeof currentHadithId !== 'number' || tocNodeMappings.length === 0) {
      setCurrentTocNodeId(undefined)
      return
    }

    const bestMatch = tocNodeMappings.reduce<{ nodeId: string | number; hadithId: number } | null>((acc, entry) => {
      if (entry.hadithId <= currentHadithId && (!acc || entry.hadithId > acc.hadithId)) {
        return entry
      }
      return acc
    }, null)

    setCurrentTocNodeId(bestMatch?.nodeId)
  }, [currentHadithId, tocNodeMappings])

  function buildBookTOC(tocEntries: BookTOCEntry[]) {
    // Efficient O(n * L) hierarchy builder (L = max level, usually very small)
    // This avoids the previous O(n^2) backwards scan which was too slow for large books like Sahih Bukhari.
    type TOCNodeInternal = BookTOCEntry & { children: TOCNodeInternal[] }

    const roots: TOCNodeInternal[] = []
    const lastNodeAtLevel: Record<number, TOCNodeInternal> = {}

    for (const entry of tocEntries) {
      const level = entry.lvl || 1
      const node: TOCNodeInternal = { ...entry, children: [] }

      if (level <= 1) {
        // Top‑level node
        roots.push(node)
      } else {
        // Find the nearest parent at a lower level
        let parent: TOCNodeInternal | undefined
        for (let l = level - 1; l >= 1; l--) {
          if (lastNodeAtLevel[l]) {
            parent = lastNodeAtLevel[l]
            break
          }
        }

        if (parent) {
          parent.children.push(node)
        } else {
          // Fallback: if no parent found, treat as root to keep TOC usable
          roots.push(node)
        }
      }

      lastNodeAtLevel[level] = node
    }

    const convertToTreeNode = (node: TOCNodeInternal): TreeNode => ({
      id: `toc-${node.id}`,
      label: node.tit,
      data: { type: 'toc', hadithId: node.id, level: node.lvl },
      children: node.children.length > 0 ? node.children.map(convertToTreeNode) : undefined,
    })

    const treeNodes = roots.map(convertToTreeNode)
    setTocTree(treeNodes)
    setTocNodeMappings(flattenTocNodes(treeNodes))
    setIsTocLoading(false)
  }

  function buildTOC(hadiths: Array<{ part: string | null; page: string | null }>) {
    setTocNodeMappings([])
    const structure: TOCStructure = { parts: new Map() }
    
    // Build structure from distinct part/page combinations
    hadiths.forEach((h) => {
      const part = h.part || 'بدون جزء'
      const page = h.page || 'بدون صفحة'
      
      if (!structure.parts.has(part)) {
        structure.parts.set(part, new Set())
      }
      structure.parts.get(part)!.add(page)
    })

    // Convert to tree (only show if there are meaningful parts/pages)
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

  function flattenTocNodes(nodes: TreeNode[]): Array<{ nodeId: string | number; hadithId: number }> {
    const flattened: Array<{ nodeId: string | number; hadithId: number }> = []

    const traverse = (node: TreeNode) => {
      const hadithId = node.data?.hadithId
      if (typeof hadithId === 'number') {
        flattened.push({ nodeId: node.id, hadithId })
      }

      node.children?.forEach(traverse)
    }

    nodes.forEach(traverse)
    return flattened
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

  // Swipe handlers for mobile navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && currentPage > 1) {
        // RTL: swipe left (finger moves left) -> previous page
        setCurrentPage((p) => Math.max(1, p - 1))
      } else if (swipeDistance < 0 && currentPage < totalPages) {
        // RTL: swipe right (finger moves right) -> next page
        setCurrentPage((p) => Math.min(totalPages, p + 1))
      }
    }

    touchStartX.current = 0
    touchEndX.current = 0
  }

  const tocSelectedId = currentTocNodeId ?? selectedTopicId ?? (selectedPage ? undefined : selectedPart ?? undefined)

  const TOCContent = (
    <div className="h-full flex flex-col font-toc">
      <div className="p-4 border-b border-border">
        <h3 className="font-bold mb-2">جدول المحتويات</h3>
        {(selectedPart || selectedPage || selectedTopicId) && (
          <button
            onClick={clearFilter}
            className="text-sm text-accent hover:underline"
          >
            إزالة التصفية
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isTocLoading ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <div className="text-muted-foreground text-sm">جارٍ تحميل الفهرس...</div>
          </div>
        ) : tocError ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2 text-center">
            <div className="text-destructive">{tocError}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm text-accent hover:underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <Tree 
            nodes={tocTree} 
            selectedId={tocSelectedId} 
            onSelect={handleTOCSelect}
            labelClassName="font-toc"
          />
        )}
      </div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Back Bar for Navigation */}
        {backLink && (
          <div className="border-b border-border bg-muted/50 px-4 py-2 flex items-center gap-2">
            <Link
              href={backLink}
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-arabic-sans"
            >
              <ChevronRight className="w-4 h-4" />
              {backLink.includes('/search') ? 'رجوع إلى نتائج البحث' : 'رجوع إلى الموضوع'}
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

        {/* Navigation Buttons for Desktop - Top positioned (no page counter in between) */}
        {totalPages > 1 && (
          <div className="hidden md:flex items-center justify-center gap-8 border-b border-border bg-muted/30 px-4 py-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-accent/90 text-accent-foreground font-arabic-sans",
                "hover:bg-accent transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="السابق"
            >
              <ChevronRight className="w-5 h-5" />
              السابق
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-accent/90 text-accent-foreground font-arabic-sans",
                "hover:bg-accent transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="التالي"
            >
              التالي
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Mobile navigation bar (icon-only previous/next buttons) */}
        {totalPages > 1 && (
          <div className="md:hidden sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-1 flex items-center justify-between w-full">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                "p-2 rounded-full flex items-center justify-center",
                "bg-accent/90 text-accent-foreground",
                "hover:bg-accent transition-all",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
              aria-label="السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "p-2 rounded-full flex items-center justify-center",
                "bg-accent/90 text-accent-foreground",
                "hover:bg-accent transition-all",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
              aria-label="التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Area with Swipe Support */}
        <div 
          className="flex-1 overflow-y-auto p-4 md:p-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
                    <div className="text-2xl md:text-3xl leading-[2.1] space-y-3 font-book">
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

      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 border-r border-border bg-card overflow-hidden">
        {TOCContent}
      </div>
    </div>
  )
}

