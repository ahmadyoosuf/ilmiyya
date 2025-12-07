'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  labelClassName?: string
}

function TreeItem({ node, level = 0, selectedId, onSelect, onExpand, labelClassName }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUserCollapsed, setIsUserCollapsed] = useState(false)
  const hasChildren = (node.children && node.children.length > 0) || node.hasChildren
  const isSelected = selectedId === node.id
  const nodeRef = useRef<HTMLDivElement>(null)
  const hasSelectedDescendant = useMemo(() => {
    if (!hasChildren || selectedId === undefined) return false

    const containsSelected = (currentNode: TreeNode): boolean => {
      if (!currentNode.children) return false
      return currentNode.children.some((child) => {
        if (child.id === selectedId) return true
        return containsSelected(child)
      })
    }

    return containsSelected(node)
  }, [hasChildren, node, selectedId])

  const handleExpand = () => {
    if (!isExpanded && hasChildren) {
      setIsUserCollapsed(false)
      setIsExpanded(true)
      // If children not loaded yet, trigger onExpand callback
      if (!node.children || node.children.length === 0) {
        onExpand?.(node)
      }
    } else if (isExpanded) {
      setIsUserCollapsed(true)
      setIsExpanded(false)
    }
  }

  useEffect(() => {
    if (hasSelectedDescendant && !isExpanded && !isUserCollapsed) {
      setIsExpanded(true)
    }
  }, [hasSelectedDescendant, isExpanded, isUserCollapsed])

  useEffect(() => {
    // Reset user collapse preference when selection changes (e.g. navigating pages)
    setIsUserCollapsed(false)
  }, [selectedId])

  useEffect(() => {
    if (isSelected && nodeRef.current) {
      nodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
    }
  }, [isSelected])

  return (
    <div>
      <div
        className={`tree-node flex items-center gap-2 ${isSelected ? 'selected' : ''}`}
        style={{ paddingRight: `${level * 1.5}rem` }}
        ref={nodeRef}
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
        <span className={`flex-1 text-sm ${labelClassName ?? 'font-arabic-sans'}`}>{node.label}</span>
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
  labelClassName?: string
}

export function Tree({ nodes, selectedId, onSelect, onExpand, className = '', labelClassName }: TreeProps) {
  return (
    <div className={`space-y-0.5 ${className}`}>
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          onExpand={onExpand}
          labelClassName={labelClassName}
        />
      ))}
    </div>
  )
}

