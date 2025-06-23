'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const supabase = createSupabaseBrowserClient();
      try {
        // Get the session, this will handle the email confirmation automatically
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // Session exists, redirect to home
          router.push('/');
        } else {
          // No session, redirect to auth page
          router.push('/auth');
        }
      } catch (error: unknown) {
        let message = 'An error occurred during email confirmation.';
        if (
          typeof error === 'object' &&
          error !== null &&
          ('message' in error || 'code' in error)
        ) {
          const err = error as { message?: string; code?: string };
          if (
            err.message === 'invalid flow state, flow state has expired' ||
            err.code === 'flow_state_expired'
          ) {
            message =
              'Your confirmation link has expired. Please try signing in again.';
          } else if (err.message) {
            message = err.message;
          }
        }
        addToast({
          title: 'Email Confirmation Error',
          description: message,
          variant: 'destructive',
        });
        setTimeout(() => router.push('/auth'), 2000);
      }
    };

    handleEmailConfirmation();
  }, [router, addToast]);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <h2 className='text-2xl font-semibold mb-4'>Verifying your email...</h2>
        <p className='text-gray-600'>
          Please wait while we confirm your email address.
        </p>
      </div>
    </div>
  );
}
