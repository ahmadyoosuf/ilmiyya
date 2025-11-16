'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Topic = Database['public']['Tables']['topics']['Row']

interface TopicWithMeta extends Topic {
  childrenLoaded?: boolean
  hasChildren?: boolean
}

interface TreeNode {
  id: string | number
  label: string
  data?: any
  isLoading?: boolean
  hasChildren?: boolean
  children?: TreeNode[]
}

interface TopicsCache {
  topics: Map<number, TopicWithMeta>
  childrenMap: Map<number, number[]> // parentId -> childIds
  childCountMap: Map<number, number> // topicId -> child count
  rootTopicIds: number[]
}

export function useTopicsData() {
  const [cache, setCache] = useState<TopicsCache>({
    topics: new Map(),
    childrenMap: new Map(),
    childCountMap: new Map(),
    rootTopicIds: [],
  })
  
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [loadingNodeIds, setLoadingNodeIds] = useState<Set<number>>(new Set())
  const supabase = getSupabaseBrowserClient()
  
  // Track which nodes we've started prefetching for
  const prefetchedIds = useRef<Set<number>>(new Set())
  const backgroundLoadingRef = useRef(false)

  // Initialize: Load root topics immediately
  useEffect(() => {
    async function loadRootTopics() {
      setIsInitialLoading(true)
      
      const { data: rootTopics, error } = await supabase
        .from('topics')
        .select('*')
        .is('parent_id', null)
        .order('id')

      if (error || !rootTopics) {
        setIsInitialLoading(false)
        return
      }

      // Count children for each root topic (parallel)
      const childCounts = await Promise.all(
        rootTopics.map(async (topic) => {
          const { count } = await supabase
            .from('topics')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', topic.id)
          return { id: topic.id, count: count || 0 }
        })
      )

      const newCache: TopicsCache = {
        topics: new Map(),
        childrenMap: new Map(),
        childCountMap: new Map(),
        rootTopicIds: rootTopics.map(t => t.id),
      }

      rootTopics.forEach((topic, idx) => {
        newCache.topics.set(topic.id, {
          ...topic,
          hasChildren: childCounts[idx].count > 0,
          childrenLoaded: false,
        })
        newCache.childCountMap.set(topic.id, childCounts[idx].count)
      })

      setCache(newCache)
      setIsInitialLoading(false)

      // Start background loading of all topics
      if (!backgroundLoadingRef.current) {
        backgroundLoadingRef.current = true
        loadAllTopicsInBackground(newCache)
      }
    }

    loadRootTopics()
  }, [supabase])

  // Background loading: Fetch all topics in batches (non-blocking)
  const loadAllTopicsInBackground = useCallback(async (currentCache: TopicsCache) => {
    const batchSize = 1000
    let from = 0
    const updatedCache = { ...currentCache }

    while (true) {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .not('parent_id', 'is', null)
        .order('parent_id', { ascending: true })
        .order('id', { ascending: true })
        .range(from, from + batchSize - 1)

      if (error || !data || data.length === 0) break

      // Group by parent_id
      const childrenByParent = new Map<number, number[]>()
      
      data.forEach(topic => {
        updatedCache.topics.set(topic.id, {
          ...topic,
          childrenLoaded: false,
        })

        if (topic.parent_id) {
          if (!childrenByParent.has(topic.parent_id)) {
            childrenByParent.set(topic.parent_id, [])
          }
          childrenByParent.get(topic.parent_id)!.push(topic.id)
        }
      })

      // Update children map
      childrenByParent.forEach((childIds, parentId) => {
        const existing = updatedCache.childrenMap.get(parentId) || []
        updatedCache.childrenMap.set(parentId, [...existing, ...childIds])
        updatedCache.childCountMap.set(parentId, childIds.length)
      })

      // Update state with new batch
      setCache({ ...updatedCache })

      if (data.length < batchSize) break
      from += batchSize

      // Small delay to avoid blocking UI
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }, [supabase])

  // Load children for a specific topic (optimistic)
  const loadChildren = useCallback(async (topicId: number): Promise<TreeNode[]> => {
    // Check if already cached
    const cachedChildIds = cache.childrenMap.get(topicId)
    if (cachedChildIds && cachedChildIds.length > 0) {
      // Return from cache instantly
      return cachedChildIds.map(childId => {
        const topic = cache.topics.get(childId)!
        const childCount = cache.childCountMap.get(childId) || 0
        return {
          id: topic.id,
          label: topic.title,
          data: topic,
          hasChildren: childCount > 0,
          children: undefined,
        }
      })
    }

    // Not in cache yet, fetch from database
    setLoadingNodeIds(prev => new Set(prev).add(topicId))

    const { data: children, error } = await supabase
      .from('topics')
      .select('*')
      .eq('parent_id', topicId)
      .order('id')

    setLoadingNodeIds(prev => {
      const next = new Set(prev)
      next.delete(topicId)
      return next
    })

    if (error || !children) {
      return []
    }

    // Update cache
    const newCache = { ...cache }
    const childIds: number[] = []

    const childNodes = await Promise.all(
      children.map(async (child) => {
        newCache.topics.set(child.id, {
          ...child,
          childrenLoaded: false,
        })
        childIds.push(child.id)

        // Check child count (may already be cached)
        let childCount = newCache.childCountMap.get(child.id)
        if (childCount === undefined) {
          const { count } = await supabase
            .from('topics')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', child.id)
          childCount = count || 0
          newCache.childCountMap.set(child.id, childCount)
        }

        return {
          id: child.id,
          label: child.title,
          data: child,
          hasChildren: childCount > 0,
          children: undefined,
        }
      })
    )

    newCache.childrenMap.set(topicId, childIds)
    setCache(newCache)

    // Prefetch grandchildren for immediate children (smart prefetching)
    prefetchGrandchildren(childIds)

    return childNodes
  }, [cache, supabase])

  // Prefetch grandchildren in background
  const prefetchGrandchildren = useCallback(async (childIds: number[]) => {
    for (const childId of childIds) {
      if (prefetchedIds.current.has(childId)) continue
      prefetchedIds.current.add(childId)

      // Small delay between prefetches
      setTimeout(async () => {
        const { data: grandchildren } = await supabase
          .from('topics')
          .select('*')
          .eq('parent_id', childId)
          .order('id')

        if (grandchildren && grandchildren.length > 0) {
          setCache(prevCache => {
            const newCache = { ...prevCache }
            const grandchildIds: number[] = []

            grandchildren.forEach(gc => {
              newCache.topics.set(gc.id, {
                ...gc,
                childrenLoaded: false,
              })
              grandchildIds.push(gc.id)
            })

            newCache.childrenMap.set(childId, grandchildIds)
            newCache.childCountMap.set(childId, grandchildren.length)

            return newCache
          })
        }
      }, 100)
    }
  }, [supabase])

  // Build tree nodes from cache
  const buildTreeNodes = useCallback((parentId: number | null = null): TreeNode[] => {
    const ids = parentId === null ? cache.rootTopicIds : cache.childrenMap.get(parentId) || []
    
    return ids.map(id => {
      const topic = cache.topics.get(id)
      if (!topic) return null
      
      const childCount = cache.childCountMap.get(id) || 0
      const childIds = cache.childrenMap.get(id) || []
      
      return {
        id: topic.id,
        label: topic.title,
        data: topic,
        hasChildren: childCount > 0,
        isLoading: loadingNodeIds.has(id),
        children: childIds.length > 0 ? buildTreeNodes(id) : undefined,
      }
    }).filter(Boolean) as TreeNode[]
  }, [cache, loadingNodeIds])

  // Get topic by ID from cache
  const getTopic = useCallback((id: number): Topic | undefined => {
    return cache.topics.get(id)
  }, [cache])

  // Search topics (uses cache when possible)
  const searchTopics = useCallback(async (query: string, limit: number = 50): Promise<Topic[]> => {
    if (!query.trim()) return []

    // Try to search in cache first for instant results
    const cacheResults = Array.from(cache.topics.values())
      .filter(topic => topic.title.includes(query))
      .slice(0, limit)

    if (cacheResults.length >= 10) {
      return cacheResults
    }

    // Fallback to database search
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(limit)

    return data || []
  }, [cache, supabase])

  return {
    isInitialLoading,
    loadingNodeIds,
    loadChildren,
    buildTreeNodes,
    getTopic,
    searchTopics,
    cache,
  }
}


