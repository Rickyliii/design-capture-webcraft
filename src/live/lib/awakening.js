export const starThemes = {
  Electric: { color: '#b6a0ef', name: 'Violet energy', key: 'violet' },
  Emotional: { color: '#e7acac', name: 'Rose-gold celestial', key: 'rose-gold' },
  Nostalgic: { color: '#e4c08a', name: 'Warm golden', key: 'gold' },
  Dreamy: { color: '#a3cef0', name: 'Blue luminous', key: 'blue' },
};
export const DEMO_STARS = 2416;
export function awakenStar(profile) {
  if (profile.awakening?.starAwakened) return profile;
  return { ...profile, awakening: { starColor: starThemes[profile.mood].key, starAwakened: true, lightSent: false } };
}
export function sendLight(profile, now = new Date().toISOString()) {
  if (profile.awakening?.lightSent) return profile;
  if (!profile.awakening?.starAwakened) throw new Error('Awaken your star first.');
  return { ...profile, awakening: { ...profile.awakening, lightSent: true, sentAt: now } };
}
export function ceremonyPhase(seconds) {
  if (seconds < 5) return 'darkness';
  if (seconds < 12) return 'awakening';
  if (seconds < 19) return 'convergence';
  if (seconds < 22) return 'supernova';
  return 'reveal';
}
