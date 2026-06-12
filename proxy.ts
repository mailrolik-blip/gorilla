import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0].toLowerCase() || '';
  const isAvtomagistralSubdomain = host.startsWith('avtomagistral.');

  if (isAvtomagistralSubdomain && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/avtomagistral';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/((?!api|_next|.*\\..*).*)'],
};
