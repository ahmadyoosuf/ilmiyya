'use client'

import { useState, ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

export interface TreeNode {
  id: string | number
  label: string
  children?: TreeNode[]
  data?: any
  isLoading?: boolean
  hasChildren?: boolean // Indicates if node might have children (for lazy loading)
}

interface TreeItemProps {
  node: TreeNode
  level?: number
  selectedId?: string | number
  onSelect?: (node: TreeNode) => void
  onExpand?: (node: TreeNode) => void
}

function TreeItem({ node, level = 0, selectedId, onSelect, onExpand }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = (node.children && node.children.length > 0) || node.hasChildren
  const isSelected = selectedId === node.id

  const handleExpand = () => {
    if (!isExpanded && hasChildren) {
      setIsExpanded(true)
      // If children not loaded yet, trigger onExpand callback
      if (!node.children || node.children.length === 0) {
        onExpand?.(node)
      }
    } else if (isExpanded) {
      setIsExpanded(false)
    }
  }

  return (
    <div>
      <div
        className={`tree-node flex items-center gap-2 ${isSelected ? 'selected' : ''}`}
        style={{ paddingRight: `${level * 1.5}rem` }}
        onClick={() => {
          if (hasChildren) {
            handleExpand()
          } else {
            // Only call onSelect for leaf nodes
            onSelect?.(node)
          }
        }}
      >
        {hasChildren && (
          <ChevronLeft 
            className={`tree-chevron w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'expanded rotate-90' : ''}`}
          />
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="flex-1 text-sm font-arabic-sans">{node.label}</span>
        {node.isLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">جاري التحميل...</span>
        )}
      </div>
      
      {hasChildren && isExpanded && node.children && node.children.length > 0 && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onExpand={onExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TreeProps {
  nodes: TreeNode[]
  selectedId?: string | number
  onSelect?: (node: TreeNode) => void
  onExpand?: (node: TreeNode) => void
  className?: string
}

export function Tree({ nodes, selectedId, onSelect, onExpand, className = '' }: TreeProps) {
  return (
    <div className={`space-y-0.5 ${className}`}>
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          onExpand={onExpand}
        />
      ))}
    </div>
  )
}

