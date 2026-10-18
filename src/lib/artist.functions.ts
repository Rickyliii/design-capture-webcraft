import { createServerFn } from "@tanstack/react-start";
import { TEAM_IDS, PALETTE_IDS, PALETTE } from "@/lib/light";

/** Public aggregate counts only. Never select or return individual fan rows. */
export const getArtistStats = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { LIGHT_EVENT_ID } = await import("@/lib/light");
  const countFans = async (flag?: "activated" | "light_sent" | "challenge_done", colors?: string[]) => {
    let query = db.from("light_fans").select("id", { count: "exact", head: true }).eq("event_id", LIGHT_EVENT_ID);
    if (flag) query = query.eq(flag, true);
    if (colors) query = query.in("star_color", colors);
    const { count, error } = await query;
    if (error) throw new Error("Participation data unavailable");
    return count ?? 0;
  };
  const [registered, activated, lights, challenges, teamCounts] = await Promise.all([
    countFans(), countFans("activated"), countFans("light_sent"), countFans("challenge_done"),
    Promise.all(TEAM_IDS.map(team => countFans(undefined, [team, ...PALETTE_IDS.filter(color => PALETTE[color].team === team)]))),
  ]);
  const { data: memoryRows, error: memoryError } = await db.from("light_activity").select("fan_id, kind, created_at").eq("event_id", LIGHT_EVENT_ID).in("kind", ["memory_card_saved", "memory_card_shared"]);
  if (memoryError) throw new Error("Participation data unavailable");
  const saved = (memoryRows ?? []).filter(r => r.kind === "memory_card_saved");
  const shared = new Set((memoryRows ?? []).filter(r => r.kind === "memory_card_shared").map(r => r.fan_id)).size;
  let joined: { fan_id: string; created_at: string }[] = [];
  if (saved.length) {
    const { data, error: joinError } = await db.from("light_fans").select("fan_id, created_at").eq("event_id", LIGHT_EVENT_ID).in("fan_id", saved.map(r => r.fan_id));
    if (joinError) throw new Error("Participation data unavailable");
    joined = data ?? [];
  }
  const { afterShowSummary } = await import("@/lib/artist-stats");
  const afterShow = afterShowSummary(saved, joined, shared);
  return { registered, activated, lights, challenges, afterShow, teams: Object.fromEntries(TEAM_IDS.map((team, i) => [team, teamCounts[i] ?? 0])) };
});