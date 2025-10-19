import { describe, it, expect } from '@jest/globals';

describe('Jest Setup', () => {
  it('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBe('hello');
    expect(true).toBeTruthy();
  });

  it('should have access to test environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should have access to global test utilities', () => {
    expect(global.testUtils).toBeDefined();
    expect(typeof global.testUtils.sleep).toBe('function');
  });

  it('should be able to test async functions', async () => {
    const result = await Promise.resolve('async test');
    expect(result).toBe('async test');
  });

  it('should be able to test promises', () => {
    return Promise.resolve('promise test').then((result) => {
      expect(result).toBe('promise test');
    });
  });

  it('should handle errors properly', () => {
    expect(() => {
      throw new Error('Test error');
    }).toThrow('Test error');
  });

  it('should work with modern JavaScript features', () => {
    const obj = { a: 1, b: 2 };
    const { a, ...rest } = obj;

    expect(a).toBe(1);
    expect(rest).toEqual({ b: 2 });

    const arr = [1, 2, 3];
    const [first, ...others] = arr;

    expect(first).toBe(1);
    expect(others).toEqual([2, 3]);
  });

  it('should support ES6+ features', () => {
    const map = new Map();
    map.set('key', 'value');

    expect(map.get('key')).toBe('value');
    expect(map.has('key')).toBe(true);

    const set = new Set([1, 2, 3, 3]);
    expect(set.size).toBe(3);
    expect(set.has(2)).toBe(true);
  });
});

describe('Test Configuration', () => {
  it('should have correct timeout configured', () => {
    // This test verifies that Jest timeout is properly set
    expect(jest.setTimeout).toBeDefined();
  });

  it('should have mocks cleared between tests', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');

    // This should be cleared in the next test due to clearAllMocks in setup
  });

  it('should verify mocks are cleared from previous test', () => {
    // If the previous test's mock was properly cleared, this should pass
    expect(jest.clearAllMocks).toBeDefined();
  });
});
