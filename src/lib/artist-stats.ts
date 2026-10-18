export type ParticipationStats = {
  registered: number;
  activated: number;
  lights: number;
  challenges: number;
  teams: Record<string, number>;
  afterShow?: AfterShowStats;
};

export type AfterShowStats = { memoryCards: number; shared: number; medianMinutes: number | null };

/** Aggregates memory-card follow-up; median minutes from a fan joining to saving their first card. */
export function afterShowSummary(saved: { fan_id: string; created_at: string }[], joined: { fan_id: string; created_at: string }[], shared: number): AfterShowStats {
  const first = new Map<string, number>();
  for (const r of saved) { const t = Date.parse(r.created_at); if (!first.has(r.fan_id) || t < first.get(r.fan_id)!) first.set(r.fan_id, t); }
  const gaps = joined.filter(j => first.has(j.fan_id)).map(j => Math.max(0, (first.get(j.fan_id)! - Date.parse(j.created_at)) / 60000)).sort((a, b) => a - b);
  const mid = gaps.length / 2;
  const median = gaps.length ? (gaps.length % 2 ? gaps[Math.floor(mid)]! : (gaps[mid - 1]! + gaps[mid]!) / 2) : null;
  return { memoryCards: first.size, shared, medianMinutes: median === null ? null : Math.round(median) };
}

export function formatMinutes(m: number | null): string {
  if (m === null) return "—";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export function activationRate(stats: ParticipationStats): number | null {
  return stats.registered > 0 ? Math.round(stats.activated / stats.registered * 100) : null;
}

export function participationActivities(stats: ParticipationStats) {
  return [
    { label: "Lightstick activated", count: stats.activated },
    { label: "Light sent", count: stats.lights },
    { label: "Challenge completed", count: stats.challenges },
  ];
}