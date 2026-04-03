import { describe, test, expect, jest } from '@jest/globals';
import { JobQueue } from '../../src/scheduler/job-queue.js';

describe('JobQueue', () => {
  test('enqueue adds jobs in priority order', () => {
    const queue = new JobQueue();
    queue.enqueue({ id: 'low', name: 'Low', priority: 10, fn: async () => {} });
    queue.enqueue({ id: 'high', name: 'High', priority: 1, fn: async () => {} });
    queue.enqueue({ id: 'mid', name: 'Mid', priority: 5, fn: async () => {} });

    expect(queue.size()).toBe(3);

    const first = queue.dequeue();
    expect(first.id).toBe('high');
    const second = queue.dequeue();
    expect(second.id).toBe('mid');
    const third = queue.dequeue();
    expect(third.id).toBe('low');
  });

  test('dequeue returns null for empty queue', () => {
    const queue = new JobQueue();
    expect(queue.dequeue()).toBeNull();
  });

  test('isEmpty returns correct state', () => {
    const queue = new JobQueue();
    expect(queue.isEmpty()).toBe(true);

    queue.enqueue({ id: 'test', name: 'Test', fn: async () => {} });
    expect(queue.isEmpty()).toBe(false);
  });

  test('processAll executes jobs sequentially', async () => {
    const queue = new JobQueue();
    const order = [];

    queue.enqueue({ id: 'a', name: 'A', priority: 2, fn: async () => { order.push('a'); return 'ok-a'; } });
    queue.enqueue({ id: 'b', name: 'B', priority: 1, fn: async () => { order.push('b'); return 'ok-b'; } });

    const result = await queue.processAll();
    expect(result.succeeded).toBe(2);
    expect(result.failed).toBe(0);
    expect(order).toEqual(['b', 'a']); // Priority order
  });

  test('processAll handles failures', async () => {
    const queue = new JobQueue();
    queue.enqueue({ id: 'ok', name: 'Ok', priority: 1, fn: async () => 'ok' });
    queue.enqueue({ id: 'fail', name: 'Fail', priority: 2, fn: async () => { throw new Error('boom'); } });

    const result = await queue.processAll();
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(1);
  });

  test('getCompleted returns finished jobs', async () => {
    const queue = new JobQueue();
    queue.enqueue({ id: 'test', name: 'Test', fn: async () => 'done' });

    await queue.processAll();

    const completed = queue.getCompleted();
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe('test');
    expect(completed[0].status).toBe('completed');
  });

  test('clearCompleted removes history', async () => {
    const queue = new JobQueue();
    queue.enqueue({ id: 'test', name: 'Test', fn: async () => 'done' });
    await queue.processAll();

    queue.clearCompleted();
    expect(queue.getCompleted()).toHaveLength(0);
  });

  test('processAll throws if already processing', async () => {
    const queue = new JobQueue();

    // Simulate a long-running job
    let resolveJob;
    queue.enqueue({
      id: 'slow',
      name: 'Slow',
      fn: () => new Promise((resolve) => { resolveJob = resolve; }),
    });

    const p1 = queue.processAll();
    await expect(queue.processAll()).rejects.toThrow('already being processed');

    resolveJob('done');
    await p1;
  });

  test('default priority is 5', () => {
    const queue = new JobQueue();
    queue.enqueue({ id: 'no-priority', name: 'NP', fn: async () => {} });

    const job = queue.dequeue();
    expect(job.priority).toBe(5);
  });
});
