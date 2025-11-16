'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { TreeDesktop } from '@/components/TreeDesktop'
import { TreeMobile } from '@/components/TreeMobile'
import { useTopicsData } from '@/hooks/use-topics-data'
import { Search, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Topic = Database['public']['Tables']['topics']['Row']

interface BreadcrumbTopic extends Topic {
  breadcrumb: Topic[]
}

interface TreeNode {
  id: string | number
  label: string
  data?: any
  isLoading?: boolean
  hasChildren?: boolean
  children?: TreeNode[]
}

function TopicsPageContent() {
  const {
    isInitialLoading,
    loadChildren,
    buildTreeNodes,
    getTopic,
    searchTopics,
  } = useTopicsData()

  const [topicTree, setTopicTree] = useState<TreeNode[]>([])
  const [breadcrumb, setBreadcrumb] = useState<Topic[]>([])
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BreadcrumbTopic[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const parentId = searchParams.get('parentId') ? parseInt(searchParams.get('parentId')!) : null

  // Load tree based on parentId
  useEffect(() => {
    if (isInitialLoading) return

    async function loadTree() {
      if (parentId) {
        // Load specific parent's children
        const parent = getTopic(parentId)
        if (!parent) {
          router.push('/topics')
          return
        }

        // Build breadcrumb
        const trail: Topic[] = [parent]
        let currentParentId = parent.parent_id

        while (currentParentId !== null) {
          const parentTopic = getTopic(currentParentId)
          if (!parentTopic) break
          trail.unshift(parentTopic)
          currentParentId = parentTopic.parent_id
        }

        setBreadcrumb(trail)

        // Load children
        const children = await loadChildren(parentId)
        setTopicTree(children)
      } else {
        // Load root topics
        setBreadcrumb([])
        const roots = buildTreeNodes(null)
        setTopicTree(roots)
      }
    }

    loadTree()
  }, [parentId, isInitialLoading, getTopic, loadChildren, buildTreeNodes, router])

  // Handle node expansion (load children on demand)
  const handleNodeExpand = useCallback(async (node: TreeNode) => {
    const topic = node.data as Topic
    if (!topic) return

    // Load children
    const children = await loadChildren(topic.id)
    
    // Update tree
    setTopicTree(prevTree => {
      function updateNode(n: TreeNode): TreeNode {
        if (n.id === node.id) {
          return {
            ...n,
            children,
            isLoading: false,
          }
        }
        
        if (n.children) {
          return {
            ...n,
            children: n.children.map(updateNode),
          }
        }
        
        return n
      }
      
      return prevTree.map(updateNode)
    })
  }, [loadChildren])

  // Handle topic selection
  const handleTopicSelect = useCallback(async (node: TreeNode) => {
    const topic = node.data as Topic
    if (!topic) return

    // Check if it's a leaf node
    const { count } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', topic.id)

    if (count === 0) {
      // Leaf node: redirect to detail page
      router.push(`/topics/${topic.id}`)
    } else {
      // Parent node: load children
      await handleNodeExpand(node)
    }
  }, [supabase, router, handleNodeExpand])

  // Build breadcrumb for a topic
  const buildBreadcrumbForTopic = useCallback(async (topicId: number): Promise<Topic[]> => {
    const trail: Topic[] = []
    let currentId: number | null = topicId
    
    while (currentId !== null) {
      const topic = getTopic(currentId)
      if (topic) {
        trail.unshift(topic)
        currentId = topic.parent_id
      } else {
        // Fallback to database if not in cache
        const { data } = await supabase
          .from('topics')
          .select('*')
          .eq('id', currentId)
          .single()
        
        if (!data) break
        trail.unshift(data)
        currentId = data.parent_id
      }
    }
    
    return trail
  }, [getTopic, supabase])

  // Search with debounce
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const results = await searchTopics(query)
      
      // Build breadcrumbs for results
      const resultsWithBreadcrumbs: BreadcrumbTopic[] = await Promise.all(
        results.map(async (topic) => ({
          ...topic,
          breadcrumb: await buildBreadcrumbForTopic(topic.id),
        }))
      )

      setSearchResults(resultsWithBreadcrumbs)
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchTopics, buildBreadcrumbForTopic])

  // Handle search input
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value)

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    const timer = setTimeout(() => {
      performSearch(value)
    }, 300)

    setSearchDebounceTimer(timer)
  }, [searchDebounceTimer, performSearch])

  // Handle search result selection
  const handleSearchResultSelect = useCallback(async (result: BreadcrumbTopic) => {
    setSearchQuery('')
    setSearchResults([])

    const { count } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', result.id)

    if (count === 0) {
      router.push(`/topics/${result.id}`)
    } else {
      router.push(`/topics?parentId=${result.id}`)
    }
  }, [supabase, router])

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6 pb-safe">
          {/* Mobile Header */}
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <h1 className="text-3xl md:text-4xl font-bold">المواضيع</h1>
            <p className="text-muted-foreground font-arabic-sans leading-relaxed">
              اختر موضوعًا من الشجرة لعرض الأحاديث المرتبطة
            </p>

            {/* Mobile Search */}
            <div className="relative">
              <div className={cn(
                'flex items-center gap-3 bg-muted/50 rounded-2xl px-4 py-3.5 transition-all duration-200',
                'focus-within:bg-muted focus-within:ring-2 focus-within:ring-accent/20'
              )}>
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="ابحث في المواضيع..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-base font-arabic-sans placeholder:text-muted-foreground/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                    className="p-1.5 hover:bg-background/80 rounded-lg transition-colors active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Mobile Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchResults.map((result, idx) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchResultSelect(result)}
                      className={cn(
                        'w-full text-right px-4 py-4 transition-colors active:scale-[0.98]',
                        'hover:bg-muted/50 active:bg-muted',
                        idx !== searchResults.length - 1 && 'border-b border-border/50'
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <span className="font-semibold text-base font-arabic-sans">{result.title}</span>
                        {result.breadcrumb && result.breadcrumb.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            {result.breadcrumb.map((item, idx) => (
                              <div key={item.id} className="flex items-center gap-1">
                                {idx > 0 && <span>←</span>}
                                <span>{item.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-arabic-sans">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري البحث...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Breadcrumb */}
            {breadcrumb.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm bg-card border border-border rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
                <Link 
                  href="/topics" 
                  className="text-accent hover:underline font-arabic-sans active:scale-95 transition-transform"
                >
                  الرئيسية
                </Link>

                {breadcrumb.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-muted-foreground">←</span>
                    {index === breadcrumb.length - 1 ? (
                      <span className="font-bold">{item.title}</span>
                    ) : (
                      <Link
                        href={`/topics?parentId=${item.id}`}
                        className="text-accent hover:underline font-arabic-sans active:scale-95 transition-transform"
                      >
                        {item.title}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Tree */}
          <TreeMobile
            nodes={topicTree}
            onSelect={handleTopicSelect}
            onExpand={handleNodeExpand}
            isLoading={isInitialLoading}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500"
          />

          {!isInitialLoading && topicTree.length > 0 && (
            <div className="text-center py-8 text-muted-foreground font-arabic-sans text-sm animate-in fade-in duration-700">
              اضغط على أي موضوع لعرض الأحاديث المرتبطة به
            </div>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex min-h-screen flex-col overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center pt-12">
          <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TreeDesktop
              nodes={topicTree}
              onSelect={handleTopicSelect}
              onExpand={handleNodeExpand}
              searchQuery={searchQuery}
              onSearchChange={handleSearchInput}
              searchResults={searchResults}
              isSearching={isSearching}
              onSearchResultSelect={handleSearchResultSelect}
              breadcrumb={breadcrumb}
              isLoading={isInitialLoading}
              className="h-[calc(100vh-200px)] min-h-[600px]"
            />
            
            {!isInitialLoading && topicTree.length > 0 && (
              <p className="text-center mt-6 text-sm text-muted-foreground font-arabic-sans animate-in fade-in duration-700">
                انقر على أي موضوع لعرض الأحاديث المرتبطة به
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function TopicsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto" />
          <p className="text-muted-foreground font-arabic-sans">جاري التحميل...</p>
        </div>
      </div>
    }>
      <TopicsPageContent />
    </Suspense>
  )
}
