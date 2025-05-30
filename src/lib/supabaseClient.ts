// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Client‐side Supabase instance
 * – Use for React hooks, getStaticProps, getServerSideProps, etc.
 */
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
