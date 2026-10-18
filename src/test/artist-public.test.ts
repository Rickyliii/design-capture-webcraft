import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ handler: (handler: () => Promise<unknown>) => handler }),
}));
const { select } = vi.hoisted(() => ({ select: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { from: () => ({ select }) },
}));
import { getArtistStats } from "@/lib/artist.functions";

describe("Public artist statistics", () => {
  it("returns counts without a session and never requests fan records", async () => {
    const query = { data: [], error: null,
      eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({ count: 7, error: null }).then(resolve),
    };
    select.mockReturnValue(query);
    const result = await getArtistStats();
    expect(result).toEqual({ registered: 7, activated: 7, lights: 7, challenges: 7, afterShow: { memoryCards: 0, shared: 0, medianMinutes: null }, teams: { violet: 7, blue: 7, rose: 7, gold: 7 } });
    expect(select).toHaveBeenCalledTimes(9);
    for (const call of select.mock.calls.slice(0, 8)) expect(call).toEqual(["id", { count: "exact", head: true }]);
    expect(Object.keys(result)).not.toContain("fans");
  });
});