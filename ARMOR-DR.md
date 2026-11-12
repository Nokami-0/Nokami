# Armor damage reduction (custom rule)

Equipped, functional gear and vehicle upgrades can reduce damage. Light Armor defaults to DR 1, Medium Armor DR 2, and Heavy Armor DR 3. Matching is by exact item name, ignoring capitalization. Any item can be configured in its Armor damage reduction field; blank uses the named default, zero disables protection. Only the highest eligible DR applies, so armor does not stack.

Damage is reduced once per application, to a minimum of zero. Shields absorb hits first and retain their normal break behavior. Fully armor-blocked damaging hits do not cause damage criticals; explicitly inflicted zero-damage criticals (such as NPC suffocation) still work. Existing HP, Speed and other armor modifiers are preserved. This is an additional custom rule, not a replacement of printed vehicle armor effects.

Use Take damage → Apply armor damage reduction → No to bypass armor, or pass {bypassArmor:true} to game.stth.damage. Manual HP edits bypass automation. The actor sheet displays Armor DR, and damage cards report the amount prevented.

Three focused tests cover defaults, overrides, stacking, broken/disabled/unequipped gear, vehicle upgrades, damage flooring, bypass, and shield precedence. JavaScript syntax checks pass. Live Foundry validation remains pending.
