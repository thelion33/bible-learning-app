/**
 * Script to regenerate AI-powered lesson titles for existing lessons
 * Run with: npx tsx scripts/regenerate-lesson-titles.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

async function regenerateLessonTitles() {
  console.log('🔄 Starting lesson title regeneration...\n')

  // Get all lessons with their videos and questions
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      summary,
      key_themes,
      video:videos (
        title,
        description
      ),
      questions (
        question_text,
        type
      )
    `)

  if (error || !lessons) {
    console.error('❌ Error fetching lessons:', error)
    return
  }

  console.log(`📚 Found ${lessons.length} lessons to process\n`)

  for (const lesson of lessons) {
    console.log(`Processing: ${lesson.title}`)

    // Create a prompt to generate a concise lesson title
    const questionSummary = lesson.questions
      ?.slice(0, 3)
      .map((q: any) => `- ${q.question_text}`)
      .join('\n') || ''

    const prompt = `Based on this church message content, generate a concise, engaging lesson title (4-8 words) that captures the core teaching:

VIDEO TITLE: ${lesson.video?.title || lesson.title}
SUMMARY: ${lesson.summary}
KEY THEMES: ${lesson.key_themes?.join(', ')}

SAMPLE QUESTIONS:
${questionSummary}

Generate ONLY the lesson title, nothing else. Make it engaging and focused on the spiritual teaching.`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating concise, engaging titles for Bible study lessons. Generate only the title, nothing else.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 50,
      })

      const newTitle = response.choices[0]?.message?.content?.trim()

      if (newTitle) {
        // Update the lesson with the new title
        const { error: updateError } = await supabase
          .from('lessons')
          .update({ title: newTitle })
          .eq('id', lesson.id)

        if (updateError) {
          console.error(`  ❌ Error updating lesson ${lesson.id}:`, updateError)
        } else {
          console.log(`  ✅ Updated: "${newTitle}"`)
        }
      }
    } catch (error) {
      console.error(`  ❌ Error generating title:`, error)
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n🎉 Lesson title regeneration complete!')
}

// Run the script
regenerateLessonTitles().catch(console.error)
