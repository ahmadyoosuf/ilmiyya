/**
 * Sanitizes Arabic text by removing unusual characters and English letters
 * that may appear as artifacts in the data.
 */
export function sanitizeArabicText(text: string): string {
  return text
    // Remove § and similar unusual symbols often appearing as data artifacts
    .replace(/[§¶†‡•◊¬]/g, '')
    // Remove all English letters (A-Z, a-z) since content is fully Arabic
    .replace(/[A-Za-z]+/g, '')
    // Clean up any double spaces left behind
    .replace(/\s{2,}/g, ' ')
    .trim()
}
