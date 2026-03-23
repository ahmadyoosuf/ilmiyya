'use client'

import { useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUp, Users, MousePointerClick, Globe } from 'lucide-react'

interface VisitorData {
  totalVisitors: number
  totalVisits: number
  countries: Array<{
    country_code: string
    country_name: string
    unique_visitors: number
    total_visits: number
    percentage: number
  }>
  pages: Array<{
    page_path: string
    unique_visitors: number
    total_visits: number
    referrer_count: number
    percentage: number
  }>
  dailyStats: Array<{
    date: string
    unique_visitors: number
    total_visits: number
    countries: number
    unique_ips: number
  }>
  topReferrers: any[]
  devices: any[]
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export function VisitorDashboard({ data }: { data: VisitorData }) {
  const stats = useMemo(() => ({
    avgVisitorsPerDay: data.dailyStats.length > 0 
      ? Math.round(data.totalVisitors / Math.max(data.dailyStats.length, 1))
      : 0,
    topCountry: data.countries[0],
    topPage: data.pages[0],
    countryCount: data.countries.length,
    pageCount: data.pages.length,
  }), [data])

  const visitorTrend = data.dailyStats.slice().reverse()
  const countryChartData = data.countries.slice(0, 8)
  const pageChartData = data.pages.slice(0, 10)

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Unique Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {stats.avgVisitorsPerDay} per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointerClick className="w-4 h-4" />
              Total Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalVisitors > 0 ? (data.totalVisits / data.totalVisitors).toFixed(1) : 0} views per visitor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.countryCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.topCountry ? `Top: ${stats.topCountry.country_name}` : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUp className="w-4 h-4" />
              Pages Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pageCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.topPage ? `Top: ${stats.topPage.page_path}` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visitor Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Trend (Last 30 Days)</CardTitle>
            <CardDescription>Daily unique visitor count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitorTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="unique_visitors" 
                  stroke="#3b82f6"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries by Visitors</CardTitle>
            <CardDescription>Geographic distribution of visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="country_code" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="unique_visitors" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Country Distribution (Pie) */}
        {countryChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Visitor Distribution by Country</CardTitle>
              <CardDescription>Percentage breakdown of traffic</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={countryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ country_code, percentage }) => `${country_code} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_visits"
                  >
                    {countryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages by Traffic</CardTitle>
            <CardDescription>Most visited pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pageChartData.slice(0, 8).map((page, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.page_path || '/'}</p>
                    <p className="text-xs text-muted-foreground">{page.unique_visitors} visitors</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-semibold">{page.total_visits}</p>
                    <p className="text-xs text-muted-foreground">{page.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Country Table */}
      {data.countries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Country Statistics</CardTitle>
            <CardDescription>Complete visitor breakdown by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Country</th>
                    <th className="text-right py-3 px-4 font-semibold">Unique Visitors</th>
                    <th className="text-right py-3 px-4 font-semibold">Total Visits</th>
                    <th className="text-right py-3 px-4 font-semibold">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.countries.map((country, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{country.country_code}</span>
                          <span className="text-muted-foreground">{country.country_name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{country.unique_visitors.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">{country.total_visits.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 font-medium">{country.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
