import { ShinobiActorSheet } from './actor-sheet.js';
import {puppetStatistics,puppetAptitudes,puppetCurrentAbsorption,promptCustomPuppet,puppetSlotSummary,puppetDeviceDamage,spendPuppetDeviceUse,registerPuppetMenu,buildPuppetCompendium} from './puppets.js';
import {rollShinobiTest} from './dice.js';
const SYS='shinobi-no-sho-revamp';const Base=foundry.appv1?.sheets?.ActorSheet??globalThis.ActorSheet;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class PuppetActorSheet extends ShinobiActorSheet{
 static get defaultOptions(){return foundry.utils.mergeObject(super.defaultOptions,{classes:['shinobi','sheet','actor','puppet']});}
 get template(){return `systems/${SYS}/templates/puppet-character-sheet.hbs`;}
 async getData(options){
  const context=await super.getData(options),profile=this.actor.flags?.[SYS]?.puppetProfile||{},controller=game.actors.get(profile.controllerId),stats=puppetStatistics(controller,profile.size),remaining=puppetCurrentAbsorption(profile,controller).remaining;
  stats.hardness+=([...this.actor.items].some(i=>i.flags?.[SYS]?.puppetDevice?.slot==='Heavy'&&/^armor$/i.test(i.name))?(stats.mechanics>=14?2:1):0);
  return {...context,puppet:profile,controllerName:controller?.name||'Not assigned',hasController:!!controller,stats,remaining,disabled:!!controller&&remaining<=0,aptitudesText:(profile.exampleAptitudes||[]).join(', '),puppetImage:this.actor.img,puppetMovement:10+Math.ceil(Number(controller?.system?.pericias?.prestidigitacao?.total||0)/2),sizeSmall:profile.size==="small",sizeMedium:profile.size==="medium",sizeLarge:profile.size==="large",construction:puppetSlotSummary(profile,[...this.actor.items]),allowedAptitudes:puppetAptitudes.join(', '),puppetAptitudes:[...this.actor.items].filter(i=>i.flags?.[SYS]?.puppetAptitudeReference||i.flags?.[SYS]?.puppetPurchasedAptitude).map(i=>({name:i.name,id:i.id})),controllers:[...game.actors].filter(a=>a.isOwner&&!a.flags?.[SYS]?.puppetProfile&&!a.flags?.[SYS]?.summonProfile).map(a=>({id:a.id,name:a.name,selected:a.id===profile.controllerId})),devices:[...this.actor.items].filter(i=>i.flags?.[SYS]?.puppetDevice).map(i=>{const d=i.flags[SYS].puppetDevice;return {id:i.id,name:i.name,...d,description:i.system.descricao,baseDamage:puppetDeviceDamage(stats.mechanics,d.weaponDamage),canAttack:d.weaponDamage>0,limited:d.maxUses!==null,remainingUses:d.remainingUses??d.maxUses,locked:stats.mechanics<(d.minimumMechanics||0)};})};
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
  html.find('.puppet-open-controller').on('click',event=>{event.preventDefault();controller()?.sheet?.render(true);});
  html.find('.puppet-open-item').on('click',event=>{event.preventDefault();this.actor.items.get(event.currentTarget.dataset.itemId)?.sheet?.render(true);});
  html.find('.puppet-roll').on('click',async event=>{event.preventDefault();try{const c=ready(),s=puppetStatistics(c),type=event.currentTarget.dataset.roll;const precision=type==='dodge'?s.dodge:type==='anticipate'?s.anticipate:s.attack;const roll=await rollShinobiTest(precision);await roll.toMessage({speaker:ChatMessage.getSpeaker({actor:this.actor}),flavor:`${esc(this.actor.name)} — ${esc(type)} (controller ${esc(c.name)}). Apply aptitude, device and condition modifiers manually.`});}catch(e){ui.notifications.error(e.message);}});
  // Attack precision is DC; damage uses the puppeteer's Mechanics and device Weapon Damage.
  html.find('.puppet-device-attack').on('click',async event=>{
   event.preventDefault();const button=event.currentTarget;button.disabled=true;
   try{
    const c=ready(),item=this.actor.items.get(button.dataset.itemId),d=item?.flags?.[SYS]?.puppetDevice;
    if(!d||!(Number(d.weaponDamage)>0))throw Error('Select an attacking puppet device.');
    const stats=puppetStatistics(c);
    if(stats.mechanics<Number(d.minimumMechanics||0))throw Error('Controller does not meet the device Mechanics prerequisite.');
    if(d.maxUses!=null&&Number(d.remainingUses??d.maxUses)<=0)throw Error('Device ammunition is empty.');
    const name=item.name.toLowerCase(),upgraded=stats.mechanics>=8&&name.includes('chakra slash');
    const weaponDamage=upgraded?Math.max(3,Number(d.weaponDamage)):Number(d.weaponDamage);
    let damage=puppetDeviceDamage(stats.mechanics,weaponDamage);
    const robust=!!d.robust||!!d.robustUpgrade;
    if(robust&&stats.mechanics>=10)damage=Math.min(stats.mechanics+3,damage+3);
    const bypass=upgraded?1:(name.includes('cutting water')&&stats.mechanics>=8&&d.slot==='Standard'?2:0);
    const target=[...(game.user.targets||[])][0]?.actor;
    const roll=await rollShinobiTest(stats.attack);
    await roll.toMessage({speaker:ChatMessage.getSpeaker({actor:this.actor}),flavor:`${esc(this.actor.name)} — ${esc(item.name)} | Controller: ${esc(c.name)} | DC ${stats.attack} | Base damage ${damage} (Mechanics ${stats.mechanics}, Weapon Damage ${weaponDamage})${bypass?` | Ignores ${bypass} Hardness`:''}. Apply hit/defense and other effects per device rules.`});
    // Once fired, limited ammunition is expended even if the attack misses.
    if(d.maxUses!=null)await spendPuppetDeviceUse(this.actor,item.id);
    if(!target){ui.notifications.info('Attack rolled; target was not selected. Apply damage manually after resolving defense.');return;}
    const confirmed=await Dialog.confirm({title:'Apply Puppet Device Damage',content:`<p>Apply ${damage} base damage from <strong>${esc(item.name)}</strong> to <strong>${esc(target.name)}</strong>?</p><p>Only confirm after the attack hits and the defender has resolved their reaction. This applies puppet Hardness automatically; other reductions and device effects require GM adjudication.</p>`,yes:'Hit — Apply Damage',no:'Miss / Cancel'});
    if(!confirmed)return;
    if(!target.isOwner){ui.notifications.warn('You cannot update this target. Ask the GM to apply damage.');return;}
    const targetProfile=target.flags?.[SYS]?.puppetProfile;
    if(targetProfile){
     const defender=game.actors.get(targetProfile.controllerId),state=puppetCurrentAbsorption(targetProfile,defender);
     const defense=puppetStatistics(defender,targetProfile.size);
     const armor=[...target.items].some(i=>i.flags?.[SYS]?.puppetDevice?.slot==='Heavy'&&/^armor$/i.test(i.name));
     const hardness=defense.hardness+(armor?(defense.mechanics>=14?2:1):0);
     const applied=Math.max(0,damage-Math.max(0,hardness-bypass));
     await target.update({[`flags.${SYS}.puppetProfile.absorptionRemaining`]:Math.max(0,state.remaining-applied),[`flags.${SYS}.puppetProfile.absorptionMaxSnapshot`]:state.max});
     ui.notifications.info(`${target.name}: ${applied} damage to Absorption (${hardness} Hardness, ${bypass} ignored).`);
    }else{
     const current=Number(target.system?.energias?.vitalidade?.value);
     if(!Number.isFinite(current))throw Error('Target has no supported Vitality value. Apply damage manually.');
     const reduction=await Dialog.prompt({title:'Target Damage Reduction',content:`<p>Enter total damage reduction after any hardness bypass, armor, aptitudes, or special defenses. The base attack is ${damage}.</p><input id="puppet-reduction" type="number" min="0" value="0"/>`,callback:html=>Number(html.find('#puppet-reduction').val())});
     if(reduction==null)return;
     if(!Number.isFinite(reduction)||reduction<0)throw Error('Damage reduction must be nonnegative.');
     const applied=Math.max(0,damage-reduction);
     await target.update({'system.energias.vitalidade.value':Math.max(0,current-applied)});
     ui.notifications.info(`${target.name}: ${applied} Vitality damage applied.`);
    }
   }catch(e){console.error('Puppet device attack',e);ui.notifications.error(e.message);}finally{button.disabled=false;}
  });
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
