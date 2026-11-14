import {puppetStatistics,puppetDeviceDamage,spendPuppetDeviceUse,registerPuppetMenu,buildPuppetCompendium} from './puppets.js';
import {rollShinobiTest} from './dice.js';
const SYS='shinobi-no-sho-revamp';const Base=foundry.appv1?.sheets?.ActorSheet??globalThis.ActorSheet;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class PuppetActorSheet extends Base{
 static get defaultOptions(){return foundry.utils.mergeObject(super.defaultOptions,{width:720,height:760,classes:['shinobi','sheet','puppet'],tabs:[{navSelector:'.puppet-tabs',contentSelector:'.puppet-body',initial:'overview'}]});}
 get template(){return `systems/${SYS}/templates/puppet-sheet.hbs`;}
 async getData(options){
  const context=await super.getData(options),profile=this.actor.flags?.[SYS]?.puppetProfile||{},controller=game.actors.get(profile.controllerId),stats=puppetStatistics(controller,profile.size),remaining=Number(profile.absorptionRemaining)||0;
  return {...context,puppet:profile,controllerName:controller?.name||'Not assigned',hasController:!!controller,stats,remaining,disabled:!!controller&&remaining<=0,aptitudesText:(profile.exampleAptitudes||[]).join(', '),controllers:[...game.actors].filter(a=>a.isOwner&&!a.flags?.[SYS]?.puppetProfile&&!a.flags?.[SYS]?.summonProfile).map(a=>({id:a.id,name:a.name,selected:a.id===profile.controllerId})),devices:[...this.actor.items].filter(i=>i.flags?.[SYS]?.puppetDevice).map(i=>{const d=i.flags[SYS].puppetDevice;return {id:i.id,name:i.name,...d,description:i.system.descricao,baseDamage:puppetDeviceDamage(stats.mechanics,d.weaponDamage),canAttack:d.weaponDamage>0,limited:d.maxUses!==null,remainingUses:d.remainingUses??d.maxUses,locked:stats.mechanics<(d.minimumMechanics||0)};})};
 }
 async _updateObject(event,data){
  const key=`flags.${SYS}.puppetProfile.`,old=this.actor.flags?.[SYS]?.puppetProfile||{},id=data[key+'controllerId']??old.controllerId,controller=game.actors.get(id);
  if(id&&(!controller||!controller.isOwner))throw Error('Choose a controller you own.');
  const max=puppetStatistics(controller,old.size).absorptionMax;
  if(!old.controllerId&&id)data[key+'absorptionRemaining']=max;
  else if(data[key+'absorptionRemaining']!==undefined){const n=Number(data[key+'absorptionRemaining']);if(!Number.isFinite(n))throw Error('Absorption must be a number.');data[key+'absorptionRemaining']=Math.max(0,Math.min(max,n));}
  return super._updateObject(event,data);
 }
 activateListeners(html){
  super.activateListeners(html);if(!this.actor.isOwner)return;
  const controller=()=>game.actors.get(this.actor.flags?.[SYS]?.puppetProfile?.controllerId);
  const ready=()=>{const c=controller();if(!c)throw Error('Assign a puppeteer first.');if(Number(this.actor.flags[SYS].puppetProfile.absorptionRemaining)<=0)throw Error('The puppet is unusable at 0 Absorption; repair it first.');return c;};
  html.find('.puppet-roll').on('click',async event=>{event.preventDefault();try{const c=ready(),s=puppetStatistics(c),type=event.currentTarget.dataset.roll;const precision=type==='dodge'?s.dodge:type==='anticipate'?s.anticipate:s.attack;const roll=await rollShinobiTest(precision);await roll.toMessage({speaker:ChatMessage.getSpeaker({actor:this.actor}),flavor:`${esc(this.actor.name)} — ${esc(type)} (controller ${esc(c.name)}). Apply aptitude, device and condition modifiers manually.`});}catch(e){ui.notifications.error(e.message);}});
  html.find('.puppet-use-charge').on('click',async event=>{event.preventDefault();const b=event.currentTarget;b.disabled=true;try{const c=ready(),d=this.actor.items.get(b.dataset.itemId)?.flags?.[SYS]?.puppetDevice;if(puppetStatistics(c).mechanics<(d?.minimumMechanics||0))throw Error('The controller does not meet this device’s Mechanics prerequisite.');await spendPuppetDeviceUse(this.actor,b.dataset.itemId);}catch(e){ui.notifications.error(e.message);}finally{b.disabled=false;}});
  html.find('.puppet-repair').on('click',async event=>{event.preventDefault();try{const c=controller();if(!c)throw Error('Assign a controller first.');const yes=await Dialog.confirm({title:'Repair Puppet',content:'<p>Repair requires a Tool Kit and 4 hours. Restore all Absorption after those requirements are completed?</p>'});if(yes)await this.actor.update({[`flags.${SYS}.puppetProfile.absorptionRemaining`]:puppetStatistics(c).absorptionMax});}catch(e){ui.notifications.error(e.message);}});
  html.find('.puppet-refill').on('click',async event=>{event.preventDefault();const yes=await Dialog.confirm({title:'Refill Puppet Devices',content:'<p>Limited device uses are replenished in a village. Have you completed that resupply?</p>'});if(!yes)return;const updates=[...this.actor.items].filter(i=>i.flags?.[SYS]?.puppetDevice?.maxUses!=null).map(i=>({_id:i.id,[`flags.${SYS}.puppetDevice.remainingUses`]:i.flags[SYS].puppetDevice.maxUses}));if(updates.length)await this.actor.updateEmbeddedDocuments('Item',updates);});
 }
}
Hooks.once('init',()=>{const actors=foundry.documents?.collections?.Actors??globalThis.Actors;actors.registerSheet(SYS,PuppetActorSheet,{types:['personagem'],makeDefault:false,label:'Kugutsu Puppet'});registerPuppetMenu();});
Hooks.once('ready',async()=>{if(!game.user.isGM||game.users.activeGM&&game.users.activeGM.id!==game.user.id)return;try{await buildPuppetCompendium();}catch(e){console.error('Initial Puppet compendium',e);ui.notifications.warn('Puppet templates could not build; retry in System Settings.');}});
