import type { ShowState } from "./light";

export const GOLDEN_FINALE_MS = 2800;

/** A first read is a baseline, not a command received live. */
export function isNewGoldCommand(previous: ShowState | null, next: ShowState): boolean {
  return previous !== null && next.is_show_active && next.mode === "color" && next.global_color === "gold"
    && Date.parse(next.updated_at) > Date.parse(previous.updated_at);
}