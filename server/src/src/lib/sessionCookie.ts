import { Response } from 'express';

export const SESSION_COOKIE_NAME = 'zelo_token';
export const SOCIAL_SIGNUP_COOKIE_NAME = 'nossozelo_social_signup';
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const SOCIAL_SIGNUP_MAX_AGE_MS = 30 * 60 * 1000;

function cookieSecure() {
  return process.env.NODE_ENV === 'production';
}

function sameSite(): 'strict' | 'lax' | 'none' {
  const configured = String(process.env.COOKIE_SAMESITE || '').toLowerCase();
  if (configured === 'none') return 'none';
  if (configured === 'strict') return 'strict';
  return 'lax';
}

export function definirCookieSessao(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: sameSite(),
    path: '/',
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function limparCookieSessao(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: sameSite(),
    path: '/',
  });
}

export function definirCookieCadastroSocial(res: Response, token: string) {
  res.cookie(SOCIAL_SIGNUP_COOKIE_NAME, token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: sameSite(),
    path: '/',
    maxAge: SOCIAL_SIGNUP_MAX_AGE_MS,
  });
}

export function limparCookieCadastroSocial(res: Response) {
  res.clearCookie(SOCIAL_SIGNUP_COOKIE_NAME, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: sameSite(),
    path: '/',
  });
}
