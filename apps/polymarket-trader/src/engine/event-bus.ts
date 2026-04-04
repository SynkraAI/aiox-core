/**
 * Central event bus for the trading system.
 * All modules communicate through events, not direct calls.
 */

import { EventEmitter } from 'events';

class TradingEventBus extends EventEmitter {
  private eventLog: Array<{ event: string; timestamp: Date }> = [];
  private maxLogSize = 1000;

  override emit(event: string | symbol, ...args: unknown[]): boolean {
    if (typeof event === 'string') {
      this.eventLog.push({ event, timestamp: new Date() });
      if (this.eventLog.length > this.maxLogSize) {
        this.eventLog = this.eventLog.slice(-this.maxLogSize);
      }
    }
    return super.emit(event, ...args);
  }

  getRecentEvents(count = 50): Array<{ event: string; timestamp: Date }> {
    return this.eventLog.slice(-count);
  }

  getEventCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const entry of this.eventLog) {
      counts[entry.event] = (counts[entry.event] || 0) + 1;
    }
    return counts;
  }
}

export const eventBus = new TradingEventBus();
eventBus.setMaxListeners(50);
export type { TradingEventBus };
