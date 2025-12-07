'use client'

import { useState, useCallback, memo, useRef, TouchEvent } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
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
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)

  const handleClick = async () => {
    if (isSwiping) return
    
    if (hasChildren) {
      onToggleExpand(node.id)
      
      if (!isExpanded && (!node.children || node.children.length === 0)) {
        setIsExpanding(true)
        await onExpand(node)
        setIsExpanding(false)
      }
    } else {
      onSelect(node)
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    setIsSwiping(false)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStart !== null) {
      const diff = Math.abs(e.touches[0].clientX - touchStart)
      if (diff > 10) {
        setIsSwiping(true)
      }
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
    setTimeout(() => setIsSwiping(false), 100)
  }

  return (
    <div className="select-none">
      <button
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'w-full flex items-center gap-3 py-4 px-4 rounded-2xl text-right transition-all duration-200',
          'active:scale-[0.98] touch-manipulation',
          'bg-card border border-border shadow-sm',
          isSelected && 'bg-accent text-accent-foreground border-accent shadow-md scale-[1.02]',
          !isSelected && 'hover:bg-muted/50 active:bg-muted',
          'cursor-pointer'
        )}
        style={{ 
          marginRight: `${level * 1.2}rem`,
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {hasChildren && (
          <ChevronRight 
            className={cn(
              'w-5 h-5 flex-shrink-0 transition-transform duration-300',
              isExpanded && 'rotate-90'
            )}
          />
        )}
        <span className={cn(
          'flex-1 text-base font-arabic-sans leading-relaxed',
          !hasChildren && 'mr-8'
        )}>
          {node.label}
        </span>
        {(node.isLoading || isExpanding) && (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        )}
      </button>
      
      {hasChildren && isExpanded && node.children && node.children.length > 0 && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
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

interface TreeMobileProps {
  nodes: TreeNode[]
  selectedId?: string | number
  onSelect: (node: TreeNode) => void
  onExpand: (node: TreeNode) => Promise<void>
  isLoading: boolean
  className?: string
}

export function TreeMobile({
  nodes,
  selectedId,
  onSelect,
  onExpand,
  isLoading,
  className
}: TreeMobileProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

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

  return (
    <div 
      ref={scrollRef}
      className={cn('pb-4 space-y-3', className)}
    >
      {isLoading && nodes.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="h-16 bg-muted/50 animate-pulse rounded-2xl"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      ) : nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <p className="text-muted-foreground font-arabic-sans text-lg">لا توجد مواضيع</p>
          <p className="text-muted-foreground/60 font-arabic-sans text-sm mt-2">
            جرب البحث أو العودة للصفحة الرئيسية
          </p>
        </div>
      ) : (
        <div className="space-y-3">
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
  )
}


