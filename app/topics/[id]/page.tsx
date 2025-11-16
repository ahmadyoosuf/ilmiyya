'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { Pagination } from '@/components/Pagination'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Topic = Database['public']['Tables']['topics']['Row']

interface HadithWithBook {
  id: number
  global_tid: number | null
  nass: string
  book_id: string
  part: string | null
  page: string | null
  books: { title: string } | null
}

const HADITHS_PER_PAGE = 10

// Helper function to truncate text and show preview
function truncateText(text: string, lines: number = 2): string {
  const splitLines = text.split('\n')
  const truncatedLines = splitLines.slice(0, lines).join('\n')
  
  // Also check character limit to be safe
  const charLimit = 300
  if (truncatedLines.length > charLimit) {
    return truncatedLines.substring(0, charLimit).trim() + '...'
  }
  
  if (splitLines.length > lines) {
    return truncatedLines + '...'
  }
  
  return text
}

function BreadcrumbLink({ topic }: { topic: Topic }) {
  const [hasChildren, setHasChildren] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function checkChildren() {
      const { count } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', topic.id)

      setHasChildren((count || 0) > 0)
    }

    checkChildren()
  }, [topic.id, supabase])

  const handleClick = () => {
    if (hasChildren === false) {
      // Leaf node: go to hadith page
      router.push(`/topics/${topic.id}`)
    } else if (hasChildren === true) {
      // Parent node: go to topics page showing children
      router.push(`/topics?parentId=${topic.id}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="hover:text-accent transition-colors"
    >
      {topic.title}
    </button>
  )
}

export default function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const topicId = parseInt(id)
  const searchParams = useSearchParams()
  
  // Read pagination page from search params
  const initialPage = searchParams.get('p') ? parseInt(searchParams.get('p')!) : 1

  const [topic, setTopic] = useState<Topic | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<Topic[]>([])
  const [hadiths, setHadiths] = useState<HadithWithBook[]>([])
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = getSupabaseBrowserClient()

  // Fetch topic and build breadcrumb trail
  useEffect(() => {
    async function fetchTopic() {
      // Fetch current topic
      const { data: currentTopic } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single()
      
      if (!currentTopic) return
      
      setTopic(currentTopic)
      
      // Build breadcrumb trail by traversing parent_id chain
      const trail: Topic[] = [currentTopic]
      let currentParentId = currentTopic.parent_id
      
      while (currentParentId !== null) {
        const { data: parentTopic } = await supabase
          .from('topics')
          .select('*')
          .eq('id', currentParentId)
          .single()
        
        if (!parentTopic) break
        
        trail.unshift(parentTopic)
        currentParentId = parentTopic.parent_id
      }
      
      setBreadcrumb(trail)
    }
    
    fetchTopic()
  }, [topicId, supabase])

  // Fetch hadiths for this topic
  useEffect(() => {
    async function fetchHadiths() {
      if (!topic) return
      
      setIsLoading(true)

      // Count total hadiths
      const { count } = await supabase
        .from('hadith_topics')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicId)
      
      const totalCount = count || 0
      setTotalPages(Math.ceil(totalCount / HADITHS_PER_PAGE))

      // Fetch hadiths with pagination
      const from = (currentPage - 1) * HADITHS_PER_PAGE
      const to = from + HADITHS_PER_PAGE - 1

      const { data } = await supabase
        .from('hadith_topics')
        .select('hadiths!inner(id, global_tid, nass, book_id, part, page, books(title))')
        .eq('topic_id', topicId)
        .range(from, to)
      
      if (data) {
        // @ts-ignore - Supabase nested query typing
        const hadithsData: HadithWithBook[] = data.map(item => item.hadiths).filter(Boolean)
        setHadiths(hadithsData)
      }
      
      setIsLoading(false)
    }

    fetchHadiths()
  }, [topic, topicId, currentPage, supabase])

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-arabic-sans">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link 
            href="/topics"
            className="inline-flex items-center gap-2 text-accent hover:underline font-arabic-sans mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            رجوع الشجرة الموضوعية
          </Link>
          
          <div className="flex flex-wrap items-center gap-2 text-lg bg-card border border-border rounded-lg p-4">
            <Link href="/topics" className="hover:text-accent transition-colors">
              الرئيسية
            </Link>
            
            {breadcrumb.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                {index === breadcrumb.length - 1 ? (
                  <span className="font-bold">{item.title}</span>
                ) : (
                  <BreadcrumbLink topic={item} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Topic Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">{topic.title}</h1>
          <p className="text-muted-foreground font-arabic-sans">
            المستوى {topic.level} • {totalPages > 0 ? `${totalPages * HADITHS_PER_PAGE} حديث تقريبًا` : 'لا توجد أحاديث'}
          </p>
        </div>

        {/* Hadiths Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse bg-muted h-32" />
            ))}
          </div>
        ) : hadiths.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-muted-foreground font-arabic-sans text-lg">
              لا توجد أحاديث مرتبطة بهذا الموضوع
            </p>
          </div>
        ) : (
          <>
            {/* Premium Table - Unified for Desktop and Mobile */}
            <div className="card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-l from-muted/30 to-muted/50 border-b-2 border-border">
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold font-arabic-sans text-foreground whitespace-nowrap">اسم الكتاب</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold font-arabic-sans text-foreground whitespace-nowrap w-20 md:w-24">الجزء</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold font-arabic-sans text-foreground whitespace-nowrap w-20 md:w-24">الصفحة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hadiths.map((hadith, index) => {
                      const bookLink = hadith.global_tid
                        ? `/books/${hadith.book_id}?tid=${hadith.global_tid}&from=topics&topicId=${topicId}&p=${currentPage}`
                        : null
                      
                      return (
                        <tr 
                          key={hadith.id}
                          className={cn(
                            'border-b border-border/50 last:border-b-0 transition-all duration-200',
                            bookLink 
                              ? 'hover:bg-accent/5 hover:shadow-sm cursor-pointer active:bg-accent/10 group' 
                              : 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={() => bookLink && (window.location.href = bookLink)}
                        >
                          <td className="px-4 md:px-6 py-3 md:py-4 align-middle">
                            <div className={cn(
                              "text-sm md:text-sm font-semibold font-arabic-sans transition-colors leading-relaxed",
                              bookLink && "group-hover:text-accent"
                            )}>
                              {hadith.books?.title || 'غير معروف'}
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 align-middle text-center">
                            <span className="inline-flex items-center justify-center px-2 md:px-3 py-1 rounded-full bg-muted/50 text-xs font-medium font-arabic-sans whitespace-nowrap">
                              {hadith.part || '-'}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 align-middle text-center">
                            <span className="inline-flex items-center justify-center px-2 md:px-3 py-1 rounded-full bg-muted/50 text-xs font-medium font-arabic-sans whitespace-nowrap">
                              {hadith.page || '-'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page)
                    // Update URL with page parameter
                    window.history.replaceState(null, '', `?p=${page}`)
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

