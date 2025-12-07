'use client'

import { useState, useCallback, memo, useRef, useEffect } from 'react'
import { ChevronRight, Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TreeNode } from './Tree'

interface TreeItemProps {
  node: TreeNode
  level: number
  selectedId?: string | number
  onSelect: (node: TreeNode) => void
  onExpand: (node: TreeNode) => Promise<void>
  expandedIds: Set<string | number>
  onToggleExpand: (id: string | number) => void
}

const TreeItem = memo(({ 
  node, 
  level, 
  selectedId, 
  onSelect, 
  onExpand,
  expandedIds,
  onToggleExpand
}: TreeItemProps) => {
  const hasChildren = (node.children && node.children.length > 0) || node.hasChildren
  const isExpanded = expandedIds.has(node.id)
  const isSelected = selectedId === node.id
  const [isExpanding, setIsExpanding] = useState(false)

  const handleClick = async () => {
    if (hasChildren) {
      onToggleExpand(node.id)
      
      // Load children if not loaded yet
      if (!isExpanded && (!node.children || node.children.length === 0)) {
        setIsExpanding(true)
        await onExpand(node)
        setIsExpanding(false)
      }
    } else {
      onSelect(node)
    }
  }

  return (
    <div className="select-none">
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-2 py-2.5 px-3 rounded-lg text-right transition-all duration-200',
          'hover:bg-muted/60',
          isSelected && 'bg-accent/10 text-accent font-semibold',
          !hasChildren && 'pr-9',
          'cursor-pointer'
        )}
        style={{ paddingRight: hasChildren ? `${level * 1.5 + 0.75}rem` : `${level * 1.5 + 2.75}rem` }}
      >
        {hasChildren && (
          <ChevronRight 
            className={cn(
              'w-4 h-4 flex-shrink-0 transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}
          />
        )}
        <span className="flex-1 text-sm font-arabic-sans truncate">{node.label}</span>
        {(node.isLoading || isExpanding) && (
          <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      
      {hasChildren && isExpanded && node.children && node.children.length > 0 && (
        <div className="overflow-hidden animate-in slide-in-from-top-1 duration-200">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onExpand={onExpand}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
})

TreeItem.displayName = 'TreeItem'

interface TreeDesktopProps {
  nodes: TreeNode[]
  selectedId?: string | number
  onSelect: (node: TreeNode) => void
  onExpand: (node: TreeNode) => Promise<void>
  searchQuery: string
  onSearchChange: (value: string) => void
  searchResults: any[]
  isSearching: boolean
  onSearchResultSelect: (result: any) => void
  breadcrumb: any[]
  isLoading: boolean
  className?: string
}

export function TreeDesktop({
  nodes,
  selectedId,
  onSelect,
  onExpand,
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  onSearchResultSelect,
  breadcrumb,
  isLoading,
  className
}: TreeDesktopProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set())
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleToggleExpand = useCallback((id: string | number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Smooth scroll to top when breadcrumb changes
  useEffect(() => {
    if (scrollAreaRef.current && breadcrumb.length > 0) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [breadcrumb])

  return (
    <div className={cn('flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden', className)}>
      {/* Header with Search */}
      <div className="flex-shrink-0 p-6 border-b border-border bg-card/50 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-arabic-sans">المواضيع</h2>
          {nodes.length > 0 && (
            <span className="text-sm text-muted-foreground font-arabic-sans">
              {nodes.length} موضوع
            </span>
          )}
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <div className={cn(
            'flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 transition-all duration-200',
            'focus-within:bg-muted focus-within:ring-2 focus-within:ring-accent/20'
          )}>
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="ابحث في المواضيع..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-arabic-sans placeholder:text-muted-foreground/60"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 hover:bg-background/80 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {searchResults.map((result, idx) => (
                <button
                  key={result.id}
                  onClick={() => onSearchResultSelect(result)}
                  className={cn(
                    'w-full text-right px-4 py-3 transition-colors',
                    'hover:bg-muted/60',
                    idx !== searchResults.length - 1 && 'border-b border-border/50'
                  )}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-sm font-arabic-sans">{result.title}</span>
                    {result.breadcrumb && result.breadcrumb.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        {result.breadcrumb.map((item: any, idx: number) => (
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl p-4 text-center shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-arabic-sans">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري البحث...</span>
              </div>
            </div>
          )}
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm bg-muted/30 rounded-lg p-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-muted-foreground">المسار:</span>
            {breadcrumb.map((item, index) => (
              <span key={item.id} className="flex items-center gap-2">
                {index > 0 && <span className="text-muted-foreground">←</span>}
                <span className={cn(
                  index === breadcrumb.length - 1 ? 'font-bold text-accent' : 'text-foreground'
                )}>
                  {item.title}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tree Content */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar"
      >
        {isLoading && nodes.length === 0 ? (
          <div className="space-y-2 px-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="h-10 bg-muted/50 animate-pulse rounded-lg"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-arabic-sans">لا توجد مواضيع</p>
          </div>
        ) : (
          <div className="space-y-1">
            {nodes.map((node) => (
              <TreeItem
                key={node.id}
                node={node}
                level={0}
                selectedId={selectedId}
                onSelect={onSelect}
                onExpand={onExpand}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


