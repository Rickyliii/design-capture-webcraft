const PREVIEW_ORIGIN = "https://id-preview--15c6b9b8-81bb-48c4-b62c-acd135fc65d8.lovable.app";

export function participationUrl(origin: string) {
  const url = new URL(origin);
  const publicOrigin = ["localhost", "127.0.0.1"].includes(url.hostname) ? PREVIEW_ORIGIN : url.origin;
  return `${publicOrigin}/light?concert=true`;
}