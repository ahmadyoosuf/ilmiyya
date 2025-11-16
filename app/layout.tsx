import type { Metadata } from "next"
import { Amiri, Tajawal } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/Header"
import { BottomNav } from "@/components/BottomNav"
import "./globals.css"

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
})

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-arabic-sans",
})

export const metadata: Metadata = {
  title: "المكتبة العلمية - Islamic Library",
  description: "مكتبة إسلامية شاملة للبحث في كتب الحديث والعقيدة",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-theme="sepia">
      <body className={`${amiri.variable} ${tajawal.variable} font-arabic antialiased`}>
        <Header />
        <main className="pb-24 md:pb-0 min-h-screen">{children}</main>
        <BottomNav />
        <Analytics />
      </body>
    </html>
  )
}
