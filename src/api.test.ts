import { describe, it, expect } from 'vitest';
import { getApiBaseUrl } from './api';

describe('getApiBaseUrl', () => {
  it('returns a non-empty string', () => {
    expect(getApiBaseUrl().length).toBeGreaterThan(0);
  });

  it('does not end with a slash', () => {
    expect(getApiBaseUrl().endsWith('/')).toBe(false);
  });
});
