import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

// For client-side usage
export const createSupabaseBrowserClient = () => {
  return createClientComponentClient<Database>();
};
