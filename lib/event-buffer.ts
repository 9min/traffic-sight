/**
 * Batches incoming items and flushes them at a fixed interval.
 * Used by useTrafficStream to throttle realtime events.
 */
export class EventBuffer<T> {
  private buffer: T[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private onFlush: (batch: T[]) => void,
    private intervalMs: number = 300
  ) {}

  push(item: T) {
    this.buffer.push(item);
  }

  flush() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];
    this.onFlush(batch);
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.flush(), this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }

  get pending() {
    return this.buffer.length;
  }
}
