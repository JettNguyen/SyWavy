# Lyrics

One file per release, oldest first. Each song starts with a `## N. Title` heading, and a blank line
starts a new verse. build.js turns these into the song pages at sywavy.com/lyrics/.

To show who's on a part, put their name in square brackets on its own line before it, like `[Kuy]`
or `[SyWavy]`. The page shows it as a small label, and it doesn't count as a line, so notes stay put.

THEMES.md stays on this Mac. Git ignores it.

## Notes on lines

`notes/<release id>.json` holds the notes for one release. A note points at the lines it is about by
number. Lines are counted from 1 within each song, skipping blank lines and [tags]. To see the numbers:

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

## The sound

An album or EP's notes file can also have a `sound` paragraph: how the project sounds and how
Jett2Fly made it, in Jett's words. It shows as "The sound" on the release page and under the
project on the Lyrics page, and it's hidden while it has `"draft": true`, like a note.

    "sound": { "draft": true, "text": "...", "inspirations": [{ "track": 6, "text": "Based on ..." }] }

`inspirations` is optional: what some of the beats came from. Each one shows in a list under the
paragraph, and on that song's lyrics page under its title. Leave out `track` for one that covers
the whole project.

While any sound paragraph is published, the Lyrics page also says that SyWavy records his own vocals
and Jett2Fly makes every beat and mixes and masters each song, and explains the plane tag.

## Places

`notes/places.json` gives each Florida place a pin on the map, as `"Name": [latitude, longitude]`.
The name must match the note's `ref.name` exactly.
