import { beforeEach, describe, expect, it } from 'vitest';
import {
  allowSurveyPost,
  resetSurveyRateLimitForTests,
} from '@/lib/statstrike/survey-rate-limit';

describe('survey rate limit', () => {
  beforeEach(() => {
    resetSurveyRateLimitForTests();
  });

  it('allows five submissions per IP then denies', () => {
    for (let i = 0; i < 5; i += 1) {
      expect(allowSurveyPost('203.0.113.20')).toBe(true);
    }
    expect(allowSurveyPost('203.0.113.20')).toBe(false);
  });

  it('expires old attempts after one hour', () => {
    const start = Date.parse('2026-07-26T12:00:00.000Z');
    for (let i = 0; i < 5; i += 1) {
      expect(allowSurveyPost('203.0.113.30', start)).toBe(true);
    }
    expect(allowSurveyPost('203.0.113.30', start + 60 * 60 * 1000)).toBe(true);
  });
});
