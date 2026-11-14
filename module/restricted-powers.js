import {loadMagenCatalog} from './magen.js';
import {loadSenjutsuCatalog} from './senjutsu.js';
import {loadTensaiCatalog} from './tensai.js';
const SYS='shinobi-no-sho-revamp';
export const RESTRICTED_PACK='world.sns-restricted-powers';
export function restrictedEntries(catalogs){
 const result=[];
 for(const [owner,rows] of Object.entries(catalogs)){
  const routes=owner==='Tensai'?['Versatility','Hibon Ninpou']:[owner];
  for(const route of routes){
   const rule=rows.find(r=>route==='Versatility'?r.id==='versatility':route==='Hibon Ninpou'?r.kind==='Power Route':r.level===0);
   result.push({key:`${owner}:power:${route}`,path:[owner,'Powers'],doc:{name:route,type:'poder',img:'icons/svg/book.svg',system:{nivelUsado:1,nivelPoder:1,descricao:[rule?.description||'',`Restricted to ${owner}. Check all purchase prerequisites; set your purchased level after importing.`].join('\n'),preRequisito:rule?.prerequisites||'See description',tipo:'Restricted Power'},flags:{[SYS]:{hierarchy:{family:'Hijutsu',owner,kind:'Powers'}}}}});
  }
  for(const r of rows){
   const aptitude=/Aptitude/.test(r.kind),reference=r.kind==='Clan Reference'||r.kind==='Rules'||r.kind==='Milestone'||r.kind==='Level Choice';
   const section=aptitude?(/Special/.test(r.kind)?'Special Aptitudes':'Restricted Aptitudes'):r.kind==='Clan Reference'?'Clan References':reference?'Rules & Progression':'Effects & Techniques';
   const details=[r.description,`Restricted to: ${owner}`,r.prerequisites?`Prerequisites: ${r.prerequisites}`:'',r.clan?`Clan source: ${r.clan} — original clan restrictions still apply.`:'',`Required level: ${r.level}`,r.chakraCost!==undefined?`Chakra cost: ${r.chakraCost}`:'',r.cost?`Cost: ${r.cost}`:'',r.action?`Action: ${r.action}`:'',`${r.sourceBook||'Basic Book'}, pp. ${r.sourcePages.join(', ')}`,reference?'Rules reference; does not grant a power or aptitude.':'Import only abilities you have purchased and meet the prerequisites for. Track costs and effects under the printed rules.'].filter(Boolean).join('\n\n');
   result.push({key:`${owner}:${r.id}`,path:[owner,section,...(r.level>0?[`Level ${r.level}`]:[])],doc:{name:`${r.name}${r.level>0?` — ${owner} ${r.level}`:''}`,type:aptitude?'aptidao':'elemento',img:aptitude?'icons/svg/upgrade.svg':'icons/svg/book.svg',system:{descricao:details,preRequisito:r.prerequisites||`${owner} ${r.level}; see description`,tipo:r.kind,nivel:0,nivelPoder:r.level,custo: r.cost??(r.chakraCost!==undefined?`${r.chakraCost} Chakra`:'See description')},flags:{[SYS]:{restrictedReference:reference,requiredLevel:r.level,clan:r.clan||'',hierarchy:{family:r.clan?'Clan':'Hijutsu',owner:r.clan||owner,kind:aptitude?'Aptitudes':'Techniques',level:r.level},restrictedTo:owner}}}});
  }
 }
 return result;
}
let pending;
export function buildRestrictedPowers(){
 if(pending)return pending;
 pending=(async()=>{
  if(!game.user.isGM)throw Error('GM permissions required');
  // Load and validate everything before making changes to the world.
  const [Magen,Senjutsu,Tensai]=await Promise.all([loadMagenCatalog(),loadSenjutsuCatalog(),loadTensaiCatalog()]);
  const entries=restrictedEntries({Magen,Senjutsu,Tensai});
  const pack=game.packs.get(RESTRICTED_PACK)||await CompendiumCollection.createCompendium({name:'sns-restricted-powers',label:'Restricted Powers',type:'Item',package:'world',ownership:{PLAYER:'OBSERVER',ASSISTANT:'OWNER'}});
  const locked=pack.locked; if(locked)await pack.configure({locked:false});
  try{
   const existing=new Set((await pack.getDocuments()).map(d=>d.flags?.[SYS]?.restrictedUid));
   for(const entry of entries){
    if(existing.has(entry.key))continue;
    let parent=null;
    for(const name of entry.path){
     let folder=pack.folders.find(f=>f.name===name&&(f.folder?.id||f.folder||null)===parent);
     if(!folder)folder=await Folder.create({name,type:'Item',folder:parent,sorting:'a'},{pack:pack.collection});parent=folder.id;
    }
    entry.doc.folder=parent;entry.doc.flags[SYS].restrictedUid=entry.key;
    await Item.create(entry.doc,{pack:pack.collection});existing.add(entry.key);
   }
   return {total:entries.length};
  }finally{if(locked)await pack.configure({locked:true});}
 })().finally(()=>{pending=null;});return pending;
}
Hooks.once('init',()=>{
 const Base=globalThis.foundry?.appv1?.api?.FormApplication??globalThis.FormApplication;
 game.settings.registerMenu(SYS,'restrictedPowersBuilder',{name:'Build / Repair Restricted Powers Compendium',label:'Build Restricted Powers',icon:'fas fa-book',restricted:true,type:class extends Base{
  async _renderInner(){return $('<div><p>Magen, Senjutsu and Tensai, with effects, levels and aptitude sections. Existing entries are preserved.</p><button type="button" class="build-restricted">Build / Repair</button></div>');}
  activateListeners(html){super.activateListeners(html);html.find('.build-restricted').on('click',async()=>{try{await buildRestrictedPowers();game.packs.get(RESTRICTED_PACK)?.render(true);this.close();}catch(e){ui.notifications.error(e.message);}});}
 }});
});
Hooks.once('ready',async()=>{
 if(!game.user.isGM||(game.users.activeGM&&game.users.activeGM.id!==game.user.id))return;
 try{await buildRestrictedPowers();}catch(e){console.error('Restricted Powers compendium',e);ui.notifications.error('Could not build Restricted Powers. Retry Build / Repair Restricted Powers Compendium in System Settings.');}
});
