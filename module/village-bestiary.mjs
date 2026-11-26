import {villageHenchmen, villageHenchmanActor} from './village-henchmen.mjs';

const SYS = 'shini-no-sho-altered';
const PACK = 'world.sns-village-henchmen';
let building;

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
   if (actor) {
    const changes = {};
    if (actor.name === row.legacyName) changes.name = row.name;
    if (actor.system.cabecalho.nome === row.legacyName) changes['system.cabecalho.nome'] = row.name;
    if (actor.prototypeToken.name === row.legacyName) changes['prototypeToken.name'] = row.name;
    if (Object.keys(changes).length) {
     await actor.update(changes);
     renamed++;
    }
    continue;
   }
   let folder = folders.get(row.village);
   if (!folder) {
    const created = await FolderClass.create({name:row.village,type:'Actor',sorting:'a'},{pack:pack.collection});
    folder = created.id;
    folders.set(row.village,folder);
   }
   await ActorClass.create({...villageHenchmanActor(row),folder},{pack:pack.collection});
   added++;
  }
 } finally {
  if (locked) await pack.configure({locked:true});
 }
 return {pack, added, renamed};
}

const bestiaryHooks = foundry.helpers?.Hooks ?? globalThis.Hooks;
bestiaryHooks.once('ready', async () => {
 if (!game.user.isGM || (game.users.activeGM && game.users.activeGM.id !== game.user.id)) return;
 game.snsVillageBestiary = {build:buildVillageBestiary};
 try {
  await buildVillageBestiary();
 } catch (error) {
  console.error('Could not build the Shini no Sho Village Bestiary',error);
  ui.notifications.warn('Village Bestiary build failed. See the console for details.');
 }
});
