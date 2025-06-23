import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export const createSupabaseServerClient = () => {
  return createServerComponentClient<Database>({
    cookies,
  });
};
