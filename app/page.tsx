import Link from 'next/link'
import { BookOpen, List, Search } from 'lucide-react'
import type { Metadata } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase/server'

// Page-specific SEO metadata (invisible to users - only for search engines)
export const metadata: Metadata = {
  title: "المكتبة العلمية | Ilmiyya - مكتبة إسلامية شاملة",
  description: "المكتبة العلمية Ilmiyya - أفضل مكتبة إسلامية شاملة للبحث في الأحاديث النبوية وكتب الحديث والعقيدة. The best Islamic hadith library with advanced search, topic tree navigation, and authentic hadith collections.",
  keywords: [
    "المكتبة العلمية", "مكتبة إسلامية", "مكتبة الحديث", "كتب الحديث", "أحاديث نبوية",
    "صحيح البخاري", "صحيح مسلم", "السنة النبوية", "البحث في الأحاديث",
    "ilmiyya", "islamic library", "hadith library", "hadith search", "sahih bukhari", "sahih muslim",
  ],
  openGraph: {
    title: "المكتبة العلمية | Ilmiyya",
    description: "مكتبة إسلامية شاملة للبحث في الأحاديث النبوية",
    url: "https://ilmiyya.com",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "المكتبة العلمية" }],
  },
  alternates: {
    canonical: "https://ilmiyya.com",
  },
}

// JSON-LD for SEO (invisible to users)
const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://ilmiyya.com/#homepage",
  name: "المكتبة العلمية - Ilmiyya Islamic Hadith Library",
  description: "Comprehensive Islamic library for hadith research",
  url: "https://ilmiyya.com",
  isPartOf: { "@id": "https://ilmiyya.com/#website" },
}

export const dynamic = 'force-dynamic'

async function recordVisitAndGetCount() {
  const supabase = await getSupabaseServerClient()

  const { error: insertError } = await supabase.from('visits').insert({})
  if (insertError) {
    console.error('Failed to record visit', insertError.message)
  }

  const { count, error: countError } = await supabase
    .from('visits')
    .select('id', { count: 'exact', head: true })

  if (countError) {
    console.error('Failed to fetch visit count', countError.message)
    return 500
  }

  return typeof count === 'number' ? count : 500
}

export default async function HomePage() {
  const visitorCount = await recordVisitAndGetCount()
  const formattedVisitorCount = new Intl.NumberFormat('en-US').format(visitorCount)

  return (
    <>
      {/* SEO JSON-LD - Hidden from users */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6 md:py-12">
        <div className="max-w-4xl w-full space-y-8 md:space-y-12 animate-fade-in">
          {/* Hero Section */}
          <div className="text-center space-y-4 md:space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-2 md:mb-4">
              المكتبة العلمية
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground font-arabic-sans">
              مكتبة إسلامية شاملة للبحث في كتب الحديث والعقيدة
            </p>
            <p className="text-base md:text-lg text-muted-foreground font-arabic-sans max-w-2xl mx-auto">
              استكشف آلاف الكتب والأحاديث المصنفة بدقة، مع إمكانية البحث المتقدم والتصفح حسب المواضيع
            </p>
          </div>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-8">
            {/* Browse Topics */}
            <Link href="/topics" className="group">
              <div className="card p-5 md:p-7 lg:p-8 text-center space-y-3 md:space-y-4 hover:scale-105 transition-transform duration-300 cursor-pointer">
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
              <div className="card p-5 md:p-7 lg:p-8 text-center space-y-3 md:space-y-4 hover:scale-105 transition-transform duration-300 cursor-pointer">
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
              <div className="card p-5 md:p-7 lg:p-8 text-center space-y-3 md:space-y-4 hover:scale-105 transition-transform duration-300 cursor-pointer">
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
          <div className="text-center pt-4 md:pt-8 space-y-2 md:space-y-4">
            <p className="text-sm text-muted-foreground font-arabic-sans">
              مكتبة شاملة تضم آلاف الأحاديث من مصادر موثوقة
            </p>
            <p className="text-xs md:text-sm text-muted-foreground font-arabic-sans">
              <span className="font-semibold text-foreground">{formattedVisitorCount}</span>{' '}
              زائر حتى الآن
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
