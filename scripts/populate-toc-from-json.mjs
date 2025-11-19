// Script to populate TOC data from book JSON files
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ycmylngpaxkuksbgapfl.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbXlsbmdwYXhrdWtzYmdhcGZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYyNDUxOSwiZXhwIjoyMDc4MjAwNTE5fQ.rJmE--HE58G37GwTKtgUGH-QesYVOPzo5qL3UXdQICo'
)

const BOOKS_DIR = 'C:\\Users\\Abdul\\Downloads\\ilmiyyah-db\\أقسام الكتب'

async function populateTOC() {
  console.log('🔍 Finding book JSON files...\n')
  
  // Get all books from database
  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, file_path')
    .is('toc', null) // Only books without TOC
  
  if (error) {
    console.error('Error fetching books:', error)
    return
  }
  
  console.log(`Found ${books.length} books without TOC data\n`)
  
  let updated = 0
  let skipped = 0
  let errors = 0
  
  for (const book of books) {
    try {
      // Construct JSON file path from file_path
      // file_path format: "أقسام الكتب/01 الصحاح الستة/سنن ابن ماجه.json"
      const jsonPath = join(BOOKS_DIR, '..', book.file_path)
      
      // Check if file exists
      try {
        statSync(jsonPath)
      } catch {
        console.log(`⚠️  File not found: ${book.file_path}`)
        skipped++
        continue
      }
      
      // Read JSON file
      const jsonContent = readFileSync(jsonPath, 'utf8')
      const bookData = JSON.parse(jsonContent)
      
      if (!bookData.toc || !Array.isArray(bookData.toc)) {
        console.log(`⚠️  No TOC in file: ${book.title}`)
        skipped++
        continue
      }
      
      // Update book with TOC
      const { error: updateError } = await supabase
        .from('books')
        .update({ toc: bookData.toc })
        .eq('id', book.id)
      
      if (updateError) {
        console.error(`❌ Error updating ${book.title}:`, updateError.message)
        errors++
      } else {
        console.log(`✅ Updated: ${book.title} (${bookData.toc.length} TOC entries)`)
        updated++
      }
      
      // Rate limiting - don't hammer the database
      if (updated % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
    } catch (err) {
      console.error(`❌ Error processing ${book.title}:`, err.message)
      errors++
    }
  }
  
  console.log('\n📊 Summary:')
  console.log(`   ✅ Updated: ${updated}`)
  console.log(`   ⚠️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`   Total: ${books.length}`)
}

console.log('🚀 Starting TOC population...\n')
console.log(`📁 Looking for JSON files in: ${BOOKS_DIR}\n`)

populateTOC().catch(console.error)

