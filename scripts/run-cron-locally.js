/**
 * Local Cron Job Runner
 * 
 * This script runs the auto-process job every hour locally for testing.
 * In production, use Railway Cron or similar service.
 */

const CRON_INTERVAL = 60 * 60 * 1000 // 1 hour in milliseconds
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function runCronJob() {
  console.log('\n🕐 Running auto-process cron job...')
  console.log('⏰ Time:', new Date().toISOString())
  
  try {
    const response = await fetch(`${API_URL}/api/cron/auto-process`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'dev-secret-change-in-production'}`
      }
    })

    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Cron job completed successfully!')
      console.log(`   📺 New videos found: ${data.newVideosFound}`)
      console.log(`   📚 Lessons created: ${data.lessonsCreated}`)
      
      if (data.lessons && data.lessons.length > 0) {
        console.log('\n   New lessons:')
        data.lessons.forEach((lesson, i) => {
          console.log(`   ${i + 1}. ${lesson.title} (${lesson.questionsCount} questions)`)
        })
      }
    } else {
      console.error('❌ Cron job failed:', data)
    }
  } catch (error) {
    console.error('❌ Error running cron job:', error.message)
  }
  
  console.log(`\n⏳ Next run in 1 hour (at ${new Date(Date.now() + CRON_INTERVAL).toLocaleTimeString()})`)
}

// Run immediately on start
console.log('🚀 Starting local cron job runner...')
console.log(`📍 API URL: ${API_URL}`)
console.log(`⏱️  Interval: Every 1 hour`)
console.log('─────────────────────────────────────')

runCronJob()

// Then run every hour
setInterval(runCronJob, CRON_INTERVAL)
