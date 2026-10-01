# Tailfins & Tyrants - feasibility study (2026-10-01)

Research by three parallel research agents using web search. Most vendor and store pages could not be opened directly (network proxy), so many figures come from search-result summaries and secondary sources. VERIFIED = found in a source; ESTIMATE = inference or third-party estimator. Confirm prices on the vendor page before paying.

## Bottom line
- As an investment, this does not pay back on its own. The median Steam game released in 2025 earned about $249, and 66% earned under $1,000 (Gamalytic, ESTIMATE). Realistic first-year range for this game: $0-300 pessimistic, $500-2,500 median, $5K-15K optimistic (needs 3K+ wishlists and a viral hook).
- Genre hits come from funded studios: Streets of Rage 4 (3 studios, about 3 years, 2.5M+ sold), TMNT: Shredder's Revenge (about 15 people, 1M+ in week one), Absolum (500K+). The realistic floor for a small studio is Mayhem Brawler: about $300K gross, top decile.
- Recommended spend: the lean tier (about $65 without Steam, about $165 with Steam), then a public demo. Spend more only if the demo earns 3,000+ Steam wishlists or strong itch.io numbers.
- "GTA level" is not a budget question. GTA V cost about $265M with 1,000+ people over about 5 years (ESTIMATE). GTA VI is rumoured at $1-2B with about 6,000 staff. What is reachable here is premium polish in a small scope: tight combat, real audio and smooth animation.

## Market
| Title | Team | Result | Status |
|---|---|---|---|
| Streets of Rage 4 (2020) | 3 studios, about 3 years | 2.5M+ copies by Apr 2021 | VERIFIED |
| TMNT: Shredder's Revenge (2022) | Tribute Games, about 15 people | 1M+ in week one, $24.99 | VERIFIED |
| Absolum (2025) | Guard Crush, Supamonks, Dotemu | 500K+ by Jan 2026 | VERIFIED |
| Fight'N Rage (2017) | 1 person, years of work | about 200K Steam owners | ESTIMATE (SteamSpy) |
| Mayhem Brawler (2021) | small studio | about 22K units, about $298K gross | ESTIMATE (VG Insights) |
| Treachery in Beatdown City (2020) | 2 devs, $50K Kickstarter | 50K-100K owners | ESTIMATE |

- The genre is crowded: about 3,300 beat 'em ups on Steam (games-stats).
- Price points: $24.99 for studio titles, $7-15 for small indies.
- Wishlist conversion: about 15-20% in the first week, 30-40% over three months (Zukowski, secondary source).

## Distribution
- Steam: $100 fee, refunded after $1,000 in revenue. Valve takes 30%. Since 16 Jan 2026, AI-generated art and audio must be disclosed on the store page; AI-assisted code is exempt. VERIFIED.
- itch.io: free hosting, 10% default cut (adjustable). VERIFIED.
- Poki and CrazyGames: about 50% and 60% of ad revenue. Both are curated, and their audience leans to single-player casual games. ESTIMATE.
- Hosting: Cloudflare Pages is free with unlimited bandwidth, max 25 MiB per file. Vercel Hobby bans commercial use. VERIFIED.

## Costs (tiers)
| Tier | Contents | Cost |
|---|---|---|
| Lean | Suno Pro 1 month ($10, 7 tracks), ElevenLabs Starter ($6, SFX and voice barks), Sonniss GDC pack (free), Higgsfield Plus 1 month ($49, animation test), Cloudflare/itch (free), Steam ($100, optional) | about $65, or $165 with Steam |
| Standard | Suno 2 months, ElevenLabs Creator 2 months, Higgsfield Ultra 2 months, Kling Pro 1 month, Steam, domain, buffer | about $600 |
| Premium | Standard AI stack plus a human composer (2 themes), a pixel animator (about 25 hours) and a sound designer | about $2,000-2,300 |

- Higgsfield music and sound-effect models are restricted to its own game-builder pipeline, so they can't be used for this project. Use Suno for music and ElevenLabs plus Sonniss for sound effects.
- The Higgsfield account currently has 0 credits on the free plan (checked 2026-10-01).
- Udio downloads are disabled after the UMG settlement, so it is not usable.
- Suno commercial rights attach to songs downloaded while a paid plan is active.

## Risks
| Risk | Detail | Mitigation |
|---|---|---|
| AI-art backlash | Several 2025-26 games were review-bombed, cancelled or delisted over AI art (Postal: Bullet Paradise, Hardest, Vapor World). Even false accusations hurt (Shrine's Legacy). | Disclose honestly. Hand-edit key art. Lead marketing with gameplay. |
| No copyright on raw AI art | Human-authorship rule; Thaler cert denied 2 Mar 2026. Others could copy raw sprites. | Keep records of human edits. Code and the compiled game are protected. |
| Trademark | GM holds the "Cadillacs and Dinosaurs" trademark; it is why the original game is not re-released. | Never use "Cadillac" or "Cadillacs and Dinosaurs" in the title, store tags or marketing. "The Duchess" is fine. Get a lawyer's review before a paid launch. |
| OpenAI terms | You own outputs and may use them commercially. OpenAI does not guarantee they are free of third-party rights. | Check that no output copies Capcom designs. |
| Platform fit | 1-8 player local co-op suits Steam and PC, not phone-first web portals. | Lead with Steam and itch; portals are a bonus. |

## Plan
1. Lean audio pass ($16): music and sound effects in the game.
2. Animation test ($49): one hero's run cycle via video-to-frames. Continue only if consistent.
3. Polish combat and feel (no cost; AI engineering work).
4. Public demo on itch.io plus a Steam page with wishlists, about 3-6 weeks of marketing.
5. Gate: 3,000+ wishlists means invest in the standard or premium tier; otherwise keep it as a portfolio piece.
