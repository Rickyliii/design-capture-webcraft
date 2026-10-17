import type { ComponentType } from "react";

export type LiveProfile = { fanId: string; nickname: string; mood: string };
declare const LiveFeatures: ComponentType<{
  gateScanned?: boolean;
  profile?: LiveProfile | null;
  event?: { id: string; artist: string; tour?: string };
  onProfileChange?: (next: unknown) => void;
  onNavigatePass?: () => void;
  onScan?: () => void;
}>;
export default LiveFeatures;
