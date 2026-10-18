<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Live Light: fans are anonymous (localStorage fan id) and write only through server functions using the admin client; show_state is publicly readable via realtime but only updatable by `admin` role (first signup becomes admin). Why: cross-device sync without fan accounts, while keeping light control server-authorized.
- Show Control commands: server function writes show_state (admin-only) then sends a broadcast ping; phones re-read the table on ping, on table change, and every 4s. Why: database change events were not reaching phones in testing, and broadcast payloads can be spoofed by anyone.
- Music shows store validated cue configuration and a shared start timestamp in show_state; devices interpolate locally using a server-calibrated clock. Why: late joins recover the same phase without frame-by-frame network commands.
- Presenter audio stays in a local object URL, starts on an explicit tap, and anchors the shared timeline to actual audio position with a preparation lead; preview never writes shared state. Why: autoplay restrictions and local copyright boundaries must not compromise synchronization.
- Personal appearance edits update only color and/or shape on the existing fan row, never re-registration; lightstick edits return to its selected mode. Why: changes must retain identity, participation flags and sync consent.
- Participation links use a shared origin resolver with an explicit destination: Live's Awakening dialog opens Live, while Show Control retains the light route's concert entry; neither auto-activates sync. Why: activity discovery and direct phone participation need distinct destinations without surrendering participant consent.
- Light entry reuses the stored anonymous fan ID even on legacy fresh links, and activation opens personal lighting before explicit sync selection. Why: returning judges retain their created star without accidental re-registration or show consent.
- Render stored star types through the shared ConcertStar component on onboarding, Star Home and lightstick; keep presenter timing/manual tools in disclosure sections. Why: consistent shapes and progressive disclosure simplify participation without changing stored identity or show authorization.
- OpeningScene uses the uploaded GPU-batched galaxy in components/awakening, with choreography derived by openingFrame from the admin-written shared start and editable music cues; stage remains read-only and phones return to personal lighting at afterlight. Why: preserves the supplied cinematic renderer without independent timers or stage control privileges.
- Opening frames separate actual playback time/duration from the uploaded renderer's choreography time; retime presenter openings through the shared duration constant while retaining editable music cues. Why: short presentation openings preserve every visual phase and accurate device counters without rewriting shaders.
- Opening pause stores a paused mode and freezes at updated_at; resume shifts the shared start by the paused interval, with optimistic concurrency on commands. Why: phones and stage recover the same frozen frame without local timers or schema changes.
- Active lightsticks use useLightSurface to synchronize document safe-area background and browser theme color with the current display, restoring both on exit. Why: prevents personal-color bands around presenter-controlled lighting without promising control over browser-owned chrome.
- Phone home-screen support is manifest-only, with route-scoped install metadata and contextual installation guidance; never register an app-shell service worker unless offline support is requested. Why: standalone display reduces browser chrome without stale preview caches or changing sync consent.
- Show merchandise is isolated in ExclusiveMerch with hosted product images and local demo-order state; never imply real inventory, payment or fulfillment. Why: uploaded concept merchandise remains independent of ticket and live-show flows.
- Artist impact is read-only and reuses the existing admin-authorized getShowStats with five-second polling and fan-keyed presence; never expose fan records or add control commands. Why: artists see current participation without changing permissions or participant consent.
