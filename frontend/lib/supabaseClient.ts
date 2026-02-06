import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client for build time if credentials are missing
const createSupabaseClient = () => {
    if (!supabaseUrl || !supabaseKey) {
        // During build time, return a minimal mock that won't crash
        if (typeof window === 'undefined') {
            return null as any;
        }
        // Client-side without credentials - still create client but it will fail gracefully
        return createClient('', '');
    }
    
    return createClient(supabaseUrl, supabaseKey);
};

export const supabase = createSupabaseClient();
