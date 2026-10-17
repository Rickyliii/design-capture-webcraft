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
- Personal color edits use a color-only server update on the existing fan row, never re-registration. Why: changing colors must retain identity and participation flags.
