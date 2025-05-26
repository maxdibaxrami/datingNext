// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/** 
 * Server‐side Supabase (service‐role) 
 * – Use only in Next.js API routes or getServerSideProps  
 */
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY
)
