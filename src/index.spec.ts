import { describe, expect, it } from 'vitest';

import { foo } from './index.js';

describe('foo', () => {
  it('should return bar', () => {
    expect(foo()).toBe('bar');
  });
});
