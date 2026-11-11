# Sonic Tag-Team Heroes for Foundry VTT 14 — 2.0.12

Unofficial adaptation of STTH 1.5.0. Original game by McShmoodle.

## Install or update

In Foundry Setup → Game Systems → Install System, paste:

```text
https://raw.githubusercontent.com/Nokami-0/Nokami/main/system.json
```

Existing installs can use Check for Update. Launch the world as GM and let the library finish building. If needed, use Configure Settings → Sonic Tag-Team Heroes → STTH Library → Build / Repair Library.

## Enemies and uploaded artwork

- **STTH — Uploaded Enemies & Vehicles:** all 250 uploaded token variants, each with playable stats and abilities. 87 inherit recovered authored profiles; 163 use new, explicitly marked homebrew encounter profiles.
- **STTH — Eggman Empire:** 277 profiles, including the recovered roster and new homebrew enemies and vehicles.
- **STTH — G.U.N.:** 30 profiles.
- **STTH — Henchmen:** the original 11 entries.

These collections overlap: uploaded variants reuse appropriate faction stats. Drag a compendium entry into Actors, then onto a scene. Previously imported world Actors are preserved; import a fresh copy to use updated art and stats. An older NPC Token Art compendium may remain in existing worlds; use Uploaded Enemies & Vehicles for the playable versions.

Ships, transports and other crewed vehicle profiles require an assigned pilot Actor UUID. Large ships and bases use provisional encounter abstractions rather than full-scale simulations. Homebrew profiles are untested starting values, not official STTH statistics. Special traits that need GM handling say so in their descriptions.

Includes character, NPC, vehicle and item sheets, combat helpers, resources and equipment catalogs. Rulebook PDFs are not included; use your own STTH 1.5.0 copy.

## Credits and validation

Original game by McShmoodle. Sonic characters belong to SEGA. Token artwork supplied by the user; original artists retain their rights.

Automated tests cover rules, derived stats, artwork paths and repeat compendium imports. Live Foundry VTT 14 testing remains pending. See AUDIT.md for limitations in the base system.
