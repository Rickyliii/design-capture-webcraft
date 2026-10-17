import { describe, it, expect } from "vitest";
import { stageFromEnergy } from "./afterlight";

describe("Afterlight stage thresholds", () => {
  it("0–499 is The Spark", () => { expect(stageFromEnergy(0)).toBe(1); expect(stageFromEnergy(499)).toBe(1); });
  it("500–1,499 is The Awakened", () => { expect(stageFromEnergy(500)).toBe(2); expect(stageFromEnergy(1499)).toBe(2); });
  it("1,500–3,999 is The Collaborator", () => { expect(stageFromEnergy(1500)).toBe(3); expect(stageFromEnergy(3999)).toBe(3); });
  it("4,000+ is Inner Circle", () => { expect(stageFromEnergy(4000)).toBe(4); });
});
