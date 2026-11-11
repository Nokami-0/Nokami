# Eggman Empire — STTH 1.5.0

Adds 33 ready-to-import NPC profiles and variants. Update to 2.0.6 and launch a world as GM. The system creates **STTH — Eggman Empire** in Compendium Packs, grouped by tier. If absent, use Game Settings → STTH Library → Build / Repair Library. Drag an Actor to the Actors sidebar, then drag it to the scene.

## Roster

| Profile | Tier | Source page | HP | Dodge | Initiative dice | Move |
| --- | --- | --- | --- | --- | --- | --- |
| Moto Bug | Henchman | 125 | 5 | 1 | 2 (up 0) | 4 |
| Buzzbomber / Buzzer | Henchman | 126 | 5 | 2 | 1 (up 0) | 2 |
| Crabmeat | Henchman | 126 | 5 | 2 | 1 (up 0) | 2 |
| Orbinaut | Henchman | 127 | 5 | 4 | 1 (up 0) | 2 |
| Burrobot | Henchman | 127 | 5 | 1 | 1 (up 0) | 2 |
| Chopper / Jaws | Henchman | 127 | 5 | 1 | 2 (up 0) | 4 |
| Egg Pawn — Unarmed | Henchman | 128 | 10 | 2 | 1 (up 0) | 2 |
| Egg Pawn — Sword / Club | Henchman | 128 | 10 | 2 | 1 (up 0) | 2 |
| Egg Pawn — Hammer / Axe | Henchman | 128 | 10 | 2 | 1 (up 0) | 2 |
| Egg Pawn — Light Launcher | Henchman | 128 | 10 | 2 | 1 (up 0) | 2 |
| Egg Pawn — Heavy Gun | Henchman | 128 | 10 | 2 | 1 (up 0) | 2 |
| Egg Pawn — Explosives | Henchman | 128 | 10 | 2 | 1 (up 0) | 2 |
| Egg Pawn — Shield | Henchman | 128 | 10 | 3 | 1 (up 0) | 2 |
| Flapper — Laser | Henchman | 128 | 10 | 2 | 1 (up 0) | 2 |
| Flapper — Bomber | Henchman | 128 | 10 | 2 | 1 (up 0) | 2 |
| Klagen | Henchman | 129 | 10 | 2 | 1 (up 0) | 2 |
| Egg Hammer | Sub-Boss | 131 | 30 | 2 | 1 (up 1) | 2 |
| Eggrobo | Sub-Boss | 132 | 15 | 2 | 2 (up 1) | 8 |
| Dr. Eggman | Boss | 150 | 50 | 3 | 3 (up 2) | 4 |
| Metal Sonic | Boss | 151 | 55 | 3 | 4 (up 2) | 16 |
| Egg Mobile — Base Chassis | Boss | 135 | N/A | 2 | 3 (up 2) | 8 |
| Egg Wrecker | Boss | 136 | 70 | 3 | 2 (up 2) | 2 |
| Egg Lancer | Boss | 136 | 70 | 3 | 3 (up 2) | 8 |
| Egg Lancer Escort — Light Laser Cannon | Henchman | 137 | 10 | 2 | N/A | 4 |
| Egg Lancer Escort — Heavy Laser Cannon | Henchman | 137 | 15 | 1 | N/A | 2 |
| Death Egg Robot | Final Boss | 154 | 75 | 4 | 1 (up 3) | 2 |
| Egg Dragoon | Final Boss | 157 | 75 | 4 | 3 (up 3) | 8 |
| Biolizard — Head | Final Boss | 159 | N/A | 3 | 2 (up 2) | 4 |
| Biolizard — Torso / Life-Support Core | Final Boss | 159 | 75 | 1 | 1 (up 2) | 2 |
| Biolizard — Tail | Final Boss | 159 | N/A | 3 | 2 (up 2) | 4 |
| Giant Eggman Robo — Left Hand | Final Boss | 162 | 35 | 3 | 2 (up 2) | 4 |
| Giant Eggman Robo — Right Hand | Final Boss | 162 | 35 | 3 | 2 (up 2) | 4 |
| Giant Eggman Robo — Head & Torso | Final Boss | 162 | 55 | 1 | 1 (up 2) | 1 |

## Play notes

- Armed Egg Pawn and Flapper entries are alternatives; choose a loadout rather than combining all weapons.
- NPC profiles keep their printed HP, Dodge, Initiative, and Move instead of forcing character formulas. Status and manual bonus adjustments still apply.
- Pilot-operated forms default to Dr. Eggman’s printed mental attributes and unlisted skills. Set an Actor UUID on the sheet to use a different pilot. Source dash columns are unused/pilot references rather than claimed independent attributes.
- Orbinaut starts with four spiked balls. Roll expends one ammunition and Dodge follows remaining quantity; edit quantity to replenish. Clam Up and touch damage are GM-resolved.
- Klagen’s field deals zero damage. Apply its specific restraint stacks and linked release with the GM.
- Damaging NPC attacks with TP costs debit TP. Non-attack TP powers are described on talent entries and require GM handling, including payment and duration.
- Biolizard’s Head/Tail and the Egg Mobile chassis show HP N/A and reject HP damage. Only the exposed life-support core is damageable. Multipart bosses use several tokens, with shared timing, weak spots, and phase changes handled by the GM.
- Giant Eggman Robo has independent hand/torso HP. Death Egg Robot uses a 2×2 token; Colossal encounter part placement follows the book map.
- Double Initiative, Giant Moves, escort schedules, firing arcs, weak spots, area statuses, positional requirements, ammo-touch effects, and movement forfeits are described but not universally automated.
- Metal Sonic’s numeric Crit Threshold is missing in the supplied profile; Dr. Eggman and Biolizard also do not print a numeric threshold. These use 0 pending a GM ruling; no value is presented as a sourced correction.
- Original non-Empire Henchmen compendium remains available. This roster covers the book’s Empire Badniks, named enemies and boss machines, not every enemy across every Sonic game.

Validation: 60 automated tests, all templates compile. Live Foundry 14 play testing remains pending.
