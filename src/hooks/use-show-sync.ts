import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LIGHT_EVENT_ID, SHOW_BROADCAST_CHANNEL, type ShowState } from "@/lib/light";
import { getShowClock } from "@/lib/light.functions";

export function useShowSync() {
  const [state, setState] = useState<ShowState | null>(null);
  const [now, setNow] = useState(0);
  const offset = useRef(0);
  useEffect(() => {
    let active = true;
    const calibrate = async () => {
      const before = Date.now();
      try { const server = await getShowClock(); if (active) offset.current = server - (before + Date.now()) / 2; } catch {}
    };
    const read = async () => {
      const { data } = await supabase.from("show_state").select("*").eq("event_id", LIGHT_EVENT_ID).maybeSingle();
      if (active && data) setState(previous => previous && Date.parse(previous.updated_at) > Date.parse(data.updated_at) ? previous : data as ShowState);
    };
    void calibrate(); void read();
    const tick = setInterval(() => setNow(Date.now() + offset.current), 100);
    const poll = setInterval(read, 4000);
    const clock = setInterval(calibrate, 30000);
    const channel = supabase.channel(`stage-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "show_state", filter: `event_id=eq.${LIGHT_EVENT_ID}` }, read).subscribe();
    const broadcast = supabase.channel(SHOW_BROADCAST_CHANNEL).on("broadcast", { event: "state" }, read).subscribe();
    const wake = () => { if (document.visibilityState === "visible") { void calibrate(); void read(); } };
    document.addEventListener("visibilitychange", wake);
    return () => { active = false; clearInterval(tick); clearInterval(poll); clearInterval(clock); void supabase.removeChannel(channel); void supabase.removeChannel(broadcast); document.removeEventListener("visibilitychange", wake); };
  }, []);
  return { state, now };
}