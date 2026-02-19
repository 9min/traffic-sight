import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventBuffer } from "../event-buffer";

describe("EventBuffer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should flush buffered items after interval", () => {
    const onFlush = vi.fn();
    const buffer = new EventBuffer<number>(onFlush, 300);
    buffer.start();

    buffer.push(1);
    buffer.push(2);

    expect(onFlush).not.toHaveBeenCalled();

    vi.advanceTimersByTime(350);

    expect(onFlush).toHaveBeenCalledOnce();
    expect(onFlush).toHaveBeenCalledWith([1, 2]);

    buffer.stop();
  });

  it("should not call onFlush when buffer is empty", () => {
    const onFlush = vi.fn();
    const buffer = new EventBuffer<number>(onFlush, 300);
    buffer.start();

    vi.advanceTimersByTime(1000);

    expect(onFlush).not.toHaveBeenCalled();

    buffer.stop();
  });

  it("should flush multiple batches over time", () => {
    const onFlush = vi.fn();
    const buffer = new EventBuffer<string>(onFlush, 200);
    buffer.start();

    buffer.push("a");
    vi.advanceTimersByTime(250);

    buffer.push("b");
    buffer.push("c");
    vi.advanceTimersByTime(250);

    expect(onFlush).toHaveBeenCalledTimes(2);
    expect(onFlush).toHaveBeenNthCalledWith(1, ["a"]);
    expect(onFlush).toHaveBeenNthCalledWith(2, ["b", "c"]);

    buffer.stop();
  });

  it("should flush remaining items on stop", () => {
    const onFlush = vi.fn();
    const buffer = new EventBuffer<number>(onFlush, 300);
    buffer.start();

    buffer.push(10);
    buffer.push(20);

    // Stop before interval fires
    buffer.stop();

    expect(onFlush).toHaveBeenCalledOnce();
    expect(onFlush).toHaveBeenCalledWith([10, 20]);
  });

  it("should not flush on stop if buffer is empty", () => {
    const onFlush = vi.fn();
    const buffer = new EventBuffer<number>(onFlush, 300);
    buffer.start();
    buffer.stop();

    expect(onFlush).not.toHaveBeenCalled();
  });

  it("should track pending count", () => {
    const onFlush = vi.fn();
    const buffer = new EventBuffer<number>(onFlush, 300);
    buffer.start();

    expect(buffer.pending).toBe(0);

    buffer.push(1);
    buffer.push(2);
    expect(buffer.pending).toBe(2);

    vi.advanceTimersByTime(350);
    expect(buffer.pending).toBe(0);

    buffer.stop();
  });

  it("should clear buffer after flush", () => {
    const onFlush = vi.fn();
    const buffer = new EventBuffer<number>(onFlush, 100);
    buffer.start();

    buffer.push(1);
    vi.advanceTimersByTime(150);

    buffer.push(2);
    vi.advanceTimersByTime(150);

    // Each flush should only contain its own batch
    expect(onFlush).toHaveBeenNthCalledWith(1, [1]);
    expect(onFlush).toHaveBeenNthCalledWith(2, [2]);

    buffer.stop();
  });

  it("should handle manual flush", () => {
    const onFlush = vi.fn();
    const buffer = new EventBuffer<number>(onFlush, 300);

    buffer.push(1);
    buffer.push(2);
    buffer.flush();

    expect(onFlush).toHaveBeenCalledOnce();
    expect(onFlush).toHaveBeenCalledWith([1, 2]);
    expect(buffer.pending).toBe(0);
  });

  it("should not start duplicate timers", () => {
    const onFlush = vi.fn();
    const buffer = new EventBuffer<number>(onFlush, 300);
    buffer.start();
    buffer.start(); // second start should be no-op

    buffer.push(1);
    vi.advanceTimersByTime(350);

    // Should only flush once, not twice
    expect(onFlush).toHaveBeenCalledOnce();

    buffer.stop();
  });

  it("should use custom interval", () => {
    const onFlush = vi.fn();
    const buffer = new EventBuffer<number>(onFlush, 500);
    buffer.start();

    buffer.push(1);
    vi.advanceTimersByTime(350);
    expect(onFlush).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(onFlush).toHaveBeenCalledOnce();

    buffer.stop();
  });
});
