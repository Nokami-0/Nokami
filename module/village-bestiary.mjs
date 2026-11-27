import {jiga} from './jiga.mjs';
import {lordSagi} from './lord-sagi.mjs';
import {renga} from './renga.mjs';
import {michiruTsuki} from './michiru-tsuki.mjs';
import {suiko} from './suiko.mjs';
import {ryugan} from './ryugan.mjs';
import {waraji} from './waraji.mjs';
import {fuka} from './fuka.mjs';
import {gitai} from './gitai.mjs';
import {tonbei} from './tonbei.mjs';
import {directorMakino} from './director-makino.mjs';
import {sazanami} from './sazanami.mjs';
import {genyumaru} from './genyumaru.mjs';
import {kamira} from './kamira.mjs';
import {ranke} from './ranke.mjs';
import {gatsu} from './gatsu.mjs';
import {gato} from './gato.mjs';
import {kamikiri} from './kamikiri.mjs';
import {suzumebachi} from './suzumebachi.mjs';
import {shiin} from './shiin.mjs';
import {menma} from './menma.mjs';
import {oboro} from './oboro.mjs';
import {poisonLoadoutChanges} from './bestiary-poisons.mjs';
import {demonBrothers} from './demon-brothers.mjs';
import {soundAndClanNpcs} from './sound-and-clan-npcs.mjs';
import {villageTraining} from './village-training.mjs';
import {shinnoBase, shinnoRevival} from './shinno.mjs';
import {samuraiCaptain} from './samurai-captain.mjs';
import {anbuOperatives} from './anbu-operatives.mjs';
import {villageBasicTechniques, villageSpecialists, villageLoadoutItems} from './village-techniques.mjs';
import {fubukiKakuyoku, mizoreFuyukuma, karenbana, nadareRoga, kongo} from './film-mercenaries.mjs';
import {ishidate, previousPetrifyingTouch} from "./ishidate.mjs";
import {dotoKazahana} from "./doto-kazahana.mjs";
import {sora} from "./sora.mjs";
import {kazuma} from "./kazuma.mjs";
import {konohaMedic} from "./konoha-medic.mjs";
import {banditLeader} from "./bandit-leader.mjs";
import {ranmaru} from "./ranmaru.mjs";
import {kaguyaClanLeader} from './kaguya-clan-leader.mjs';
import {ghostSamurai} from './ghost-samurai.mjs';
import {villageHenchmen, villageHenchmanActor} from './village-henchmen.mjs';

const SYS = 'shinobi-no-sho-revamp';
const PACK = 'world.sns-village-henchmen';
const BOSS_PACK = 'world.sns-village-bosses';
let building;

const placeholderArt = 'icons/svg/mystery-man.svg';
const tokenDirectory = `systems/${SYS}/assets/tokens/bestiary`;
const henchmanTokenNames = {
 'Iwagakure:0': 'iwa-shinobi',
 'Sunagakure:0': 'suna-shinobi',
 'Kirigakure:0': 'kiri-shinobi',
 'Amegakure:0': 'ame-shinobi',
 'Konohagakure:0': 'konoha-shinobi',
 'Kumogakure:0': 'kumo-shinobi',
 'Soragakure:0': 'sky-ninja',
 'cult:member': 'cult-member',
 'cult:zombie-ninja': 'zombie-ninja',
 'independent:fox-mask': 'fox-mask-ninja',
 'yukigakure:snow-ninja-henchman': 'snow-ninja-henchman',
 'bandits:thief-henchman': 'thief-henchman',
 'kurosuki:gang-member': 'kurosuki-gang-member',
 'haido:soldier': 'haido-soldier',
 'sunagakure:puppet-user': 'suna-puppet-user',
 'Hoshigakure:0': 'hoshi-shinobi',
 'land-of-iron:samurai-henchman': 'land-of-iron-samurai',
 'otogakure:masked-henchman': 'oto-masked-ninja',
 'konohagakure:chunin-examiner': 'konoha-chunin-examiner',
 'kaguya:clan-raider': 'kaguya-clan-raider'
};

const tokenArtReplacements = new Set(['mizore-fuyukuma', 'fubuki-kakuyoku', 'nadare-roga', 'ishidate', 'karenbana', 'kongo', 'kiri-hunter-nin', 'suna-anbu', 'konoha-anbu', 'ranke']);

const originalTokenNames = new Set([
 'ranke',
 'suna-puppet-user',
 'aburame-clan-member',
 'ame-shinobi',
 'bandit-leader',
 'cult-member',
 'dosu-kinuta',
 'doto-kazahana',
 'fubuki-kakuyoku',
 'gato',
 'gatsu',
 'gozu',
 'hoshi-shinobi',
 'hyuga-shinobi',
 'ishidate',
 'iwa-shinobi',
 'kaguya-clan-leader',
 'kaguya-clan-raider',
 'kamikiri',
 'karenbana',
 'kazuma-furiido',
 'kedoin-clan-member',
 'kin-tsuchi',
 'kiri-hunter-nin',
 'kiri-shinobi',
 'kongo',
 'konoha-anbu',
 'konoha-chunin-examiner',
 'konoha-medic',
 'konoha-shinobi',
 'kumo-shinobi',
 'kurosuki-gang-member',
 'land-of-birds-ghost-samurai',
 'land-of-iron-samurai',
 'meizu',
 'menma',
 'mizore-fuyukuma',
 'nadare-roga',
 'nara-clan-member',
 'oboro',
 'ranmaru',
 'shiin',
 'shinno-base',
 'sky-ninja',
 'sora',
 'suna-anbu',
 'suna-shinobi',
 'suzumebachi',
 'uchiha-clan-member',
 'zaku-abumi',
 'zombie-ninja'
]);

function withTokenArt(actor, tokenName) {
 if (!tokenName) return actor;
 const originalName = tokenName.replace(/-(?:card|film)$/, '');
 const assetName = originalTokenNames.has(originalName) ? `${originalName}-cutout` : tokenName;
 const src = `${tokenDirectory}/${assetName}.webp`;
 return {...actor, img: src, prototypeToken: {...actor.prototypeToken, texture: {src}}};
}

function defaultArtUpdates(actor, template) {
 const changes = {};
 if (!actor || !template.prototypeToken.texture) return changes;
 const target = template.prototypeToken.texture.src;
 const stem = target.endsWith('-cutout.webp') ? target.slice(0, -'-cutout.webp'.length) : null;
 const previous = stem ? [`${stem}.webp`, `${stem}-film.webp`, `${stem}-card.webp`, `${stem}-original.webp`] : [];
 if (actor.img === placeholderArt || previous.includes(actor.img)) changes.img = template.img;
 const current = actor.prototypeToken.texture?.src;
 if (!current || current === placeholderArt || previous.includes(current)) changes['prototypeToken.texture.src'] = target;
 return changes;
}

export function buildVillageBestiary() {
 if (!game.user.isGM) throw Error('Only a GM can build the Village Bestiary.');
 return building ??= build().finally(() => {building = undefined;});
}

async function build() {
 const Compendiums = foundry.documents?.collections?.CompendiumCollection ?? globalThis.CompendiumCollection;
 const ActorClass = CONFIG.Actor.documentClass;
 const FolderClass = CONFIG.Folder.documentClass;
 const pack = game.packs.get(PACK) ?? await Compendiums.createCompendium({
  name:'sns-village-henchmen', label:'Shini no Sho — Village Bestiary: Henchmen',
  type:'Actor', package:'world', ownership:{PLAYER:'NONE', ASSISTANT:'OWNER'}
 });
 const response = await fetch(`systems/${SYS}/integrated/data/sns-basic-jutsu__items.json`);
 if (!response.ok) throw Error(`Could not load the Basic Jutsu catalog (HTTP ${response.status}).`);
 const basicJutsu = await response.json();
 const locked = pack.locked;
 if (locked) await pack.configure({locked:false});
 let added = 0;
 let renamed = 0;
 try {
  const documents = await pack.getDocuments();
  const existing = new Map(documents.map(actor => [actor.getFlag(SYS,'villageHenchman'), actor]));
  const folders = new Map(pack.folders.map(folder => [folder.name, folder.id]));
  for (const row of villageHenchmen) {
   const previousPuppetUser = row.id === 'sunagakure:puppet-user' && documents.find(document =>
    document.name === row.name && !document.getFlag(SYS, 'villageHenchman'));
   const actor = existing.get(row.id) ?? previousPuppetUser;
   const template = withTokenArt(villageHenchmanActor(row), henchmanTokenNames[row.id]);
   const techniques = villageBasicTechniques(row, basicJutsu);
   if (actor) {
    const changes = {};
    if (row.legacyName) {
     if (actor.name === row.legacyName) changes.name = row.name;
     if (actor.system.cabecalho.nome === row.legacyName) changes['system.cabecalho.nome'] = row.name;
     if (actor.prototypeToken.name === row.legacyName) changes['prototypeToken.name'] = row.name;
    }
    if (Object.keys(changes).length) renamed++;
    Object.assign(changes, defaultArtUpdates(actor, template));
    if (actor === previousPuppetUser) {
     changes[`flags.${SYS}.villageHenchman`] = row.id;
     changes.img = template.img;
     changes['prototypeToken.texture.src'] = template.prototypeToken.texture.src;
    }
    if (Object.keys(changes).length) await actor.update(changes);
    const missing = techniques.filter(technique => !actor.items.some(item =>
     item.type === technique.type && item.name.toLowerCase() === technique.name.toLowerCase()));
    if (missing.length) await actor.createEmbeddedDocuments('Item', missing);
    continue;
   }
   let folder = folders.get(row.village);
   if (!folder) {
    const created = await FolderClass.create({name:row.village,type:'Actor',sorting:'a'},{pack:pack.collection});
    folder = created.id;
    folders.set(row.village,folder);
   }
   await ActorClass.create({...template,items:[...template.items,...techniques],folder},{pack:pack.collection});
   added++;
  }
  if (await moveMedicToHenchmen(pack, folders.get('Konohagakure'), documents)) added++;
 } finally {
  if (locked) await pack.configure({locked:true});
 }
 return {pack, added, renamed, basicJutsu};
}

async function moveMedicToHenchmen(pack, folder, documents) {
 const id = 'konoha-medic';
 const bosses = game.packs.get(BOSS_PACK);
 const previous = (await bosses?.getDocuments())?.find(actor => actor.getFlag(SYS,'bestiaryBoss') === id);
 const current = documents.find(actor => actor.getFlag(SYS,'bestiarySupport') === id);
 if (!current) {
  const template = withTokenArt(konohaMedic, id);
  const source = previous?.toObject() ?? structuredClone(template);
  delete source._id;
  const training = villageTraining(id, source);
  source.system.pericias = {...source.system.pericias, ...training.skills};
  source.items.push(...missingItems(source, training.items));
  const flags = source.flags[SYS] ??= {};
  delete flags.bestiaryBoss;
  flags.bestiarySupport = id;
  if (previous) {
   const art = defaultArtUpdates(previous, template);
   if (art.img) source.img = art.img;
   if (art['prototypeToken.texture.src']) source.prototypeToken.texture = {...source.prototypeToken.texture, src: template.img};
  }
  const created = await CONFIG.Actor.documentClass.create({...source,folder},{pack:pack.collection});
  if (!created) throw Error('Could not create the Konoha Medic in Henchmen.');
 }
 if (current) {
  const training = villageTraining(id, current);
  const changes = skillUpdates(training.skills);
  if (Object.keys(changes).length) await current.update(changes);
  const items = missingItems(current, training.items);
  if (items.length) await current.createEmbeddedDocuments('Item', items);
 }
 if (previous) {
  const locked = bosses.locked;
  if (locked) await bosses.configure({locked:false});
  try {
   await previous.delete();
  } finally {
   if (locked) await bosses.configure({locked:true});
  }
 }
 return !current;
}

function missingItems(actor, items) {
 return items.filter(item => !actor.items.some(owned =>
  owned.type === item.type && owned.name.toLowerCase() === item.name.toLowerCase()));
}

function skillUpdates(skills) {
 return Object.fromEntries(Object.entries(skills).map(([skill, data]) =>
  [`system.pericias.${skill}.pontos`, data.pontos]));
}

function banditBalanceUpdate(actor) {
 const system = actor?._source.system;
 if (system?.cabecalho.nc !== 8) return;
 const previousAttributes = {for:8, des:4, agi:5, per:5, vig:7, int:4, esp:3};
 const revised = banditLeader.system;
 const updates = {'system.cabecalho.nc':revised.cabecalho.nc};
 for (const [key, value] of Object.entries(previousAttributes)) {
  if (system.atributos[key].valor !== value) return;
  updates[`system.atributos.${key}.valor`] = revised.atributos[key].valor;
 }
 for (const [key, skill] of Object.entries(revised.pericias)) {
  if (system.pericias[key].pontos !== 4) return;
  updates[`system.pericias.${key}.pontos`] = skill.pontos;
 }
 if (system.sociais.carisma.valor !== 4 || system.periciasSociais.intimidar.pontos !== 4) return;
 updates['system.sociais.carisma.valor'] = revised.sociais.carisma.valor;
 updates['system.periciasSociais.intimidar.pontos'] = revised.periciasSociais.intimidar.pontos;
 for (const [key, oldMax] of [['vitalidade',71], ['chakra',19]]) {
  if (system.energias[key].value !== oldMax) return;
  updates[`system.energias.${key}.value`] = revised.energias[key].value;
  updates[`system.energias.${key}.max`] = revised.energias[key].max;
 }
 return updates;
}

async function buildBossBestiary(basicJutsu) {
 const collection = BOSS_PACK;
 const Compendiums = foundry.documents?.collections?.CompendiumCollection ?? globalThis.CompendiumCollection;
 const pack = game.packs.get(collection) ?? await Compendiums.createCompendium({
  name:'sns-village-bosses', label:'Shini no Sho — Village Bestiary: Bosses',
  type:'Actor', package:'world', ownership:{PLAYER:'NONE', ASSISTANT:'OWNER'}
 });
 const existing = new Map((await pack.getDocuments()).map(actor => [actor.getFlag(SYS,'bestiaryBoss'), actor]));
 const bandit = existing.get('bandit-leader');
 const balanceUpdate = banditBalanceUpdate(bandit);
 const ishidateActor = existing.get('ishidate');
 const oldTouch = ishidateActor?.items.find(item => item.type === 'poder' && item.name === 'Petrifying Touch'
  && item.system.descricao === previousPetrifyingTouch);
 const puppetAptitudes = await Promise.all([
  ['sns-aptitude-individual__items.json', 'Engineer'],
  ['sns-hijutsu-vol2-chapter2__items.json', 'Kugutsu (Puppets)']
 ].map(async ([file, name]) => {
  const response = await fetch(`systems/${SYS}/integrated/data/${file}`);
  if (!response.ok) throw Error(`Could not load ${file} (HTTP ${response.status}).`);
  const item = (await response.json()).find(item => item.name === name && item.type === 'aptidao');
  if (!item) throw Error(`Could not find ${name} in ${file}.`);
  return item;
 }));
 const response = await fetch(`systems/${SYS}/integrated/data/sns-common-ninpou__items.json`);
 if (!response.ok) throw Error(`Could not load the Ninpou catalog (HTTP ${response.status}).`);
 const ninpou = await response.json();
 const clanResponse = await fetch(`systems/${SYS}/integrated/data/sns-basic-book-clans__items.json`);
 if (!clanResponse.ok) throw Error(`Could not load clan abilities (HTTP ${clanResponse.status}).`);
 const clanCatalog = await clanResponse.json();
 const templates = [
  {actor:ghostSamurai, folderName:'Land of Birds'},
  {actor:lordSagi(SYS), folderName:'Land of Birds'},
  {actor:samuraiCaptain, folderName:'Land of Iron'},
  {actor:kaguyaClanLeader, folderName:'Kirigakure'},
  {actor:ranmaru, folderName:'Kurosuki Family'},
  {actor:banditLeader, folderName:'Bandits'},
  {actor:shinnoBase, folderName:'Land of the Sky'},
  {actor:shinnoRevival, folderName:'Land of the Sky'},
  {actor:kazuma, folderName:'Twelve Guardian Ninja'},
  {actor:sora, folderName:'Twelve Guardian Ninja'},
  {actor:dotoKazahana, folderName:'Land of Snow'},
  {actor:ishidate, folderName:'Land of the Moon'},
  {actor:michiruTsuki(SYS), folderName:'Land of the Moon'},
  {actor:renga(SYS), folderName:'Land of Vegetables'},
  {actor:jiga(SYS), folderName:'Land of Vegetables'},
  {actor:karenbana, folderName:'Land of the Moon'},
  {actor:kongo, folderName:'Land of the Moon'},
  {actor:nadareRoga, folderName:'Land of Snow'},
  {actor:fubukiKakuyoku, folderName:'Land of Snow'},
  {actor:mizoreFuyukuma, folderName:'Land of Snow'},
  {actor:menma(SYS), folderName:'Shiin Clan'},
  {actor:shiin(SYS), folderName:'Shiin Clan'},
  {actor:suzumebachi(SYS), folderName:'Iwagakure'},
  {actor:kamikiri(SYS), folderName:'Otogakure'},
  {actor:genyumaru(SYS), folderName:'Otogakure'},
  {actor:gato(SYS), folderName:'Land of Waves'},
  {actor:waraji(SYS), folderName:'Land of Waves'},
  {actor:ryugan(SYS), folderName:'Takumi Village'},
  {actor:suiko(SYS), folderName:'Takumi Village'},
  {actor:gatsu(SYS), folderName:'Land of Stone'},
  {actor:sazanami(SYS), folderName:'Independent Shinobi'},
  {actor:directorMakino(SYS), folderName:'Land of Fire'},
  {actor:tonbei(SYS), folderName:'Tsuchigumo Clan'},
  {actor:gitai(SYS), folderName:'Land of Demons'},
  {actor:fuka(SYS), folderName:'Twelve Guardian Ninja'},
  {actor:ranke(SYS), folderName:'Haido’s Knights'},
  {actor:kamira(SYS), folderName:'Haido’s Knights'},
  {actor:oboro(SYS), folderName:'Amegakure'},
  ...soundAndClanNpcs(SYS, basicJutsu, clanCatalog, ninpou),
  ...demonBrothers(SYS, basicJutsu, ninpou),
  ...villageSpecialists,
  ...anbuOperatives(SYS, basicJutsu, puppetAptitudes)
 ].map(({actor, folderName}) => {
  const id = actor.flags[SYS].bestiaryBoss;
  const loadout = villageLoadoutItems(id, actor.system.cabecalho.filiacao, basicJutsu, ninpou);
  const training = villageTraining(id, actor);
  const profile = {
   ...actor,
   system:{...actor.system, pericias:{...actor.system.pericias, ...training.skills}},
   items:[...actor.items, ...loadout, ...missingItems(actor, training.items)]
  };
  const specialist = id.startsWith('village-specialist:');
  const additions = specialist || id === 'suna-anbu' || id === 'land-of-iron-samurai-captain'
   ? profile.items
   : [...loadout, ...profile.items.filter(item => item.type === 'aptidao')];
  const tokenName = tokenArtReplacements.has(id) ? `${id}${['kiri-hunter-nin', 'suna-anbu', 'konoha-anbu', 'ranke'].includes(id) ? '-card' : '-film'}` : id;
  return {id, actor: specialist ? profile : withTokenArt(profile, tokenName), folderName, loadout:additions};
 });
 const missing = templates.filter(({id}) => !existing.has(id));
 const artUpdates = templates.flatMap(({id, actor}) => {
  const current = existing.get(id);
  const changes = defaultArtUpdates(current, actor);
  if (tokenArtReplacements.has(id) && current) {
   const previousArt = `${tokenDirectory}/${id}.webp`;
   if (current.img === previousArt) changes.img = actor.img;
   if (current.prototypeToken.texture?.src === previousArt) {
    changes['prototypeToken.texture.src'] = actor.prototypeToken.texture.src;
   }
  }
  return Object.keys(changes).length ? [{current, changes}] : [];
 });
 const loadoutUpdates = templates.flatMap(({id, loadout}) => {
  const current = existing.get(id);
  if (!current) return [];
  const items = missingItems(current, loadout);
  const skills = skillUpdates(villageTraining(id, current).skills);
  return items.length || Object.keys(skills).length ? [{current, items, skills}] : [];
 });
 const poisonUpdates = templates.flatMap(({id, actor}) => {
  const current = existing.get(id);
  if (!current) return [];
  const changes = poisonLoadoutChanges(current, actor, id);
  return changes.create.length || changes.update.length ? [{current, ...changes}] : [];
 });
 const captain = existing.get('land-of-iron-samurai-captain');
 const oldCaptainArmor = captain?.items.find(item =>
  item.name === 'Land of Iron Battle Armor' && item.system.absorption === 15);
 if (!missing.length && !balanceUpdate && !oldTouch && !artUpdates.length && !oldCaptainArmor && !loadoutUpdates.length && !poisonUpdates.length) return;

 const locked = pack.locked;
 if (locked) await pack.configure({locked:false});
 try {
  if (balanceUpdate) await bandit.update(balanceUpdate);
  for (const {current, items, skills} of loadoutUpdates) {
   if (Object.keys(skills).length) await current.update(skills);
   if (items.length) await current.createEmbeddedDocuments('Item', items);
  }
  for (const {current, create, update} of poisonUpdates) {
   if (update.length) await current.updateEmbeddedDocuments('Item', update);
   if (create.length) await current.createEmbeddedDocuments('Item', create);
  }
  if (oldCaptainArmor) {
   const armor = samuraiCaptain.items.find(item => item.name === oldCaptainArmor.name).system;
   await oldCaptainArmor.update({
    'system.absorption': armor.absorption,
    'system.absorptionRemaining': Math.min(armor.absorption, oldCaptainArmor.system.absorptionRemaining + 5),
    'system.bodyHardnessBonus': armor.bodyHardnessBonus,
    'system.valorRyo': armor.valorRyo,
    'system.peso': armor.peso,
    'system.descricao': armor.descricao
   });
  }
  for (const {current, changes} of artUpdates) await current.update(changes);
  if (oldTouch) {
   const touch = ishidate.items.find(item => item.name === 'Petrifying Touch');
   await ishidateActor.updateEmbeddedDocuments('Item', [{_id:oldTouch.id, 'system.descricao':touch.system.descricao}]);
  }
  for (const {actor, folderName} of missing) {
   const folder = pack.folders.find(folder => folder.name === folderName)
    ?? await CONFIG.Folder.documentClass.create({name:folderName,type:'Actor',sorting:'a'},{pack:pack.collection});
   await CONFIG.Actor.documentClass.create({...actor,folder:folder.id},{pack:pack.collection});
  }
 } finally {
  if (locked) await pack.configure({locked:true});
 }
}

const bestiaryHooks = foundry.helpers?.Hooks ?? globalThis.Hooks;
bestiaryHooks.once('ready', async () => {
 if (!game.user.isGM || (game.users.activeGM && game.users.activeGM.id !== game.user.id)) return;
 game.snsVillageBestiary = {build:buildVillageBestiary};
 try {
  const {basicJutsu} = await buildVillageBestiary();
  await buildBossBestiary(basicJutsu);
 } catch (error) {
  console.error('Could not build the Shini no Sho Village Bestiary',error);
  ui.notifications.warn('Village Bestiary build failed. See the console for details.');
 }
});
