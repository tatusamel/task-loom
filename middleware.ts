import { NextResponse } from 'next/server';
import { auth } from './auth';

const publicRoutes = ['/sign-in'];
const apiAuthPrefix = '/api/auth';
const apiPrefix = '/api';

export default auth(request => {
  const { nextUrl } = request;
  const isLoggedIn = Boolean(request.auth);
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isApiRoute = nextUrl.pathname.startsWith(apiPrefix);
  const isPublicRoute = publicRoutes.some(route => nextUrl.pathname.startsWith(route));

  if (isApiRoute && !isApiAuthRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute && !isApiAuthRoute) {
    const signInUrl = new URL('/sign-in', nextUrl.origin);
    const callbackValue = `${nextUrl.pathname}${nextUrl.search}`;
    signInUrl.searchParams.set('callbackUrl', callbackValue);
    return NextResponse.redirect(signInUrl);
  }

  if (isLoggedIn && isPublicRoute) {
    const callback = nextUrl.searchParams.get('callbackUrl');
    const safeCallback = callback && callback.startsWith('/') ? callback : '/';
    return NextResponse.redirect(new URL(safeCallback, nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
