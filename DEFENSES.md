# Defense choices (custom rules)

Character and NPC sheets now show Block (Power), Dodge (Dexterity), and Parry (Speed). Choose only one defense per incoming attack; the GM enforces that choice. These controls do not spend an additional Action or grant an additional attack. Existing Dodge behavior is preserved: its normal derived Dodge pool (normally ceil(Dexterity/2), with existing bonuses and penalties), not full Dexterity dice.

## Block

For a blockable hit, subtract effective Power from incoming damage, minimum zero. No roll is required. Then apply the strongest equipped armor DR to the remainder. Power 4 against 10 damage leaves 6; DR 3 then leaves 3. An active protective shield absorbs the hit first and breaks under existing rules; do not spend Block or armor protection on top of that. GM decides whether hazards or special attacks can be blocked. Block does not cancel separate conditions or explicit zero-damage critical effects.

Use Block on the sheet, enter incoming damage and critical/shield/armor choices, and confirm once. This applies damage directly; do not also click another damage application. API users can pass {block:true} to game.stth.damage on a character or NPC.

## Parry

Declare before rolling against a single-target melee hit. Requires a usable melee weapon or a limb that can safely deflect that attack, as agreed by the GM. Beams, explosions, area effects and environmental damage cannot normally be parried.

Enter the attacker's successful hits and incoming damage. Roll effective Speed d6s, reduced by 2 dice per Stunned and Restrained stack (minimum zero). This is a defensive roll counting hits only, with no skill ranks or mastery dice. Strictly more hits than the attacker cancels that hit's damage and on-hit effects; equal or fewer fails and resolves full incoming damage through shields and armor normally. No Block may be added to a failed Parry. Attackers and defenders must adjudicate separate conditions manually.

A successful Parry earns 1 TP, maximum 15 TP, at most once per combat round. Outside started combat, earn this reward once until End encounter is used. Additional successful Parries can prevent their declared hits but grant no further TP in the same reward window. The player and GM enforce one defense per incoming attack; repeated clicks do not represent extra opportunities to defend the same hit.

## Validation

Focused tests cover Power reduction, flooring, Block plus armor, prevention without Ring loss, Parry success/tie/failure and TP cap. Updated JavaScript modules pass syntax checks. Live Foundry validation remains pending.
