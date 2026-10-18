import { describe, expect, it } from "vitest";
import { LIGHT_ID_KEY, lightEntryId } from "@/lib/light-identity";

function savedPhone() {
  const values = new Map([[LIGHT_ID_KEY, "ricky-star"]]);
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}

describe("judge demo star entry", () => {
  it("creates a different identity on every fresh entry on a registered phone", () => {
    const storage = savedPhone();
    expect(lightEntryId(storage, true, () => "judge-one")).toBe("judge-one");
    expect(lightEntryId(storage, true, () => "judge-two")).toBe("judge-two");
    expect(storage.getItem(LIGHT_ID_KEY)).toBe("judge-two");
  });
  it("retains the saved identity on direct light visits", () => {
    expect(lightEntryId(savedPhone(), false, () => "unexpected-new-star")).toBe("ricky-star");
  });
});