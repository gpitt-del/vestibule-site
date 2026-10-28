# vestibulehq.com — STATUS

Rewritten at every close-out. The newest change is the commit that carries this file; its hash is written in at the next close-out.

## Live

`main`, classic GitHub Pages, CNAME vestibulehq.com. Live commit: the one headed "PROF-PAGES-1" (2026-10-28); the one before it is 854249b (the STATUS.md rider on SITE-FOLD-3), and before that 77ac4ab (SITE-FOLD-3).

## Changes, newest first

- PROF-PAGES-1 (2026-10-28): /audiologists and /hearing-aid-specialists play the fold's report scene in their devices: the chart with the last audiogram, Open in Noah, Noah with the two sessions, the amber "Report due:" band (Preview now · Edit), click 1 the preview screen, click 2 Sign & send, the signed line reading 4 pages; the five fly-ins verbatim, in a rail right under the device with "Clicks in the app N of 2" and Start over; the hand. The screens and the page script are index.html's, copied; the hearing-aid page keeps its own letterhead ("Coastal Hearing") and provider (Dana Whitcomb, BC-HIS, DW) and signs the same report. Gone from both pages: the older chart and its Noah, the report room and "← Back to edit", the PDF-page preview, the Reports list, the guide (claim, step pills, hints). The audiologists page lost its "Noah connection" chip (the report scene starts in Noah now); the hearing-aid page lost its calendar day (`ha-cal`, the table's appointments row), REM Noah, fitting room, fitting preview and receipt, and its report chip reads "Reports in 2 Clicks". The counseling, kiosk and referral scenes play as they did (the counseling frame is 16:10 now, as in the fold). site.css: the fold's screen rules also serve the device (`.as-fold`), the chart's plot gives way before the Diagnostics (13rem), the preview stacks under 40rem of stage.
- STATUS.md rider (2026-10-28, 854249b): the open item on the profession pages reworded as SITE-CLICK-2's fifth call, in Gabe's words, with the rider that takes it (PROF-PAGES-1). Nothing on the site changed.
- SITE-FOLD-3 (2026-10-28, 77ac4ab): the fold's two notes came off; the fly-in rail starts at the top of its column, "2-Click Reports" first. The Noah ES Certified by HIMSA band sits directly under the scene chips, the width of the screen's column; "On your phone, too." and the sample-patients line follow it. Left of "Sign a report" the lead-in, two lines: "Our Favorite Features" over "click these 4 options" with a drawn arrow; where the row does not fit on one line (a phone, a tablet, the two-column fold under about 1190 px) it sits above the chips with the arrow turned down. The copy column after the fold runs the full width, its highlights in two columns from 56rem. The signed line and the chart's sent line read 4 pages, like the sample report's receipt. This file gained the "Screens we draw" table.
- SITE-CLICK-2 (2026-10-28, 6a02796): the fold is the click-through, one screen. The device that sat under the fold is gone; the fold's big screen plays every scene (site.js, the same engine, drawings and hints), with the scene chips under it. The report scene is the two-click report, from the mock on mock/site-click-2 (the flow, the words, the numbers) and Gabe's amendment: the last audiogram (today less two years and 23 days) on the chart; Open in Noah; Noah with two sessions, today's drawn over the old one dashed; ✕ then Yes; today's audiogram on the chart with the amber "Report due:" band (Preview now · Edit) as the app draws it; click 1 = Preview now opens the app's preview screen, the report's page one in the sample report's own form with a sources rail and Sign & send · add note · Edit · Close; click 2 = Sign & send, the signed line, "Report sent" on the chart, Close. The fly-in rail (five, verbatim) with "Clicks in the app N of 2" and Start over; HERO-2's hand comes to each next thing to click. The h1 reads "Vestibule: your practice's headquarters — everything audiology and hearing aids, in one place." (title and og:title equal it) and fills the content width on one line from 40rem. Every "three clicks" on the site is two.
- STATUS.md rider (2026-10-28, 382f266): never a secret, a credential, a customer's or prospect's name, or anything about Hearing-Doctors' patients.
- HERO-2 Part B + SITE-AUD-1 (2026-10-28, 0e6d358): one offer on the page, a night band between "Here's how a visit runs." and "Everything else, in the same place". "Book now" replaces "Quick-Book" in every drawn app bar and verb. The h1 became "Vestibule: your practice's headquarters — audiology and hearing aids, in one place." The speech-language pathology door came off; speech-pathology.html stays at its URL, unlinked. This file began.
- HERO-2 (2026-10-27, 4ca005c): the top fold: one small headline line, two notes beside the demo practice's chart drawn large, the yellow "Click here" with the pressing hand, and the Noah ES Certified by HIMSA band.
- SITE-HLS-VOLUME-1 (2026-10-19, 2822d24): a Volume slider on the "Hear it their way" player's Loop row.
- SITE-PROMISE-2 (2026-10-18, 4e27e0a): the headline named all three professions, the promise returned as the subline, a fourth card opened the speech-language pathology page (the first and the third undone by SITE-AUD-1).
- SITE-PROMISE-1 (2026-10-18, cac3d3b): the home page opened with the promise: save hours every week, see every dollar, set up in an hour or less.
- SITE-OG-1 (2026-10-16, 533a7ce): each landing page describes itself when shared (title = h1 = og:title); the one-sentence credit under the player; Record a voice and Load a file back in the Sound list.
- SITE-SOUNDS-1 (2026-10-16, 6a0209e; its commit body carries no ID): the chosen voices and the background choices in the Speech Intelligibility Audiogram, with the CREDITS entry.

## Screens we draw

One row per app screen the site draws, the picture in the app's screen ledger it mirrors (`screens/<slug>.webp` in the app repo, listed in its docs/SCREENS.md), and the app commit the drawing was last matched to. A SITE-SYNC session reads the app's ledger against this table and lists the drift.

| Screen (where the site draws it) | App ledger picture | Last matched to |
| --- | --- | --- |
| The chart header and its Report due band — the report scene's `d-chart`, in the fold and (PROF-PAGES-1) in the audiologists and hearing-aid-specialists devices; speech-pathology.html's parked device draws the chart with the older fixture | screens/patients-id-report-due.webp (/patients/[id]) | a72ca44e (2026-10-28) |
| The preview screen — `r-preview` in the fold and in the two profession pages' devices: page one, the sources rail, Sign & send · add note · Edit · Close | screens/reports-id-preview.webp (/reports/[id]) | a72ca44e (2026-10-28) |
| The Noah window — `d-noah` in the fold and in the two profession pages' devices, Noah's own screen drawn in simple form | none: not an app screen, no ledger picture | a72ca44e (with the report scene) |
| The report room — speech-pathology.html `r-room` only (the parked page's side path, "← Back to edit"); gone from the two profession pages with PROF-PAGES-1 | screens/reports-id.webp (/reports/[id]) | never matched; drawn 2026-10-13 (site c909aec) |
| The kiosk screens — `k-grid` · `k-dob` · `k-consent` · `k-sign` · `k-done`, in every page's click-through | screens/kiosk.webp (/kiosk) and screens/checkin-token.webp (/checkin/[token]) | never matched; drawn 2026-10-07 (site 1e845b8) |
| The referral inbox — `f-ref`, the Referrals timeline (Received · Outreach · Scheduled · Confirmed) | screens/referrals.webp (/referrals, "Needs you" since REFERRALS-1, 2026-10-12) | never matched; drawn 2026-10-07 (site 1e845b8) |
| Patient Review — the counseling scene `ha-counsel`, the Speech Intelligibility Audiogram under the app's bar | screens/review-appointmentId.webp (/review/[appointmentId]) | drift known — awaits COUNSEL-SITE-1 |

## Open items

- The demo walk's share link: the fold's Open in Noah plays the scene in the fold's screen; a link to the live walk, read-only in a new tab, waits for Gabe to send one.
- The vector seal: the band shows the 399-px WebP seal until HIMSA sends a vector.
- The preview's page foot: index.html's page one still says "Page 1 of 2"; the two profession pages' says "Page 1 of 4", like the signed line (SITE-FOLD-3). One word on index.html, on Gabe's say-so.
- The hearing-aid page signs the fold's Audiological Assessment (Dana Whitcomb, BC-HIS). A fitting report of its own in the fold's two-click form would be a new drawing, from its own mock.

## Standing rules

- The fold is the click-through — one screen. Every scene plays in the fold's screen; no second device on the first page.
- The report scene is one drawing: the fold's `d-chart` (with `d-noah` and `r-preview` inside it), the hand and the page script are the same text in index.html, audiologists.html and hearing-aid-specialists.html (PROF-PAGES-1). A change to the scene is made in all three.
- The counseling scene awaits its own mock (the app's Patient Review); until then it plays as it did in the device.
- Report wording: never "AI writes reports". "AI-assisted" at most; the approved line is "Reports scripted in your own words. Two clicks."
- No price in the fold. The one offer on the first page is the band after "Here's how a visit runs."; the price appears there and nowhere above it.
- SITE-OG-1: on every page the h1, the <title> and og:title are the same words.
- No speech-language pathology as a profession anywhere on the site until Gabe says so. Clinical words stay: Speech Intelligibility Audiogram, speech audiometry, SRT, speech canoe.
- The drawings say "Book now" where the app does (BOOK-NOW-1, 2026-10-19); only the Calendar menu's row keeps "Quick-Book", and no drawing shows that row.
- The preview's practice and patients are invented; never a real name. The dates in the screens are computed each day: today, and the last test about two years ago.
- A session that adds a third-party sound, image, font or icon appends to docs/CREDITS.md in the same commit.
- This file stays readable at vestibulehq.com/docs/STATUS.md, like CREDITS.md: never a secret, a credential, a customer's or prospect's name, or anything about Hearing-Doctors' patients. Nothing links to it.
- Briefs are small and auditable: do only what the brief names, record it in the commit body headed by the brief's ID, rewrite this file, report before/after and the live check (cache-busted URL, then the bare URL).
- Mock branches (mock-1123, mock/site-click-2) stay as they are; nothing merges them.
