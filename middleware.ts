import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Protected routes list
    const protectedRoutes = ['/watchlist', '/history'];
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

    if (isProtectedRoute && !session) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirectedFrom', req.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return res;
}

export const config = {
    matcher: ['/watchlist/:path*', '/history/:path*'],
};
