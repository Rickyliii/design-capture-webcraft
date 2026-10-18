import { describe, expect, it } from "vitest";
import { participationUrl } from "@/lib/participation";

describe("phone participation links", () => {
  it("opens the Live tab for the Awakening dialog QR", () => {
    expect(participationUrl("https://fans.example.com", "live")).toBe("https://fans.example.com/live");
  });
  it("uses a phone-accessible Live link when previewed locally", () => {
    expect(participationUrl("http://localhost:8080", "live")).toBe("https://id-preview--15c6b9b8-81bb-48c4-b62c-acd135fc65d8.lovable.app/live");
  });
  it("preserves star identity by opening the concert entry without a reset flag", () => {
    expect(participationUrl("https://fans.example.com")).toBe("https://fans.example.com/light?concert=true");
  });
  it("never encodes a laptop-only localhost link in the phone QR", () => {
    expect(participationUrl("http://localhost:8080")).toBe("https://id-preview--15c6b9b8-81bb-48c4-b62c-acd135fc65d8.lovable.app/light?concert=true");
  });
});