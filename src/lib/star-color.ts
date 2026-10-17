import { isStarColor, STAR_TYPES, type StarColor, type StarType } from "./light";
/** A color-only edit never resets identity or participation. */
export function starColorUpdate(color: unknown): { star_color: StarColor } {
  if (!isStarColor(color)) throw new Error("Invalid star color");
  return { star_color: color };
}

/** Appearance edits must not touch participation or create another fan. */
export function starAppearanceUpdate(color: unknown, type: unknown): { star_color: StarColor; star_type: StarType } {
  const shape = STAR_TYPES.find(value => value === type);
  if (!shape) throw new Error("Invalid star shape");
  return { ...starColorUpdate(color), star_type: shape };
}