import { vi } from 'vitest';

export const pushMock = vi.fn();

export function criarRouterMock(overrides = {}) {
  return {
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    query: {},
    pathname: '/',
    isReady: true,
    ...overrides,
  };
}
