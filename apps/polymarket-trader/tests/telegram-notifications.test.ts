import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationManager, DEFAULT_NOTIFICATION_CONFIG } from '../src/telegram/notifications.js';

describe('NotificationManager', () => {
  let sendFn: ReturnType<typeof vi.fn>;
  let nm: NotificationManager;

  beforeEach(() => {
    sendFn = vi.fn().mockResolvedValue(undefined);
    nm = new NotificationManager(sendFn);
  });

  afterEach(() => {
    nm.unwire();
    vi.restoreAllMocks();
  });

  it('should send a normal notification', async () => {
    const result = await nm.send('Test message', 'normal');
    expect(result).toBe(true);
    expect(sendFn).toHaveBeenCalledWith('Test message', undefined);
  });

  it('should send with keyboard', async () => {
    const keyboard = { inline_keyboard: [[{ text: 'Test', callback_data: 'test' }]] };
    await nm.send('Test', 'normal', keyboard);
    expect(sendFn).toHaveBeenCalledWith('Test', keyboard);
  });

  it('should track message timestamps', async () => {
    await nm.send('msg1', 'info');
    await nm.send('msg2', 'info');

    const stats = nm.getStats();
    expect(stats.messagesLastHour).toBe(2);
  });

  it('should enforce rate limiting', async () => {
    const limitedNm = new NotificationManager(sendFn, { maxMessagesPerHour: 3 });

    await limitedNm.send('1', 'info');
    await limitedNm.send('2', 'info');
    await limitedNm.send('3', 'info');
    const result = await limitedNm.send('4', 'info');

    expect(result).toBe(false); // Rate limited
    expect(sendFn).toHaveBeenCalledTimes(3);
  });

  it('should allow critical messages through rate limit', async () => {
    const limitedNm = new NotificationManager(sendFn, { maxMessagesPerHour: 2 });

    await limitedNm.send('1', 'info');
    await limitedNm.send('2', 'info');

    // Normal should be blocked
    const normalResult = await limitedNm.send('3', 'normal');
    expect(normalResult).toBe(false);

    // Critical should go through
    const critResult = await limitedNm.send('4', 'critical');
    expect(critResult).toBe(true);
  });

  it('should check quiet hours correctly (same day range)', () => {
    const quietNm = new NotificationManager(sendFn, {
      quietHoursStart: 10,
      quietHoursEnd: 14,
    });

    // 12:00 is within quiet hours
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    expect(quietNm.isQuietHours(noon)).toBe(true);

    // 9:00 is outside
    const morning = new Date();
    morning.setHours(9, 0, 0, 0);
    expect(quietNm.isQuietHours(morning)).toBe(false);

    // 15:00 is outside
    const afternoon = new Date();
    afternoon.setHours(15, 0, 0, 0);
    expect(quietNm.isQuietHours(afternoon)).toBe(false);
  });

  it('should check quiet hours correctly (wrap midnight)', () => {
    const quietNm = new NotificationManager(sendFn, {
      quietHoursStart: 23,
      quietHoursEnd: 7,
    });

    // 2:00 AM is within quiet hours
    const lateNight = new Date();
    lateNight.setHours(2, 0, 0, 0);
    expect(quietNm.isQuietHours(lateNight)).toBe(true);

    // 23:30 is within quiet hours
    const evening = new Date();
    evening.setHours(23, 30, 0, 0);
    expect(quietNm.isQuietHours(evening)).toBe(true);

    // 12:00 is outside quiet hours
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    expect(quietNm.isQuietHours(noon)).toBe(false);

    // 8:00 is outside quiet hours
    const morning = new Date();
    morning.setHours(8, 0, 0, 0);
    expect(quietNm.isQuietHours(morning)).toBe(false);
  });

  it('should block non-critical during quiet hours', async () => {
    // Force quiet hours by setting a range that includes current hour
    const now = new Date();
    const quietNm = new NotificationManager(sendFn, {
      quietHoursStart: now.getHours(),
      quietHoursEnd: (now.getHours() + 2) % 24,
      quietHoursMinPriority: 'critical',
    });

    const infoResult = await quietNm.send('info msg', 'info');
    expect(infoResult).toBe(false);

    const normalResult = await quietNm.send('normal msg', 'normal');
    expect(normalResult).toBe(false);

    const critResult = await quietNm.send('critical msg', 'critical');
    expect(critResult).toBe(true);
  });

  it('should handle send function failures', async () => {
    const failSend = vi.fn().mockRejectedValue(new Error('Send failed'));
    const failNm = new NotificationManager(failSend);

    const result = await failNm.send('Test', 'normal');
    expect(result).toBe(false);
  });

  it('should provide correct stats', async () => {
    await nm.send('1', 'info');
    await nm.send('2', 'normal');

    const stats = nm.getStats();
    expect(stats.messagesLastHour).toBe(2);
    expect(typeof stats.isQuietHours).toBe('boolean');
    expect(typeof stats.isRateLimited).toBe('boolean');
  });

  it('should have correct default config', () => {
    expect(DEFAULT_NOTIFICATION_CONFIG.quietHoursStart).toBe(23);
    expect(DEFAULT_NOTIFICATION_CONFIG.quietHoursEnd).toBe(7);
    expect(DEFAULT_NOTIFICATION_CONFIG.maxMessagesPerHour).toBe(30);
    expect(DEFAULT_NOTIFICATION_CONFIG.dailySummaryEnabled).toBe(true);
    expect(DEFAULT_NOTIFICATION_CONFIG.weeklySummaryEnabled).toBe(true);
  });

  it('should wire and unwire without errors', () => {
    nm.wire(() => ({
      dailyPnl: 10,
      totalPnl: 100,
      totalTrades: 50,
      winRate: 0.65,
      openPositions: 3,
    }));

    // Wire again should be no-op
    nm.wire();

    nm.unwire();
    // Unwire should be idempotent
    nm.unwire();
  });

  it('should report isRateLimited correctly', async () => {
    const limitedNm = new NotificationManager(sendFn, { maxMessagesPerHour: 2 });

    expect(limitedNm.isRateLimited()).toBe(false);

    await limitedNm.send('1', 'info');
    await limitedNm.send('2', 'info');

    expect(limitedNm.isRateLimited()).toBe(true);
  });
});
