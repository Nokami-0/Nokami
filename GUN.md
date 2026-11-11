# G.U.N. — STTH conversions

Thirty profiles for use in Sonic Tag-Team Heroes. These are homebrew conversions and generic book-profile reskins; they are not an official printed G.U.N. bestiary. Numerical values, encounter timing and optional rewards are adaptation choices.

## Installation

Update the system to 2.0.7. Launch a world as GM, then open Compendium Packs → STTH — G.U.N. The library is populated automatically; if it is absent, run Game Settings → STTH Library → Build / Repair Library. Drag profiles into Actors and then onto a scene. Existing world actors and Empire entries are not overwritten.

## Roster

| Profile | Type / tier | HP | Dodge | Move |
| --- | --- | --- | --- | --- |
| G.U.N. Soldier | Henchman | 5 | 2 | 2 |
| G.U.N. Heavy Trooper | Henchman | 15 | 2 | 2 |
| G.U.N. Recon Trooper | Henchman | 15 | 2 | 4 |
| G.U.N. Captain | Sub-Boss | 15 | 2 | 2 |
| G.U.N. Commander | Boss | 50 | 3 | 4 |
| G.U.N. Pilot / Driver | Sub-Boss | 15 | 2 | 4 |
| Gun Hunter | Henchman | 10 | 2 | 2 |
| Laser Hunter | Henchman | 15 | 2 | 2 |
| Shield Hunter | Henchman | 15 | 3 | 2 |
| Mono Beetle | Henchman | 5 | 2 | 2 |
| Gun Beetle | Henchman | 5 | 2 | 2 |
| Bomb Beetle | Henchman | 10 | 2 | 2 |
| Spark Beetle | Henchman | 10 | 2 | 2 |
| Spring Beetle | Henchman | 5 | 2 | 2 |
| Gold Beetle | Henchman | 5 | 3 | 8 |
| Gun Wing | Henchman | 15 | 2 | 4 |
| Bomb Wing | Henchman | 15 | 2 | 4 |
| Rocket Beetle | Henchman | 15 | 2 | 2 |
| Rhino Jet | Henchman | 15 | 2 | 2 |
| Rhino Cannon | Henchman | 20 | 2 | 2 |
| Rhino Spike | Henchman | 20 | 2 | 2 |
| Rhino Metal | Henchman | 25 | 3 | 2 |
| Blue Eagle | Sub-Boss | 25 | 3 | 8 |
| F-6t Big Foot | Boss | 65 | 3 | 4 |
| B-3x Hot Shot | Boss | 65 | 3 | 8 |
| R-1/A Flying Dog | Boss | 70 | 4 | 8 |
| G.U.N. Armed Motorcycle | Vehicle | 20 | 2 | 4 |
| G.U.N. Troop Truck | Vehicle | 30 | 1 | 4 |
| G.U.N. Helicopter | Vehicle | 30 | 2 | 4 |
| G.U.N. Transport Shuttle | Vehicle | 50 | 1 | 8 |

## Balance and use

- Personnel: Soldier, Captain and Commander use the Officer, Marshal and Kingpin templates from STTH pp130, 132 and 138, with G.U.N. equipment naming. The Heavy Trooper, Recon Trooper and Pilot are custom profiles. Soldiers use Squad; specialists do not automatically gain squad bonuses.
- All human personnel need air. Robot profiles have suffocation immunity; robotic bodies do not imply other automatic immunities.
- Hunters are standalone infantry. Shield Hunter has a GM-managed firing window. Beetles and Wings fly; Mono/Spring/Gold Beetles deliberately have no invented damaging weapon.
- Rocket Beetle carries four rockets. Its weapon quantity tracks ammunition; its recharge counter requires Interact phases. Refill quantity manually when resupplied.
- Spark Beetle has a GM-managed barrier cycle. Rhino Spike/Metal have positional protection, with explicit counterplay. These are balanced abstractions, not complete game-engine invulnerability.
- Big Foot, Hot Shot and Flying Dog are Boss-tier profiles, not Final Bosses. Big Foot makes three passes before a landing window; Hot Shot makes one; Flying Dog remains airborne. GM tracks the attack pattern, cockpit exposure and firing geometry. Mechanical Dodge/HP are STTH homebrew values.
- Boss sheets default to the supplied G.U.N. Pilot / Driver’s mental ratings and skills; set a world Actor UUID to substitute a specific pilot. Pilot survival/ejection is a GM decision.
- Vehicles are book-profile reskins: armed motorcycle from Dark Rider p111, truck from Car/Truck p103, helicopter p105 and shuttle p106. Simplified footprints and the truck’s six-seat configuration are marked as custom. Helicopter blades and full vehicle geometry require GM adjudication.
- Area targeting, altitude, prerequisite movement, facing, shield cycles and boss windows are described but not universally enforced or automatically placed. The captain/commander abilities have readable rules and require GM application.
- This is a substantial G.U.N. starter roster rather than every model across all Sonic games. The sources distinguish visual/game behavior from the original STTH statistics created here.

## Behavior references

- Sonic Adventure 2 official Prima strategy guide, enemy series overview: https://info.sonicretro.org/images/e/ee/SonicAdventure2_Prima_digital_guide.pdf
- G.U.N. roster and boss overview: https://sonic.fandom.com/wiki/Guardian_Units_of_Nations
- Flying Dog: https://sonic.fandom.com/wiki/R-1/A_Flying_Dog
- Rocket Beetle: https://sonic.fandom.com/wiki/Rocket_Beetle

Validation: 64 automated tests pass. Templates compile. Live Foundry V14 play testing remains pending.
