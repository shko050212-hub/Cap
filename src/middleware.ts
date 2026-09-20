import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') return NextResponse.next();

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Edge Runtime에서는 JWT 검증 대신 토큰 존재 여부만 체크
    // 실제 권한 검증은 각 API route에서 처리
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
