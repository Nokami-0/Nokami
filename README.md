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
