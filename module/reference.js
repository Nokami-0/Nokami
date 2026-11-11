const {CompendiumCollection}=foundry.documents.collections;
const {Actor,Item,Folder}=foundry.documents;
import {esc} from './rolls.js';
const ID='sonic-tag-team-heroes';let rules;
const {ApplicationV2,HandlebarsApplicationMixin}=foundry.applications.api;
export class RulesReference extends HandlebarsApplicationMixin(ApplicationV2){
 static DEFAULT_OPTIONS={id:'stth-rules',classes:['stth','stth-reference'],position:{width:940,height:780},window:{title:'STTH — Quick Reference',resizable:true}};
 static PARTS={body:{template:'systems/sonic-tag-team-heroes/templates/reference.hbs'}};
 async _prepareContext(options){const c=await super._prepareContext(options);rules??=await(await fetch(`systems/${ID}/data/rules.json`)).json();return {...c,query:this._query||''};}
 _onRender(context,options){super._onRender(context,options);const input=this.element.querySelector('.stth-search');input.addEventListener('input',event=>{this._query=event.target.value;this.renderResults();});this.renderResults();}
 renderResults(){const matches=rules.filter(p=>!this._query||p.text.toLowerCase().includes(this._query.toLowerCase()));this.element.querySelector('.count').textContent=`${matches.length} sections. Showing first 20; refine your search.`;this.element.querySelector('.results').innerHTML=matches.slice(0,20).map(p=>`<article><h3>Section ${p.page}</h3><pre>${esc(p.text)}</pre></article>`).join('');}
}
let referenceApp;
export function openRules(){referenceApp??=new RulesReference();return referenceApp.render({force:true});}
export class LibraryManager extends HandlebarsApplicationMixin(ApplicationV2){
 static DEFAULT_OPTIONS={id:'stth-library-manager',classes:['stth'],position:{width:520,height:300},window:{title:'STTH Library'},actions:{build:LibraryManager.build}};
 static PARTS={body:{template:'systems/sonic-tag-team-heroes/templates/library.hbs'}};
 static async build(event,target){target.disabled=true;try{await buildLibrary();ui.notifications.info('STTH library is ready.');}catch(error){console.error(error);ui.notifications.error(error.message);}finally{target.disabled=false;}}
}
export async function buildLibrary(){if(!game.user.isGM)return;
 const catalog=await (await fetch(`systems/${ID}/data/catalog.json`)).json();let pack=game.packs.get('world.stth-library');if(!pack)pack=await CompendiumCollection.createCompendium({name:'stth-library',label:'STTH — Abilities & Equipment',type:'Item',package:'world',ownership:{PLAYER:'OBSERVER'}});
 const locked=pack.locked;if(locked)await pack.configure({locked:false});
 try{const docs=await pack.getDocuments();const folders=new Map();let count=0;
 for(const raw of catalog){const key=`core:${raw.type}:${raw.name}`;if(docs.some(d=>d.getFlag(ID,'catalogKey')===key))continue;let folder=folders.get(raw.type)||pack.folders.find(f=>f.name===raw.type)?.id;if(!folder){const f=await Folder.create({name:raw.type,type:'Item',sorting:'a'},{pack:pack.collection});folder=f.id;}folders.set(raw.type,folder);await Item.create({...raw,folder,flags:{[ID]:{catalogKey:key}}},{pack:pack.collection});count++;}
 ui.notifications.info(`STTH library ready: ${count} new items.`);
 }finally{if(locked)await pack.configure({locked:true});}
 let ap=game.packs.get('world.stth-vehicles');if(!ap)ap=await CompendiumCollection.createCompendium({name:'stth-vehicles',label:'STTH — Vehicles',type:'Actor',package:'world',ownership:{PLAYER:'OBSERVER'}});
 const wasLocked=ap.locked;if(wasLocked)await ap.configure({locked:false});try{const docs=await ap.getDocuments();const rows=await(await fetch(`systems/${ID}/data/actors.json`)).json();for(const row of rows)if(!docs.some(d=>d.getFlag(ID,'catalogKey')===row.name))await Actor.create({...row,img:`systems/${ID}/assets/vehicle.svg`,flags:{[ID]:{catalogKey:row.name}}},{pack:ap.collection});}finally{if(wasLocked)await ap.configure({locked:true});}
 let np=game.packs.get('world.stth-npcs');if(!np)np=await CompendiumCollection.createCompendium({name:'stth-npcs',label:'STTH — Henchmen',type:'Actor',package:'world',ownership:{PLAYER:'OBSERVER'}});
 const nl=np.locked;if(nl)await np.configure({locked:false});try{const docs=await np.getDocuments();const rows=await(await fetch(`systems/${ID}/data/npcs.json`)).json();for(const row of rows)if(!docs.some(d=>d.getFlag(ID,'catalogKey')===row.name))await Actor.create({...row,flags:{[ID]:{catalogKey:row.name}}},{pack:np.collection});}finally{if(nl)await np.configure({locked:true});}

 await buildEggmanLibrary();await buildGunLibrary();await buildUploadedLibrary();await buildMechLibrary();await buildWeaponLibrary();

}


export async function buildEggmanLibrary(){return buildFactionLibrary('eggman-empire','Eggman Empire','eggmanKey');}
export async function buildGunLibrary(){return buildFactionLibrary('gun','G.U.N.','gunKey');}
export async function buildMechLibrary(){return buildFactionLibrary('eggman-mechs','Eggman Mechs — Vehicles','mechKey');}
export async function buildUploadedLibrary(){return buildFactionLibrary('token-art','Uploaded Enemies & Vehicles','tokenArtKey','uploaded-enemies');}
async function buildFactionLibrary(file,label,key,packName=file){
 if(!game.user.isGM)return;
 const rows=await(await fetch(`systems/${ID}/data/${file}.json`)).json();
 let pack=game.packs.get(`world.stth-${packName}`);
 if(!pack)pack=await CompendiumCollection.createCompendium({name:`stth-${packName}`,label:`STTH — ${label}`,type:'Actor',package:'world',ownership:{PLAYER:'OBSERVER'}});
 const locked=pack.locked;if(locked)await pack.configure({locked:false});
 try{
  const docs=await pack.getDocuments();const folders=new Map();
  for(const row of rows){
   const existing=docs.find(d=>d.getFlag(ID,key)===(row.flags?.[ID]?.[key]??row.name));
   if(existing){
    // Add newly supplied signature weapons without replacing customized compendium data.
    for(const item of row.items||[]){
     const addition=item.flags?.[ID]?.rosterAddition;
     if(addition&&!existing.items.some(i=>i.flags?.[ID]?.rosterAddition===addition||i.name===item.name))await existing.createEmbeddedDocuments('Item',[item]);
    }

    if(row.flags?.[ID]?.communityRosterVersion && (existing.img!==row.img || existing.prototypeToken?.texture?.src!==row.prototypeToken?.texture?.src || existing.getFlag(ID,'communityRosterVersion')!==row.flags[ID].communityRosterVersion))await existing.update({img:row.img,'prototypeToken.texture.src':row.prototypeToken?.texture?.src||row.img,[`flags.${ID}.communityRosterVersion`]:row.flags[ID].communityRosterVersion});
    continue;
   }
   const tier=row.type==='vehicle'?'Vehicles':row.system.npcTier;let folder=folders.get(tier)||pack.folders.find(f=>f.name===tier)?.id;
   if(!folder){const f=await Folder.create({name:tier,type:'Actor',sorting:'a'},{pack:pack.collection});folder=f.id;}
   folders.set(tier,folder);await Actor.create({...row,folder},{pack:pack.collection});
  }
 }finally{if(locked)await pack.configure({locked:true});}
}


export async function buildWeaponLibrary(){
 if(!game.user.isGM)return;
 const rows=await(await fetch(`systems/${ID}/data/weapons.json`)).json();
 let pack=game.packs.get('world.stth-weapons');
 if(!pack)pack=await CompendiumCollection.createCompendium({name:'stth-weapons',label:'STTH — Weapons & Prices',type:'Item',package:'world',ownership:{PLAYER:'OBSERVER'}});
 const locked=pack.locked;if(locked)await pack.configure({locked:false});
 try{const docs=await pack.getDocuments();const keys=new Set(docs.map(d=>d.getFlag(ID,'weaponKey')));const folders=new Map();
 for(const row of rows){const flags=row.flags[ID];if(keys.has(flags.weaponKey))continue;
 let folder=folders.get(flags.weaponCategory)||pack.folders.find(f=>f.name===flags.weaponCategory)?.id;
 if(!folder){folder=(await Folder.create({name:flags.weaponCategory,type:'Item',sorting:'a'},{pack:pack.collection})).id;folders.set(flags.weaponCategory,folder);}
 await Item.create({...row,folder},{pack:pack.collection});keys.add(flags.weaponKey);
 }}finally{if(locked)await pack.configure({locked:true});}
}
