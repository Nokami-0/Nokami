const SYS='shinobi-no-sho-revamp';export const PUPPET_PACK='world.sns-puppets';let catalogPromise,building;
export function validatePuppetCatalog(rows){
 if(!Array.isArray(rows)||rows.length!==3)throw Error('Expected the three Initial Puppet examples.');const ids=new Set();
 for(const r of rows){if(!r.id||ids.has(r.id)||r.size!=='medium'||!r.aptitudes?.length||r.devices?.length!==4)throw Error('Invalid Initial Puppet: '+r.name);ids.add(r.id);for(const [slot,n]of Object.entries(r.slots))if(r.devices.filter(d=>d.slot===slot).length!==n)throw Error('Invalid device slots: '+r.name);for(const d of r.devices)if(!d.id||!d.rules||!Number.isInteger(d.weaponDamage)||d.weaponDamage<0)throw Error('Invalid puppet device.');}return rows;
}
export function loadPuppetCatalog(){if(!catalogPromise)catalogPromise=(async()=>{const r=await fetch(`systems/${SYS}/integrated/data/sns-initial-puppets__actors.json`);if(!r.ok)throw Error('Cannot load Initial Puppets (HTTP '+r.status+').');return validatePuppetCatalog(await r.json());})().catch(e=>{catalogPromise=null;throw e;});return catalogPromise;}
export function puppetStatistics(controller,size='medium'){
 const n=v=>Number(v)||0,s=controller?.system||{},mechanics=n(s.pericias?.mecanismo?.total),spirit=n(s.atributos?.esp?.valor);
 return {mechanics,spirit,hardness:1,absorptionMax:Math.max(0,5*mechanics+(size==='small'?-5:size==='large'?5:0)),attack:n(s.combate?.distancia?.total),dodge:n(s.combate?.esquiva?.total),anticipate:n(s.combate?.lerMovimentos?.total),controlRange:10+2*spirit,attackRange:5+spirit};
}
export const puppetConstruction={small:{cost:300,carry:'1 compartment',light:1,standard:1,heavy:1,absorptionAdjustment:-5},medium:{cost:600,carry:'3 compartments',light:1,standard:2,heavy:1,absorptionAdjustment:0},large:{cost:900,carry:'Scroll only',light:1,standard:3,heavy:1,absorptionAdjustment:5}};
export function puppetCurrentAbsorption(profile,controller){const max=puppetStatistics(controller,profile.size).absorptionMax;const previousMax=Number.isFinite(Number(profile.absorptionMaxSnapshot))?Number(profile.absorptionMaxSnapshot):max;const remaining=Number(profile.absorptionRemaining)||0;return {max,remaining:Math.max(0,Math.min(max,remaining+max-previousMax)),previousMax};}
export const puppetSlotCosts={Light:10,Standard:20,Heavy:30};
export function puppetSlotSummary(profile,devices=[]){const size=puppetConstruction[profile.size]||puppetConstruction.medium;const capacity={Light:size.light,Standard:size.standard,Heavy:size.heavy,...profile.slots};const used={Light:0,Standard:0,Heavy:0};for(const d of devices){const slot=d.flags?.[SYS]?.puppetDevice?.slot;if(slot in used)used[slot]++;}const heavyNames=devices.filter(d=>d.flags?.[SYS]?.puppetDevice?.slot==='Heavy').map(d=>d.name);return {capacity,used,valid:Object.keys(used).every(k=>used[k]<=Number(capacity[k]||0))&&new Set(heavyNames).size===heavyNames.length,carry:size.carry,skeletonCost:size.cost,slotCosts:puppetSlotCosts};}
export const puppetDeviceDamage=(mechanics,weaponDamage)=>Math.ceil(Number(mechanics)/2+Number(weaponDamage));
export function buildInitialPuppet(row,controller=null){
 const stats=puppetStatistics(controller,row.size),cost=row.skeletonCost+row.devices.reduce((n,d)=>n+({Light:10,Standard:20,Heavy:30}[d.slot]||0),0);
 const profile={typeId:row.id,controllerId:controller?.id||'',size:row.size,slots:row.slots,absorptionRemaining:controller?stats.absorptionMax:0,absorptionMaxSnapshot:stats.absorptionMax,exampleAptitudes:row.aptitudes,materialsCost:cost,sourceBook:row.sourceBook,sourcePages:row.sourcePages};
 const img='icons/svg/mystery-man.svg';
 return {name:row.name,type:'personagem',img,system:{energias:{tamanho:'Medium'}},prototypeToken:{name:row.name,actorLink:false,width:1,height:1,texture:{src:img},displayBars:0,disposition:1},flags:{core:{sheetClass:`${SYS}.PuppetActorSheet`},[SYS]:{puppetTemplateKey:row.id,puppetRevision:1,puppetProfile:profile}},items:row.devices.map(d=>({name:d.name,type:'equipamento',img:'icons/svg/item-bag.svg',system:{quantidade:1,weaponCategory:'none',weaponDamage:d.weaponDamage,caracteristicas:`${d.slot} device slot; Weapon Damage +${d.weaponDamage}; ${d.maxUses??'unlimited'} uses.`,descricao:d.rules},flags:{[SYS]:{puppetDevice:{...d,remainingUses:d.maxUses}}}})).concat(row.aptitudes.map(name=>({name,type:'aptidao',img:'icons/svg/upgrade.svg',system:{tipo:'Kugutsu example aptitude reference',descricao:'Listed in the Initial Puppet example. Allocate the puppeteer’s normal power-point purchase and meet prerequisites. This reference does not automatically grant or apply its bonus.'},flags:{[SYS]:{puppetAptitudeReference:true}}}))) };
}
export async function buildPuppetCompendium(){
 if(!game.user.isGM)throw Error('Only the GM can build the puppet compendium.');if(building)return building;
 building=(async()=>{const rows=await loadPuppetCatalog();let pack=game.packs.get(PUPPET_PACK);if(!pack)pack=await CompendiumCollection.createCompendium({name:'sns-puppets',label:'Puppets — Initial Puppet Types',type:'Actor',package:'world',ownership:{PLAYER:'OBSERVER',ASSISTANT:'OWNER'}});const locked=pack.locked;if(locked)await pack.configure({locked:false});let added=0;
 try{const docs=await pack.getDocuments();for(const row of rows)if(!docs.some(d=>d.flags?.[SYS]?.puppetTemplateKey===row.id)){await Actor.create(buildInitialPuppet(row),{pack:pack.collection});added++;}}finally{if(locked)await pack.configure({locked:true});}return {added,total:rows.length,pack:pack.collection};})().finally(()=>{building=null;});return building;
}
export async function createInitialPuppet(controller,id){
 if(!controller?.isOwner)throw Error('You must own the puppeteer actor.');const row=(await loadPuppetCatalog()).find(r=>r.id===id);if(!row)throw Error('Unknown Initial Puppet type.');
 let folder=game.folders.find(f=>f.type==='Actor'&&f.name==='Puppets');if(!folder&&game.user.isGM)folder=await Folder.create({name:'Puppets',type:'Actor'});
 const data=buildInitialPuppet(row,controller);data.name=`${row.name} — ${controller.name}`;data.folder=folder?.id||null;data.ownership={...controller.ownership};
 // Creation prepares an owned puppet, not an animal summoning or an automatic purchase.
 return Actor.create(data);
}
export async function puppetTabContext(controller){try{const rows=await loadPuppetCatalog();const puppetOwned=controller?[...(game.actors||[])].filter(a=>a.isOwner&&a.flags?.[SYS]?.puppetProfile?.controllerId===controller.id).map(a=>({id:a.id,name:a.name})):[];return {puppetOwned,puppetTypes:rows.map(r=>({...r,aptitudeText:r.aptitudes.join(', '),deviceText:r.devices.map(d=>`${d.slot}: ${d.name}`).join(' · ')})),puppetError:''};}catch(e){console.error('Initial Puppets',e);return {puppetTypes:[],puppetError:e.message};}}

export async function createCustomPuppet(controller=null,{name='Custom Puppet',size='medium'}={}){
 if(controller&&!controller.isOwner)throw Error('You must own the controller.');
 if(!puppetConstruction[size])throw Error('Choose Small, Medium, or Large.');
 const shape=puppetConstruction[size],stats=puppetStatistics(controller,size);
 const profile={typeId:'custom',custom:true,controllerId:controller?.id||'',size,slots:{Light:shape.light,Standard:shape.standard,Heavy:shape.heavy},absorptionRemaining:controller?stats.absorptionMax:0,absorptionMaxSnapshot:stats.absorptionMax,exampleAptitudes:[],materialsCost:shape.cost,sourceBook:'Book of Hijutsu Vol. 2',sourcePages:[89,90,91]};
 let folder=game.folders.find(f=>f.type==='Actor'&&f.name==='Puppets');if(!folder&&game.user.isGM)folder=await Folder.create({name:'Puppets',type:'Actor'});
 const img='icons/svg/mystery-man.svg';
 return Actor.create({name:name.trim()||'Custom Puppet',type:'personagem',img,folder:folder?.id||null,ownership:controller?{...controller.ownership}:undefined,system:{energias:{tamanho:size[0].toUpperCase()+size.slice(1)}},prototypeToken:{name,actorLink:false,width:size==='large'?2:1,height:size==='large'?2:1,texture:{src:img},displayBars:0,disposition:1},flags:{core:{sheetClass:`${SYS}.PuppetActorSheet`},[SYS]:{puppetTemplateKey:'custom',puppetRevision:1,puppetProfile:profile}},items:[]});
}
export async function promptCustomPuppet(controller=null){
 const options=['small','medium','large'].map(x=>`<option value="${x}">${x[0].toUpperCase()+x.slice(1)}</option>`).join('');
 const result=await Dialog.prompt({title:'Create Custom Puppet',content:`<form><div class="form-group"><label>Puppet name</label><input name="puppetName" value="Custom Puppet" required></div><div class="form-group"><label>Size</label><select name="puppetSize">${options}</select></div></form>`,callback:html=>({name:String(html.find('[name="puppetName"]').val()||'Custom Puppet'),size:String(html.find('[name="puppetSize"]').val()||'medium')})});
 if(!result)return null;
 const actor=await createCustomPuppet(controller,result);actor?.sheet?.render(true);return actor;
}

export async function spendPuppetDeviceUse(actor,itemId){
 if(!actor.isOwner)throw Error('Owner permission is required.');const item=actor.items.get(itemId),device=item?.flags?.[SYS]?.puppetDevice;
 if(!device)throw Error('Select an installed puppet device.');if(device.maxUses===null)return;
 const remaining=Number(device.remainingUses??device.maxUses);if(!Number.isInteger(remaining)||remaining<=0)throw Error('This device has no uses remaining.');
 await item.update({[`flags.${SYS}.puppetDevice.remainingUses`]:remaining-1});return remaining-1;
}
export function activatePuppetTab(html,controller){
 html.find('.sns-puppet-custom').on('click',async event=>{event.preventDefault();try{await promptCustomPuppet(controller);}catch(e){ui.notifications.error(e.message);}});
 html.find('.sns-puppet-create').on('click',async event=>{event.preventDefault();const button=event.currentTarget;button.disabled=true;try{const a=await createInitialPuppet(controller,button.dataset.puppetType);a?.sheet.render(true);controller.sheet?.render(false);}catch(e){ui.notifications.error(e.message);}finally{button.disabled=false;}});
 html.find('.sns-puppet-open').on('click',event=>{event.preventDefault();game.actors.get(event.currentTarget.dataset.puppetActor)?.sheet.render(true);});
 html.find('.sns-puppet-owned').on('dragstart',event=>{const actor=game.actors.get(event.currentTarget.dataset.puppetActor);if(!actor?.isOwner)return;event.stopPropagation();(event.originalEvent||event).dataTransfer.setData('text/plain',JSON.stringify({type:'Actor',uuid:actor.uuid}));});
 html.find('.sns-puppets-pack').on('click',event=>{event.preventDefault();const p=game.packs.get(PUPPET_PACK);if(p)p.render(true);else ui.notifications.warn('The GM can build Puppets — Initial Types in System Settings.');});
}
const menuBase=globalThis.foundry?.appv1?.api?.FormApplication??globalThis.FormApplication;
// Registered lazily so the pure catalog helpers can also be tested without Foundry.
export function registerPuppetMenu(){
 class PuppetMenu extends menuBase{static get defaultOptions(){return foundry.utils.mergeObject(super.defaultOptions,{title:'Initial Puppet Types',width:520,height:'auto'});}async _renderInner(){return $('<section><p>Offensive, Balanced and Support puppet actor templates. Create a controller-owned copy from the Puppets tab.</p><button type="button" class="sns-build-puppets">Build / Repair Puppet Compendium</button><button type="button" class="sns-create-custom-puppet">Create Custom Puppet</button></section>');}activateListeners(html){super.activateListeners(html);html.find('.sns-create-custom-puppet').on('click',async()=>{try{await promptCustomPuppet();}catch(e){ui.notifications.error(e.message);}});html.find('.sns-build-puppets').on('click',async()=>{try{const r=await buildPuppetCompendium();ui.notifications.info(`Puppets: ${r.added} new; ${r.total} initial types.`);}catch(e){ui.notifications.error(e.message);}});}}
 game.settings.registerMenu(SYS,'initialPuppets',{name:'Puppets — Initial Types',label:'Build / Repair Puppet Compendium',type:PuppetMenu,icon:'fas fa-user-cog',restricted:true});
}
