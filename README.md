# Shinobi no Sho — Revamp (English)

Foundry VTT system, hosted for Nokami-0 on the dedicated `shinobi-no-sho` branch. Sonic Tag-Team Heroes remains on `main`.

This release packages the existing English Revamp v1.7.40 equipment-fix build with GitHub installation/update URLs. Versions 1.7.41–1.7.42 change distribution metadata only; the gameplay code and catalogs are unchanged.

## Install in Foundry

In Setup → Game Systems → Install System, paste this manifest URL:

```text
https://raw.githubusercontent.com/Nokami-0/Nokami/shinobi-no-sho/system.json
```

The source manifest declares Foundry 12 minimum and Foundry 13 verified. This upload has not been tested in a live Foundry instance, and Foundry 14 compatibility has not been verified.

For manual installation, download this branch as ZIP, extract it, and name the system folder `shinobi-no-sho-revamp` beneath your Foundry user data `Data/systems/` directory. The folder must contain `system.json` directly. Restart Foundry afterward. Back up worlds before updating.

## Included build

English interface, integrated equipment and aptitude catalogs, clan/Hijutsu organization, summon tools and token art, and the v1.7.40 equipment-button fix. Existing validation and feature notes remain alongside this README. Historical notes describe the build at the time they were written.

## Credits

The source manifest credits **Nela Trex/NelaTrex** for the original Foundry system. Original Shinobi no Sho rules and all artwork remain credited to their respective creators; this is an unofficial English adaptation and distribution. Existing attribution and translation notes are preserved. No new license or ownership claim is added.

Internal UI-reference screenshots and an incomplete temporary image from the supplied archive are omitted from this distribution; they are not used by the system.

## English update source (1.7.42)

This English edition uses only these package distribution URLs:

- Manifest: https://raw.githubusercontent.com/Nokami-0/Nokami/shinobi-no-sho/system.json
- Download: https://github.com/Nokami-0/Nokami/archive/refs/heads/shinobi-no-sho.zip
- Project: https://github.com/Nokami-0/Nokami/tree/shinobi-no-sho

The upstream author's name is retained as attribution, not as an update destination. The system ID remains `shinobi-no-sho-revamp` for compatibility with existing worlds. Gameplay files and catalogs are unchanged by this metadata release.

An older installed package can retain its old manifest URL. Updating the hosted English manifest cannot redirect an installed package that is still checking the upstream author's manifest. Reinstall the English package once using the manifest above (preserving worlds), or close Foundry and replace the installed system folder with this branch's download. Then use Foundry's normal Update button for later English releases. Do not switch the installed package's manifest back to the upstream URL.

## Kuchiyose Summons Compendium (1.7.43)

The GM's first world startup builds **Shinobi no Sho — Kuchiyose Summons**, an Actor compendium containing all **29 species and variants currently in the system's source catalog**. Groups include Basic Kuchiyose, additional and revised species, Spider Kuchiyose, Animal Path, Kamizuru bees, and three Doki variants.

Open it from Compendium Packs or the **Summon Compendium** button in the character sheet's Kuchiyose panel. A GM can also use **System Settings → Kuchiyose Summons Compendium → Build / Repair Kuchiyose Compendium**, or run `await game.snsKuchiyose.buildCompendium()`.

Entries contain artwork, size, source/page, species skills, allowed aptitude options, available attack entries, powers/techniques and source notes. They are editable NC-based species templates, not fully allocated named NPC stat blocks: allocate attributes and energies at the chosen NC before combat. Fixed-size species use a template NC high enough for the existing engine's size limits. Aptitude lists are purchase options, not free grants. Source-specific details absent from the existing catalog still require checking the source book; no new attacks or fixed stat blocks are invented.

Use **Summon Creature** on the summoner sheet for the existing chakra, blood-contract, quantity, NC and scene rules. Importing a template or dragging it onto a scene is a manual operation and does not deduct chakra or count a summoning use.

Rebuilding adds missing generated entries only. Existing templates, including GM edits, and manually added compendium entries are preserved. Building creates compendium documents only, not world actors or scene tokens. The compendium's original lock state is restored after a build or error.

Five automated tests pass for the 29 templates, artwork paths, spider attacks, Doki and source-fixed sizes, duplicate prevention, edit preservation, GM permissions and lock restoration. Updated modules pass JavaScript syntax checks. Live Foundry validation remains pending.

## Doki equipment and unarmed options (1.7.44)

- Doki (Club): equipped Club (+2 Weapon Damage) and a separate natural Unarmed Strike.
- Doki (Claws): equipped **Tekko-Kagi — Pair**, quantity **2**, and a separate natural Unarmed Strike. Base Weapon Damage +3; the source's paired +4 option requires Ambidexterity and can be applied with the existing +1 weapon modifier after checking prerequisites. Carrying the pair does not automatically grant an aptitude, extra attack or additional actions.
- Doki (Armless): natural Unarmed Strike.

The shared factory supplies these entries to both compendium templates and newly summoned Doki. On GM startup or a Kuchiyose compendium rebuild, a one-time loadout migration updates generated Doki weapon entries and adds missing unarmed attacks in existing templates and generated world summons. It preserves actor attributes, HP and unrelated custom equipment.

Summon equipment damage now honors the existing summon attack formula **max(3, Strength − 3) + Weapon Damage + Modifier**, rather than silently using the ordinary character weapon formula. Summons below NC 4 cannot use these entries to deal attack damage.

Eight compendium and equipment regression tests pass; changed modules pass syntax checks. Live Foundry validation remains pending.

## Summon actor tabs (1.7.45)

Actors marked with a summon profile or summon-template flag now use these primary tabs:

- **Stats**: existing attributes, combat stats, skill controls and allocation notice.
- **Attacks**: existing weapon/natural-attack and inventory controls, including Doki club, paired Tekko-Kagi and unarmed entries.
- **Techniques**: powers, elements and source technique options; adding a technique does not bypass purchase rules.
- **Aptitudes**: free and purchased aptitudes, with a separate list of allowed species aptitude options.
- **Summoning Details**: source/page, current NC, summoner, size/reach, primary attributes, species skills, power-point reference, source rules and editable profile notes.
- **Settings** remains available for existing sheet configuration.

Ordinary character sheets keep their current five-tab layout. The primary tab IDs and existing Foundry tab controllers are retained. Summon sheets no longer show the summoner's casting controls; summon from the owner character's sheet. Reference-only species skills, allowed aptitude options and species-rule notes are grouped separately and do not count as purchased aptitude entries.

This is a sheet-layout change, not automatic attribute allocation. Existing actors and items are retained; reopening a summon sheet after updating shows the new layout without reimporting or resummoning.

Twelve automated tests pass: the existing eight summon/Doki tests plus four rendered-Handlebars/DOM tests checking ordinary versus summon navigation, matching tab panels, unique item placement and action controls, escaped metadata and missing summoner handling. Changed modules pass JavaScript syntax checks. Live Foundry runtime validation remains pending.

For local test execution, install the development dependencies with `npm install`, then run `npm test`. These development packages are not needed by Foundry.



## Complete summon species information (1.7.46)

All 29 catalog species now have species skill lists, primary attributes, physical attack entries, allowed aptitude lists, a power-choice reference, and individually readable innate/conditional/summoner ability cards under **Techniques**. Source rules were checked against Basic Book 4.1b pp.224–232, the Advanced Shinobi Guide revised Monkey pp.10–12, Book of Hijutsu Vol.1 pp.9 and 69–71, Book of Hijutsu Vol.2 pp.8–9,35–37,81–85,106–108, and the supplied Kamizuru supplement pp.3–4.

The earlier 1.7.44 damage description above is superseded: summon melee base damage is **max(3, Strength−3), plus1 only for a martial weapon**. Ordinary weapon DDA and weapon modifiers do not add to summon damage. Doki keep the Club or paired Tekko-Kagi as requested, with an unarmed attack on all three variants. The ordinary character weapon calculation is unchanged.

Summon Stats now derive half normal Vitality; listed species skills use full linked attribute accuracy, unlisted skills are zero, and Flight is available. Common-power Combat Skill penalties apply automatically (Doki−1, other species−3). Intelligence0 species have zero Intelligence; Ninken have1 Vitality. Below NC 4 attributes/accuracy are zero and attacks cannot deal damage. Turtle shell Hardness is included; Doki Stealth uses the linked summoner's Art when the summoner is available.

Quantity controls support up to eight Ninken/sharks/ordinary spiders, three Doki (trio maximumNC2×level−1), normal pairs (maximumNC2×level−2), and one-only species. The Giant Bee requires Kuchiyose8, bee swarms may become Huge at NC 14, and the ordinary Tiny/Small NC limits are enforced with the bee Tiny exception. The extra restricted-power scene use must use Common Power; species limited to one summon per scene retain that limit.

The GM startup/rebuild migration adds or refreshes generated species references/attacks in the summon compendium and existing generated world summons. It preserves actor names, attributes, current energies and unrelated custom items; outdated generated skill/aptitude option references are reconciled once. Innate ability cards and allowed aptitude references do not spend power points or count as purchased aptitudes. Choose three actual free aptitudes with prerequisites using the existing free-aptitude controls; do not treat the full allowed list as granted. Bought powers/elements use their configured level for the summon budget.

Salamander now uses the revised **Book of Hijutsu Vol.2** profile: two-round poison cooldown, revised venom/escape rules and the NC20 categoryVII exception. Its incompatible older standalone supplement rules are not combined with the revised profile. Basic and revised Monkey entries retain their respective staff variants.

**Scope:** attribute distribution remains editable and must follow the selected NC (12 points at NC 4,+6 per NC). Actions, prerequisites, variable chakra costs, special targeting, summoner-only techniques, common-power DC penalties, size modifiers, Partner restrictions and complex effects such as Spider Rain/slug division are described on the cards and resolved manually; they are not automatic combat macros. Importing/dragging a template does not cast the summoning. Doki Feint uses summoner Art per its card. Animal Path's mixed-species eight-creature summon remains a manual procedure. No live Foundry runtime was available for testing.

Validation: 20 automated tests cover all 29 species, complete generated attack/ability entries, source rule distinctions, quantity/NC limits, summon damage, actual derived-data calculations, migration preservation/idempotence, compendium permissions/locking, and rendered tab/card placement. JavaScript syntax checks pass.



## Common and elemental Ninpou compendium (1.7.47)

A new **Ninpou — Common & Elemental** Item compendium is built on GM startup. Its browser has two tabs: **Non-Elemental Ninpou** and **Elemental Ninpou**. The native compendium uses the same two top-level folders; elemental entries are further grouped into Earth/Doton, Wind/Fuuton, Fire/Katon, Lightning/Raiton and Water/Suiton, then by minimum effect level. Power rule cards have their own folders.

Open **System Settings → Ninpou — Common & Elemental → Browse Ninpou**, or the compendium's **Browse Ninpou Tabs** button where supported. The character-sheet ability browser now includes **Common Ninpou**, with element/association, type, level and search filters. Read a card or drag it onto a sheet; configure the selected level and chakra cost before casting. The cards provide source rules, not automatic effect resolution or automatic power purchases.

There are **135 entries**: 23 non-elemental, 26 Doton, 25 Fuuton, 14 Katon, 17 Raiton and 30 Suiton. These represent six power-rule cards, 39 distinct effect definitions copied only into permitted power lists, and the explicitly marked optional Ninpou Mist rule. Effects are not all automatically learned. Ordinary prerequisites remain, including Spirit8 for Lightning Blade, Energize for Sharpen, and Giant Fan proficiency/Mastery for Float. Sharingan is not required for access to Lightning Blade.

Sources: Basic Book4.1b pp.91–114 and Advanced Shinobi Guide pp.48–56 (PDF49–57). Advanced revisions supersede their Basic Book versions. The old 16-placeholder general-effects import is retired and replaced by sourced descriptions, corrected levels and per-element availability. Only the old generated placeholder compendium entries are removed; manual entries and unrelated compendiums remain. Normal rebuilds include the new pack. Stable IDs prevent duplicates and retain edits on repeat builds; pack lock state is restored after errors.

This is the **Ninpou power and its five basic elemental powers**, not a reclassification of other power systems. Restricted Hijutsu, clan/Kekkei Genkai elements, Bijuu-only variants, and Kinjutsu-exclusive effects are not imported. A common effect shared with a restricted power remains available in its printed common-power list. The optional non-elemental Mist card requires GM permission and cannot evolve. No clan or Hijutsu catalogs are searched by name to infer eligibility.

All 29 automated checks pass, including nine new catalog, compendium and browser checks and the existing summon regressions. Live Foundry runtime testing remains pending.
