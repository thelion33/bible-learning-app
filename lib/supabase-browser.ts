/**
 * Supabase client for browser/client components
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()
