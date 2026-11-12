# Lighting and visual effects

STTH uses Foundry's native scene lighting and token light settings. Configure scene lights with the Lighting tools and token light/vision through Token Configuration. The system does not overwrite those settings when importing roster entries or transforming Biolizard.

Use module releases compatible with your installed Foundry version. System-specific modules may require their own STTH adapter; this change does not claim universal module compatibility.

## Optional Sequencer attack animations

1. Install and enable a compatible Sequencer release and your chosen animation asset pack.
2. Select the attacking token and select a target if using a projectile.
3. Open the attack or vehicle-weapon item. Expand **Optional visual effects**.
4. Enter an installed animation file path or Sequencer database entry.
5. Enable **Stretch from attacker to first selected target** for projectiles. Leave it off for an effect at the attacker.
6. Roll the attack normally.

Animations are cosmetic and play after a confirmed completed attack, including a miss. They do not apply damage or lighting. One animation is played per attack, not per occupied target square. If an actor has multiple scene tokens, the selected matching token is preferred; synthetic token actors use their own token. Missing Sequencer or an empty file leaves combat unchanged. Disable the built-in playback under **Optional attack animations** if another adapter handles animation.

Sequencer owns synchronization to other clients. Assets must be accessible to those clients. Lighting modules and ambient lights continue to use native Foundry controls. No module is installed or enabled automatically.

## Integration hook

Listen with `Hooks.on('stthAttackRolled', payload => { ... })`.
Payload: `actor, item, source, targets, attack, defense, damage, pilot, userId`.
The source is the scene Token when available. Targets are the rolling user's selected Token objects. Damage is the calculated attack outcome, not confirmation that HP damage was applied. Pilot is populated for vehicle attacks. This hook fires only on the rolling client; integrations own broadcasting and duplicate prevention. Tag-Team and Team Blast use separate workflows and are not included in this adapter.

The system preserves external status-effect definitions when registering its own status icons.

References:
- https://foundryvtt.com/api/modules/hookEvents.html
- https://github.com/fantasycalendar/FoundryVTT-Sequencer/blob/master/docs/api/effect.md

Validation: mocked adapter tests cover missing module, hook payload, Sequencer execution, setting disabled, no target, missing source, and exception isolation. A live Foundry session with third-party modules has not been tested.
