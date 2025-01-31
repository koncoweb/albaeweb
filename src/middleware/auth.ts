import type { MiddlewareHandler, APIContext } from 'astro';
import { supabase, isAdmin, setAuthSession } from '../lib/supabase';

export const adminAuthMiddleware: MiddlewareHandler = async (
  { request, redirect }: APIContext
): Promise<Response> => {
  console.log('Auth middleware - Starting check');
  
  // Get session with detailed logging
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('Auth middleware - Session:', {
    userId: session?.user?.id,
    hasError: !!sessionError
  });
  
  if (sessionError) {
    console.error('Auth middleware - Session error:', sessionError);
    return redirect('/admin/login');
  }
  
  if (!session) {
    console.log('Auth middleware - No session');
    return redirect('/admin/login');
  }

  try {
    // Try to persist session
    const sessionSet = await setAuthSession(session);
    if (!sessionSet) {
      console.log('Auth middleware - Failed to persist session');
      return redirect('/admin/login');
    }

    // Check admin status
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      console.log('Auth middleware - Not admin');
      await supabase.auth.signOut();
      return redirect('/unauthorized');
    }

    console.log('Auth middleware - Admin access confirmed');

    // Return success with no-cache headers
    const response = new Response(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    return response;
  } catch (error) {
    console.error('Auth middleware - Error:', error);
    await supabase.auth.signOut();
    return redirect('/admin/login');
  }
}
