import { afterEach, beforeAll, vi } from 'vitest';
import { mockReset } from 'vitest-mock-extended';
import { prismaMock } from './helpers/prismaMock';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET =
    process.env.JWT_SECRET || 'nossozelo-test-secret';

  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL_TEST
  ) {
    delete process.env.DATABASE_URL;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
  mockReset(prismaMock);
});

vi.mock('../src/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('../src/lib/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../src/service/Service_Email', () => ({
  default: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue(undefined),
  })),
}));
