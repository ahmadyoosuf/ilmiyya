import { Metadata } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { VisitorDashboard } from '@/components/VisitorDashboard'

export const metadata: Metadata = {
  title: 'Visitor Analytics',
  robots: 'noindex, nofollow',
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function StatsPage() {
  const supabase = await getSupabaseServerClient()
  
  // Fetch analytics data
  let data: any = {
    totalVisitors: 0,
    totalVisits: 0,
    countries: [],
    pages: [],
    dailyStats: [],
    topReferrers: [],
    devices: [],
  }

  try {
    // Try to fetch from visitors table if it exists
    const { data: visitorsData, error } = await supabase
      .from('visitors')
      .select('*', { count: 'exact' })
      .limit(1)

    if (!error && visitorsData) {
      // Table exists, fetch aggregated data
      const [
        { data: dailyData },
        { data: countryData },
        { data: pageData },
        { count: totalCount }
      ] = await Promise.all([
        supabase.from('visitor_daily_stats').select('*').order('date', { ascending: false }).limit(30),
        supabase.from('visitor_country_stats').select('*'),
        supabase.from('visitor_page_stats').select('*'),
        supabase.from('visitors').select('*', { count: 'exact', head: true })
      ])

      data = {
        totalVisitors: totalCount || 0,
        totalVisits: totalCount || 0,
        countries: countryData || [],
        pages: pageData || [],
        dailyStats: dailyData || [],
        topReferrers: [],
        devices: [],
      }
    }
  } catch (error) {
    console.error('Error fetching visitor analytics:', error)
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Visitor Analytics</h1>
          <p className="text-muted-foreground">Comprehensive visitor statistics for ilmiyya.com</p>
        </div>

        <VisitorDashboard data={data} />
      </div>
    </main>
  )
}
