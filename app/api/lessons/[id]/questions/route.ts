/**
 * API Route: Get questions for a specific lesson
 */

import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsByLessonId } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id
    const questions = await getQuestionsByLessonId(lessonId)
    
    return NextResponse.json({
      success: true,
      questions,
      count: questions.length,
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}
