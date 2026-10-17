import { describe, expect, it } from "vitest";
import { attendedEvents } from "@/lib/memory-data";

describe("memory cards per show", () => {
  it("only past shows have cards before the gate scan", () => {
    expect(attendedEvents(false).map((e) => e.id)).toEqual(["ts-2024-eras", "dr-2023-blur", "jb-2022-justice"]);
  });
  it("tonight's show adds a card once the pass is scanned", () => {
    expect(attendedEvents(true)).toHaveLength(4);
    expect(attendedEvents(true)[0]!.id).toBe("jb-2026-live");
  });
});
