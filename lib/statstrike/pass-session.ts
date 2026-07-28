import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  STATSTRIKE_PASS_COOKIE,
  hashPassAccessToken,
  isPassActive,
} from '@/lib/statstrike/pass';
import { getPassByTokenHash } from '@/lib/statstrike/pass-store';

export type PassSessionPayload = {
  unlocked: boolean;
  expiresAt: string | null;
  passId: string | null;
};

export function passCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };
}

export async function readPassSessionFromCookies(): Promise<PassSessionPayload> {
  const jar = cookies();
  const token = jar.get(STATSTRIKE_PASS_COOKIE)?.value;
  if (!token) {
    return { unlocked: false, expiresAt: null, passId: null };
  }
  try {
    const pass = await getPassByTokenHash(hashPassAccessToken(token));
    if (!pass || !isPassActive(pass)) {
      return { unlocked: false, expiresAt: null, passId: null };
    }
    return { unlocked: true, expiresAt: pass.expiresAt, passId: pass.passId };
  } catch {
    return { unlocked: false, expiresAt: null, passId: null };
  }
}

export function jsonNoStore(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}

/** JSON response that also sets the pass cookie (reliable in App Router route handlers). */
export function jsonNoStoreWithPassCookie(
  data: unknown,
  token: string,
  expiresAt: Date,
  init?: { status?: number },
) {
  const res = jsonNoStore(data, init);
  res.cookies.set(STATSTRIKE_PASS_COOKIE, token, passCookieOptions(expiresAt));
  return res;
}
