import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hasProductionSession = request.cookies.has('gorilla_session');
  const hasDevSession =
    process.env.NODE_ENV !== 'production' && request.cookies.has('gorilla_dev_user_id');

  if (hasProductionSession || hasDevSession) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('next', '/cabinet');

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/cabinet'],
};
