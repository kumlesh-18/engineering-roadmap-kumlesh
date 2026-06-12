import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAuth = req.nextUrl.pathname.startsWith('/auth');
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnRoadmap = req.nextUrl.pathname.startsWith('/roadmap');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');

  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL('/roadmap/ai-engineer', req.nextUrl));
  }

  if (!isLoggedIn && (isOnDashboard || isOnRoadmap)) {
    return NextResponse.redirect(new URL('/auth/signin', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};