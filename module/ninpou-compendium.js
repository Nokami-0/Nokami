const SYS='shinobi-no-sho-revamp';
export const NINPOU_PACK='world.sns-ninpou';
export const NINPOU_REVISION=1;
export const NINPOU_ELEMENTS={'non-elemental':'Non-Elemental Ninpou',doton:'Earth — Doton',fuuton:'Wind — Fuuton',katon:'Fire — Katon',raiton:'Lightning — Raiton',suiton:'Water — Suiton'};
export const SUPPORT_NINJUTSU={fuuinjutsu:'Fuuinjutsu',iryou:'Iryou Ninjutsu'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let building;
export function validateNinpouCatalog(rows){
 if(!Array.isArray(rows)||!rows.length)throw Error('Empty Ninpou catalog.');
 const ids=new Set();
 for(const r of rows){
  if(!r.id||ids.has(r.id))throw Error('Missing or duplicate Ninpou source key.');ids.add(r.id);
  if(r.eligibility!=='common'||!Array.isArray(r.exclusiveTo)||r.exclusiveTo.length||!(r.element in NINPOU_ELEMENTS)||r.category!==(r.element==='non-elemental'?'non-elemental':'elemental'))throw Error('Restricted or incorrectly categorized Ninpou: '+r.name);
  if(!r.sourceBook||!r.sourcePages||!r.description||!Number.isInteger(r.level)||r.level<1)throw Error('Incomplete Ninpou rules: '+r.name);
 }
 return rows;
}
export function validateSupportNinjutsuCatalog(rows){
 if(!Array.isArray(rows)||!rows.length)throw Error('Empty sealing/medical catalog.');
 const ids=new Set();
 for(const r of rows){
  if(!r.id||ids.has(r.id))throw Error('Missing or duplicate sealing/medical key.');ids.add(r.id);
  const sections=r.category==='fuuinjutsu'?['Power Rules','Seals','Advanced Seals']:r.category==='iryou'?['Power Rules','Medical Techniques']:[];
  if(r.eligibility!=='common'||!Array.isArray(r.exclusiveTo)||r.exclusiveTo.length||!sections.includes(r.section))throw Error('Restricted or invalid sealing/medical entry: '+r.name);
  if(!r.sourceBook||!r.sourcePages||!r.description||!r.prerequisites||!r.action||!r.chakraCost||!Number.isInteger(r.level)||r.level<1||r.level>8)throw Error('Incomplete sealing/medical rules: '+r.name);
 }
 return rows;
}
export function ninpouFolderPath(row){
 if(SUPPORT_NINJUTSU[row.category])return [SUPPORT_NINJUTSU[row.category],row.section,...(row.kind==='Power Rules'?[]:[`Level ${row.level}`])];
 return [row.category==='non-elemental'?'Non-Elemental Ninpou':'Elemental Ninpou',...(row.category==='elemental'?[NINPOU_ELEMENTS[row.element]]:[]),row.kind==='Power Rules'?'Power Rules':`Level ${row.level}`];
}
export function ninpouItem(row){
 const uid='common-ninpou:'+row.id,reference=row.kind==='Power Rules',support=SUPPORT_NINJUTSU[row.category];
 return {name:row.name,type:support?'poder':'elemento',img:support||row.element==='non-elemental'?'icons/svg/book.svg':'icons/svg/explosion.svg',system:{tipo:support?'Ninjutsu':'',caracteristicas:support?`Prerequisites: ${row.prerequisites}\nAction: ${row.action}\nChakra: ${row.chakraCost}`:'',nivel:String(row.level),nivelUsado:row.level,efeitos:row.kind,descricao:row.description+'\n\nSource: '+row.sourceBook+', p. '+row.sourcePages+'\n'+(row.optional?'Optional rule: GM permission required.':'Common-power option; learn it and satisfy its prerequisites before use.'),custo:'See rules: '+(row.chakraCost||'Power purchase, not a cast')},flags:{[SYS]:{ninpouCatalogId:uid,compendiumUid:uid,ninpouRevision:NINPOU_REVISION,ninpouReference:true,source:row.sourceBook,sourcePages:row.sourcePages,optional:!!row.optional,hierarchy:{family:support||'Common Ninpou',owner:support?row.section:row.category==='non-elemental'?'Non-Elemental Ninpou':NINPOU_ELEMENTS[row.element],kind:reference?'Power Rules':support?(row.kind==='Rules'?'Rules':'Techniques'):'Effects',level:row.level,ninpouCategory:row.category,element:row.element||'',section:row.section||''}}}};
}
export async function buildNinpouCompendium(){
 if(!game.user.isGM)throw Error('Only a GM can build the Ninpou compendium.');
 if(building)return building;
 building=build().finally(()=>building=null);return building;
}
async function build(){
 const responses=await Promise.all(['sns-common-ninpou__items.json','sns-sealing-medical__items.json'].map(file=>fetch(`systems/${SYS}/integrated/data/${file}`)));
 if(responses.some(r=>!r.ok))throw Error('Cannot load common Ninjutsu rules.');
 const [ninpou,support]=await Promise.all(responses.map(r=>r.json()));
 const rows=[...validateNinpouCatalog(ninpou),...validateSupportNinjutsuCatalog(support)];
 if(new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('Duplicate common-power source keys.');
 let pack=game.packs.get(NINPOU_PACK);
 if(!pack)pack=await CompendiumCollection.createCompendium({name:'sns-ninpou',label:'Ninpou, Fuuinjutsu & Iryou Ninjutsu',type:'Item',package:'world',ownership:{PLAYER:'OBSERVER',ASSISTANT:'OWNER'}});
 const locked=pack.locked;if(locked)await pack.configure({locked:false});
 let added=0,updated=0;
 try{
  const docs=await pack.getDocuments(),folders=new Map();
  async function folder(path){let parent=null;for(const name of path){const key=(parent||'root')+'::'+name;if(folders.has(key)){parent=folders.get(key);continue;}let f=pack.folders.find(f=>f.name===name&&(f.folder?.id||f.folder||null)===parent);if(!f)f=await Folder.create({name,type:'Item',folder:parent,sorting:'a'},{pack:pack.collection});parent=f.id;folders.set(key,parent);}return parent;}
  for(const row of rows){const data=ninpouItem(row);data.folder=await folder(ninpouFolderPath(row));const old=docs.find(d=>d.getFlag(SYS,'ninpouCatalogId')===data.flags[SYS].ninpouCatalogId);
   if(!old){await Item.create(data,{pack:pack.collection});added++;}
   else if(old.getFlag(SYS,'ninpouRevision')!==NINPOU_REVISION){await old.update(data);updated++;}
  }
 }finally{if(locked)await pack.configure({locked:true});}
 // Retire only the former generated placeholder references after the replacement pack succeeds.
 const legacy=game.packs.get('world.sns-techniques');let retired=0;
 if(legacy){const wasLocked=legacy.locked;if(wasLocked)await legacy.configure({locked:false});try{const old=await legacy.getDocuments();const ids=old.filter(d=>String(d.getFlag(SYS,'compendiumUid')||'').startsWith('sns-general-ninpou-effects__items.json:')).map(d=>d.id);if(ids.length){await Item.deleteDocuments(ids,{pack:legacy.collection});retired=ids.length;}}finally{if(wasLocked)await legacy.configure({locked:true});}}
 return {added,updated,retired,total:rows.length,pack:pack.collection};
}
export function filterNinpouEntries(entries,{category='non-elemental',element='',section='',level='',query=''}={}){
 const q=String(query).toLowerCase().trim();
 return entries.filter(r=>{const m=r.flags?.[SYS]?.hierarchy;return ['Common Ninpou',...Object.values(SUPPORT_NINJUTSU)].includes(m?.family)&&m.ninpouCategory===category&&(!section||m.section===section)&&(!element||m.element===element)&&(!level||String(m.level)===String(level))&&(!q||r.name.toLowerCase().includes(q));}).sort((a,b)=>a.name.localeCompare(b.name));
}
export function ninpouBrowserMarkup(){return `<section class="sns-ninpou-browser"><nav class="tabs" aria-label="Common power categories"><button type="button" data-ninpou-tab="non-elemental" aria-pressed="true">Non-Elemental Ninpou</button><button type="button" data-ninpou-tab="elemental" aria-pressed="false">Elemental Ninpou</button><button type="button" data-ninpou-tab="fuuinjutsu" aria-pressed="false">Fuuinjutsu</button><button type="button" data-ninpou-tab="iryou" aria-pressed="false">Iryou Ninjutsu</button></nav><label>Element <select name="element"><option value="">All elements</option>${Object.entries(NINPOU_ELEMENTS).filter(([k])=>k!=='non-elemental').map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>Section <select name="section"><option value="">All sections</option><option>Power Rules</option><option>Seals</option><option>Advanced Seals</option><option>Medical Techniques</option></select></label><label>Level <select name="level"><option value="">All levels</option>${Array.from({length:10},(_,i)=>`<option>${i+1}</option>`).join('')}</select></label><label>Search <input type="search" name="query" placeholder="Find an effect"></label><p>Common Ninpou, sealing and medical options. Fuuinjutsu has Seals and Advanced Seals sections. Check each card’s prerequisites, action and chakra cost; optional rules are marked on their cards. Drag a card to a sheet to import it, then configure the chosen level and cost.</p><div class="sns-ninpou-results" style="max-height:420px;overflow:auto"></div></section>`;}
export async function openNinpouBrowser(){
 const pack=game.packs.get(NINPOU_PACK);if(!pack)return ui.notifications.warn('The GM can build Ninpou — Common & Elemental in System Settings.');
 const entries=Array.from(await pack.getIndex({fields:[`flags.${SYS}.hierarchy`]}));
 let category='non-elemental';
 return new Dialog({title:'Ninpou, Fuuinjutsu & Iryou Ninjutsu',content:ninpouBrowserMarkup(),buttons:{close:{label:'Close'}},render:html=>{
  const root=html instanceof jQuery?html:$(html),get=n=>root.find(`[name="${n}"]`);
  const draw=()=>{get('element').prop('disabled',category!=='elemental');get('section').prop('disabled',!SUPPORT_NINJUTSU[category]);const rows=filterNinpouEntries(entries,{category,element:category==='elemental'?get('element').val():'',section:SUPPORT_NINJUTSU[category]?get('section').val():'',level:get('level').val(),query:get('query').val()});
   root.find('[data-ninpou-tab]').each((_i,e)=>{const selected=e.dataset.ninpouTab===category;e.setAttribute('aria-pressed',String(selected));e.style.fontWeight=selected?'bold':'normal';e.style.borderBottom=selected?'3px solid currentColor':'';});
   root.find('.sns-ninpou-results').html(rows.length?rows.map(r=>`<div draggable="true" data-ninpou-id="${esc(r._id)}" style="padding:6px;border-bottom:1px solid #888;display:flex;gap:8px"><span style="flex:1">${esc(r.name)} <small>Level ${r.flags[SYS].hierarchy.level}</small></span><button type="button" class="sns-ninpou-read" style="width:auto">Read</button></div>`).join(''):'No matching techniques.');
   root.find('.sns-ninpou-read').on('click',async ev=>{const id=ev.currentTarget.closest('[data-ninpou-id]').dataset.ninpouId;const doc=await pack.getDocument(id);doc?.sheet.render(true);});
   root.find('[draggable=true]').on('dragstart',ev=>{const id=ev.currentTarget.dataset.ninpouId;const e=ev.originalEvent||ev;e.dataTransfer.setData('text/plain',JSON.stringify({type:'Item',uuid:`Compendium.${NINPOU_PACK}.Item.${id}`}));});
  };
  root.find('[data-ninpou-tab]').on('click',ev=>{category=ev.currentTarget.dataset.ninpouTab;get('section').val('');get('level').val('');get('query').val('');draw();});get('element').on('change',draw);get('section').on('change',draw);get('level').on('change',draw);get('query').on('input',draw);draw();
 },width:760}).render(true);
}
class NinpouMenu extends FormApplication{
 static get defaultOptions(){return foundry.utils.mergeObject(super.defaultOptions,{id:'sns-ninpou-menu',title:'Ninpou, Fuuinjutsu & Iryou Ninjutsu',width:520,height:'auto'});}
 async _renderInner(){return $('<section><p>Browse Non-Elemental Ninpou, Elemental Ninpou, Fuuinjutsu, and Iryou Ninjutsu. Fuuinjutsu separates Seals and Advanced Seals; elemental options are grouped by element.</p><button type="button" class="sns-ninpou-browse">Browse Ninpou</button>'+(game.user.isGM?'<button type="button" class="sns-ninpou-build">Build / Repair Ninpou Compendium</button>':'')+'</section>');}
 activateListeners(html){super.activateListeners(html);html.find('.sns-ninpou-browse').on('click',()=>openNinpouBrowser());html.find('.sns-ninpou-build').on('click',async()=>{try{const r=await buildNinpouCompendium();ui.notifications.info(`Ninpou: ${r.added} new, ${r.updated} updated, ${r.total} total.`);}catch(e){console.error(e);ui.notifications.error(e.message);}});}
}
Hooks.once('init',()=>{
 game.settings.registerMenu(SYS,'ninpouCompendium',{name:'Ninpou, Fuuinjutsu & Iryou Ninjutsu',label:'Browse Common Powers',hint:'Four tabs: non-elemental, elemental, sealing and medical. Seals and Advanced Seals are separated; restricted-exclusive content stays outside the common lists.',type:NinpouMenu,icon:'fas fa-scroll',restricted:false});
 game.snsNinpou={buildCompendium:buildNinpouCompendium,browse:openNinpouBrowser};
});
Hooks.once('ready',async()=>{if(!game.user.isGM||game.users.activeGM&&game.users.activeGM.id!==game.user.id)return;try{await buildNinpouCompendium();}catch(e){console.error('Common Ninpou compendium',e);ui.notifications.warn('Ninpou compendium could not build; retry in System Settings.');}});
const addBrowserButton=(app,html)=>{const id=app.collection?.collection||app.collection||app.document?.collection;if(id!==NINPOU_PACK)return;const root=html instanceof jQuery?html:$(html);if(root.find('.sns-ninpou-open').length)return;const button=$('<button type="button" class="sns-ninpou-open">Browse Common Power Tabs</button>');button.on('click',()=>openNinpouBrowser());const header=root.find('.directory-header').first();(header.length?header:root).prepend(button);};
Hooks.on('renderCompendium',addBrowserButton);Hooks.on('renderCompendiumCollection',addBrowserButton);

