import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Path', url.pathname);

  if (url.pathname.startsWith('/api/assets/')) {
    return NextResponse.rewrite(
      `${process.env.PRIVATE_API_URL}${url.pathname.replace('/api', '')}`,
    );
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
