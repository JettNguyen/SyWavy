# Lyrics

One file per release, oldest first. Each song starts with a `## N. Title` heading, and a blank line
starts a new verse. build.js turns these into the song pages at sywavy.com/lyrics/.

THEMES.md stays on this Mac. Git ignores it.

## Notes on lines

`notes/<release id>.json` holds the notes for one release. A note points at the lines it is about by
number. Lines are counted from 1 within each song, skipping blank lines. To see the numbers:

    node build-lyrics.js number <release id>

A note has a `kind`:

- `reference`: who or what a line names. It also needs `ref.name` and `ref.category`, which put it on
  the References page (and on the Florida map when the category is `place`).
- `story`: what was going on behind the line.
- `studio`: how the song was made. Only Jett2Fly or SyWavy can write these.

A note with `"draft": true` is hidden on sywavy.com. To publish it, delete that line. To see drafts
while working:

    node build.js --drafts && npx serve _site

To check every notes file for mistakes:

    node build-lyrics.js check

`notes/places.json` gives each Florida place a pin on the map, as `"Name": [latitude, longitude]`.
The name must match the note's `ref.name` exactly.
