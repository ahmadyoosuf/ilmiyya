import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

interface TrackingData {
  sessionId: string
  page_path: string
  referrer: string | null
  user_agent: string
  timestamp: string
}

async function getGeoData(ip: string): Promise<{ country_code: string; country_name: string; city: string } | null> {
  try {
    // Try to use ipapi.com or similar service
    // For now, we'll use a simple approach - you can upgrade to a paid service later
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) return null

    const data = await response.json()
    return {
      country_code: data.country_code || null,
      country_name: data.country_name || null,
      city: data.city || null,
    }
  } catch (error) {
    console.error('Error fetching geo data:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingData = await request.json()
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     request.headers.get('x-real-ip') ||
                     request.ip ||
                     'unknown'

    // Get geographic data
    const geoData = await getGeoData(clientIp)

    const supabase = await getSupabaseServerClient()

    // Check if visitors table exists
    const { error: checkError } = await supabase
      .from('visitors')
      .select('id', { count: 'exact', head: true })
      .limit(1)

    if (checkError) {
      // Table doesn't exist yet, just return success
      return NextResponse.json({ success: true, message: 'Tracking table not yet created' })
    }

    // Insert visitor record
    const { error } = await supabase
      .from('visitors')
      .insert({
        session_id: body.sessionId,
        ip_address: clientIp,
        country_code: geoData?.country_code || null,
        country_name: geoData?.country_name || null,
        city: geoData?.city || null,
        user_agent: body.user_agent.substring(0, 500), // Limit length
        page_path: body.page_path,
        referrer: body.referrer ? body.referrer.substring(0, 500) : null,
        timestamp: body.timestamp,
      })

    if (error) {
      console.error('Error tracking visitor:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in track-visitor:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
