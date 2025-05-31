// hooks/useLoginOrRegister.ts
import { useState, useEffect } from 'react'
import { SupabaseClient, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

/**
 * Hook return type
 */
interface UseLoginOrRegisterResult {
  user: User | null
  loading: boolean
  error: string | null
}

/**
 * Attempts to sign in with the given (email, password). If the user does not exist,
 * it falls back to sign-up. Manages loading/error states, and returns the final user.
 *
 * @param email - The user’s email address.
 * @param password - The user’s password.
 * @returns {UseLoginOrRegisterResult}
 */
export function useLoginOrRegister(
  email: string,
  password: string
): UseLoginOrRegisterResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If email or password is empty, skip authentication entirely.
    if (!email || !password) {
      setLoading(false)
      return
    }

    let isCancelled = false

    async function authenticate() {
      setLoading(true)
      setError(null)

      // 1) Try signing in first
      try {
        const {
          data: signInData,
          error: signInError,
        } = await supabase.auth.signInWithPassword({ email, password })

        if (isCancelled) return

        if (!signInError && signInData.user) {
          // Successfully signed in
          setUser(signInData.user)
          setLoading(false)
          return
        }

        // 2) If sign-in failed (e.g. user not found), attempt sign-up
        const {
          data: signUpData,
          error: signUpError,
        } = await supabase.auth.signUp({ email, password })

        if (isCancelled) return

        if (signUpError) {
          // Registration also failed; bubble up the error message
          setError(signUpError.message)
          setLoading(false)
          return
        }

        // Successfully signed up (email confirmation may be required)
        if (signUpData.user) {
          setUser(signUpData.user)
        }
        setLoading(false)
      } catch (err: unknown) {
        if (isCancelled) return
        // Capture any unexpected errors (network issues, etc.)
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(message)
        setLoading(false)
      }
    }

    authenticate()

    return () => {
      isCancelled = true
    }
  }, [email, password])

  return { user, loading, error }
}
