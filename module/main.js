import {CharacterData,VehicleData,ItemData} from './models.js';
import {STTHActor} from './actor.js';
import {HeroSheet,GearSheet} from './sheets.js';
import {STTHCombat,installCombatHooks} from './combat.js';
import {RulesReference,LibraryManager,openRules,buildLibrary} from './reference.js';
import {rollSkill,opposed,owned,prompt,select} from './rolls.js';
import {damage,CONDITIONS} from './resources.js';
import {installEquipmentValidation} from './validation.js';
const ID='sonic-tag-team-heroes';
const {Actor,Item,ChatMessage,Macro}=foundry.documents;
const {DocumentSheetConfig}=foundry.applications.apps;
Hooks.once('init',()=>{
 CONFIG.Actor.documentClass=STTHActor;
 CONFIG.Combat.documentClass=STTHCombat;
 Object.assign(CONFIG.Actor.dataModels,{character:CharacterData,npc:CharacterData,vehicle:VehicleData});
 for(const type of ['attack','talent','gear','consumable','tagTeam','special','vehicleWeapon','vehicleUpgrade','reference'])CONFIG.Item.dataModels[type]=ItemData;
 DocumentSheetConfig.registerSheet(Actor,ID,HeroSheet,{types:['character','npc','vehicle'],makeDefault:true,label:'STTH V14 Actor Sheet'});
 DocumentSheetConfig.registerSheet(Item,ID,GearSheet,{makeDefault:true,label:'STTH V14 Item Sheet'});
 CONFIG.Combat.initiative={formula:'1d6',decimals:0};
 CONFIG.statusEffects=Object.entries(CONDITIONS).map(([id,name])=>({id,name,img:`systems/${ID}/assets/${id}.svg`}));
 game.settings.register(ID,'enforcePhases',{name:'Enforce spent phases for players',hint:'Optional turn guard; GM can override.',scope:'world',config:true,type:Boolean,default:false});
 game.settings.registerMenu(ID,'rules',{name:'STTH Rulebook',label:'Search Rules',icon:'fas fa-book',type:RulesReference,restricted:false});
 game.settings.registerMenu(ID,'library',{name:'STTH Library',label:'Build / Repair Library',icon:'fas fa-book-open',type:LibraryManager,restricted:true});
 game.stth={rollSkill,opposed,openRules,buildLibrary,damage};
 console.info('STTH V14 2.0.3 initialized: native ApplicationV2 sheets and dialogs.');
});
Hooks.once('ready',async()=>{
 installCombatHooks();installEquipmentValidation();
 if(game.user.isGM&&(!game.users.activeGM||game.users.activeGM.id===game.user.id)){
  try{await buildLibrary();}
  catch(error){console.error('STTH library initialization failed',error);ui.notifications.error('STTH library initialization failed; use Build / Repair Library in system settings.');}
 }
});
// V14 passes an HTMLElement through renderChatMessageHTML, never a jQuery wrapper.
Hooks.on('renderChatMessageHTML',(message,html)=>{
 for(const button of html.querySelectorAll('[data-stth-chat="damage"]'))button.addEventListener('click',async()=>{
  if(button.disabled)return;button.disabled=true;
  try{
   const data=message.flags[ID];if(data?.kind!=='damage'||data.applied)return;
   const target=await fromUuid(data.target);owned(target);
   if(target.getFlag(ID,`appliedDamage.${message.id}`))return ui.notifications.warn('Damage already applied.');
   const options=await prompt('Apply attack damage',select('critical','Spend Critical Trick?',{no:'No',yes:'Yes'},'no')+select('shield','Shield interaction',{yes:'Use active shield',no:'Bypass / exempt'},'yes'));
   if(!options)return;
   if(options.critical==='yes'&&!data.criticalAvailable)throw Error('No Critical Trick is available.');
   await damage(target,data.damage,{critical:options.critical==='yes',shield:options.shield==='yes'});
   await target.setFlag(ID,`appliedDamage.${message.id}`,true);
   if(message.isOwner)await message.setFlag(ID,'applied',true);
  }catch(error){ui.notifications.error(error.message);}
  finally{button.disabled=false;}
 });
});
Hooks.on('hotbarDrop',(_bar,data,slot)=>{
 if(data.type!=='Item'||!data.uuid)return;
 fromUuid(data.uuid).then(async item=>{
  if(!item?.actor)return;
  const action=item.type==='consumable'?'use':['gear','vehicleUpgrade'].includes(item.type)?'equip':['attack','tagTeam','vehicleWeapon'].includes(item.type)?'roll':'edit';
  const command=`const item = await fromUuid(${JSON.stringify(data.uuid)}); if (item?.actor) await item.actor.sheet.action('${action}', {closest:()=>({dataset:{itemId:item.id}})});`;
  let macro=game.macros.find(m=>m.command===command);
  macro??=await Macro.create({name:item.name,type:'script',img:item.img,command});
  await game.user.assignHotbarMacro(macro,slot);
 }).catch(error=>ui.notifications.error(error.message));return false;
});
