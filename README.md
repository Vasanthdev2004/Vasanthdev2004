# Vasanth T

### Product builder & open-source maintainer at [Twigpine](https://github.com/Twigpine).

I work at **Twigpine**, building products and maintaining open-source projects across AI coding tools, infrastructure, and onchain applications. I co-maintain [Zero](https://github.com/Twigpine/zero), our terminal coding agent.

My work spans implementation, code review, and ongoing maintenance: model integrations, Windows compatibility, sandboxing, trading interfaces, security fixes, and the tests that keep them working.

[Twigpine contributions](#twigpine-contributions) · [My projects](#things-im-building) · [@BuildWithBeast](https://x.com/BuildWithBeast) · [Email](mailto:vasanth.dev@outlook.com)

## Twigpine contributions

<picture>
  <source media="(max-width: 640px) and (prefers-color-scheme: light)" srcset="./assets/contributions-light-mobile.svg" />
  <source media="(max-width: 640px)" srcset="./assets/contributions-dark-mobile.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/contributions-light.svg" />
  <img src="./assets/contributions-dark.svg" width="100%" alt="Twigpine contribution history: 242 merged PRs across 6 public repositories, including 14 in the 30 days before November 17, 2026. Cumulative merge timeline and per-project breakdown." />
</picture>

<sub>Public merged PRs through November 17, 2026. <a href="./data/README.md">Source data and chart notes</a>.</sub>

Reviewing is a large part of the work too: I have reviewed [879 pull requests from other contributors](https://github.com/pulls?q=is%3Apr+is%3Apublic+reviewed-by%3AVasanthdev2004+org%3ATwigpine+-author%3AVasanthdev2004) across Twigpine’s public repositories, as of the same date.

<details>
<summary><strong>Explore all 6 projects and merged pull requests</strong></summary>

| Project | Work across our projects | Merged PRs |
| :--- | :--- | ---: |
| **[Zero](https://github.com/Twigpine/zero)** | Terminal AI tooling, model/provider integrations, sandboxing, Windows compatibility, and reliability. | **[176](https://github.com/Twigpine/zero/pulls?q=is%3Apr+is%3Amerged+author%3AVasanthdev2004)** |
| **[OpenClaude](https://github.com/Twigpine/openclaude)** | Context management, provider behavior, credentials, and cross-platform fixes. | **[38](https://github.com/Twigpine/openclaude/pulls?q=is%3Apr+is%3Amerged+author%3AVasanthdev2004)** |
| **[Openlaunch](https://github.com/Twigpine/openlaunch)** | Product UI, live trading charts, cross-chain bridging, wallet identities, and token avatars. | **[20](https://github.com/Twigpine/openlaunch/pulls?q=is%3Apr+is%3Amerged+author%3AVasanthdev2004)** |
| **[Node](https://github.com/Twigpine/node)** | Push authorization, graceful shutdown, observability, and database migrations. | **[5](https://github.com/Twigpine/node/pulls?q=is%3Apr+is%3Amerged+author%3AVasanthdev2004)** |
| **[Node Explorer](https://github.com/Twigpine/node-explorer)** | Explorer UI, search, documentation, and accessible mobile navigation. | **[2](https://github.com/Twigpine/node-explorer/pulls?q=is%3Apr+is%3Amerged+author%3AVasanthdev2004)** |
| **[OpenClaude Skills](https://github.com/Twigpine/openclaude-skills)** | Registry validation and trust-metadata hardening. | **[1](https://github.com/Twigpine/openclaude-skills/pulls?q=is%3Apr+is%3Amerged+author%3AVasanthdev2004)** |

<sub>Public authored PRs merged as of November 17, 2026. Counts are a snapshot; each number links to the latest results.</sub>

</details>

### A few changes behind those numbers

- **Keeping agent sessions reliable.** Preserved [model choices when Zero’s specialist sessions resume](https://github.com/Twigpine/zero/pull/1009), added [a session prune that never removes a session another process has open](https://github.com/Twigpine/zero/pull/1089), and prevented [repeated automatic compaction in OpenClaude](https://github.com/Twigpine/openclaude/pull/636).
- **Closing security gaps.** Made Zero [redact credentials split by an invisible character](https://github.com/Twigpine/zero/pull/1067), stopped [a repository’s git config from running programs in Zero’s own git calls](https://github.com/Twigpine/zero/pull/1133), and kept [sandbox ACL targets inside the write root they came from](https://github.com/Twigpine/zero/pull/1040).
- **Making everyday setups work.** Worked on [proxy support in Zero](https://github.com/Twigpine/zero/pull/1025) and [Windows credential handling in OpenClaude](https://github.com/Twigpine/openclaude/pull/941).
- **Building the product experience.** [Rebuilt Openlaunch’s interface and hardened live market charts](https://github.com/Twigpine/openlaunch/pull/8), landed [a nine-part UI overhaul](https://github.com/Twigpine/openlaunch/pull/76), and added [a bridge for Base, Robinhood and Arc](https://github.com/Twigpine/openlaunch/pull/49).
- **Strengthening the infrastructure.** Made [owner-only push authorization the default in Node](https://github.com/Twigpine/node/pull/330) and added [graceful shutdown with opt-in metrics](https://github.com/Twigpine/node/pull/22).

[Browse all my public Twigpine merged PRs →](https://github.com/pulls?q=is%3Apr+is%3Amerged+is%3Apublic+author%3AVasanthdev2004+org%3ATwigpine)

## Things I’m building

**[Game Save Genie](https://github.com/Vasanthdev2004/Game-Save-Genie)**<br />
Automatic, versioned game-save backups to cloud storage you control, built on Ludusavi and rclone. Windows backups are stable; cross-machine sync is in beta.

**[MoneyKernel](https://github.com/Vasanthdev2004/moneykernel)**<br />
Spending controls for AI agents: budgets, exact-order approvals, and verifiable receipts. Live market data with paper execution.

**[Kred](https://github.com/Vasanthdev2004/kred)**<br />
Verifiable income statements and shareable proof from onchain payment history. Currently an Arc Testnet MVP.

## Tools I work with

**Languages** · `Go` `TypeScript` `Python` `Solidity`<br />
**Product** · `React` `Next.js` `Tailwind CSS`<br />
**Systems** · `Node.js` `PostgreSQL` `GitHub Actions` `Linux` `Windows`

---

**Have something useful in mind? Let’s build it.**<br />
Open to product engineering opportunities and open-source collaboration.

[vasanth.dev@outlook.com](mailto:vasanth.dev@outlook.com) · [Follow @BuildWithBeast](https://x.com/BuildWithBeast) · [Explore my repositories](https://github.com/Vasanthdev2004?tab=repositories)
