import {placeAttackTemplate,attackShapeLabel} from './attack-areas.js';
import {vehicleAction} from './vehicles.js';
import {loadoutWizard} from './loadouts.js';
import {ATTRIBUTES,SKILLS} from './engine.js';
import {rollSkill,rollDodge,attack,card,owned,prompt,field,select,spendPhase,esc,num} from './rolls.js';
import {damageDialog,healRings,rest,equip,useItem,condition,CONDITIONS,advance,underwaterCheck,endEncounter} from './resources.js';
import {tagTeam,teamBlast} from './team.js';import {qte,zone,race} from './challenges.js';import {createHero} from './creation.js';import {openRules} from './reference.js';
import {conditionStacks,itemDamage} from './actor.js';

const {HandlebarsApplicationMixin}=foundry.applications.api;
const {ActorSheetV2,ItemSheetV2}=foundry.applications.sheets;
const ROOT='systems/sonic-tag-team-heroes';

// V14 document forms: no legacy ActorSheet, jQuery, or activateListeners.
export class HeroSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
 static DEFAULT_OPTIONS={
  classes:['stth','sheet','actor'],tag:'form',position:{width:980,height:830},
  window:{resizable:true},
  form:{submitOnChange:true,closeOnSubmit:false,handler:HeroSheet.saveForm},
  actions:{stthAction:HeroSheet.onAction}
 };
 static PARTS={body:{template:`${ROOT}/templates/actor.hbs`}};
 static async saveForm(event,form,formData){
  if(!this.actor.isOwner)throw Error('You must own this actor to edit it.');
  await this.actor.update(formData.object);
 }
 static async onAction(event,target){
  event.preventDefault();
  if(target.disabled)return;
  target.disabled=true;
  try{
   if(target.dataset.stth==='tab'){
    this._activeTab=target.dataset.tab;this.showTab();return;
   }
   if(target.dataset.stth==='portrait')return editPortrait(this.actor);
   await this.action(target.dataset.stth,target);
  }catch(error){console.error('STTH V14',error);ui.notifications.error(error.message);}
  finally{target.disabled=false;}
 }
 showTab(){
  const active=this._activeTab||'stats';
  for(const node of this.element.querySelectorAll('.tab[data-tab]'))node.classList.toggle('active',node.dataset.tab===active);
  for(const node of this.element.querySelectorAll('.tabs [data-tab]'))node.classList.toggle('active',node.dataset.tab===active);
 }
 _onRender(context,options){super._onRender(context,options);this.showTab();}
 _onDragStart(event){
  const row=event.target.closest('[data-item-id]');
  const item=row&&this.actor.items.get(row.dataset.itemId);
  if(item){event.dataTransfer.setData('text/plain',JSON.stringify(item.toDragData()));return;}
  return super._onDragStart(event);
 }
 async _onDropItem(event,item){
  owned(this.actor);
  if(item.parent?.uuid===this.actor.uuid)return item;
  const data=item.toObject();delete data._id;delete data.folder;
  if(['gear','attack','vehicleUpgrade'].includes(data.type))data.system.equipped=false;
  const [created]=await this.actor.createEmbeddedDocuments('Item',[data]);return created;
 }
 async _prepareContext(options){const c=await super._prepareContext(options);c.actor=this.actor;c.hasForms=!!this.actor.flags?.['sonic-tag-team-heroes']?.forms;c.formLabel=this.actor.flags?.['sonic-tag-team-heroes']?.form==='flight'?'Flight Mode':'Combat Mode';const s=this.actor.system;c.system=s;c.vehicle=this.actor.type==='vehicle';c.character=this.actor.type==='character';c.npc=this.actor.type==='npc';c.technique=c.character&&s.heroType==='technique';c.types={speed:'Speed',power:'Power',fly:'Fly',technique:'Technique'};c.archetypes={genius:'Genius',figurehead:'Figurehead',generalist:'Generalist'};
 c.attributes=Object.entries(ATTRIBUTES).map(([key,label])=>({key,label,value:s.attributes?.[key],effective:s.derived.attributes?.[key],skills:Object.entries(SKILLS).filter(([,attribute])=>attribute===key).map(([skill])=>({key:skill,ranks:s.skills?.[skill],effective:s.derived.ranks?.[skill]}))}));
 c.skills=Object.entries(SKILLS).map(([key,attribute])=>({key,attribute,ranks:s.skills?.[key],effective:s.derived.ranks?.[key]}));
 c.skillChoices=Object.fromEntries(Object.keys(SKILLS).map(k=>[k,k]));c.itemGroups=['attack','talent','gear','consumable','tagTeam','special','vehicleWeapon','vehicleUpgrade','reference'].map(type=>({type,label:{attack:'Signature Attacks',talent:'Talents',gear:'Gear',consumable:'Items & Consumables',tagTeam:'Tag-Team Attacks',special:'Special',vehicleWeapon:'Vehicle Weapons',vehicleUpgrade:'Vehicle Upgrades',reference:'Rule References'}[type],items:this.actor.items.filter(i=>i.type===type).map(i=>({id:i.id,name:i.name,type:i.type,system:i.system,img:i.img,damage:i.type==='attack'?itemDamage(this.actor,i):i.system.damage,shapeLabel:attackShapeLabel(i),templatable:['attack','vehicleWeapon'].includes(i.type),rollable:['attack','tagTeam','vehicleWeapon'].includes(i.type),gear:['gear','vehicleUpgrade'].includes(i.type)||(i.type==='attack'&&i.system.slots>0),consumable:i.type==='consumable'}))})).filter(g=>g.items.length||!c.vehicle&&['attack','talent','gear','consumable','tagTeam','special'].includes(g.type)||c.vehicle&&['vehicleWeapon','vehicleUpgrade'].includes(g.type));
 c.conditions=Object.entries(CONDITIONS).map(([id,label])=>({id,label,stacks:conditionStacks(this.actor,id)}));return c;}
 async action(action,button){const a=this.actor,s=a.system;const item=a.items.get(button.closest('[data-item-id]')?.dataset.itemId);
 if(['edit','delete','roll','equip','use','recharge','template'].includes(action)&&!item)throw Error('This item is no longer on the actor. Reopen the sheet.');
 if(a.type==='vehicle'&&['loadout','skill','rings','rest','adventure','advance','create','blast','qte','zone','breath','surface','session','special','end','resetQte'].includes(action))throw Error('Use these character actions on the pilot’s sheet.');
 if(action==='transform'){
  owned(a);const flags=a.flags?.['sonic-tag-team-heroes'];if(!flags?.forms)throw Error('This actor has no alternate form.');
  if(s.phases.interact)throw Error('Interact phase already spent.');
  const next=flags.form==='flight'?'combat':'flight';await spendPhase(a,'interact');
  await a.update({'flags.sonic-tag-team-heroes.form':next,'system.attributes.speed':next==='flight'?5:3,'system.profileMovement':next==='flight'?6:3,img:flags.forms[next],'prototypeToken.texture.src':flags.forms[next]});
  for(const token of a.getActiveTokens?.()||[])await token.document.update({'texture.src':flags.forms[next]});
  return;
 }
 if(action==='template')return placeAttackTemplate(a,item);
 if(action==='vehicleAction')return vehicleAction(a);if(action==='loadout')return loadoutWizard(a);if(action==='rules')return openRules();if(action==='skill')return rollSkill(a,button.dataset.skill);if(action==='dodge')return rollDodge(a);if(action==='edit')return item.sheet.render({force:true});if(action==='delete'){owned(a);if(await foundry.applications.api.DialogV2.confirm({rejectClose:false,window:{title:'Delete item?'},content:`<p>Delete ${esc(item.name)} from this actor?</p>`}))return item.delete();return;}
 if(action==='roll')return item.type==='tagTeam'?tagTeam(a,item):attack(a,item);if(action==='equip')return equip(a,item);if(action==='use')return useItem(a,item);
 if(action==='add'){owned(a);const [i]=await a.createEmbeddedDocuments('Item',[{name:'New '+button.dataset.type,type:button.dataset.type}]);return i.sheet.render({force:true});}
 if(action==='damage')return damageDialog(a);if(action==='rings')return healRings(a);if(action==='rest')return rest(a,false);if(action==='adventure')return rest(a,true);if(action==='advance')return advance(a);if(action==='create')return createHero(a);if(action==='blast')return teamBlast(a);if(action==='qte')return qte(a);if(action==='zone')return zone(a);if(action==='race')return race(a);if(action==='breath')return underwaterCheck(a);if(action==='end')return endEncounter(a);
 if(action==='condition'){const id=button.dataset.condition,o=await prompt(CONDITIONS[id],field('stacks','Stacks (0 removes)',conditionStacks(a,id)));if(o)return condition(a,id,num(o.stacks));return;}
 if(action==='recharge'){owned(a);await spendPhase(a,'interact');return item.update({'system.remainingRecharge':Math.max(0,item.system.remainingRecharge-1)});}
 if(action==='phase')return spendPhase(a,button.dataset.phase);
 if(action==='exchange'){owned(a);const o=await prompt('Exchange Action',select('phase','Gain a second phase',{move:'Move',interact:'Interact'},'move'));if(o){await spendPhase(a,'action');const p={...a.system.phases};p[o.phase]=Math.max(0,(p[o.phase]||0)-1);return a.update({'system.phases':p});}return;}
 if(action==='resetPhases'){owned(a);return a.update({'system.phases':{}});}
 if(action==='resetQte'){owned(a);return a.update({'system.qte':{}});}
 if(action==='surface'){owned(a);const drowning=conditionStacks(a,'suffocating')>0;await a.update({'system.underwater':false,'system.breathRounds':0});await condition(a,'suffocating',0);if(drowning&&a.system.hp.value>0)await condition(a,'ko',0);return;}
 if(action==='session'){owned(a);return a.update({'system.specialUsed':false,'system.specialEncounter':''});}
 if(action==='special'){owned(a);if(a.type!=='character'||s.heroType!=='technique')throw Error('Technique Specials require a Technique Type character.');if(s.specialUsed)throw Error('Special has already succeeded this session.');const encounter=game.combat?.id;if(encounter&&s.specialEncounter===encounter)throw Error('This Special was already attempted in this encounter. Try again in a later encounter.');if(s.archetype==='generalist'){await a.update({'system.specialUsed':true});return card(a,'Indomitable Will','<p>Reroll the chosen check and use the better result. Use the normal check dialog with the original modifiers; do not reroll unrelated checks.</p>');}if(encounter)await a.update({'system.specialEncounter':encounter});const r=await rollSkill(a,s.specialSkill,{difficulty:2,ask:false});if(r?.success)await a.update({'system.specialUsed':true});return;}
 throw Error(`Unknown sheet action: ${action}`);
 }
}
export class GearSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
 static DEFAULT_OPTIONS={
  classes:['stth','sheet','item'],tag:'form',position:{width:650,height:780},window:{resizable:true},
  form:{submitOnChange:true,closeOnSubmit:false,handler:GearSheet.saveForm},
  actions:{editPortrait:async function(){await editPortrait(this.item);}}
 };
 static PARTS={body:{template:`${ROOT}/templates/item.hbs`}};
 static async saveForm(event,form,formData){if(!this.item.isOwner)throw Error('You must own this item.');await this.item.update(formData.object);}
 async _prepareContext(options){const c=await super._prepareContext(options);c.item=this.item;c.system=this.item.system;c.skills=Object.fromEntries(Object.keys(SKILLS).map(k=>[k,k]));c.damageModes={fixed:'Fixed',spin:'Power + 1 + bonus',melee:'Power + 2 + bonus'};c.templateShapes={auto:'Automatic from AoE / arc',single:'Single target',cone:'Cone',line:'Line',circle:'Circle / radius',rectangle:'Rectangle / square'};c.modifiers={'':'None',attribute:'Attribute bonus',skill:'Skill rank bonus',advantage:'Contextual Advantage',dodge:'Dodge',initiative:'Initiative',movement:'Movement',hp:'HP',immunity:'Immunity'};return c;}
}
async function editPortrait(document){
 if(!document.isOwner)return;
 const Picker=foundry.applications.apps.FilePicker.implementation;
 new Picker({type:'image',current:document.img,callback:path=>document.update({img:path})}).render({force:true});
}
