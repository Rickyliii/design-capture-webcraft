import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateTimeline, type MusicTimeline } from "./music-show";
import {
  ACTIVITY_KINDS,
  COMMANDS,
  FIRST_CONCERT,
  LIGHT_EVENT_ID,
  SHOW_BROADCAST_CHANNEL,
  STAR_TYPES,
  TEAM_IDS,
  isHex,
  isStarColor,
  teamOf,
  stateForCommand,
  type ActivityKind,
  type Command,
} from "./light";

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const fanIdOk = (v: unknown): v is string => typeof v === "string" && /^[a-zA-Z0-9-]{16,64}$/.test(v);

export type LightFan = {
  fan_id: string;
  nickname: string;
  star_color: string;
  star_type: string;
  activated: boolean;
  light_sent: boolean;
  challenge_done: boolean;
};
const FAN_COLS = "fan_id,nickname,star_color,star_type,activated,light_sent,challenge_done";

export const getFan = createServerFn({ method: "POST" })
  .inputValidator((d: { fanId: string }) => {
    if (!fanIdOk(d?.fanId)) throw new Error("Invalid fan id");
    return d;
  })
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db.from("light_fans").select(FAN_COLS).eq("event_id", LIGHT_EVENT_ID).eq("fan_id", data.fanId).maybeSingle();
    return (row as LightFan | null) ?? null;
  });

export const registerFan = createServerFn({ method: "POST" })
  .inputValidator((d: { fanId: string; nickname: string; color: string; type: string; first?: string | undefined }) => {
    const nickname = String(d?.nickname ?? "").trim().slice(0, 24);
    if (!fanIdOk(d?.fanId) || !nickname || !isStarColor(d.color) || !STAR_TYPES.includes(d.type as never)) throw new Error("Invalid star");
    const first: string | null = FIRST_CONCERT.includes(d.first as never) ? (d.first ?? null) : null;
    return { fanId: d.fanId, nickname, color: d.color, type: d.type, first };
  })
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: existing } = await db.from("light_fans").select("id").eq("event_id", LIGHT_EVENT_ID).eq("fan_id", data.fanId).maybeSingle();
    const { data: row, error } = await db
      .from("light_fans")
      .upsert(
        { event_id: LIGHT_EVENT_ID, fan_id: data.fanId, nickname: data.nickname, star_color: data.color, star_type: data.type, first_concert_self_reported: data.first },
        { onConflict: "event_id,fan_id" },
      )
      .select(FAN_COLS)
      .single();
    if (error) throw new Error("Could not save your star");
    if (!existing) {
      await db.from("light_activity").insert([
        { event_id: LIGHT_EVENT_ID, fan_id: data.fanId, kind: "star_created" },
        { event_id: LIGHT_EVENT_ID, fan_id: data.fanId, kind: "team_joined" },
      ]);
    }
    return row as LightFan;
  });

/** Records an activity; flag-type activities only count once per fan per event. */
export const recordActivity = createServerFn({ method: "POST" })
  .inputValidator((d: { fanId: string; kind: ActivityKind }) => {
    if (!fanIdOk(d?.fanId) || !ACTIVITY_KINDS.includes(d.kind)) throw new Error("Invalid activity");
    return d;
  })
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: fan } = await db.from("light_fans").select(FAN_COLS).eq("event_id", LIGHT_EVENT_ID).eq("fan_id", data.fanId).maybeSingle();
    if (!fan) throw new Error("Create your star first");
    const flag = data.kind === "lightstick_activated" ? "activated" : data.kind === "light_sent" ? "light_sent" : data.kind === "challenge_completed" ? "challenge_done" : null;
    let first = true;
    if (flag) {
      // Conditional update: only flips false → true, so repeats change nothing.
      const { data: changed } = await db.from("light_fans").update(flag === "activated" ? { activated: true } : flag === "light_sent" ? { light_sent: true } : { challenge_done: true }).eq("event_id", LIGHT_EVENT_ID).eq("fan_id", data.fanId).eq(flag, false).select("id");
      first = (changed?.length ?? 0) > 0;
    }
    if (first) await db.from("light_activity").insert({ event_id: LIGHT_EVENT_ID, fan_id: data.fanId, kind: data.kind });
    const { data: updated } = await db.from("light_fans").select(FAN_COLS).eq("event_id", LIGHT_EVENT_ID).eq("fan_id", data.fanId).single();
    return { first, fan: updated as LightFan };
  });

/** Public leaderboard: counts only, no personal data. */
export const getTeamBoard = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data } = await db.from("light_fans").select("star_color,light_sent").eq("event_id", LIGHT_EVENT_ID);
  const board = Object.fromEntries(TEAM_IDS.map((c) => [c, { members: 0, lights: 0 }])) as Record<string, { members: number; lights: number }>;
  for (const r of data ?? []) {
    const t = board[teamOf(r.star_color)]; if (!t) continue;
    t.members++;
    if (r.light_sent) t.lights++;
  }
  return board;
});

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (data !== true) throw new Error("Not authorized");
}

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return data === true;
  });

/** Public clock only: no private show or fan data. */
export const getShowClock = createServerFn({ method: "GET" }).handler(() => Date.now());

export const startMusicShow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { timeline: MusicTimeline; scheduledStart: number }) => {
    const timeline = validateTimeline(d?.timeline);
    if (!Number.isFinite(d?.scheduledStart)) throw new Error("Invalid start time");
    return { timeline, scheduledStart: d.scheduledStart };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const now = Date.now();
    if (data.scheduledStart < now + 500 || data.scheduledStart > now + 30000) throw new Error("Start arrived too late. Stop and try again with a longer preparation time.");
    const { data: row, error } = await context.supabase.from("show_state").update({
      mode: "music", global_color: null, is_show_active: true,
      sequence_name: data.timeline.sequenceId,
      sequence_start_time: new Date(data.scheduledStart).toISOString(),
      updated_at: new Date(now).toISOString(), music_timeline: data.timeline,
    }).eq("event_id", LIGHT_EVENT_ID).select().single();
    if (error) throw new Error("Could not start the music show");
    try {
      const db = await admin();
      const channel = db.channel(SHOW_BROADCAST_CHANNEL);
      await channel.httpSend("state", { updated_at: row.updated_at });
      await db.removeChannel(channel);
    } catch { console.error("Music show ping failed; phones will re-read the stored timeline."); }
    return row;
  });

export const getShowStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const db = await admin();
    const { data: fans } = await db.from("light_fans").select("star_color,activated,light_sent,challenge_done").eq("event_id", LIGHT_EVENT_ID);
    const teams: Record<string, number> = { violet: 0, rose: 0, gold: 0, blue: 0 };
    let activated = 0, lights = 0, challenges = 0;
    for (const f of fans ?? []) {
      teams[teamOf(f.star_color)] = (teams[teamOf(f.star_color)] ?? 0) + 1;
      if (f.activated) activated++;
      if (f.light_sent) lights++;
      if (f.challenge_done) challenges++;
    }
    return { registered: fans?.length ?? 0, activated, lights, challenges, teams };
  });

export const sendShowCommand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { command: Command; hex?: string | undefined }) => {
    if (!COMMANDS.includes(d?.command)) throw new Error("Unknown command");
    if (d.command === "custom" && !isHex(d.hex)) throw new Error("Invalid color");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // Written as the signed-in admin; RLS also requires the admin role.
    const { data: row, error } = await context.supabase
      .from("show_state")
      .update(stateForCommand(data.command, new Date(), data.hex))
      .eq("event_id", LIGHT_EVENT_ID)
      .select()
      .single();
    if (error) throw new Error("Command failed");
    // Push the new state to every phone instantly; phones also watch the table and re-check as backups.
    try {
      const db = await admin();
      const ch: any = db.channel(SHOW_BROADCAST_CHANNEL);
      if (typeof ch.httpSend === "function") await ch.httpSend("state", row);
      else await ch.send({ type: "broadcast", event: "state", payload: row });
      db.removeChannel(ch);
    } catch (e) { console.error("broadcast failed", e); }
    return row;
  });
