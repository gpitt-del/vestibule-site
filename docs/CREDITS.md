# CREDITS — third-party sounds the site ships

One entry per third-party asset the site serves: what it is · where it is
used · source · license · what was changed · the attribution shown. A
session that adds a third-party sound, image, font or icon set appends its
entry in the same commit. The site's own artwork (the Vestibule seal and
lockups under `brand/`, the QR codes under `qr/`) is the company's own and
is not listed.

## The counseling tool's voices and restaurant babble

**Files:** `tools/sounds/rainbow_p311_M_Iowa.mp3` ·
`tools/sounds/rainbow_p339_F_Pennsylvania.mp3` ·
`tools/sounds/babble_vctk_8talker.mp3`

- **What it is:** two readings of the Rainbow Passage (a male voice and a
  female voice) and an 8-talker restaurant babble bed.
- **Where it is used:** `tools/speech-intelligibility-audiogram.html`, the
  "Hear it their way" player (Male voice · Female voice · the two Restaurant
  backgrounds); the tool is embedded in the preview device on the home,
  audiologists and hearing-aid-specialists pages.
- **Source:** CSTR VCTK Corpus, version 0.92 — "CSTR VCTK Corpus: English
  Multi-speaker Corpus for CSTR Voice Cloning Toolkit", The Centre for
  Speech Technology Research, University of Edinburgh.
  https://datashare.ed.ac.uk/handle/10283/3443
- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0),
  https://creativecommons.org/licenses/by/4.0/
- **Speakers:** p311 (male, Iowa) is `rainbow_p311_M_Iowa.mp3`; p339
  (female, Pennsylvania) is `rainbow_p339_F_Pennsylvania.mp3`; the babble's
  eight talkers are p360, p334, p311, p345, p294, p318, p333 and p299
  (`babble_vctk_8talker.mp3`).
- **What was changed** (the edits note from the build's CREDITS.txt):
  sentence recordings concatenated, silence-trimmed, loudness-normalized
  (EBU R128, -18 LUFS, -1 dBTP), mixed. No other processing.
- **Attribution shown:** the credit line under the player, "Voices and
  restaurant babble: CSTR VCTK Corpus (University of Edinburgh), CC BY 4.0,
  edited." with "CSTR VCTK Corpus" linking to the corpus page and "CC BY
  4.0" linking to the license. (SITE-OG-1, 2026-10-16: the detail above
  moved here from the longer credit line SITE-SOUNDS-1 shipped the same
  day.)

The railroad crossing is synthesized in the page itself and is the
company's own work, not a third-party asset.

## The counseling screen's pictures and serif (COUNSEL-SITE-1, 2026-10-28)

**Files:** `pictures/counseling/ear.webp` · `pictures/counseling/ha-bte-section@1x.webp` ·
`pictures/counseling/ha-ric-section@1x.webp` · `pictures/counseling/ha-cic-section@1x.webp`

- **What it is:** the app's own pictures, copied unchanged from its Patient Review:
  the ear's cross-section (Gabe's render of 2026-10-21 at 2048 px) and the three
  hearing-aid style cross-sections (made 2026-10-24 with Grok on Gabe's prompts;
  "Artist's renderings · not to scale · for instruction only" prints under the cards).
- **Where it is used:** the Counseling tools scene of the fold's screen on the home,
  audiologists and hearing-aid-specialists pages (the Anatomy tab and the Hearing aids
  tab).
- **Source and license:** the company's own work, listed here for provenance; not a
  third-party asset.
- **The serif:** the scene's title, index and card names are set in Cormorant Garamond
  (weight 600), the app's own serif, linked from Google Fonts like the site's Oswald and
  Schibsted Grotesk — SIL Open Font License 1.1 (https://fonts.google.com/specimen/Cormorant+Garamond).
