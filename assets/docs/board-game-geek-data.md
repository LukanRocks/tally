# BoardGameGeek data

---

[BoardGameGeek](https://boardgamegeek.com) (BGG) is the world's largest board game database. Tally can optionally import BGG's public game catalog to power name autocomplete when adding games to your library.

This is entirely optional. Tally works fine without it — any game not in the dataset can always be entered manually.

## What it does

When the BGG dataset is loaded, typing in the game name field shows matching suggestions from the catalog. Selecting one fills in the game's name and publication year automatically.

The current implementation of BGG data only covers the name and year. Everything else — cover image, description, player count, price, owner — still needs to be added manually.

No BGG API calls are ever made at runtime. Once imported, the data lives entirely in your local SQLite database.


## How to set it up

1. Go to [boardgamegeek.com/data_dumps/bg_ranks](https://boardgamegeek.com/data_dumps/bg_ranks) — a free BGG account is required to download the file.
2. Download the board games CSV.
3. In Tally, open **Settings → BGG Data** and upload the file.

The import runs locally and takes a few seconds. When it's done, autocomplete will be active immediately.

## Managing the dataset

You can find the current import status (including when it was last updated) under **Settings → BGG Data**.

From there you can:

- **Re-import** — download a fresh CSV from BGG and upload it again to get the latest data.
- **Delete** — remove the dataset entirely if you no longer want it. Autocomplete will stop working, but no game data you've already entered is affected.

## Privacy & licensing

Tally never contacts BGG's servers. The CSV is downloaded manually by you, imported once, and stored in your local database. No data is sent anywhere.

The BGG dataset is provided by BoardGameGeek under their [Terms of Use](https://boardgamegeek.com/terms) and [XML API & Data Terms of Use](https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use#). Use is permitted for non-commercial purposes. Tally does not modify or redistribute the data.
