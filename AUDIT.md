# STTH 1.5.0 implementation audit — 2.0.5

Source: supplied Sonic Tag-Team Heroes 1.5.0 PDF, 189 pages. The PDF was locally extracted and compared with implementation. This is a targeted rules and control audit, not certification of every page or a live Foundry acceptance test.

## Fixed

- Exchange Action and condition dialogs now cancel without spending a phase or reporting an unknown action.
- Character-only controls are hidden or rejected on vehicles; vehicle actions use the pilot controls instead.
- Technique Specials require a Technique Type character.
- Missing inventory items and unknown action names produce explicit errors.
- KO actors cannot attack or Dodge outside combat.
- Effective skill ranks, including consumable/gear bonuses, cap at four (p36); advancement cannot buy beyond that cap (pp91–92). Existing stored ranks are preserved but effective ranks are capped.
- Disabled/broken equipped gear can be removed rather than trapping gear slots.
- Surfacing resets breath penalties and clears a drowning KO if HP remains (pp33–34). HP recovery does not clear an underwater zero-TP KO.
- Thunder/Flame shields break when the submerged-interval control is used (p37). Changing the underwater checkbox directly still requires the GM to resolve shield loss.
- NPC failed breath saves apply criticals rather than only consuming TP; exhausted breath saves cannot succeed after Disadvantage exceeds the dice pool (pp32–34).
- Dazzled adds a defensive die against attacks when no Trick Die can be downgraded (p31).
- Tag-Team base damage uses the partner's strongest eligible, equipped, functioning attack including its bonuses (pp43–44).
- Newly built Spin/Melee loadouts scale with effective Power. Previously built fixed-damage attacks remain unchanged to preserve intentional custom values; rebuild those using Build Signature Attack if desired.
- Reference buttons and text describe the quick reference actually shipped in the public package.

## Validation

52 automated tests pass: engine examples, mocked V14 initialization, document saves/drop, gear rules, permissions, action dispatch coverage, cancellation, recharge, phase controls, healing, KO checks, drowning and loadout scaling. All four Handlebars templates compile. Each sheet control has a dispatcher branch; this does not prove every outcome of every control in Foundry itself.

## Coverage and remaining work

| Area | Current implementation | Remaining manual work / validation |
| --- | --- | --- |
| Checks and opposed checks | Dice pools, Advantage, Tricks/Slips, Dodge | GM decides situational modifiers and spends narrative effects |
| Combat and resources | Attack helpers, HP/TP/Rings, shields, status controls, initiative | Live multi-user chat permission and combat-cycle acceptance tests |
| Items and gear | Equip validation, basic consumables, modifiers | Custom items/talents, regional treasures and some benefits use description and GM resolution |
| Tag-Team and Team Blast | Roll and damage helpers | Adjacency, special move clauses, area targets, follow-up selection and team-buff application |
| Challenges and terrain | QTE, Zone and basic race tracking | Complex course rules, turns, hazards, jumps, flying, carrying, terrain costs and token movement |
| Vehicles | Profiles, pilot rolls, repair and ram helpers | Firing arcs, collision placement, crew roles, advanced movement and damage placement |
| Character creation | Stat validation, default attacks, placeholders and loadout builder | Talent choices and all prerequisites need GM review; four talent/attack slots are not universally enforced |
| Bestiary and adventure | Eleven parsed Henchmen profiles | Full bestiary, sub-bosses, bosses and adventure-specific automation are not complete |

A licensed running Foundry V14 instance is not available in the build environment. All controls still need real-world acceptance testing, including player versus GM permissions, drag/drop, chat application, round transitions, compendium creation and every confirmation dialog. No claim is made that the whole PDF is completely automated.
