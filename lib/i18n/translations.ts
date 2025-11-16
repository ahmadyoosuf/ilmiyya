// Translation strings for Download and Donate pages
import { Language } from './types'

export interface DownloadTranslations {
  title: string
  description: string
  recommendedTitle: string
  downloadButton: string
  showAllDownloads: string
  showRecommendedOnly: string
  detectionMessage: string
  windows64Title: string
  windows64Description: string
  windows32Title: string
  windows32Description: string
  systemRequirementsTitle: string
  requirement1: string
  requirement2: string
  requirement3: string
}

export interface DonateTranslations {
  title: string
  description: string
  donateViaUPI: string
  scanToContribute: string
  downloadQRCode: string
  payUsingUPI: string
  thankYouMessage: string
}

export const downloadTranslations: Record<Language, DownloadTranslations> = {
  en: {
    title: 'Desktop Application',
    description: 'Get the desktop application for Windows and start exploring the Prophetic tradition',
    recommendedTitle: 'Recommended for Your System',
    downloadButton: 'Download for Windows (Recommended)',
    showAllDownloads: 'Show all downloads',
    showRecommendedOnly: 'Show recommended only',
    detectionMessage: "We couldn't detect your system architecture. Please choose the appropriate version below.",
    windows64Title: 'Windows 64-bit (x64)',
    windows64Description: 'For modern Windows systems (Windows 10/11, 64-bit)',
    windows32Title: 'Windows 32-bit (x86)',
    windows32Description: 'For older Windows systems (32-bit)',
    systemRequirementsTitle: 'System Requirements:',
    requirement1: 'Windows 10 or later (64-bit or 32-bit)',
    requirement2: 'Minimum 4GB RAM recommended',
    requirement3: 'At least 500MB free disk space',
  },
  ar: {
    title: 'تطبيق سطح المكتب',
    description: 'احصل على التطبيق المكتبي لنظام ويندوز وابدأ في استكشاف السنة النبوية',
    recommendedTitle: 'الموصى به لنظامك',
    downloadButton: 'تحميل للويندوز (موصى به)',
    showAllDownloads: 'عرض جميع التحميلات',
    showRecommendedOnly: 'عرض الموصى به فقط',
    detectionMessage: 'لم نتمكن من اكتشاف بنية نظامك. يرجى اختيار الإصدار المناسب أدناه.',
    windows64Title: 'ويندوز 64 بت (x64)',
    windows64Description: 'لأنظمة ويندوز الحديثة (ويندوز 10/11، 64 بت)',
    windows32Title: 'ويندوز 32 بت (x86)',
    windows32Description: 'لأنظمة ويندوز القديمة (32 بت)',
    systemRequirementsTitle: 'متطلبات النظام:',
    requirement1: 'ويندوز 10 أو أحدث (64 بت أو 32 بت)',
    requirement2: 'يوصى بذاكرة 4 جيجابايت على الأقل',
    requirement3: '500 ميجابايت على الأقل من مساحة القرص الحرة',
  },
  ta: {
    title: 'டெஸ்க்டாப் செயலி',
    description: 'Windows கணினிக்கான செயலியைப் பெற்று நபிவழி சுன்னாவை ஆராய்ந்திடுங்கள்',
    recommendedTitle: 'உங்கள் கணினிக்கு பரிந்துரைக்கப்பட்டது',
    downloadButton: 'Windows-க்குப் பதிவிறக்கவும் (பரிந்துரைக்கப்பட்டது)',
    showAllDownloads: 'அனைத்து பதிவிறக்கங்களையும் காட்டு',
    showRecommendedOnly: 'பரிந்துரைக்கப்பட்டதை மட்டும் காட்டு',
    detectionMessage: 'உங்கள் கணினி அமைப்பைக் கண்டறிய முடியவில்லை. கீழே பொருத்தமான பதிப்பைத் தேர்ந்தெடுக்கவும்.',
    windows64Title: 'Windows 64-பிட் (x64)',
    windows64Description: 'நவீன Windows கணினிகளுக்கு (Windows 10/11, 64-பிட்)',
    windows32Title: 'Windows 32-பிட் (x86)',
    windows32Description: 'பழைய Windows கணினிகளுக்கு (32-பிட்)',
    systemRequirementsTitle: 'கணினித் தேவைகள்:',
    requirement1: 'Windows 10 அல்லது அதற்கு மேல் (64-பிட் அல்லது 32-பிட்)',
    requirement2: 'குறைந்தபட்சம் 4GB RAM பரிந்துரைக்கப்படுகிறது',
    requirement3: 'குறைந்தபட்சம் 500MB வட்டு இடம் தேவை',
  },
}

export const donateTranslations: Record<Language, DonateTranslations> = {
  en: {
    title: 'Support This Work',
    description: 'Your contributions help maintain and enhance this platform, ensuring Islamic scholarship remains accessible to seekers of knowledge worldwide.',
    donateViaUPI: 'Donate via UPI',
    scanToContribute: 'Scan to contribute or tap to open your payment app.',
    downloadQRCode: 'Download QR Code',
    payUsingUPI: 'Pay using default UPI app',
    thankYouMessage: 'May Allah accept your generosity.',
  },
  ar: {
    title: 'ادعم هذا العمل',
    description: 'مساهماتكم تساعد في صيانة وتطوير هذه المنصة، لضمان بقاء العلم الشرعي متاحاً لطلاب المعرفة في كل مكان.',
    donateViaUPI: 'تبرع عبر UPI',
    scanToContribute: 'امسح للمساهمة أو اضغط لفتح تطبيق الدفع.',
    downloadQRCode: 'تحميل رمز الاستجابة السريعة',
    payUsingUPI: 'ادفع باستخدام تطبيق UPI الافتراضي',
    thankYouMessage: 'تقبل الله منكم.',
  },
  ta: {
    title: 'இப்பணிக்கு உதவுங்கள்',
    description: 'உங்கள் பங்களிப்புகள், இத்தளத்தைப் பராமரிக்கவும் மேம்படுத்தவும் உதவும். இதன் மூலம் இஸ்லாமியக் கல்வி உலகெங்கிலும் உள்ள அறிவுத் தேடப்பாளர்களுக்குத் தொடர்ந்து கிடைக்கும்.',
    donateViaUPI: 'நன்கொடை',
    scanToContribute: 'நன்கொடை அளிக்க ஸ்கேன் செய்யவும் அல்லது உங்கள் பேமெண்ட் செயலியைத் திறக்கவும்.',
    downloadQRCode: 'QR குறியீட்டைப் பதிவிறக்கவும்',
    payUsingUPI: 'UPI செயலி மூலம் செலுத்தவும்',
    thankYouMessage: 'அல்லாஹ் உங்கள் தாராள குணத்தை ஏற்றுக்கொள்வானாக.',
  },
}

