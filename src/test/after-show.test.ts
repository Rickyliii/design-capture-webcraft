import { describe, expect, it } from "vitest";
import { afterShowSummary, formatMinutes } from "@/lib/artist-stats";

describe("After-show memory card stats", () => {
  it("counts each fan once and uses the median minutes from joining to first card", () => {
    const joined = [{ fan_id: "a", created_at: "2026-10-20T20:00:00Z" }, { fan_id: "b", created_at: "2026-10-20T20:00:00Z" }, { fan_id: "c", created_at: "2026-10-20T20:00:00Z" }];
    const saved = [{ fan_id: "a", created_at: "2026-10-20T20:10:00Z" }, { fan_id: "a", created_at: "2026-10-20T23:00:00Z" }, { fan_id: "b", created_at: "2026-10-20T21:00:00Z" }, { fan_id: "c", created_at: "2026-10-21T00:00:00Z" }];
    expect(afterShowSummary(saved, joined, 2)).toEqual({ memoryCards: 3, shared: 2, medianMinutes: 60 });
  });
  it("shows no time before any card exists", () => {
    expect(afterShowSummary([], [], 0).medianMinutes).toBeNull();
    expect(formatMinutes(95)).toBe("1h 35m");
  });
});
