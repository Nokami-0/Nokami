const villages = [
  ["Konohagakure", "Konoha", "Hidden Leaf", "Manga", [
    ["Gate Watch", "Kunai", "melee", "Guards the village gates and challenges unknown entrants."],
    ["Border Patrol", "Shuriken", "ranged", "Uses the forest canopy to screen roads and report intruders."]]],
  ["Sunagakure", "Suna", "Hidden Sand", "Manga", [
    ["Desert Watch", "Kunai", "melee", "Guards canyon approaches and desert supply routes."],
    ["Dune Skirmisher", "Shuriken", "ranged", "Uses dunes for cover while screening a larger squad."]]],
  ["Kirigakure", "Kiri", "Hidden Mist", "Manga", [
    ["Coast Watch", "Short Sword", "melee", "Patrols harbor approaches and narrow coastal paths."],
    ["Mist Screen Patrol", "Kunai", "ranged", "Uses existing fog to cover other patrol members."]]],
  ["Kumogakure", "Kumo", "Hidden Cloud", "Manga", [
    ["Mountain Patrol", "Short Sword", "melee", "Screens the passes leading into the mountain village."],
    ["Ridge Watch", "Shuriken", "ranged", "Warns the next post and covers exposed approaches."]]],
  ["Iwagakure", "Iwa", "Hidden Stone", "Manga", [
    ["Pass Guard", "Kunai", "melee", "Holds a narrow rock pass with the rest of the patrol."],
    ["Cliff Watch", "Shuriken", "ranged", "Takes cover among stone outcrops overlooking the trail."]]],
  ["Amegakure", "Ame", "Hidden Rain", "Manga", [
    ["Canal Watch", "Kunai", "melee", "Checks bridges, canals, and access to the village towers."],
    ["Roof Patrol", "Senbon", "ranged", "Covers wet roof routes and ordinary urban chokepoints."]]],
  ["Kusagakure", "Kusa", "Hidden Grass", "Manga", [
    ["Grass Border Scout", "Kunai", "melee", "Tracks movement through grassland and wooded border areas."],
    ["Trail Lookout", "Shuriken", "ranged", "Signals the patrol from concealment near a crossing."]]],
  ["Takigakure", "Taki", "Hidden Waterfall", "Manga and anime", [
    ["Waterfall Approach Guard", "Kunai", "melee", "Screens trails and pools below the hidden settlement."],
    ["Ravine Observer", "Shuriken", "ranged", "Watches narrow approaches and signals across the water."]]],
  ["Otogakure", "Oto", "Hidden Sound", "Manga", [
    ["Hideout Guard", "Kunai", "melee", "Guards a corridor or entrance in a Sound hideout."],
    ["Outer Lookout", "Senbon", "ranged", "Screens an outpost while stronger specialists stay inside."]]],
  ["Yugakure", "Yu", "Hidden Hot Water", "Manga and anime", [
    ["Spring Road Escort", "Kunai", "melee", "Escorts travelers near the springs and calls for help in a fight."],
    ["Outpost Watch", "Shuriken", "ranged", "Watches the approach to a quiet resort settlement."]]],
  ["Shimogakure", "Shimo", "Hidden Frost", "Manga", [
    ["Frost Road Patrol", "Kunai", "melee", "Guards a cold-country road or temporary checkpoint."],
    ["Snowline Scout", "Shuriken", "ranged", "Signals the patrol from cover on a snowy trail."]]],
  ["Tanigakure", "Tani", "Hidden Valley", "Manga and anime", [
    ["Valley Trail Guard", "Kunai", "melee", "Patrols an approach through the valley."],
    ["Valley Lookout", "Shuriken", "ranged", "Watches a route from higher ground."]]],
  ["Uzushiogakure", "Uzushio", "Hidden Eddy", "Manga, historical", [
    ["Historic Coast Guard", "Kunai", "melee", "Use before the village’s destruction or in a flashback."],
    ["Historic Harbor Watch", "Shuriken", "ranged", "A nameless historical sentry with no inherited sealing abilities."]]],
  ["Hoshigakure", "Hoshi", "Hidden Star", "Anime", [
    ["Star Perimeter Watch", "Kunai", "melee", "Guards an approach used in a Star Guard Mission-era scenario."],
    ["Training Grounds Lookout", "Shuriken", "ranged", "Watches the outskirts of the training grounds."]]],
  ["Yukigakure", "Yuki", "Hidden Snow", "Film", [
    ["Snow Route Patrol", "Short Sword", "melee", "Patrols a cold pass during a Land of Snow scenario."],
    ["Snow Outpost Lookout", "Kunai", "ranged", "Screens a snowy outpost using ordinary equipment."]]],
  ["Soragakure", "Sora", "Hidden Sky", "Film", [
    ["Ground Crew Guard", "Kunai", "melee", "Guards a landing site or supply point during a Sky operation."],
    ["Launch Site Lookout", "Shuriken", "ranged", "Alerts the ground crew to newcomers."]]],
  ["Takumi Village", "Takumi", "Artisan Village", "Anime", [
    ["Workshop Guard", "Short Sword", "melee", "Guards a workshop or supply yard."],
    ["Supply Escort", "Kunai", "ranged", "Escorts shipments of ordinary tools and weapons."]]],
  ["Nadeshiko Village", "Nadeshiko", "Nadeshiko", "Anime", [
    ["Village Patrol", "Unarmed", "melee", "Screens the village approaches using ordinary close combat."],
    ["Trail Lookout", "Kunai", "ranged", "Watches a trail used by messengers and visitors."]]],
  ["Kagerō Village", "Kagerō", "Hidden Heat Haze", "Anime, historical", [
    ["Historic Perimeter Guard", "Kunai", "melee", "Use in a campaign set before the village’s destruction."],
    ["Historic Lookout", "Shuriken", "ranged", "An ordinary sentry for a flashback or alternate continuity."]]],
  ["Jōmae Village", "Jōmae", "Hidden Lock", "Anime", [
    ["Courier Guard", "Kunai", "melee", "Escorts a courier carrying information for the village."],
    ["Border Observer", "Senbon", "ranged", "Observes a crossing and alerts the rest of the team."]]]
];

export const villageHenchmen = villages.flatMap(([village, prefix, english, continuity, roles]) =>
  roles.map(([role, weapon, attack, tactics], index) => ({
    id:`${village}:${index}`, village, english, continuity, role, weapon, attack, tactics,
    name:`${prefix} ${index === 0 ? "Shinobi" : "Kunoichi"}`,
    legacyName:`${village} — ${role}`
  }))
);

villageHenchmen.push({
  id:'land-of-iron:samurai-henchman',
  village:'Land of Iron',
  english:'Land of Iron',
  continuity:'Manga and anime',
  role:'Armored summit guard',
  name:'Land of Iron Samurai',
  weapon:'Katana',
  sidearm:'Wakizashi',
  attack:'melee',
  tactics:'An armored samurai with a helmet and face mask. Use him in pairs to guard a gate or a corridor at the Five Kage Summit. Choose either blade for a standard melee attack. Carrying two weapons grants no extra attacks. The armor is part of the uniform and grants no extra protection in this ordinary henchman build.'
});

villageHenchmen.push({
  id:'otogakure:masked-henchman',
  village:'Otogakure',
  english:'Hidden Sound',
  continuity:'Manga and anime setting',
  role:'Masked hideout sentry',
  name:'Oto Masked Ninja',
  weapon:'Unarmed',
  sidearm:'Kunai',
  attack:'melee',
  tactics:'A masked foot soldier in a gray tunic. Use him as a sentry in a Sound hideout. He fights with ordinary taijutsu or a backup kunai and calls for reinforcements when intruders get past him. Either attack uses the same henchman damage. He has no special sound techniques.'
});

villageHenchmen.push({
  id:'konohagakure:chunin-examiner',
  village:'Konohagakure',
  english:'Hidden Leaf',
  continuity:'Chūnin Exams',
  role:'Assistant exam proctor',
  name:'Konoha Chūnin Examiner',
  weapon:'Unarmed',
  sidearm:'Kunai',
  attack:'melee',
  tactics:'A gray-uniformed Leaf chūnin with a clipboard. Tracks candidates and records infractions for the chief proctor. Run routine exam supervision as part of the scene. If a disputed incident requires a skill test, use a full NPC for the chief proctor. In combat, the examiner calls for backup and uses basic taijutsu or a kunai.'
});

villageHenchmen.push({
  id:'kaguya:clan-raider',
  village:'Kirigakure',
  english:'Hidden Mist encounter',
  continuity:'Manga and anime, historical',
  role:'Kaguya clan attacker',
  name:'Kaguya Clan Raider',
  clan:'Kaguya',
  affiliation:'Kaguya clan',
  weapon:'Unarmed',
  attack:'melee',
  tactics:'A nameless Kaguya clan fighter from the raid on Kirigakure. The Kirigakure folder marks the encounter location. The raider is an attacker from the clan and fights at close range with ordinary taijutsu. Reserve Shikotsumyaku and bone techniques for a rare bloodline wielder.'
});

villageHenchmen.push({
  id:'sunagakure:puppet-user',
  village:'Sunagakure',
  english:'Hidden Sand',
  continuity:'Manga and anime setting',
  role:'Puppet user',
  name:'Suna Shinobi — Puppet User Henchman',
  weapon:'Kunai',
  attack:'melee',
  gear:['Goggles', 'Face Wrap', 'Water Flask', 'Medium Wooden Puppet'],
  tactics:'Carries a medium wooden puppet fitted with a Hidden Blade and Senbon Launcher. Resolve the puppet’s attacks using this henchman’s normal accuracy and damage. The kunai is a backup.'
});

villageHenchmen.push({
  id:'bandits:thief-henchman',
  village:'Bandits',
  english:'Roadside gang',
  continuity:'Naruto-inspired encounter',
  role:'Masked thief',
  name:'Thief Henchman',
  weapon:'Short Sword',
  attack:'melee',
  gear:['Face Mask', 'Loot Pouch'],
  tactics:'Works in pairs to distract travelers and steal their valuables. Uses a short sword if cornered and retreats once the gang loses the advantage.'
});

villageHenchmen.push({
  id:'yukigakure:snow-ninja-henchman',
  village:'Yukigakure',
  english:'Land of Snow',
  continuity:'Film',
  role:'Shipboard guard',
  name:'Snow Ninja Henchman',
  weapon:'Kunai',
  attack:'ranged',
  gear:['Snow Shinobi Mask', 'Cold-Weather Uniform', 'Climbing Line'],
  tactics:'Watches the deck and boarding points, using a kunai from cover and a climbing line to move between levels. Use normal henchman rules for the attack. The uniform provides warmth and has no combat armor bonus.'
});


villageHenchmen.push(
  {
    id:'cult:member', village:'Cult and Undead', english:'Cult encounter', continuity:'Homebrew',
    role:'Ritual chamber guard', name:'Cult Member', weapon:'Unarmed', attack:'melee',
    gear:['Red Face Seal'], tactics:'Guards the ritual chamber. The red seal is a cult insignia.'
  },
  {
    id:'cult:zombie-ninja', village:'Cult and Undead', english:'Cult encounter', continuity:'Homebrew',
    role:'Undead guard', name:'Zombie Ninja', weapon:'Unarmed', attack:'melee',
    gear:['Yellow Binding Seal'], tactics:'The yellow seal animates the zombie. It collapses at 0 Vitality or if the seal is removed. It does not rise again automatically. Resolve the seal manually.'
  },
  {
    id:'independent:fox-mask', village:'Independent Shinobi', english:'Independent encounter', continuity:'Homebrew',
    role:'Masked sentry', name:'Fox-Mask Ninja', weapon:'Kunai', attack:'melee',
    gear:['Fox Mask'], tactics:'A masked shinobi without an assigned village or clan. Use the ordinary henchman rules.'
  }
);

export function henchmanNumbers(nc) {
  const level = Math.max(1, Math.trunc(Number(nc) || 1));
  return {accuracy:3 + level, damage:Math.max(Math.floor(level / 2), level - 3)};
}

export function villageHenchmanActor(row) {
  const nc = 4;
  const {accuracy, damage} = henchmanNumbers(nc);
  const {name} = row;
  const weapons = row.sidearm ? [row.weapon, row.sidearm] : [row.weapon];
  return {
    name, type:'personagem', img:'icons/svg/mystery-man.svg',
    prototypeToken:{name, actorLink:false, disposition:-1},
    system:{
      cabecalho:{nome:name, nc, patente:'Henchman', filiacao:row.affiliation ?? row.village, cla:row.clan ?? ''},
      energias:{vitalidade:{value:1,max:1}, chakra:{value:0,max:0}},
      databook:{biografia:`<p><strong>${row.english} · ${row.continuity} · ${row.role}</strong></p><p>${row.tactics}</p>
       <p>Original nameless NPC. Default campaign NC 4. Edit NC to scale accuracy and base damage. Ordinary attribute and skill tests fail. Against ordinary opponents, damage caps at Degree 3. No coup de grâce or opportunity attacks against ordinary opponents. Opponents can simulate one die against this henchman. Core 4.1b, p. 281.</p>`}
    },
    items:[...weapons.map(weapon => ({
      name:weapon, type:'equipamento', img:'icons/svg/sword.svg',
      system:{descricao:`${row.attack === 'melee' ? 'Melee' : 'Ranged'} henchman attack. Default accuracy ${accuracy}. Uses the henchman base damage for the actor’s current NC.`,
        weaponCategory:{Unarmed:'natural', Katana:'martial', Wakizashi:'martial'}[weapon] ?? 'simple',
        attackType:row.attack,
        damageType:{Unarmed:'Bludgeoning', 'Short Sword':'Slashing', Katana:'Slashing', Wakizashi:'Slashing'}[weapon] ?? 'Piercing',
        weaponDamage:damage, equipped:true, quantidade:1}
    })), ...(row.gear ?? []).map(name => ({
      name, type:'equipamento', img:'icons/svg/item-bag.svg', system:{quantidade:1}
    }))],
    flags:{'shini-no-sho-altered':{villageHenchman:row.id}}
  };
}
