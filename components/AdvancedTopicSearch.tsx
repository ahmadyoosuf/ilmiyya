'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Sparkles, Search, Loader2, X, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

interface SemanticResult {
  id: number
  title: string
  level: number
  parent_id: number | null
  semantic_score?: number
  fts_score?: number
  hybrid_score?: number
}

interface AdvancedTopicSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdvancedTopicSearch({ open, onOpenChange }: AdvancedTopicSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SemanticResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const performSearch = useCallback(async () => {
    const trimmed = query.trim()
    if (!trimmed) return

    setIsSearching(true)
    setHasSearched(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/topics/semantic-search?q=${encodeURIComponent(trimmed)}&limit=20`
      )

      if (!response.ok) {
        throw new Error('Search request failed')
      }

      const payload = await response.json()

      if (payload.error) {
        throw new Error(payload.error)
      }

      setResults(payload.results || [])
    } catch (err) {
      setError('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const handleResultClick = useCallback(async (result: SemanticResult) => {
    // Check if leaf node
    const { count } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', result.id)

    onOpenChange(false)

    if (count === 0) {
      router.push(`/topics/${result.id}`)
    } else {
      router.push(`/topics?parentId=${result.id}`)
    }
  }, [supabase, router, onOpenChange])

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setError(null)
    inputRef.current?.focus()
  }

  const getScoreBadge = (result: SemanticResult) => {
    const score = result.hybrid_score ?? result.semantic_score ?? 0
    if (score >= 0.8) return { label: 'تطابق عالي', className: 'bg-accent/15 text-accent' }
    if (score >= 0.5) return { label: 'تطابق جيد', className: 'bg-muted text-muted-foreground' }
    return { label: 'تطابق محتمل', className: 'bg-muted/50 text-muted-foreground' }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        <SheetHeader className="p-5 pb-4 border-b border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-bold font-arabic-sans text-right">
                البحث الذكي
              </SheetTitle>
            </div>
          </div>
          <SheetDescription className="text-sm text-muted-foreground font-arabic-sans leading-relaxed text-right">
            يستخدم الذكاء الاصطناعي لفهم المعنى والسياق، فيجد المواضيع ذات الصلة حتى لو اختلفت الألفاظ. ابحث بأي لغة.
          </SheetDescription>
        </SheetHeader>

        {/* Search Form */}
        <div className="p-4 border-b border-border">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <div className={cn(
                'flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5 transition-all duration-200',
                'focus-within:bg-muted focus-within:ring-2 focus-within:ring-accent/20'
              )}>
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="مثال: أحكام الصلاة..."
                  className="flex-1 bg-transparent outline-none text-sm font-arabic-sans placeholder:text-muted-foreground/50"
                  dir="auto"
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-0.5 hover:bg-background/80 rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className={cn(
                'px-4 py-2.5 rounded-xl font-arabic-sans font-bold text-sm transition-all',
                'bg-accent text-accent-foreground',
                'hover:opacity-90 active:scale-95',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100'
              )}
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'بحث'
              )}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground font-arabic-sans">جاري البحث الذكي...</p>
            </div>
          )}

          {error && !isSearching && (
            <div className="p-4">
              <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm font-arabic-sans text-center">
                {error}
              </div>
            </div>
          )}

          {!isSearching && !error && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                <Search className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-arabic-sans text-sm">
                لم يتم العثور على نتائج. جرب كلمات مختلفة.
              </p>
            </div>
          )}

          {!isSearching && !error && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-accent/5 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent/40" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground font-arabic-sans text-sm leading-relaxed">
                  أدخل سؤالك أو الموضوع الذي تبحث عنه
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {['آداب الدعاء', 'prayer times', 'صفة الوضوء'].map((example) => (
                    <button
                      key={example}
                      onClick={() => {
                        setQuery(example)
                        inputRef.current?.focus()
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground font-arabic-sans hover:bg-muted transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground font-arabic-sans">
                  {results.length} نتيجة
                </p>
              </div>
              <div className="space-y-1">
                {results.map((result) => {
                  const badge = getScoreBadge(result)
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={cn(
                        'w-full text-right px-4 py-3.5 rounded-xl transition-all duration-150',
                        'hover:bg-muted/60 active:scale-[0.98]',
                        'group'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <ArrowLeft className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent mt-1 flex-shrink-0 transition-colors" />
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <span className="block font-semibold text-sm font-arabic-sans group-hover:text-accent transition-colors">
                            {result.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-[10px] px-2 py-0.5 rounded-md font-arabic-sans',
                              badge.className
                            )}>
                              {badge.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground/50">
                              {'المستوى ' + result.level}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function AdvancedSearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200',
        'bg-accent/10 hover:bg-accent/15 active:scale-95',
        'text-accent text-sm font-arabic-sans font-medium',
        'border border-accent/20'
      )}
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>بحث ذكي</span>
    </button>
  )
}
