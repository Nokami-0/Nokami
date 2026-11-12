# Original STTH

A separate Foundry VTT V14 edition using the original **Sonic Tag-Team Heroes 1.5.0** rules by **McShmoodle**. This is an unofficial community adaptation, not a release by the original author.

This edition lives on the `original-stth` branch. The customized system remains on `main`, and Shinobi no Sho remains on its own branch.

## Install

Foundry Setup → Game Systems → Install System → Manifest URL:

```text
https://raw.githubusercontent.com/Nokami-0/Nokami/original-stth/system.json
```

The system ID is `original-stth` and its displayed name is **Original STTH**, so it can be installed alongside the customized `sonic-tag-team-heroes` system. Create a new world using Original STTH. Do not change an existing world's system ID to switch editions; keep the existing world as-is and transfer reviewed character/item exports to a new world if needed.

Manual download: https://github.com/Nokami-0/Nokami/archive/refs/heads/original-stth.zip

Extract the archive and rename its top folder to `original-stth` under Foundry user data `Data/systems/`. `system.json` must be directly inside that folder. Restart Foundry.

## Original mechanics

- Dice pool: take the larger of attribute or skill rank as the total number of dice; upgrade the smaller number to d10 Trick Dice (book p11). No additional mastery d6s. Power 4 / Melee 2 rolls **2d6 + 2d10**.
- Standard defense uses Dodge (book p25). Custom Power Block, Speed Parry, Parry TP rewards and next-attack penalties are absent.
- Protective/Defensive Gear grants **+1 Dodge** (book p95), not damage reduction. Vehicle Light Armor grants +5 HP; Heavy Armor grants +10 HP and −1 Speed, not DR (book p109). Existing vehicle upgrade descriptions require GM application to the vehicle profile.
- Original damage, Rings, Crits, HP/TP, advancement, Signature Attacks, Tag-Team Attacks and Team Blast resolution remain.
- Artificial universal magazine capacities and custom weapon prices are excluded. Explicit limited-ammunition rules can still be configured when a printed profile calls for them.

## Library and interface

The default library contains 94 existing item/reference entries identified as STTH 1.5.0 sources, plus the existing book-derived vehicle and Henchman profiles. Community enemy/weapon rosters, extra gear and boss-form conversions are excluded. Artwork assets remain available for users' own tokens. This is the original-rules edition of the current conversion; it is not a claim that every page or NPC in the book has been fully automated.

Readability changes, separate Gear organization, square measurement, optional visual effects and attack-area previews remain as interface tools; they do not replace the book's rules. The GM adjudicates range/cover, special conditions, area eligibility and printed exceptions where automation is incomplete.

## Validation

63 automated engine, integration, sheet and equipment tests passed before publishing, including a regression proving legacy DR and Block options do not reduce incoming damage. All shipped JavaScript modules pass syntax checks. Manifest/import/template paths and local data JSON were checked. A live Foundry session was not available for runtime validation.

## Credit

Original game: **McShmoodle**. Rulebook: **Sonic Tag-Team Heroes v1.5.0**. Sonic and associated characters belong to their respective rights holders. This branch is an unofficial fan conversion; no authorship or ownership of the original game or supplied art is claimed.
