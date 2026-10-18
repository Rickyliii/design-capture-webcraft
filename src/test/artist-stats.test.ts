import { describe, expect, it } from "vitest";
import { activationRate, audienceRetentionRate, participationActivities } from "@/lib/artist-stats";

describe("Artist participation metrics", () => {
  it("defines audience retention as registered fans who saved a memory card", () => {
    expect(audienceRetentionRate({ registered: 40, activated: 30, lights: 2, challenges: 1, teams: {}, afterShow: { memoryCards: 24, shared: 12, medianMinutes: 107 } })).toBe(60);
  });
  it("does not imply retention without registered fans or after-show data", () => {
    expect(audienceRetentionRate({ registered: 0, activated: 0, lights: 0, challenges: 0, teams: {}, afterShow: { memoryCards: 0, shared: 0, medianMinutes: null } })).toBeNull();
    expect(audienceRetentionRate({ registered: 40, activated: 0, lights: 0, challenges: 0, teams: {} })).toBeNull();
  });
  it("calculates activation from actual registered fans, not illustrative percentages", () => {
    expect(activationRate({ registered: 20, activated: 7, lights: 2, challenges: 1, teams: {} })).toBe(35);
  });
  it("does not imply an activation rate before any fan registers", () => {
    expect(activationRate({ registered: 0, activated: 0, lights: 0, challenges: 0, teams: {} })).toBeNull();
  });
  it("keeps tracked participation counts separate", () => {
    expect(participationActivities({ registered: 20, activated: 7, lights: 2, challenges: 1, teams: {} }).map(a => a.count)).toEqual([7, 2, 1]);
  });
});