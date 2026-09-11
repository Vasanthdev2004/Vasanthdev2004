# Contribution chart data

These charts show **public, authored, merged pull requests in Gitlawb**, not all GitHub contributions. Commits, reviews, issues, private repositories, and unmerged PRs are not counted.

The snapshot timestamp is in `gitlawb-contributions.json`. Every record includes its public PR URL and actual merge timestamp. The cumulative line uses UTC days; the last point ends at the snapshot time. Repository bars use a shared linear scale starting at zero. The last-30-days count is relative to the snapshot, not the viewer's clock.

The moving line highlight is decorative. It does not indicate new merges or a live connection. Motion is disabled for `prefers-reduced-motion: reduce`; the underlying chart always remains fully visible.

## Verify or regenerate

Node.js 22 or newer; no package dependencies or secrets required:

```sh
node --test scripts/render-contributions.test.mjs
node scripts/render-contributions.mjs --check
node scripts/render-contributions.mjs
```

To refresh the snapshot, query GitHub for `org:Gitlawb author:Vasanthdev2004 is:pr is:merged is:public`. Fetch every page and reject incomplete search results. Verify that every included repository is public. Use `pull_request.merged_at` from search results (or `mergedAt` from GraphQL), not `closed_at`. Update the snapshot and the README's textual counts/date together, then regenerate and verify the four chart variants. The renderer accepts only the six explicitly allowlisted public repositories; review any additions before extending that list.

The snapshot does not auto-refresh. Charts are served from this repository, with no external statistics service, tracking pixel, or browser-side requests beyond loading the image.
