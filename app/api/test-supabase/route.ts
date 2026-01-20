/**
 * Test Supabase Connection
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test database connection
    const { data: videos, error: videoError } = await supabase
      .from('videos')
      .select('count')
      .limit(1)

    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.getSession()

    return NextResponse.json({
      success: true,
      database: {
        connected: !videoError,
        error: videoError?.message,
      },
      auth: {
        connected: !authError,
        error: authError?.message,
        hasSession: !!authData?.session,
      },
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
