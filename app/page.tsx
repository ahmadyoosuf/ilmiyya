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

async function recordVisitAndGetCount(headers: Headers) {
  const supabase = await getSupabaseServerClient()

  // Get IP address from headers
  const forwarded = headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : headers.get('x-real-ip') || 'unknown'
  
  // Get user agent for better uniqueness
  const userAgent = headers.get('user-agent') || 'unknown'
  
  // Check if this IP has visited in the last 24 hours
  const oneDayAgo = new Date()
  oneDayAgo.setHours(oneDayAgo.getHours() - 24)
  
  const { data: recentVisit } = await supabase
    .from('visits')
    .select('id')
    .eq('ip_address' as any, ip)
    .gte('created_at', oneDayAgo.toISOString())
    .limit(1)
    .maybeSingle()

  // Only record if no recent visit from this IP
  if (!recentVisit) {
    const { error: insertError } = await supabase.from('visits').insert({
      ip_address: ip,
      user_agent: userAgent
    } as any)
    if (insertError) {
      console.error('Failed to record visit', insertError.message)
    }
  }

  // Get total unique visitors count
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
  const { headers } = await import('next/headers')
  const headersList = await headers()
  const visitorCount = await recordVisitAndGetCount(headersList)
  const formattedVisitorCount = new Intl.NumberFormat('en-US').format(visitorCount)

  return (
    <>
      {/* SEO JSON-LD - Hidden from users */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <div className="min-h-screen flex flex-col items-center md:justify-center px-4 pt-6 pb-24 md:py-12" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-4xl w-full space-y-6 md:space-y-12 animate-fade-in">
          {/* Hero Section */}
          <div className="text-center space-y-3 md:space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground">
              المكتبة العلمية
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground font-arabic-sans">
              مكتبة إسلامية شاملة للبحث في كتب الحديث
            </p>
            <p className="text-sm md:text-lg text-muted-foreground font-arabic-sans max-w-2xl mx-auto hidden md:block">
              استكشف آلاف الكتب والأحاديث المصنفة بدقة، مع إمكانية البحث المتقدم والتصفح حسب المواضيع
            </p>
          </div>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-3 gap-3 md:gap-6">
            {/* Browse Topics */}
            <Link href="/topics" className="group">
              <div className="card p-4 md:p-7 lg:p-8 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="flex items-center gap-3 md:flex-col md:text-center md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                    <List className="w-6 h-6 md:w-8 md:h-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                  </div>
                  <div className="flex-1 md:flex-none">
                    <h2 className="text-lg md:text-2xl font-bold font-arabic-sans">تصفح المواضيع</h2>
                    <p className="text-sm md:text-base text-muted-foreground font-arabic-sans hidden md:block mt-2">
                      ابحث حسب التصنيفات الموضوعية المرتبة هرميًا
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Browse Books */}
            <Link href="/books" className="group">
              <div className="card p-4 md:p-7 lg:p-8 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="flex items-center gap-3 md:flex-col md:text-center md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                    <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                  </div>
                  <div className="flex-1 md:flex-none">
                    <h2 className="text-lg md:text-2xl font-bold font-arabic-sans">تصفح الكتب</h2>
                    <p className="text-sm md:text-base text-muted-foreground font-arabic-sans hidden md:block mt-2">
                      اطّلع على مجموعة واسعة من كتب الحديث
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Search */}
            <Link href="/search" className="group">
              <div className="card p-4 md:p-7 lg:p-8 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="flex items-center gap-3 md:flex-col md:text-center md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                    <Search className="w-6 h-6 md:w-8 md:h-8 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                  </div>
                  <div className="flex-1 md:flex-none">
                    <h2 className="text-lg md:text-2xl font-bold font-arabic-sans">البحث المتقدم</h2>
                    <p className="text-sm md:text-base text-muted-foreground font-arabic-sans hidden md:block mt-2">
                      ابحث في محتوى الكتب والأحاديث بسرعة ودقة
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats or Additional Info */}
          <div className="text-center space-y-1 md:space-y-4">
            <p className="text-sm md:text-sm text-muted-foreground font-arabic-sans hidden md:block">
              مكتبة شاملة تضم آلاف الأحاديث من مصادر موثوقة
            </p>
            <p className="text-sm md:text-sm text-muted-foreground flex flex-wrap items-center justify-center gap-x-1">
              <span className="font-semibold text-foreground">{formattedVisitorCount}</span>
              <span>Total visitors</span>
              <span aria-hidden>/</span>
              <span className="font-arabic-sans" dir="auto">
                عدد الزوار
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
