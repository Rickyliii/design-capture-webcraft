import { describe, expect, it } from "vitest";
import { zodiacFor } from "@/lib/zodiac";

describe("zodiac from birthday", () => {
  it("handles sign boundaries", () => {
    expect(zodiacFor("1994-03-01")?.name).toBe("Pisces");
    expect(zodiacFor("2000-03-21")?.name).toBe("Aries");
    expect(zodiacFor("2000-12-22")?.name).toBe("Capricorn");
    expect(zodiacFor("2000-01-20")?.name).toBe("Aquarius");
    expect(zodiacFor("")).toBeNull();
  });
});
