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

 await buildEggmanLibrary();

}


export async function buildEggmanLibrary(){
 if(!game.user.isGM)return;
 const rows=await(await fetch(`systems/${ID}/data/eggman-empire.json`)).json();
 let pack=game.packs.get('world.stth-eggman-empire');
 if(!pack)pack=await CompendiumCollection.createCompendium({name:'stth-eggman-empire',label:'STTH — Eggman Empire',type:'Actor',package:'world',ownership:{PLAYER:'OBSERVER'}});
 const locked=pack.locked;if(locked)await pack.configure({locked:false});
 try{
  const docs=await pack.getDocuments();const folders=new Map();
  for(const row of rows){
   if(docs.some(d=>d.getFlag(ID,'eggmanKey')===row.name))continue;
   const tier=row.system.npcTier;let folder=folders.get(tier)||pack.folders.find(f=>f.name===tier)?.id;
   if(!folder){const f=await Folder.create({name:tier,type:'Actor',sorting:'a'},{pack:pack.collection});folder=f.id;}
   folders.set(tier,folder);await Actor.create({...row,folder},{pack:pack.collection});
  }
 }finally{if(locked)await pack.configure({locked:true});}
}
