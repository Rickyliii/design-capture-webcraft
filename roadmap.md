# Roadmap

## Golden finale
- [ ] Add a 2–3 second non-blocking ALL GOLD celebration for new commands only; verify duplicate reads, refresh, reduced motion and existing manual controls without protocol changes.

## Artist view
- [x] Remove artist sign-in and expose only anonymous aggregate participation counts publicly; Show Control authorization unchanged. Signed-out real counts, five-second updates and 390px layout verified without runtime errors.
- [x] Add Artists as the final tab with existing admin-authorized participation counts, activation rate, activity counts and crowd colors; post-show return is explicitly untracked. Six tests passed; signed-out entry, real authorized stats, five-second refresh, live device presence, 390px layout and automatic build verified. No changes to permissions, data or Show Control.

## Final presentation UX
- [x] Reorder the bottom tabs to Show, Forum, Rewards, Profile, Live; nav order checked in the preview at 390px and Live still opens.
- [x] Make the existing JOIN CONCERT SYNC primary after activation and add requested helper/connected text; 14 tests, automatic build and simulated-phone activation → sync → authorized blue/rose changes → leave verified, with no runtime errors. UI-only; backend and Show Control unchanged.
- [x] Prioritize star/lightstick entry, clarify create → activate → sync, preserve saved star identity including legacy fresh links; 34 tests and simulated mobile creation, eight colors, four shapes, activation, modes, authorized four-color sync, exit and 22-second stage pause/resume verified. Backend and presenter commands unchanged; physical-phone QR access and browser chrome require a manual rehearsal.

## Done
- [x] Remove the "T-minus 3d" badge from the top-right of the app header; the fanDrop logo stays on the left and no gap remains, checked on Show, Live and Rewards.
- [x] Replace Aurora with Wave Mode: a bright light band sweeps across the screen every 3.5s over a deep-blue base, tinted by the fan's own Star Color, while the centre star stays fixed; the presenter button reads START WAVE. Reduced-motion preference is honoured and 17 tests passed.

- [x] Restore memory card photos: the five CDN concert scenes had gone missing (all 404), so five new AI-generated demo scenes were created and re-uploaded as CDN assets; Profile shelf and memory card pages verified showing photos with legible text.
- [x] Remove the "Before the show" heading and its two cards (voice note, Fan rewards) from Show; the Forum and Rewards tabs already cover both.
- [x] Rename the Show ticket link to "Get tickets" and reorder the bottom tabs to Show, Live, Rewards, Forum, Profile; verified in the preview at 390px.
- [x] Selectively incorporate FanDrop-source.zip merchandise: imported hoodie/keychain images, product previews and local demo purchase; preserve current Before the show links, navigation, 22-second opening and phone sync.
- Merchandise sample collection added directly to Show with product imagery and three named items; no checkout or invented prices.
- Chorus screen rebuilt as a video flow: live camera viewfinder, 15-sec record, watch back, send
- Artist switched to Justin Bieber on every screen, with real song titles (Peaches, YUKON, Sorry, Baby)
- Live tab added (/live): in-concert "Show night" sector with locked exclusive-event slots — activities TBD from user
- Gate scan unlocks Live: tap ticket on Show → "I'm at the gate — scan me" sets localStorage flag; /live switches from locked to "Concert mode ON"

- Memory cards in the Pass tab: one card per show attended (photos/short videos, favourite song, mood, message, save/share)
- Fourth memory card added: Justin Bieber · Justice Tour · Aug 12, 2022 · Ghost — matches the Justice Tour post in the Forum

## Open
- Fill the Live tab with the user's specific in-concert exclusive activities (user will provide them)
- Show details are still invented (Scotiabank Arena, Oct 20, Section B/Row 12/Seat 07, fan names, "1,284 clips") — no Bieber tour dates are announced, so waiting on the user's real ones
- "Show day" part of the flowchart: QR entry, light painting, song voting — not started, waiting on the user to confirm it's next
- [x] Memory cards: one per show — Justin Bieber (Justice Tour 2022), Taylor Swift (Eras 2024), Drake (Blur 2023), plus tonight; dates/seats invented

## Open (new)
- [x] Replace presenter music controls with START / PAUSE / RESTART for the shared 22-second opening; participant counts retained, authorized stage pause/resume/restart and Manual lighting verified, 20 tests passed.
- [x] Remove duplicate Awakening shortcut, highlight the exclusive activity with cobalt/pink and subtle motion, rename its entry MY INTERACTIVE LIGHTSTICK and point its QR to Live; four link tests and desktop/mobile navigation checks passed.
- [x] Revert the rejected directly-visible Live QR addition; retain the existing participant QR inside the Awakening dialog.
- [x] Shorten the presentation opening from 27 to 15 seconds, preserving all phases and PLAY/STOP/REPLAY; 20 tests passed and authorized stage playback, reveal, completion, replay and stop verified. Editable music timelines remain unchanged.
- [x] Lengthen the presentation opening to 22 seconds (15 felt too short); all five phases retimed from the uploaded 27-second choreography, boundaries covered by tests.
- [x] Split stage opening into separate PLAY, STOP and REPLAY controls, retaining OPEN STAGE SCREEN; verified stage play, replay restart and stop-to-waiting in an authorized browser.
- [x] Provide the presenter control link on request.
- [x] Further simplify presenter controls: opening/replay and STOP prominent, real counts retained, music/timing/manual tools disclosed; authorized stage and music start/stop checked, narrow layout checked, 27 tests passed.
- [x] Improve iPhone safe-area light immersion and add manifest-only home-screen support with an explicit installation prompt; no offline cache. Simulated iPhone checks passed; native browser chrome still requires a physical device.
- [x] Integrate uploaded 27-second opening on stage, presenter-triggered only, with YOUR LIGHT waiting screen and separate star revisit entry; shared playback, completion and replay verified.
- [x] Saved color and shape edits retain identity/participation and return to the selected light mode; verified persistence after reload. Page/root/body tint stays in step with lighting and has a fullscreen retry. Authorized browser checks passed for shared opening and uploaded music; anonymous preview request returned 401, so guests need a shared preview link or public publication. Native iPhone browser-bar tint remains unverified.
- [x] Match phone safe-area colors to current lighting; expose opening/replay and simplify presenter view with live counts; verified shared opening, local music upload and color changes in an authorized browser flow. Native iPhone chrome and physical-phone checks remain unverified.
- [x] English-only Awakening and presenter UI; QR embedded inside Awakening; restored shared gathering/reveal on phones and /stage, then personal animated light. Verified with an authorized presenter, two simulated phones and stage; public access requires publishing or a shared review link.
- [x] Connect Live The Awakening to phone participation, add QR/link, clarify explicit Concert Sync consent, refresh star shapes, simplify presenter controls and remove unused challenge/achievements.
- [x] Activated lightstick and Star Home offer saved personal color changes without re-registration; explain presenter/phone setup
- [x] Awakening 3.0 Phase A implementation: local presenter music, editable cues, shared scheduled timeline, static/STOP/reset safety, clock calibration
- [x] Awakening 3.0 Phase A authorized end-to-end: presenter upload/start/stop verified with two simulated phones showing the same music lighting; participants can select Solid or exit.
- Music synchronization check superseded by the user's animation-only presentation controls.
- Phase B/C from Awakening 3.0 await Phase A approval; do not start them automatically
- [x] Rewards: 4 stage names, tap to see rewards
- [x] Phase A: 8 colors, 4 lightstick modes, Show Control (custom color, stop, presence)
- Phase B: Forge Your Constellation
- Phase C: Star Collection + Star Battle
