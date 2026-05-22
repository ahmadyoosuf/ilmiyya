import type { Metadata } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { HomeContent } from '@/components/HomeContent'

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

  return (
    <>
      {/* SEO JSON-LD - Hidden from users */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <HomeContent visitorCount={visitorCount} />
    </>
  )
}
