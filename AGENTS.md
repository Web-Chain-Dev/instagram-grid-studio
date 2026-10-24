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

## Project rules
- Data access lives in src/lib/api.ts using the browser backend client; routes stay `ssr: false` because the editor is fully client-driven.
- RLS policies are currently open (single private user); every table has a nullable `owner_id` so policies can switch to `owner_id = auth.uid()` when login is added.
- Media bucket is private; uploads store long-lived signed URLs (public buckets are blocked in this workspace).
- Instagram look is defined by `--ig-*` tokens in src/styles.css; the profile renders in a max 470px phone-width column on every screen size.
