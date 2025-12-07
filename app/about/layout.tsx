import type { Metadata } from 'next'

// SEO Metadata for about page
export const metadata: Metadata = {
    title: "عن المشروع | About Ilmiyya - المكتبة العلمية",
    description: "تعرف على مشروع المكتبة العلمية (Ilmiyya) - منصة مكتبية لدراسة الحديث النبوي الشريف. من فكرة تميم الهندي وتصميم أحمد يوسف. Learn about Ilmiyya Islamic Library project - a desktop platform for hadith study and research. Created by Tamim Al-Hindi and designed by Ahmed Youssef.",
    keywords: [
        "عن المكتبة العلمية", "عن الإلمية", "تميم الهندي", "أحمد يوسف",
        "about ilmiyya", "islamic library project", "hadith research platform",
        "islamic scholarship", "hadith study", "prophetic traditions"
    ],
    openGraph: {
        title: "عن المشروع | About Ilmiyya",
        description: "تعرف على مشروع المكتبة العلمية للحديث النبوي",
        url: "https://ilmiyya.com/about",
        type: "website",
    },
    alternates: {
        canonical: "https://ilmiyya.com/about",
    },
}

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
