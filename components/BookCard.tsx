import Link from 'next/link'
import { BookOpen } from 'lucide-react'

interface BookCardProps {
  id: string
  title: string
  categoryName?: string
}

export function BookCard({ id, title, categoryName }: BookCardProps) {
  return (
    <Link href={`/books/${id}`} className="block group">
      <div className="card p-6 h-full transition-all duration-300 hover:shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
            <BookOpen className="w-6 h-6 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-accent transition-colors">
              {title}
            </h3>
            {categoryName && (
              <p className="text-sm text-muted-foreground font-arabic-sans">
                {categoryName}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

