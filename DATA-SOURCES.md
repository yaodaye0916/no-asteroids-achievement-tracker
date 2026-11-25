# No Asteroids achievement data sources

Last checked: 2026-11-25 (Asia/Shanghai)

## Primary source

- Steam App ID: `5527800`
- Public achievement page: https://steamcommunity.com/achievements/5527800
- Public schema page used for extraction: https://steamcommunity.com/stats/5527800/achievements/?xml=1
- Official global unlock-rate API: https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=5527800
- Steam schema version at extraction: `14`
- Steam schema hash at extraction: `2104938099`

The Steam page embeds the public achievement schema used by the current Steam achievements UI. The extracted fields are API name, internal key, English display name, official description, hidden/archive flags, and achieved/unachieved icon filenames.

Achievement icon URLs use Steam's current public asset path:

```text
https://shared.fastly.steamstatic.com/community_assets/images/apps/5527800/{filename}
```

The first achieved icon was checked directly and returned HTTP 200 with an `image/jpeg` content type.

## Secondary check

- SteamDB achievements page: https://steamdb.info/app/5527800/stats/

SteamDB independently listed 65 achievements on 2026-11-25. It is a secondary cross-check, not the canonical source in `data/achievements.json`.

## Current verification state

- 65 records were extracted.
- All 65 Steam API names are unique.
- All 65 Steam internal keys are unique.
- Steam marks exactly one achievement as hidden: `ACH_DESTRUCT` (`Not in the plan`).
- `globalUnlockPercent` is a dated Steam snapshot from 2026-11-25 and will change as more players unlock achievements.
- All 65 records have been placed into seven descriptive categories derived from their official names and descriptions. Category assignment is editorial organization, not a claim about hidden game logic.
- `unlockCondition` and `tips` are intentionally `null` until gameplay evidence or reliable developer/player evidence is checked.
- Official descriptions are preserved as source facts; they are not presented as independently verified strategy text.

## Next research task

Classify the achievements from their official descriptions, then investigate only the achievements whose official text is ambiguous or whose practical unlock requirements may differ from the displayed description. Record supporting URLs and keep uncertain claims marked as unverified.
