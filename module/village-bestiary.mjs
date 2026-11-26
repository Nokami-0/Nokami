import {fubukiKakuyoku, mizoreFuyukuma, karenbana} from './film-mercenaries.mjs';
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

const SYS = 'shini-no-sho-altered';
const PACK = 'world.sns-village-henchmen';
let building;

const placeholderArt = 'icons/svg/mystery-man.svg';
const tokenDirectory = `systems/${SYS}/assets/tokens/bestiary`;
const henchmanTokenNames = {
 'land-of-iron:samurai-henchman': 'land-of-iron-samurai',
 'otogakure:masked-henchman': 'oto-masked-ninja',
 'konohagakure:chunin-examiner': 'konoha-chunin-examiner',
 'kaguya:clan-raider': 'kaguya-clan-raider'
};

function withTokenArt(actor, tokenName) {
 if (!tokenName) return actor;
 const src = `${tokenDirectory}/${tokenName}.webp`;
 return {...actor, img: src, prototypeToken: {...actor.prototypeToken, texture: {src}}};
}

function defaultArtUpdates(actor, template) {
 const changes = {};
 if (!actor || !template.prototypeToken.texture) return changes;
 if (actor.img === placeholderArt) changes.img = template.img;
 const current = actor.prototypeToken.texture?.src;
 if (!current || current === placeholderArt) changes['prototypeToken.texture.src'] = template.prototypeToken.texture.src;
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
 const locked = pack.locked;
 if (locked) await pack.configure({locked:false});
 let added = 0;
 let renamed = 0;
 try {
  const existing = new Map((await pack.getDocuments()).map(actor => [actor.getFlag(SYS,'villageHenchman'), actor]));
  const folders = new Map(pack.folders.map(folder => [folder.name, folder.id]));
  for (const row of villageHenchmen) {
   const actor = existing.get(row.id);
   const template = withTokenArt(villageHenchmanActor(row), henchmanTokenNames[row.id]);
   if (actor) {
    const changes = {};
    if (row.legacyName) {
     if (actor.name === row.legacyName) changes.name = row.name;
     if (actor.system.cabecalho.nome === row.legacyName) changes['system.cabecalho.nome'] = row.name;
     if (actor.prototypeToken.name === row.legacyName) changes['prototypeToken.name'] = row.name;
    }
    if (Object.keys(changes).length) renamed++;
    Object.assign(changes, defaultArtUpdates(actor, template));
    if (Object.keys(changes).length) await actor.update(changes);
    continue;
   }
   let folder = folders.get(row.village);
   if (!folder) {
    const created = await FolderClass.create({name:row.village,type:'Actor',sorting:'a'},{pack:pack.collection});
    folder = created.id;
    folders.set(row.village,folder);
   }
   await ActorClass.create({...template,folder},{pack:pack.collection});
   added++;
  }
 } finally {
  if (locked) await pack.configure({locked:true});
 }
 return {pack, added, renamed};
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

async function buildBossBestiary() {
 const collection = 'world.sns-village-bosses';
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
 const templates = [
  {actor:ghostSamurai, folderName:'Land of Birds'},
  {actor:kaguyaClanLeader, folderName:'Kirigakure'},
  {actor:ranmaru, folderName:'Kurosuki Family'},
  {actor:banditLeader, folderName:'Bandits'},
  {actor:konohaMedic, folderName:'Konohagakure'},
  {actor:kazuma, folderName:'Twelve Guardian Ninja'},
  {actor:sora, folderName:'Twelve Guardian Ninja'},
  {actor:dotoKazahana, folderName:'Land of Snow'},
  {actor:ishidate, folderName:'Land of the Moon'},
  {actor:karenbana, folderName:'Land of the Moon'},
  {actor:fubukiKakuyoku, folderName:'Land of Snow'},
  {actor:mizoreFuyukuma, folderName:'Land of Snow'}
 ].map(({actor, folderName}) => {
  const id = actor.flags[SYS].bestiaryBoss;
  return {id, actor: withTokenArt(actor, id), folderName};
 });
 const missing = templates.filter(({id}) => !existing.has(id));
 const artUpdates = templates.flatMap(({id, actor}) => {
  const current = existing.get(id);
  const changes = defaultArtUpdates(current, actor);
  return Object.keys(changes).length ? [{current, changes}] : [];
 });
 if (!missing.length && !balanceUpdate && !oldTouch && !artUpdates.length) return;

 const locked = pack.locked;
 if (locked) await pack.configure({locked:false});
 try {
  if (balanceUpdate) await bandit.update(balanceUpdate);
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
  await buildVillageBestiary();
  await buildBossBestiary();
 } catch (error) {
  console.error('Could not build the Shini no Sho Village Bestiary',error);
  ui.notifications.warn('Village Bestiary build failed. See the console for details.');
 }
});
