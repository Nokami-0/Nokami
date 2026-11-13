import {loadKuchiyoseSpecies,buildKuchiyoseTemplate} from './kuchiyose-engine.js';
const SYS='shinobi-no-sho-revamp';
const PACK='world.sns-kuchiyose';
let building;
export function buildKuchiyoseCompendium(){
 if(!game.user.isGM)throw Error('Only the GM can build the Kuchiyose compendium.');
 if(building)return building;
 building=build().finally(()=>{building=null;});return building;
}
async function build(){
 const rows=await loadKuchiyoseSpecies();
 let pack=game.packs.get(PACK);
 if(!pack)pack=await CompendiumCollection.createCompendium({name:'sns-kuchiyose',label:'Shinobi no Sho — Kuchiyose Summons',type:'Actor',package:'world',ownership:{PLAYER:'OBSERVER',ASSISTANT:'OWNER'}});
 const locked=pack.locked;if(locked)await pack.configure({locked:false});
 let added=0,existing=0;
 try{
  const docs=await pack.getDocuments(),keys=new Set(docs.map(a=>a.getFlag(SYS,'kuchiyoseCompendiumKey')).filter(Boolean));
  const folders=new Map(pack.folders.map(f=>[f.name,f.id]));
  for(const species of rows){
   if(keys.has(species.name)){existing++;continue;}
   const group=species.group||'Other Kuchiyose';
   let folder=folders.get(group);
   if(!folder){const f=await Folder.create({name:group,type:'Actor',sorting:'a'},{pack:pack.collection});folder=f.id;folders.set(group,folder);}
   await Actor.create({...buildKuchiyoseTemplate(species),folder},{pack:pack.collection});
   keys.add(species.name);added++;
  }
 }finally{if(locked)await pack.configure({locked:true});}
 return {added,existing,total:rows.length,pack:pack.collection};
}
class KuchiyoseCompendiumMenu extends FormApplication{
 static get defaultOptions(){return foundry.utils.mergeObject(super.defaultOptions,{id:'sns-kuchiyose-compendium',title:'Kuchiyose Summons Compendium',width:480,height:'auto'});}
 async _renderInner(){return $('<div><p>Build all catalog Kuchiyose species as Actor templates with token artwork, source rules and attack options. Existing entries and edits are preserved.</p><p>Allocate attributes and energies before combat. Use Summon Creature on the summoner sheet for chakra and scene rules.</p><button type="button" class="sns-build-kuchiyose">Build / Repair Kuchiyose Compendium</button></div>');}
 activateListeners(html){super.activateListeners(html);html.find('.sns-build-kuchiyose').on('click',async e=>{
  const button=$(e.currentTarget);button.prop('disabled',true);
  try{const r=await buildKuchiyoseCompendium();ui.notifications.info('Kuchiyose compendium: '+r.added+' new, '+r.existing+' existing, '+r.total+' total.');this.close();}
  catch(error){console.error(error);ui.notifications.error(error.message);button.prop('disabled',false);}
 });}
}
Hooks.once('init',()=>{
 game.settings.registerMenu(SYS,'kuchiyoseCompendium',{name:'Kuchiyose Summons Compendium',label:'Build / Repair Kuchiyose Compendium',hint:'All catalog summon species, grouped by source or contract.',icon:'fas fa-dragon',type:KuchiyoseCompendiumMenu,restricted:true});
 game.snsKuchiyose={...(game.snsKuchiyose||{}),buildCompendium:buildKuchiyoseCompendium};
});
Hooks.once('ready',async()=>{
 if(!game.user.isGM||game.users.activeGM&&game.users.activeGM.id!==game.user.id)return;
 try{await buildKuchiyoseCompendium();}catch(error){console.error('Kuchiyose compendium',error);ui.notifications.warn('Could not build Kuchiyose compendium; retry in System Settings.');}
});
