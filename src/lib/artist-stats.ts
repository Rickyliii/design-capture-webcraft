export type ParticipationStats = {
  registered: number;
  activated: number;
  lights: number;
  challenges: number;
  teams: Record<string, number>;
};

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