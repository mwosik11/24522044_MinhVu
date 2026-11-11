
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";

import { usePubgAirdropTimer } from "./usePubgAirdropTimer.js";

describe("usePubgAirdropTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(10000));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should initialize the remaining time correctly", () => {
    const { result } = renderHook(() =>
      usePubgAirdropTimer(15000)
    );

    expect(result.current.remainingMs).toBe(5000);
    expect(result.current.isLive).toBe(false);
  });

  it("should apply the server clock offset", () => {
    const { result } = renderHook(() =>
      usePubgAirdropTimer(15000, 2000)
    );

    expect(result.current.remainingMs).toBe(3000);
  });

  it("should update the countdown periodically", () => {
    const { result } = renderHook(() =>
      usePubgAirdropTimer(15000)
    );

    expect(result.current.remainingMs).toBe(5000);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.remainingMs).toBe(4000);
  });

  it("should resynchronize when the tab becomes visible", () => {
    const visibilitySpy = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("visible");

    const { result } = renderHook(() =>
      usePubgAirdropTimer(20000)
    );

    expect(result.current.remainingMs).toBe(10000);

    vi.setSystemTime(new Date(17000));

    act(() => {
      document.dispatchEvent(
        new Event("visibilitychange")
      );
    });

    expect(result.current.remainingMs).toBe(3000);

    visibilitySpy.mockRestore();
  });

  it("should not resynchronize while the tab is hidden", () => {
    vi.spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");

    const { result } = renderHook(() =>
      usePubgAirdropTimer(20000)
    );

    expect(result.current.remainingMs).toBe(10000);

    vi.setSystemTime(new Date(17000));

    act(() => {
      document.dispatchEvent(
        new Event("visibilitychange")
      );
    });

    expect(result.current.remainingMs).toBe(10000);
  });

  it("should return zero when the countdown expires", () => {
    vi.setSystemTime(new Date(20000));

    const { result } = renderHook(() =>
      usePubgAirdropTimer(15000)
    );

    expect(result.current.remainingMs).toBe(0);
    expect(result.current.isLive).toBe(true);
  });

  it("should update when the target timestamp changes", () => {
    const { result, rerender } = renderHook(
      ({ targetEpochMs }) =>
        usePubgAirdropTimer(targetEpochMs),
      {
        initialProps: {
          targetEpochMs: 20000,
        },
      }
    );

    expect(result.current.remainingMs).toBe(10000);

    rerender({
      targetEpochMs: 18000,
    });

    expect(result.current.remainingMs).toBe(8000);
  });

  it("should remove the interval and visibility listener on unmount", () => {
    const removeListenerSpy = vi.spyOn(
      document,
      "removeEventListener"
    );

    const { unmount } = renderHook(() =>
      usePubgAirdropTimer(20000)
    );

    unmount();

    expect(vi.getTimerCount()).toBe(0);

    expect(removeListenerSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function)
    );
  });
});
