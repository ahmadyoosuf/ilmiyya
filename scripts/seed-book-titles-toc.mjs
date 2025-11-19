// Script to populate TOC data from the "title" array in book JSON files
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, basename } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ycmylngpaxkuksbgapfl.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbXlsbmdwYXhrdWtzYmdhcGZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYyNDUxOSwiZXhwIjoyMDc4MjAwNTE5fQ.rJmE--HE58G37GwTKtgUGH-QesYVOPzo5qL3UXdQICo'
)

const BOOKS_ROOT = 'C:\\Users\\Abdul\\Downloads\\ilmiyyah-db'

// Recursively find all JSON files
function findAllJsonFiles(dir, baseDir = dir) {
  let jsonFiles = []
  
  try {
    const items = readdirSync(dir)
    
    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        jsonFiles = jsonFiles.concat(findAllJsonFiles(fullPath, baseDir))
      } else if (item.endsWith('.json')) {
        // Store relative path from base directory
        const relativePath = fullPath.substring(baseDir.length + 1)
        jsonFiles.push({ fullPath, relativePath })
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message)
  }
  
  return jsonFiles
}

async function seedBookTOCs() {
  console.log('🔍 Finding all book JSON files...\n')
  
  const jsonFiles = findAllJsonFiles(BOOKS_ROOT)
  console.log(`Found ${jsonFiles.length} JSON files\n`)
  
  // Get all books from database
  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, file_path')
  
  if (error) {
    console.error('❌ Error fetching books:', error)
    return
  }
  
  console.log(`Found ${books.length} books in database\n`)
  
  // Create a map of file_path to book for quick lookup
  const booksByPath = new Map()
  books.forEach(book => {
    // Normalize path separators
    const normalizedPath = book.file_path.replace(/\\/g, '/')
    booksByPath.set(normalizedPath, book)
  })
  
  let updated = 0
  let skipped = 0
  let errors = 0
  let noTitle = 0
  
  console.log('🚀 Processing books...\n')
  
  for (const { fullPath, relativePath } of jsonFiles) {
    try {
      // Normalize path for comparison
      const normalizedRelPath = relativePath.replace(/\\/g, '/')
      
      // Find matching book in database
      const book = booksByPath.get(normalizedRelPath)
      
      if (!book) {
        console.log(`⚠️  No DB match for: ${relativePath}`)
        skipped++
        continue
      }
      
      // Read and parse JSON file
      console.log(`📖 Processing: ${book.title}`)
      const jsonContent = readFileSync(fullPath, 'utf8')
      const bookData = JSON.parse(jsonContent)
      
      // Check if "title" array exists (the TOC array)
      if (!bookData.title || !Array.isArray(bookData.title)) {
        console.log(`   ⚠️  No "title" array found, skipping`)
        noTitle++
        continue
      }
      
      const tocArray = bookData.title
      
      if (tocArray.length === 0) {
        console.log(`   ⚠️  Empty "title" array, skipping`)
        noTitle++
        continue
      }
      
      // Update book with TOC from "title" array
      const { error: updateError } = await supabase
        .from('books')
        .update({ toc: tocArray })
        .eq('id', book.id)
      
      if (updateError) {
        console.error(`   ❌ Error updating: ${updateError.message}`)
        errors++
      } else {
        console.log(`   ✅ Updated with ${tocArray.length} TOC entries`)
        updated++
      }
      
      // Rate limiting - batch updates
      if (updated % 50 === 0 && updated > 0) {
        console.log(`\n⏸️  Processed ${updated} books, pausing briefly...\n`)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
    } catch (err) {
      console.error(`❌ Error processing ${relativePath}:`, err.message)
      errors++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 FINAL SUMMARY')
  console.log('='.repeat(60))
  console.log(`   ✅ Successfully updated: ${updated}`)
  console.log(`   ⚠️  Skipped (no DB match): ${skipped}`)
  console.log(`   ⚠️  No title array: ${noTitle}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`   📚 Total files processed: ${jsonFiles.length}`)
  console.log('='.repeat(60))
  
  if (updated > 0) {
    console.log('\n🎉 Success! Running verification...\n')
    await verifyTOCs()
  }
}

async function verifyTOCs() {
  const { count: withToc } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .not('toc', 'is', null)
  
  const { count: totalBooks } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
  
  console.log('✅ Verification Results:')
  console.log(`   Books with TOC: ${withToc}/${totalBooks}`)
  
  if (withToc === totalBooks) {
    console.log('\n🎉 Perfect! All books now have TOC data!')
  } else {
    console.log(`\n⚠️  ${totalBooks - withToc} books still missing TOC`)
  }
  
  // Show sample
  const { data: samples } = await supabase
    .from('books')
    .select('title, toc')
    .not('toc', 'is', null)
    .limit(3)
  
  if (samples && samples.length > 0) {
    console.log('\n📖 Sample books with TOC:')
    samples.forEach((book, i) => {
      const tocCount = Array.isArray(book.toc) ? book.toc.length : 0
      console.log(`   ${i + 1}. ${book.title} (${tocCount} entries)`)
      if (tocCount > 0) {
        console.log(`      First: "${book.toc[0].tit || book.toc[0].title || 'N/A'}"`)
      }
    })
  }
}

console.log('🚀 Starting Book TOC Seeding...')
console.log(`📁 Source directory: ${BOOKS_ROOT}\n`)

seedBookTOCs().catch(console.error)

