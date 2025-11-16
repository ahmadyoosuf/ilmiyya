'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Category = Database['public']['Tables']['categories']['Row']

export default function BooksPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true)
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name_ar')
      
      if (data) {
        setCategories(data)
      }
      setIsLoading(false)
    }
    fetchCategories()
  }, [supabase])

  const handleCategorySelect = (categoryId: number) => {
    router.push(`/books/category/${categoryId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8 animate-entrance">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">الكتب</h1>
          <p className="text-lg text-muted-foreground font-arabic-sans">
            اختر تصنيفًا لتصفح الكتب المتوفرة
          </p>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 h-32 animate-pulse bg-muted" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-arabic-sans">
              لا توجد تصنيفات متوفرة
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="card p-8 text-center hover:shadow-lg hover:bg-muted transition-all animate-entrance group cursor-pointer"
              >
                <h3 className="text-xl md:text-2xl font-bold font-arabic-sans group-hover:text-accent transition-colors">
                  {category.name_ar}
                </h3>
                <p className="text-sm text-muted-foreground font-arabic-sans mt-2">
                  انقر لعرض الكتب
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

