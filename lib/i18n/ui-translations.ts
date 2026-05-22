import { Language } from './types'

export interface NavTranslations {
  siteName: string
  topics: string
  books: string
  search: string
  download: string
  donate: string
  about: string
  home: string
}

export interface HomeTranslations {
  title: string
  subtitle: string
  description: string
  browseTopics: string
  browseTopicsDesc: string
  browseBooks: string
  browseBooksDesc: string
  advancedSearch: string
  advancedSearchDesc: string
  footerNote: string
  totalVisitors: string
  visitorCount: string
}

export interface UiTranslations {
  nav: NavTranslations
  home: HomeTranslations
}

export const uiTranslations: Record<Language, UiTranslations> = {
  ar: {
    nav: {
      siteName: 'المكتبة العلمية',
      topics: 'المواضيع',
      books: 'الكتب',
      search: 'البحث',
      download: 'سطح المكتب',
      donate: 'تبرع',
      about: 'عن المشروع',
      home: 'الرئيسية',
    },
    home: {
      title: 'المكتبة العلمية',
      subtitle: 'مكتبة إسلامية شاملة للبحث في كتب الحديث',
      description: 'استكشف آلاف الكتب والأحاديث المصنفة بدقة، مع إمكانية البحث المتقدم والتصفح حسب المواضيع',
      browseTopics: 'تصفح المواضيع',
      browseTopicsDesc: 'ابحث حسب التصنيفات الموضوعية المرتبة هرميًا',
      browseBooks: 'تصفح الكتب',
      browseBooksDesc: 'اطّلع على مجموعة واسعة من كتب الحديث',
      advancedSearch: 'البحث المتقدم',
      advancedSearchDesc: 'ابحث في محتوى الكتب والأحاديث بسرعة ودقة',
      footerNote: 'مكتبة شاملة تضم آلاف الأحاديث من مصادر موثوقة',
      totalVisitors: 'عدد الزوار',
      visitorCount: 'Total visitors',
    },
  },
  en: {
    nav: {
      siteName: 'Ilmiyya Library',
      topics: 'Topics',
      books: 'Books',
      search: 'Search',
      download: 'Desktop App',
      donate: 'Donate',
      about: 'About',
      home: 'Home',
    },
    home: {
      title: 'Ilmiyya Library',
      subtitle: 'A comprehensive Islamic library for hadith research',
      description: 'Explore thousands of carefully classified books and hadiths, with advanced search and topic-based browsing',
      browseTopics: 'Browse Topics',
      browseTopicsDesc: 'Search by hierarchical topic classifications',
      browseBooks: 'Browse Books',
      browseBooksDesc: 'Explore a wide collection of hadith books',
      advancedSearch: 'Advanced Search',
      advancedSearchDesc: 'Search book and hadith content quickly and accurately',
      footerNote: 'A comprehensive library with thousands of hadiths from trusted sources',
      totalVisitors: 'Total visitors',
      visitorCount: 'Total visitors',
    },
  },
  ta: {
    nav: {
      siteName: 'இல்மிய்யா நூலகம்',
      topics: 'தலைப்புகள்',
      books: 'நூல்கள்',
      search: 'தேடல்',
      download: 'டெஸ்க்டாப்',
      donate: 'நன்கொடை',
      about: 'பற்றி',
      home: 'முகப்பு',
    },
    home: {
      title: 'இல்மிய்யா நூலகம்',
      subtitle: 'ஹதீஸ் நூல்களை ஆராய்வதற்கான விரிவான இஸ்லாமிய நூலகம்',
      description: 'மேம்பட்ட தேடல் மற்றும் தலைப்பு அடிப்படையிலான உலாவலுடன், ஆயிரக்கணக்கான நூல்கள் மற்றும் ஹதீஸ்களை ஆராயுங்கள்',
      browseTopics: 'தலைப்புகளை உலாவு',
      browseTopicsDesc: 'படிநிலை வகைப்பாட்டின் அடிப்படையில் தேடுங்கள்',
      browseBooks: 'நூல்களை உலாவு',
      browseBooksDesc: 'ஹதீஸ் நூல்களின் பரந்த தொகுப்பைப் பாருங்கள்',
      advancedSearch: 'மேம்பட்ட தேடல்',
      advancedSearchDesc: 'நூல் மற்றும் ஹதீஸ் உள்ளடக்கத்தை விரைவாகவும் துல்லியமாகவும் தேடுங்கள்',
      footerNote: 'நம்பகமான ஆதாரங்களிலிருந்து ஆயிரக்கணக்கான ஹதீஸ்களைக் கொண்ட விரிவான நூலகம்',
      totalVisitors: 'மொத்த பார்வையாளர்கள்',
      visitorCount: 'Total visitors',
    },
  },
}
