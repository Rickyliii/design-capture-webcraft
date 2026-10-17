import { describe, expect, it } from "vitest";
import { isAllowedVideoDuration, mediaKind } from "@/lib/album-media";

describe("concert album media", () => {
  it("accepts both photos and videos in the same album", () => {
    expect(["image/jpeg", "video/mp4", "image/png", "video/webm"].map(mediaKind)).toEqual(["image", "video", "image", "video"]);
    expect(mediaKind("application/pdf")).toBeNull();
  });
  it("preserves the existing 20-second short video limit", () => {
    expect(isAllowedVideoDuration(15)).toBe(true);
    expect(isAllowedVideoDuration(20)).toBe(true);
    expect(isAllowedVideoDuration(20.01)).toBe(false);
    expect(isAllowedVideoDuration(Infinity)).toBe(false);
    expect(isAllowedVideoDuration(0)).toBe(false);
  });
});