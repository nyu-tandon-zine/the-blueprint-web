import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = "https://llcgqjqgdahpjwqsrfot.supabase.co"
const supabaseAnonKey = "sb_publishable_8KR2zNhfr-NZBat0QTiKgA_05EGm-Oc"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
