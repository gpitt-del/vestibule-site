# vestibulehq.com — STATUS

Rewritten at every close-out. The newest change is the commit that carries this file; its hash is written in at the next close-out.

## Live

`main`, classic GitHub Pages, CNAME vestibulehq.com. Live commit: the one headed "PROF-PAGES-2 + SITE-REPORT-1" (2026-10-28); the one before it is 2c10ba6 (PROF-PAGES-1), and before that 854249b (the STATUS.md rider on SITE-FOLD-3).

## Changes, newest first

- PROF-PAGES-2 (2026-10-28): /audiologists and /hearing-aid-specialists take the home fold's shape, index.html's markup copied: one small headline line that fills the width ("Vestibule: your practice's headquarters — everything audiology, in one place." / "… everything hearing aids, in one place."; the title and og:title equal it), the fly-in rail beside the big screen, the lead-in and the scene chips under the screen, the Noah ES Certified by HIMSA band directly under the chips with each page's own words, "On your phone, too." after it. No price in either fold: the offer box left the copy column for the offer band after "Here's how a visit runs.", as index has it, and the second offer under "Everything else" went with it. The copy column follows the fold at the full width. Each page keeps its own scenes, chips, practice name and provider. Gone with the device: the lockup line over the old headline, the "On your computer" caption, the monitor stand, and the pages' inline .sp rules (dead since PROF-PAGES-1; the counseling screen's are site.css's), the hearing-aid page keeping the two rules its own sample report's real-ear page uses.
- SITE-REPORT-1 (2026-10-28, in the same commit): the report in the scene is the app's report, one drawing in index.html, audiologists.html and hearing-aid-specialists.html. The preview's page one is the app's (screens/reports-id-preview.webp): the practice letterhead line (name · phone · fax · site), DIAGNOSTIC AUDIOLOGICAL EVALUATION, the patient block, the SUMMARY box, the audiogram with its caption, HISTORY as one paragraph, TESTS PERFORMED AND RESULTS as one sentence per test (Audiometry · Speech audiometry · Tympanometry · Otoacoustic emissions), the Interpretation band, RECOMMENDATIONS numbered, the signature block; the sources rail and the verbs as built. No table of frequencies, no checkboxes. Scrolling shows pages 2 to 4 in the sample report's own forms (the #get sample's pages: the full audiogram with speech, Tympanometry & Acoustic Reflexes with the tymp graphs and the measures table, the DPOAE page), plotted and worded with today's results; "Page 1 of 4" everywhere, index included. The words are the sample report's voice with Roy's facts.
- PROF-PAGES-1 (2026-10-28, 2c10ba6): the two profession pages played the fold's report scene in their devices, the screens and the page script copied from index.html, the rail under the device; the older chart, the report room, the PDF preview, the Reports list and the guide went; the hearing-aid page kept its own letterhead and provider (Dana Whitcomb, BC-HIS). Superseded in shape by PROF-PAGES-2.
- STATUS.md rider (2026-10-28, 854249b): the open item on the profession pages reworded as SITE-CLICK-2's fifth call, in Gabe's words. Nothing on the site changed.
- SITE-FOLD-3 (2026-10-28, 77ac4ab): the fold's two notes came off; the rail starts at the top of its column; the certification band directly under the chips; the "Our Favorite Features — click these 4 options" lead-in; the copy column at the full width; the signed line and the sent line read 4 pages. This file gained the "Screens we draw" table.
- SITE-CLICK-2 (2026-10-28, 6a02796): the fold is the click-through, one screen: the two-click report (Open in Noah, Noah with two sessions, the amber "Report due:" band, click 1 Preview now, click 2 Sign & send), the five fly-ins, the hand. The h1 became "Vestibule: your practice's headquarters — everything audiology and hearing aids, in one place." (title and og:title equal it). Every "three clicks" on the site is two.
- HERO-2 Part B + SITE-AUD-1 (2026-10-28, 0e6d358): one offer on the page, a night band between "Here's how a visit runs." and "Everything else, in the same place". "Book now" replaces "Quick-Book" in every drawing. The speech-language pathology door came off; speech-pathology.html stays at its URL, unlinked. This file began; its rider 382f266 added the never-a-secret rule below.
- HERO-2 (2026-10-27, 4ca005c): the top fold: one small headline line, the demo practice's chart drawn large, the yellow "Click here" with the pressing hand, the Noah ES Certified by HIMSA band.
- SITE-HLS-VOLUME-1 (2026-10-19, 2822d24): a Volume slider on the "Hear it their way" player's Loop row.
- SITE-PROMISE-2 (2026-10-18, 4e27e0a) and SITE-PROMISE-1 (2026-10-18, cac3d3b): the promise as the subline; the headline named the professions and a fourth card opened the speech-language pathology page (both undone by SITE-AUD-1).
- SITE-OG-1 (2026-10-16, 533a7ce): on every landing page title = h1 = og:title; the credit under the player; Record a voice and Load a file back in the Sound list. SITE-SOUNDS-1 (2026-10-16, 6a0209e; its commit body carries no ID): the voices and the background choices in the Speech Intelligibility Audiogram, with the CREDITS entry.

## Screens we draw

One row per app screen the site draws, the picture in the app's screen ledger it mirrors (`screens/<slug>.webp` in the app repo, listed in its docs/SCREENS.md), and the app commit the drawing was last matched to. A SITE-SYNC session reads the app's ledger against this table and lists the drift.

| Screen (where the site draws it) | App ledger picture | Last matched to |
| --- | --- | --- |
| The chart header and its Report due band — the report scene's `d-chart`, in the fold of all three pages (PROF-PAGES-2); speech-pathology.html's parked device draws the chart with the older fixture | screens/patients-id-report-due.webp (/patients/[id]) | a72ca44e (2026-10-28) |
| The preview screen — `r-preview` in the fold of all three pages: page one as the app's preview shows it, the sources rail, Sign & send · add note · Edit · Close; pages 2 to 4 scroll under it in the sample report's forms (SITE-REPORT-1) | screens/reports-id-preview.webp (/reports/[id]) for page one; screens/report-pdf-audiogram-caption.webp · report-pdf-consistency.webp · report-pdf-immittance.webp are the app's PDF pages, read for the pages after it | 8d1329f5 (2026-10-28) |
| The Noah window — `d-noah` in the fold of all three pages, Noah's own screen drawn in simple form | none: not an app screen, no ledger picture | a72ca44e (with the report scene) |
| The report room — speech-pathology.html `r-room` only (the parked page's side path, "← Back to edit") | screens/reports-id.webp (/reports/[id]) | never matched; drawn 2026-10-13 (site c909aec) |
| The kiosk screens — `k-grid` · `k-dob` · `k-consent` · `k-sign` · `k-done`, in every page's click-through | screens/kiosk.webp (/kiosk) and screens/checkin-token.webp (/checkin/[token]) | never matched; drawn 2026-10-07 (site 1e845b8) |
| The referral inbox — `f-ref`, the Referrals timeline (Received · Outreach · Scheduled · Confirmed) | screens/referrals.webp (/referrals, "Needs you" since REFERRALS-1, 2026-10-12) | never matched; drawn 2026-10-07 (site 1e845b8) |
| Patient Review — the counseling scene `ha-counsel`, the Speech Intelligibility Audiogram under the app's bar | screens/review-appointmentId.webp (/review/[appointmentId]) | drift known — awaits COUNSEL-SITE-1 |

## Open items

- The demo walk's share link: the fold's Open in Noah plays the scene in the fold's screen; a link to the live walk, read-only in a new tab, waits for Gabe to send one.
- The vector seal: the band shows the 399-px WebP seal until HIMSA sends a vector.
- The letterhead's web address reads coastalhearing.example (a reserved name that can never be a real practice's); another invented address is Gabe's call.
- The hearing-aid page signs the same Diagnostic Audiological Evaluation (Dana Whitcomb, BC-HIS). A fitting report of its own in the two-click form would be a new drawing, from its own mock.
- site.css keeps the `.as-fold` selectors from PROF-PAGES-1, which no page uses now; they go in a CSS sweep.

## Standing rules

- The fold is the click-through — one screen, on all three pages (PROF-PAGES-2). Every scene plays in the fold's screen; no second device on any of them.
- The report scene is one drawing: the fold's `d-chart` (with `d-noah` and `r-preview` inside it, the preview's four pages included), the hand and the page script are the same text in index.html, audiologists.html and hearing-aid-specialists.html, each page's practice name and provider aside. A change to the scene is made in all three.
- The counseling scene awaits its own mock (the app's Patient Review); until then it plays as it did in the device.
- Report wording: never "AI writes reports". "AI-assisted" at most; the approved line is "Reports scripted in your own words. Two clicks."
- No price in any fold. The one offer on a page is the band after "Here's how a visit runs."; the price appears there and nowhere above it.
- SITE-OG-1: on every page the h1, the <title> and og:title are the same words.
- No speech-language pathology as a profession anywhere on the site until Gabe says so. Clinical words stay: Speech Intelligibility Audiogram, speech audiometry, SRT, speech canoe.
- The drawings say "Book now" where the app does (BOOK-NOW-1, 2026-10-19); only the Calendar menu's row keeps "Quick-Book", and no drawing shows that row.
- The preview's practice and patients are invented; never a real name. The dates in the screens are computed each day: today, and the last test about two years ago.
- A session that adds a third-party sound, image, font or icon appends to docs/CREDITS.md in the same commit.
- This file stays readable at vestibulehq.com/docs/STATUS.md, like CREDITS.md: never a secret, a credential, a customer's or prospect's name, or anything about Hearing-Doctors' patients. Nothing links to it.
- Briefs are small and auditable: do only what the brief names, record it in the commit body headed by the brief's ID, rewrite this file, report before/after and the live check (cache-busted URL, then the bare URL).
- Mock branches (mock-1123, mock/site-click-2) stay as they are; nothing merges them.
