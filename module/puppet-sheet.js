import {puppetStatistics,puppetCurrentAbsorption,promptCustomPuppet,puppetSlotSummary,puppetDeviceDamage,spendPuppetDeviceUse,registerPuppetMenu,buildPuppetCompendium} from './puppets.js';
import {rollShinobiTest} from './dice.js';
const SYS='shinobi-no-sho-revamp';const Base=foundry.appv1?.sheets?.ActorSheet??globalThis.ActorSheet;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class PuppetActorSheet extends Base{
 static get defaultOptions(){return foundry.utils.mergeObject(super.defaultOptions,{width:1050,height:820,resizable:true,classes:['shinobi','sheet','actor','puppet'],tabs:[{navSelector:".sheet-tabs[data-group='primary']",contentSelector:'.sheet-body',initial:'overview'}]});}
 get template(){return `systems/${SYS}/templates/puppet-sheet.hbs`;}
 async getData(options){
  const context=await super.getData(options),profile=this.actor.flags?.[SYS]?.puppetProfile||{},controller=game.actors.get(profile.controllerId),stats=puppetStatistics(controller,profile.size),remaining=puppetCurrentAbsorption(profile,controller).remaining;
  return {...context,puppet:profile,controllerName:controller?.name||'Not assigned',hasController:!!controller,stats,remaining,disabled:!!controller&&remaining<=0,aptitudesText:(profile.exampleAptitudes||[]).join(', '),puppetImage:this.actor.img,sizeSmall:profile.size==="small",sizeMedium:profile.size==="medium",sizeLarge:profile.size==="large",construction:puppetSlotSummary(profile,[...this.actor.items]),controllers:[...game.actors].filter(a=>a.isOwner&&!a.flags?.[SYS]?.puppetProfile&&!a.flags?.[SYS]?.summonProfile).map(a=>({id:a.id,name:a.name,selected:a.id===profile.controllerId})),devices:[...this.actor.items].filter(i=>i.flags?.[SYS]?.puppetDevice).map(i=>{const d=i.flags[SYS].puppetDevice;return {id:i.id,name:i.name,...d,description:i.system.descricao,baseDamage:puppetDeviceDamage(stats.mechanics,d.weaponDamage),canAttack:d.weaponDamage>0,limited:d.maxUses!==null,remainingUses:d.remainingUses??d.maxUses,locked:stats.mechanics<(d.minimumMechanics||0)};})};
 }
 async _updateObject(event,data){
  const key=`flags.${SYS}.puppetProfile.`,old=this.actor.flags?.[SYS]?.puppetProfile||{},id=data[key+'controllerId']??old.controllerId,controller=game.actors.get(id);
  if(id&&(!controller||!controller.isOwner))throw Error('Choose a controller you own.');
  const nextSize=data[key+'size']??old.size;const max=puppetStatistics(controller,nextSize).absorptionMax;
  if((!old.controllerId&&id)||(nextSize!==old.size&&id))data[key+'absorptionRemaining']=max;
  else if(data[key+'absorptionRemaining']!==undefined){const n=Number(data[key+'absorptionRemaining']);if(!Number.isFinite(n))throw Error('Absorption must be a number.');data[key+'absorptionRemaining']=Math.max(0,Math.min(max,n));}
  data[key+'absorptionMaxSnapshot']=max;return super._updateObject(event,data);
 }
 activateListeners(html){
  super.activateListeners(html);if(!this.actor.isOwner)return;
  const controller=()=>game.actors.get(this.actor.flags?.[SYS]?.puppetProfile?.controllerId);
  const ready=()=>{const c=controller();if(!c)throw Error('Assign a puppeteer first.');if(puppetCurrentAbsorption(this.actor.flags[SYS].puppetProfile,c).remaining<=0)throw Error('The puppet is unusable at 0 Absorption; repair it first.');return c;};
  html.find('.puppet-roll').on('click',async event=>{event.preventDefault();try{const c=ready(),s=puppetStatistics(c),type=event.currentTarget.dataset.roll;const precision=type==='dodge'?s.dodge:type==='anticipate'?s.anticipate:s.attack;const roll=await rollShinobiTest(precision);await roll.toMessage({speaker:ChatMessage.getSpeaker({actor:this.actor}),flavor:`${esc(this.actor.name)} — ${esc(type)} (controller ${esc(c.name)}). Apply aptitude, device and condition modifiers manually.`});}catch(e){ui.notifications.error(e.message);}});
  // Device attacks use the controller's Ranged Combat and report damage without applying it.
  html.find('.puppet-device-attack').on('click',async event=>{event.preventDefault();const b=event.currentTarget;b.disabled=true;try{
   const c=ready(),item=this.actor.items.get(b.dataset.itemId),d=item?.flags?.[SYS]?.puppetDevice;
   if(!d||!(d.weaponDamage>0))throw Error('Select an attacking puppet device.');
   const stats=puppetStatistics(c);
   if(stats.mechanics<(d.minimumMechanics||0))throw Error('The controller does not meet this device’s Mechanics prerequisite.');
   if(d.maxUses!==null&&Number(d.remainingUses??d.maxUses)<=0)throw Error('This device has no uses remaining.');
   const roll=await rollShinobiTest(stats.attack);
   const damage=puppetDeviceDamage(stats.mechanics,d.weaponDamage);
   await roll.toMessage({speaker:ChatMessage.getSpeaker({actor:this.actor}),flavor:`${esc(this.actor.name)} — ${esc(item.name)} attack (controller: ${esc(c.name)}). Base damage: ${damage} = ceil(Mechanics / 2 + Weapon Damage). Apply defenses, device effects and modifiers normally. Charges are spent separately.`});
  }catch(e){ui.notifications.error(e.message);}finally{b.disabled=false;}});
  html.find('.puppet-size-select').on('change',async event=>{event.preventDefault();const size=event.currentTarget.value;try{const profile=this.actor.flags?.[SYS]?.puppetProfile||{};if(!profile.custom)throw Error('Only custom puppets can change size here.');const sizes={small:{Light:1,Standard:1,Heavy:1},medium:{Light:1,Standard:2,Heavy:1},large:{Light:1,Standard:3,Heavy:1}};const c=controller();const stats=puppetStatistics(c,size);await this.actor.update({[`flags.${SYS}.puppetProfile.size`]:size,[`flags.${SYS}.puppetProfile.slots`]:sizes[size],[`flags.${SYS}.puppetProfile.materialsCost`]:{small:300,medium:600,large:900}[size],[`flags.${SYS}.puppetProfile.absorptionRemaining`]:c?stats.absorptionMax:0,[`flags.${SYS}.puppetProfile.absorptionMaxSnapshot`]:stats.absorptionMax,'prototypeToken.width':size==='large'?2:1,'prototypeToken.height':size==='large'?2:1});}catch(e){ui.notifications.error(e.message);}});
  html.find('.puppet-create-custom').on('click',async event=>{event.preventDefault();try{await promptCustomPuppet(controller());}catch(e){ui.notifications.error(e.message);}});
  html.find('.puppet-open-device').on('click',event=>{event.preventDefault();this.actor.items.get(event.currentTarget.dataset.itemId)?.sheet?.render(true);});
  html.find('.puppet-use-charge').on('click',async event=>{event.preventDefault();const b=event.currentTarget;b.disabled=true;try{const c=ready(),d=this.actor.items.get(b.dataset.itemId)?.flags?.[SYS]?.puppetDevice;if(puppetStatistics(c).mechanics<(d?.minimumMechanics||0))throw Error('The controller does not meet this device’s Mechanics prerequisite.');await spendPuppetDeviceUse(this.actor,b.dataset.itemId);}catch(e){ui.notifications.error(e.message);}finally{b.disabled=false;}});
  html.find('.puppet-repair').on('click',async event=>{event.preventDefault();try{const c=controller();if(!c)throw Error('Assign a controller first.');const yes=await Dialog.confirm({title:'Repair Puppet',content:'<p>Repair requires a Tool Kit and 4 hours. Restore all Absorption after those requirements are completed?</p>'});if(yes){const max=puppetStatistics(c,this.actor.flags[SYS].puppetProfile.size).absorptionMax;await this.actor.update({[`flags.${SYS}.puppetProfile.absorptionRemaining`]:max,[`flags.${SYS}.puppetProfile.absorptionMaxSnapshot`]:max});}}catch(e){ui.notifications.error(e.message);}});
  html.find('.puppet-refill').on('click',async event=>{event.preventDefault();const yes=await Dialog.confirm({title:'Refill Puppet Devices',content:'<p>Limited device uses are replenished in a village. Have you completed that resupply?</p>'});if(!yes)return;const updates=[...this.actor.items].filter(i=>i.flags?.[SYS]?.puppetDevice?.maxUses!=null).map(i=>({_id:i.id,[`flags.${SYS}.puppetDevice.remainingUses`]:i.flags[SYS].puppetDevice.maxUses}));if(updates.length)await this.actor.updateEmbeddedDocuments('Item',updates);});
 }
}
Hooks.once('init',()=>{const actors=foundry.documents?.collections?.Actors??globalThis.Actors;actors.registerSheet(SYS,PuppetActorSheet,{types:['personagem'],makeDefault:false,label:'Kugutsu Puppet'});registerPuppetMenu();});
Hooks.once('ready',async()=>{if(!game.user.isGM||game.users.activeGM&&game.users.activeGM.id!==game.user.id)return;try{await buildPuppetCompendium();}catch(e){console.error('Initial Puppet compendium',e);ui.notifications.warn('Puppet templates could not build; retry in System Settings.');}});

Hooks.on('updateActor',async(actor,change)=>{
 if(!change.system||actor.flags?.[SYS]?.puppetProfile)return;
 if(!game.user.isGM&&game.users.activeGM)return;
 const linked=[...game.actors].filter(p=>p.flags?.[SYS]?.puppetProfile?.controllerId===actor.id&&p.isOwner);
 for(const puppet of linked){const profile=puppet.flags[SYS].puppetProfile;const state=puppetCurrentAbsorption(profile,actor);if(state.max===state.previousMax)continue;try{await puppet.update({[`flags.${SYS}.puppetProfile.absorptionRemaining`]:state.remaining,[`flags.${SYS}.puppetProfile.absorptionMaxSnapshot`]:state.max});}catch(e){console.error('Puppet Mechanics scaling',e);}}
});
