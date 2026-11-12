const SPECIAL_BOOK_WEAPONS = [
  {
    "name": "Gunbai",
    "damage": 3,
    "size": "long",
    "dtype": "bludgeoning",
    "range": 0,
    "slots": 2,
    "source": "Hijutsus 4.1.b pp.83–84",
    "rules": "Strength or Dexterity 10. Fan-Flail reaches 4m; Fan Shield can block techniques; Fan Strike reflects absorbed chakra as Fuuton; Energize and Acuity apply."
  },
  {
    "name": "Hiramekarei",
    "damage": 3,
    "size": "heavy",
    "dtype": "slashing",
    "range": 0,
    "slots": 2,
    "source": "Hijutsus 4.1.b pp.84–85",
    "rules": "Two blades +3 each; combined heavy grip +6. Separate blades need Ambidexterity. Giant Weapon, Extended Weapon, Twin Swords expend stored chakra; limited uses per day. Record +6 manually in joined form."
  },
  {
    "name": "Kabutowari",
    "damage": 3,
    "size": "heavy",
    "dtype": "slashing",
    "range": 0,
    "slots": 2,
    "source": "Hijutsus 4.1.b pp.85–86",
    "rules": "Axe +3 and hammer +3; Strength 12, Ambidexterity. Shockwave, Cut and Smash, Destroy Hardness, Destroy Absorption and Destroy Defense. Paired weapon: damage listed per component."
  },
  {
    "name": "Kiba",
    "damage": 2,
    "size": "medium",
    "dtype": "slashing",
    "range": 0,
    "slots": 2,
    "source": "Hijutsus 4.1.b pp.86–87",
    "rules": "Two blades +2 each; Ambidexterity and Raiton 5. Both blades required for effects. Raiton conduit, Natural Lightning +1, Energize and Acuity."
  },
  {
    "name": "Kubikiribōchō",
    "damage": 6,
    "size": "heavy",
    "dtype": "slashing",
    "range": 0,
    "slots": 2,
    "source": "Hijutsus 4.1.b pp.87–88",
    "rules": "Strength 12. Decapitate adds +0.5 damage degree. Unlike typical special weapons, hardness 15 and absorption 50; broken blade +3; regenerates absorption from blood."
  },
  {
    "name": "Kusanagi",
    "damage": 0,
    "size": "medium",
    "dtype": "slashing",
    "range": 0,
    "slots": 1,
    "source": "Hijutsus 4.1.b pp.88–89",
    "rules": "VARIABLE DAMAGE: select the weapon model and set its damage manually. Strength or Dexterity 10. Perfect Cut, shape-changing, telekinetic link, replication; optional fixed base damage Strength−2 or Spirit−2 under Energize."
  },
  {
    "name": "Nuibari",
    "damage": 3,
    "size": "medium",
    "dtype": "piercing",
    "range": 15,
    "slots": 1,
    "source": "Hijutsus 4.1.b pp.89–90",
    "rules": "Throw Needle range 15m; attack with CC or DC but use Strength for damage. Infinite resistant wire, Thread Stitching, Wire Fighting, Acuity."
  },
  {
    "name": "Samehada",
    "damage": 3,
    "size": "heavy",
    "dtype": "slashing",
    "range": 0,
    "slots": 2,
    "source": "Hijutsus 4.1.b pp.90–92",
    "rules": "Spirit 12 and Expanded Chakra. Living chakra-consuming sword; Chakra Scraping absorbs chakra, rejects unworthy users, and has fusion effects. Do not treat absorbed chakra as automatic resource gains without GM adjudication."
  },
  {
    "name": "Shibuki",
    "damage": 4,
    "size": "heavy",
    "dtype": "slashing",
    "range": 0,
    "slots": 2,
    "source": "Hijutsus 4.1.b p.92",
    "rules": "Spirit 10. Explosive Sword blast uses Spirit instead of Strength for base melee damage; recharge one full turn; Sword Scroll extends to 15m."
  },
  {
    "name": "Raijin no Ken",
    "damage": 4,
    "size": "medium",
    "dtype": "slashing",
    "range": 0,
    "slots": 1,
    "source": "Raijin no Ken Revised pp.1–2",
    "rules": "Strength or Dexterity 10; Raiton 5. Activation partial action and 1 chakra. Activated sword can replace Strength with Spirit for damage; has 10 charges, recharges after 1 hour inactive. Electric Rings, Electrical Cut and Electric Discharge have distinct chakra/charge costs. Critical 15–16."
  },
  {
    "name": "Seimei — Fire Sword",
    "damage": 4,
    "size": "medium",
    "dtype": "slashing",
    "range": 0,
    "slots": 1,
    "source": "Seimei Set Revised p.1",
    "rules": "Spirit 10, Strength or Dexterity 10, Katon 1. Katon conduit, Flame Initiator, Tongue of Fire (+2 weapon damage when energized), light source, Acuity; Seimei Set telepathy."
  },
  {
    "name": "Seimei — Fujaku Hishō Shōken",
    "damage": 2,
    "size": "medium",
    "dtype": "slashing",
    "range": 0,
    "slots": 1,
    "source": "Seimei Set Revised pp.1–2",
    "rules": "TWO SWORDS +2/+2 (two items, one compartment). Ambidexterity, Spirit 10, Strength or Dexterity 10, Fuuton 1. Both required; Wind Cut +1 to each when energized/sharpened; Fuuton conduit, Summer Breeze, Acuity."
  },
  {
    "name": "Seimei — Gariantō",
    "damage": 5,
    "size": "medium",
    "dtype": "slashing",
    "range": 6,
    "slots": 1,
    "source": "Seimei Set Revised pp.2–3",
    "rules": "Spirit 10, Strength or Dexterity 10, Multi-Attack. Whip-sword reaches 6m; Urumi transforms three blades into chakra serpents at Chakra cost equal to Spirit, with distinct reach/movement and absorption. Combo of Strikes +1 per different target."
  },
  {
    "name": "Seimei — Mugen Kōgai (Special Armor)",
    "damage": 0,
    "size": "heavy",
    "dtype": "bludgeoning",
    "range": 0,
    "slots": 2,
    "source": "Seimei Set Revised p.3",
    "rules": "SPECIAL HEAVY ARMOR, NOT AN ATTACK WEAPON. Spirit 10, Heavy Armor proficiency. Absorption +20, Body Hardness +2, armor penalty 1; 10-point chakra reserve, absorbs 2 chakra on qualifying hits, and has defensive/healing reserve uses. Do not use weapon attack button for this item."
  }
];
import { SNS_WEAPONS } from "./weapon-catalog.js";
const ROOT="Shinobi no Sho — Weapons";
const CATEGORIES={Simple:"Simple Weapons",Martial:"Martial Weapons",Natural:"Natural Weapons",Ammunition:"Ammunition",Explosive:"Explosives",Special:"Special Weapons"};
export async function ensureWeaponLibrary() {
  if (!game.user.isGM) return;
  let root=game.folders.find(f=>f.type==="Item" && f.name===ROOT && !f.folder);
  if (!root) root=await Folder.create({name:ROOT,type:"Item",sorting:"a"});
  const folders={};
  for (const [group,label] of Object.entries(CATEGORIES)) {
    let folder=game.folders.find(f=>f.type==="Item" && f.name===label && f.folder?.id===root.id);
    if (!folder) folder=await Folder.create({name:label,type:"Item",folder:root.id,sorting:"a"});
    folders[group]=folder;
  }
  for (const w of SNS_WEAPONS) {
    const folder=folders[w.group];
    if (!folder) continue;
    if (game.items.some(i=>i.folder?.id===folder.id && i.name===w.name && i.type==="equipamento")) continue;
    const category=({Simple:"simple",Martial:"martial",Natural:"natural",Special:"special"})[w.group]||"none";
    const ranged=w.size==="ranged" || ["Senbon","Shuriken","Kunai","Sai (pair)","Aian Nakkuru (pair)","Fuuma Shuriken: Giant","Fuuma Shuriken: Straight Blade","Fuuma Shuriken: Kage Fuusha"].includes(w.name);
    await Item.create({name:w.name,type:"equipamento",folder:folder.id,
      system:{weaponCategory:category,weaponDamage:w.damage,weaponBonus:0,attackType:ranged?"ranged":w.attack,
        weaponSize:["light","medium","long","heavy"].includes(w.size)?w.size:"light",damageType:w.dtype,
        weaponRange:w.range,criticalRange:w.crit,quantidade:1,peso:w.slots,unitsPerSlot:w.units,equipped:false,
        descricao:`Basic Book 4.1.b weapon table. Price: ${w.price??"not specified"} Ryos. ${w.note||""}`}});
  }
  for (const w of SPECIAL_BOOK_WEAPONS) {
    const folder=folders.Special;
    if (game.items.some(i=>i.folder?.id===folder.id && i.name===w.name && i.type==="equipamento")) continue;
    await Item.create({name:w.name,type:"equipamento",folder:folder.id,
      system:{weaponCategory:"special",weaponDamage:w.damage,weaponBonus:0,attackType:"melee",
        weaponSize:w.size,damageType:w.dtype,weaponRange:w.range,criticalRange:"15-16",
        quantidade:1,peso:w.slots,unitsPerSlot:1,equipped:false,
        caracteristicas:w.rules,descricao:`Source: ${w.source}. ${w.rules}`}});
  }
  ui.notifications.info("Shinobi no Sho weapon folders are ready in the Items sidebar. Drag weapons onto character sheets.");
}
