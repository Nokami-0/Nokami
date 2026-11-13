const SYS='shinobi-no-sho-revamp';
const BaseActorSheet=foundry.appv1?.sheets?.ActorSheet??globalThis.ActorSheet;
export class RashoumonSheet extends BaseActorSheet{
 static get defaultOptions(){return foundry.utils.mergeObject(super.defaultOptions,{width:500,height:540,classes:['shinobi','sheet','rashoumon']});}
 get template(){return `systems/${SYS}/templates/rashoumon-sheet.hbs`;}
 async getData(options){return {...await super.getData(options),gate:this.actor.flags?.[SYS]?.rashoumonGate||{template:true}};}
}
Hooks.once('init',()=>{const actors=foundry.documents?.collections?.Actors??globalThis.Actors;actors.registerSheet(SYS,RashoumonSheet,{types:['personagem'],makeDefault:false,label:'Rashoumon Defensive Gate'});});
