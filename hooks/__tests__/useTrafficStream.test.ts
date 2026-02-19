import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("@/lib/supabase/client", () => {
  const mockOn = vi.fn().mockReturnThis();
  const mockSubscribe = vi.fn((cb: (status: string) => void) => {
    cb("SUBSCRIBED");
    return { unsubscribe: vi.fn() };
  });

  return {
    supabase: {
      channel: vi.fn().mockReturnValue({ on: mockOn, subscribe: mockSubscribe }),
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [] }),
          }),
        }),
      }),
      removeChannel: vi.fn(),
    },
  };
});

import { useTrafficStream } from "../useTrafficStream";

describe("useTrafficStream", () => {
  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useTrafficStream());
    expect(result.current.events).toEqual([]);
    expect(result.current.threats).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it("should report connected status", () => {
    const { result } = renderHook(() => useTrafficStream());
    expect(result.current.isConnected).toBe(true);
  });

  it("should return all expected fields", () => {
    const { result } = renderHook(() => useTrafficStream());
    expect(result.current).toHaveProperty("events");
    expect(result.current).toHaveProperty("threats");
    expect(result.current).toHaveProperty("isConnected");
    expect(result.current).toHaveProperty("totalCount");
  });
});
