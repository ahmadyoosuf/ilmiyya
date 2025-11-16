import Link from 'next/link'
import { BookOpen, List, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-12 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4">
            المكتبة العلمية
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-arabic-sans">
            مكتبة إسلامية شاملة للبحث في كتب الحديث والعقيدة
          </p>
          <p className="text-lg text-muted-foreground font-arabic-sans max-w-2xl mx-auto">
            استكشف آلاف الكتب والأحاديث المصنفة بدقة، مع إمكانية البحث المتقدم والتصفح حسب المواضيع
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-3 gap-6 pt-8">
          {/* Browse Topics */}
          <Link href="/topics" className="group">
            <div className="card p-8 text-center space-y-4 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <List className="w-8 h-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold font-arabic-sans">تصفح المواضيع</h2>
              <p className="text-muted-foreground font-arabic-sans">
                ابحث حسب التصنيفات الموضوعية المرتبة هرميًا
              </p>
            </div>
          </Link>

          {/* Browse Books */}
          <Link href="/books" className="group">
            <div className="card p-8 text-center space-y-4 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <BookOpen className="w-8 h-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold font-arabic-sans">تصفح الكتب</h2>
              <p className="text-muted-foreground font-arabic-sans">
                اطّلع على مجموعة واسعة من كتب الحديث والعقيدة
              </p>
            </div>
          </Link>

          {/* Search */}
          <Link href="/search" className="group">
            <div className="card p-8 text-center space-y-4 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <Search className="w-8 h-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold font-arabic-sans">البحث المتقدم</h2>
              <p className="text-muted-foreground font-arabic-sans">
                ابحث في محتوى الكتب والأحاديث بسرعة ودقة
              </p>
            </div>
          </Link>
        </div>

        {/* Stats or Additional Info */}
        <div className="text-center pt-8 space-y-4">
          <p className="text-sm text-muted-foreground font-arabic-sans">
            مكتبة شاملة تضم آلاف الأحاديث من مصادر موثوقة
          </p>
        </div>
      </div>
    </div>
  )
}

