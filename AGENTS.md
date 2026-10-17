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
