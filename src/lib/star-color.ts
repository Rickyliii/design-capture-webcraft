import { isStarColor, type StarColor } from "./light";
/** A color-only edit never resets identity or participation. */
export function starColorUpdate(color: unknown): { star_color: StarColor } {
  if (!isStarColor(color)) throw new Error("Invalid star color");
  return { star_color: color };
}