const devices = [
 ["Armor","Heavy",0,null,"Adds 1 Body Hardness. At Mechanics 14, adds 2 instead. Reduces puppet control range to Short (5 m + Spirit)."],
 ["Warehouse","Heavy",0,null,"Carries 3/6/9 item compartments for Small/Medium/Large puppets. Adding or removing items takes a Move Action. Cannot hold creatures, scrolls or puppets."],
 ["Chest","Heavy",0,null,"Requires Mechanics 10. Open as a Standard Action, close as a Free Action. An ally must Throw or Push the victim inside. Maintain confinement with a Standard Action at the start of each puppet turn. Escape with Strength against difficulty 9 + Mechanics or destroy the puppet. The victim can form hand seals but cannot perform actions requiring movement. Attacks against the puppet harm the victim only with damage exceeding remaining Absorption. Inside attacks hit automatically; roll damage degree. Holds one same-size creature or three per size category above it. Perforated chests allow Hidden Knives coup de grace against a defenseless victim. After one such strike, all victims cease being defenseless. At Mechanics 16 the controller can occupy it as a Free Action, control puppets from inside, and move 10 m using their own action. Only one puppet may have this device."],
 ["Bombs","Light / Standard",0,5,"Launches flash bombs, smoke bombs or explosive-tag projectiles. Standard slot permits a smoke sphere with diameter 5 m + Mechanics. Poisoned smoke follows normal smoke and inhalation-poison rules. Five uses per slot."],
 ["Steel Cable","Standard",2,null,"Flexible cable with an iron spear tip. Ranged attacks; may be poisoned. Two Standard slots increase its range by 1 m per Mechanics."],
 ["Scroll Capsule","Light / Standard",0,null,"Stores one compartment of Fuuinjutsu scrolls per Light slot, or three per Standard slot. Stores your own or allies’ jutsu with their original parameters. Activating takes the sealed effect’s normal action and uses the controller’s Chakra."],
 ["Chakra Slash","Standard",2,null,"An energized attack device. At Mechanics 8, weapon damage becomes +3 and ignores 1 Hardness."],
 ["Iron Maiden","Heavy",0,null,"Uses Chest confinement rules. Closed interior spikes have internal Body Hardness 2. No knife openings or Chest coup de grace. On imprisonment and at the start of each victim turn, deals fixed damage equal to Mechanics. May be poisoned."],
 ["Robust Device","Standard upgrade",0,null,"Requires Mechanics 10. Add one Standard slot to an attack device. Adds +3 damage, capped at Mechanics + 3 base damage, preserving its effects. Two-round automatic cooldown after firing. You cannot control other puppets in the round you fire it."],
 ["Body Division","Heavy",0,null,"As a Free Action, separate the head and limbs to escape restraints and grapples without a check. Until reassembly at the end of its turn, the puppet cannot defend or attack except with Hidden Knives."],
 ["Chakra Shield","Standard",0,null,"A 2 m circular shield with Hardness equal to Mechanics. React with Defend with Technique to protect the puppet, controller or an ally. Excess damage goes to puppet Absorption. Cannot defend area attacks. Spend the puppet’s Move Action and 2 Chakra to position adjacent to an ally and defend them."],
 ["Hidden Knives","Standard",2,null,"Melee or ranged attacks; may be poisoned. On the first attack against a victim, they test Readiness against difficulty 9 + Mechanics or become feinted. At Mechanics 12, two Standard slots grant 5 m reach and +3 weapon damage. This version cannot be used with Body Division. Extra reach does not change opportunity attacks or close-combat penalties."],
 ["Cutting Water Jet","Light / Standard",3,5,"Ranged cutting or piercing jet. At Mechanics 8, a Standard slot ignores 2 Hardness. At Mechanics 10, can form a line 1 m per Mechanics. Five uses per slot."],
 ["Double Kousen","Standard",3,null,"Requires two puppets with this device within 3 m of one another and unrestricted movement. Both spend a Full Action to charge along a Short-range line, limited by control range. Combined attack has +1 Accuracy and +3 weapon damage. Puppets end at the line’s end and suffer normal Charge penalties. May be poisoned."],
 ["Flamethrower","Light / Standard",3,5,"Ranged fire cannon. At Mechanics 8, a Standard slot may attack a cone 1 m long per Mechanics. Five uses per slot."],
 ["Advanced Machinery","Heavy",0,null,"Spend a Move Action and 2 Chakra for +1 base damage to a device or +15 m range to a ranged device until round end. Both different bonuses can be purchased together, paying separately."],
 ["Armed Puppet","All slots",0,null,"Replaces all device slots. The puppet fights with simple and martial weapons, except bows and Giant Fan, and can make unarmed attacks. Meet weapon prerequisites using Mechanics instead of Strength or Dexterity. Draw or retrieve dropped weapons as a Free Action. May apply poison. Available aptitudes: Ambidexterity, Utility Thrower, Efficient Thrower, Attack on the Move, Marksman, Improved Critical, Ranged Disarm, Extra Damage, Specialist, Arrow to the Knee, Fuuma Shuriken Kousen, Warrior, Phalanx Stance, Fighter, Sharpshooter, Iron Fist, Long Shot, Precise Shot, Cleave, Weapon Use, Gunpowder Use, Quick Utilityist, and Maneuver aptitudes except Pick Up Objects, Weapon Block, Counterattack and Zui Quan Style."],
 ["Elastic Limb","Standard",2,null,"Extend limbs for melee attacks at range. May rotate as a reaction to block projectiles with Ranged Combat. Two Standard slots permit special maneuvers at range with −2 Accuracy, unaffected by Fighter. At Mechanics 12, the maneuver penalty becomes −1."],
 ["Wall","Heavy",0,null,"Large puppets only. A 3 m circular barrier with Hardness 2 + Mechanics. Defend with Technique using a Move Action, Chakra equal to half Mechanics, and Read Movement +2. Protects the puppet or up to three Medium creatures behind it from area attacks. Excess damage reduces puppet Absorption."],
 ["Projectiles","Light / Standard",1,10,"Fires kunai, shuriken or senbon. At Mechanics 8, a Standard slot grants an area attack: a circle 1 m in diameter per Mechanics with +2 weapon damage. May be poisoned. Ten uses per slot."]
];

devices.push(
 ["Flamethrower — Cone","Standard",3,5,"Requires Mechanics 8. Ranged fire attack in a cone 1 m long per Mechanics. Five uses per installed slot."],
 ["Projectiles — Area Shower","Standard",2,10,"Requires Mechanics 8. Launch a spinning projectile that showers a circle 1 m in diameter per Mechanics. May be poisoned. Ten uses per installed slot."],
 ["Steel Cable — Extended","2 Standard",2,null,"Two Standard slots. Ranged spear-tipped cable. Add 1 m per Mechanics to the device’s normal range. May be poisoned."],
 ["Hidden Knives — Extended","2 Standard",3,null,"Requires Mechanics 12. Melee or ranged attack; 5 m reach. First attack forces Readiness against difficulty 9 + Mechanics or the victim becomes feinted. May be poisoned. Cannot combine with Body Division. Extra reach does not change opportunity attack or close-combat rules."],
 ["Cutting Water Jet — Hardness Bypass","Standard",3,5,"Requires Mechanics 8. Ranged cutting or piercing attack that ignores 2 Hardness. Five uses per installed slot."],
 ["Cutting Water Jet — Line","Standard",3,5,"Requires Mechanics 10. Attack along a line 1 m long per Mechanics. Ignores 2 Hardness using the Standard-slot upgrade. Five uses per installed slot."],
 ["Chakra Slash — Improved","Standard",3,null,"Requires Mechanics 8. Energized attack that ignores 1 Hardness."],
 ["Elastic Limb — Maneuvers","2 Standard",2,null,"Extend limbs for ranged melee attacks and special maneuvers. Maneuvers take −2 Accuracy, improved to −1 at Mechanics 12; Fighter does not alter this penalty. Can block projectiles as a reaction using Ranged Combat."],
 ["Scroll Capsule — Expanded","Standard",0,null,"Stores three compartments of Fuuinjutsu scrolls. Sealed jutsu retain the original caster’s parameters. Activate using the sealed effect’s normal action and your own Chakra."],
 ["Bombs — Smoke Dispersal","Standard",0,5,"Expels smoke in a sphere 5 m + Mechanics in diameter. Five uses per installed slot. Poisoned smoke follows normal smoke-bomb and inhalation-poison rules."]
);

export async function ensurePuppetDevices(pack, folder) {
 const index = await pack.getIndex();
 let upgrades = pack.folders.find(entry => entry.name === 'Upgraded Devices' && entry.folder?.id === folder);
 if (!upgrades) upgrades = await Folder.create({ name: 'Upgraded Devices', type: 'Item', folder }, { pack: pack.collection });
 const location = name => name.includes(' — ') ? upgrades.id : folder;
 const slotPrice = slots => ({ Heavy: 30, Standard: 20, 'Standard upgrade': 20, '2 Standard': 40, 'Light / Standard': 10 })[slots] ?? 0;

 const aliases = { Warehouse: 'Storage', 'Chakra Slash': 'Cutting Chakra', 'Elastic Limb': 'Elastic Member' };
 const common = 'General rules: Standard Action unless stated otherwise; pay Chakra before testing. Precision uses Ranged Combat. Base damage is ceil(Mechanics / 2 + weapon damage). Short range is 5 m + Spirit unless overridden. Device replacement requires a toolkit and 4 hours. Limited uses refill in a village without material cost. Extra Light or Standard devices carried for replacements or replenishment take one inventory compartment per slot. Quantity counts device copies. Track installation and uses manually. Slot prices: Light 10 Ryō, Standard 20 Ryō, Heavy 30 Ryō. Flexible Light/Standard items show the 10 Ryō Light version price; Standard versions cost 20 Ryō. A two-Standard-slot variant costs 40 Ryō. Armed Puppet replaces all slots; its 0 Ryō field is a placeholder because the device lists no separate material price.';
 for (const [name, slots, damage, uses, rules] of devices) {
  const entry = index.find(item => [folder, upgrades.id].includes(item.folder) && [name, aliases[name]].includes(item.name));
  if (!entry) continue;
  const item = await pack.getDocument(entry._id);
  if (!item?.system?.descricao?.startsWith('Kugutsu no Jutsu — Book of Hijutsus Vol. 2, device list')) continue;
  const description = 'Kugutsu no Jutsu — Book of Hijutsus Vol. 2, device list (printed pages 92–96). ' + rules + ' ' + common;
  if (item.name !== name || item.system.descricao !== description || item.folder?.id !== location(name) || item.system.valorRyo !== slotPrice(slots)) {
   await item.update({ name, folder: location(name), 'system.descricao': description, 'system.valorRyo': slotPrice(slots) });
  }
 }
 const referenceName = 'Puppet Device Slots — Rules';
 if (!index.some(item => item.folder === folder && item.name === referenceName)) {
  await Item.create({
   name: referenceName, type: 'equipamento', folder,
   system: { quantidade: 1, peso: 0,
    descricao: 'Book of Hijutsus Vol. 2, pages 90–91. Small: 1 Light, 1 Standard, 1 Heavy slot. Medium: 1 Light, 2 Standard, 1 Heavy. Large: 1 Light, 3 Standard, 1 Heavy. Trade 3 Standard for 1 Heavy, or a larger slot for a smaller slot. Cannot install two identical Heavy devices. Slot prices: 10/20/30 Ryō. Skeleton prices: 300/600/900 Ryō by size. Increase size for 300 Ryō per step; decrease free. Sell for half price. ' + common
   }
  }, { pack: pack.collection });
 }

 const missing = devices.filter(([name]) => !index.some(item => [folder, upgrades.id].includes(item.folder) && [name, aliases[name]].includes(item.name)));
 if (!missing.length) return;
 await Item.createDocuments(missing.map(([name, slots, damage, uses, rules]) => ({
  name, type: "equipamento", folder: location(name),
  flags: { "shinobi-no-sho-revamp": { puppetDevice: { slots, maxUses: uses, weaponDamage: damage } } },
  system: {
   quantidade: 1, peso: 0, valorRyo: slotPrice(slots), weaponDamage: damage, weaponCategory: "none",
   caracteristicas: `Kugutsu device. Slot: ${slots}. Weapon damage: ${damage ? "+" + damage : "see rules"}. Uses: ${uses ?? "see rules / unlimited"}.`,
   descricao: 'Kugutsu no Jutsu — Book of Hijutsus Vol. 2, device list (printed pages 92–96). ' + rules + ' ' + common
  }
 })), { pack: pack.collection });
}
