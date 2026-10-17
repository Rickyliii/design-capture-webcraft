import { describe, it, expect } from "vitest";
import { energyOf, stageOf } from "@/lib/afterlight";

describe("afterlight journey", () => {
  it("awards energy once per action", () => {
    expect(energyOf(["pass", "pass", "light"])).toBe(150);
  });
  it("stage 1 needs the fan pass", () => {
    expect(stageOf([])).toBe(0);
    expect(stageOf(["pass"])).toBe(1);
  });
  it("stage 2 needs 150 energy and send light", () => {
    expect(stageOf(["pass", "encore"])).toBe(1);
    expect(stageOf(["pass", "light"])).toBe(2);
  });
  it("energy alone does not unlock stage 3 without returning", () => {
    expect(stageOf(["pass", "light", "qa", "encore", "drop"])).toBe(2);
    expect(stageOf(["pass", "light", "encore", "return"])).toBe(3);
  });
  it("stage 4 needs 500 energy and an artist drop", () => {
    expect(stageOf(["pass", "light", "encore", "return"])).toBe(3);
    expect(stageOf(["pass", "light", "encore", "return", "drop"])).toBe(3);
    expect(stageOf(["pass", "light", "qa", "encore", "return", "drop"])).toBe(4);
  });
});
