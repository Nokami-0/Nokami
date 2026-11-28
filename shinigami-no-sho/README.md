# Shinigami no Sho

An unofficial Foundry VTT game system for the English *Shinigami no Sho 4.5* rulebook and *The World Beyond the East*. Foundry VTT v14 is the target. AI assisted with implementation.

## Install

1. Stop Foundry if it is running, and extract this ZIP into your Foundry User Data `Data/systems` directory.
2. Check that `Data/systems/shinigami-no-sho/system.json` exists.
3. Start Foundry and create a world with **Shinigami no Sho** as the game system.
4. Create a Character or NPC from the Actors tab. Drag entries from the **Shinigami no Sho 4.5** and **The World Beyond the East** compendiums onto an editable sheet.

For a manifest install, open **Setup → Game Systems → Install System** and paste `https://raw.githubusercontent.com/Nokami-0/Nokami/main/shinigami-no-sho/system.json` into the Manifest URL field.

## At the table

- Click an attribute, combat skill, or expertise name to roll. Set a situational modifier or a difficulty in the prompt. Leave the difficulty blank to compare rolls manually.
- Enter combat base scores and purchased expertise ranks in the editable fields. The adjacent totals update from the associated attributes. Combat uses the explicit formula on core page 23, since the character creation overview also prints a conflicting formula.
- Use the core Combat Tracker to roll initiative. Resolve tied initiatives and shared NPC initiative manually.
- The Vitality controls handle lethal damage, healing, stabilization and the dying bleed step. The hit that first reduces Vitality to 0 stops there. Use the **Bleed 2** button on the dying character’s turn when required. Roll the stabilization check before clicking **Stabilize**.
- Powers and techniques have a **Use** button. Enter or confirm the Reiatsu cost for that use. Apply the effect, targets and any sustained costs as described in the book. Use the editable current Vitality field for rule exceptions, and track nonlethal damage separately.
- Compendium entries summarize selected rules and cite their pages. Dragged entries are editable on the actor. The packs contain 40 curated entries. The PDFs remain the reference for full rules, build requirements, effect selections and material outside these packs.

## Editing the system

The manifest is `system.json`. Data models and Foundry sheet behavior are in `scripts/system.mjs`, and formulas are in `scripts/rules.mjs`. Source JSON for both compendiums is in `content`. After editing a compendium source, use the Foundry CLI to rebuild into a clean target directory and replace the matching pack.

## Credits

Original *Shinigami no Sho* credits include Juan Pablo, Bruno Chagas (BrSama), Lucas (Tazrex), and the contributors credited in the supplied rulebooks. The core book credits Diego “Fesant” Silva for *Shinobi no Sho*, and *Bleach* is by Tite Kubo. Consult the original PDFs for their full credits and licensing notices. This fan implementation uses Foundry's built-in icons.
