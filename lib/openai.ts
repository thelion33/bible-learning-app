/**
 * OpenAI Client for Content Generation
 * Processes message transcripts into learning materials
 */

import OpenAI from 'openai'
import type { QuestionType } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GeneratedContent {
  lessonTitle: string
  summary: string
  keyThemes: string[]
  scriptureReferences: string[]
  questions: GeneratedQuestion[]
}

export interface GeneratedQuestion {
  type: QuestionType
  questionText: string
  options?: string[]
  correctAnswer: string
  explanation?: string
  xpValue: number
}

/**
 * Generate learning content from a message transcript
 */
export async function generateLearningContent(
  transcript: string,
  videoTitle: string,
  videoDescription: string
): Promise<GeneratedContent> {
  const prompt = `You are an expert in creating engaging Bible study materials. Analyze the following church message and create comprehensive learning content.

MESSAGE TITLE: ${videoTitle}

MESSAGE DESCRIPTION: ${videoDescription}

TRANSCRIPT:
${transcript.slice(0, 15000)} // Limit to ~15k chars to stay within token limits

Please provide:

1. A concise, engaging lesson title (4-8 words) that captures the core teaching - NOT the video title
2. A concise summary (2-3 paragraphs) of the main message
3. Key themes (3-5 main themes covered)
4. Scripture references mentioned (with book, chapter, and verse)
5. Learning questions in the following types:
   - 3 multiple choice questions
   - 2 fill-in-the-blank questions
   - 2 scripture matching questions
   - 2 true/false questions

Format your response as JSON with this structure:
{
  "lessonTitle": "Walking in Faith and Purpose",
  "summary": "...",
  "keyThemes": ["theme1", "theme2", ...],
  "scriptureReferences": ["John 3:16", "Romans 8:28", ...],
  "questions": [
    {
      "type": "multiple_choice",
      "questionText": "What was the main point of the message?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "explanation": "The pastor emphasized...",
      "xpValue": 10
    },
    {
      "type": "fill_in_blank",
      "questionText": "The message focused on the importance of _____ in our daily walk.",
      "correctAnswer": "faith",
      "explanation": "Faith was mentioned as...",
      "xpValue": 15
    },
    {
      "type": "scripture_match",
      "questionText": "Match the verse to its reference: 'For God so loved the world...'",
      "options": ["John 3:16", "Romans 5:8", "1 John 4:19", "Ephesians 2:8"],
      "correctAnswer": "John 3:16",
      "explanation": "This is one of the most famous verses...",
      "xpValue": 10
    },
    {
      "type": "true_false",
      "questionText": "The pastor said that faith without works is dead.",
      "correctAnswer": "true",
      "explanation": "This comes from James 2:26...",
      "xpValue": 5
    }
  ]
}

Make sure questions are engaging, test understanding, and promote spiritual growth.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Bible teacher and curriculum designer. Create engaging, theologically sound learning materials.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated from OpenAI')
    }

    const parsed = JSON.parse(content) as GeneratedContent
    return parsed
  } catch (error) {
    console.error('Error generating content with OpenAI:', error)
    throw error
  }
}

/**
 * Generate additional questions for a lesson
 */
export async function generateMoreQuestions(
  lessonSummary: string,
  existingQuestionCount: number,
  questionType: QuestionType,
  count = 3
): Promise<GeneratedQuestion[]> {
  const prompt = `Based on this Bible lesson summary, generate ${count} high-quality ${questionType} questions for learning and retention.

LESSON SUMMARY:
${lessonSummary}

QUESTION TYPE: ${questionType}

Generate exactly ${count} questions in JSON format:
[
  {
    "type": "${questionType}",
    "questionText": "...",
    ${questionType === 'multiple_choice' || questionType === 'scripture_match' ? '"options": ["A", "B", "C", "D"],' : ''}
    "correctAnswer": "...",
    "explanation": "...",
    "xpValue": ${questionType === 'fill_in_blank' ? 15 : 10}
  }
]`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Bible teacher creating engaging quiz questions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No questions generated')
    }

    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : parsed.questions || []
  } catch (error) {
    console.error('Error generating additional questions:', error)
    throw error
  }
}
