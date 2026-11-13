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
