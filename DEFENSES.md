# Defense choices (custom rules)

Character and NPC sheets now show Block (Power), Dodge (Dexterity), and Parry (Speed). Choose only one defense per incoming attack; the GM enforces that choice. These controls do not spend an additional Action or grant an additional attack. Existing Dodge behavior is preserved: its normal derived Dodge pool (normally ceil(Dexterity/2), with existing bonuses and penalties), not full Dexterity dice.

## Block

For a blockable hit, subtract effective Power from incoming damage, minimum zero. No roll is required. Then apply the strongest equipped armor DR to the remainder. Power 4 against 10 damage leaves 6; DR 3 then leaves 3. An active protective shield absorbs the hit first and breaks under existing rules; do not spend Block or armor protection on top of that. GM decides whether hazards or special attacks can be blocked. Block does not cancel separate conditions or explicit zero-damage critical effects.

Use Block on the sheet, enter incoming damage and critical/shield/armor choices, and confirm once. This applies damage directly; do not also click another damage application. API users can pass {block:true} to game.stth.damage on a character or NPC.

## Parry

Declare before rolling against a single-target melee hit. Requires a usable melee weapon or a limb that can safely deflect that attack, as agreed by the GM. Beams, explosions, area effects and environmental damage cannot normally be parried.

Enter the attacker's successful hits and incoming damage. Roll effective Speed d6s, reduced by 2 dice per Stunned and Restrained stack (minimum zero). This is a defensive roll counting hits only, with no skill ranks or mastery dice. Strictly more hits than the attacker cancels that hit's damage and on-hit effects; equal or fewer fails and resolves full incoming damage through shields and armor normally. No Block may be added to a failed Parry. Attackers and defenders must adjudicate separate conditions manually.

A successful Parry earns 1 TP, maximum 15 TP, at most once per combat round. Outside started combat, earn this reward once until End encounter is used. Additional successful Parries can prevent their declared hits but grant no further TP in the same reward window. The player and GM enforce one defense per incoming attack; repeated clicks do not represent extra opportunities to defend the same hit.

## Successful Parry: next-attack Disadvantage

Choose the attacking actor in the Parry dialog (a selected target is suggested). Every successful Parry imposes 1 Disadvantage on that actor's next attack, against any target, in addition to the existing limited TP reward. It does not stack above 1 on the same actor. It remains until the next attack is rolled; a miss still consumes it. Canceling an attack dialog or failing validation does not consume it. Ordinary skill checks and Dodge do not consume it.

The attacker receives a visible Active Effect. The system subtracts 1 from the next attack's final Net Advantage and deletes the effect after rolling. Ordinary attacks, vehicle weapon attacks, Tag-Team Attacks and Team Blasts handle the penalty. Combined attacks apply one penalty for each affected participant; Team Blast adds an enemy defense die per affected participant. Teachable Moment support is not itself an attack, so the supporter retains the penalty until making an attack. Attacks made outside the system's attack controls require GM handling.

If the user resolving Parry owns the attacker, the effect applies automatically. Otherwise the chat card includes an Apply next-attack Disadvantage button for the GM or attacker owner. It must be applied before that actor next attacks. Each successful Parry card can apply its penalty only once, even after the penalty has been consumed.

## Validation

Focused tests cover Power reduction, flooring, Block plus armor, prevention without Ring loss, Parry success/tie/failure and TP cap. Updated JavaScript modules pass syntax checks. Live Foundry validation remains pending.

Two additional focused tests verify application, nonstacking, consumption, duplicate-card prevention, permissions, and disabled effects. Updated modules pass syntax checks; live Foundry validation remains pending.
