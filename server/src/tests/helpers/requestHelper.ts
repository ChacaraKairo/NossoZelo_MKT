import request from 'supertest';
import app from '../../main';

export function apiTest() {
  return request(app);
}
