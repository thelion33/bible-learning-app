/**
 * API Route: Get all published lessons
 */

import { NextResponse } from 'next/server'
import { getPublishedLessons } from '@/lib/database'

export async function GET() {
  try {
    const lessons = await getPublishedLessons()
    
    return NextResponse.json({
      success: true,
      lessons,
      count: lessons.length,
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}
