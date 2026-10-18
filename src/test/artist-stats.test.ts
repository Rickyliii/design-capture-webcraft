import { describe, expect, it } from "vitest";
import { activationRate, participationActivities } from "@/lib/artist-stats";

describe("Artist participation metrics", () => {
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