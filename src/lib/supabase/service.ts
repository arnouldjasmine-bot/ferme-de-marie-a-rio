import { createClient } from '@supabase/supabase-js'

// Client avec service_role — pour les API routes (pas de cookies)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
