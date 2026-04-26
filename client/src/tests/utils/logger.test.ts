import { describe, expect, it } from 'vitest';
import logger from '@/utils/logger';

describe('logger', () => {
  it('nao quebra em ambiente de teste', () => {
    expect(() => {
      logger.info('Teste', 'mensagem');
      logger.debug('Teste', 'mensagem');
      logger.warn('Teste', 'mensagem');
      logger.error('Teste', 'mensagem');
    }).not.toThrow();
  });
});
