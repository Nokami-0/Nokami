const ID='sonic-tag-team-heroes';
const FORMS=['Biolizard','Biolizard — Phase 2'];
const busy=new Set();
export async function transformBiolizard(token=canvas.tokens.controlled[0],target){
 const doc=token?.document??token;
 const actor=doc?.actor;
 if(!actor||!doc?.update)throw Error('Select one Biolizard token first.');
 if(!actor.isOwner||!doc.isOwner)throw Error('You must own this token and actor.');
 if(doc.actorLink)throw Error('Use an unlinked Biolizard token so this transformation affects only this creature.');
 const current=actor.getFlag(ID,'biolizardForm')??actor.getFlag(ID,'gunKey')??actor.name;
 if(!FORMS.includes(current))throw Error('Selected token is not a Biolizard form.');
 target??=current===FORMS[0]?FORMS[1]:FORMS[0];
 if(!FORMS.includes(target))throw Error('Unknown Biolizard form.');
 if(target===current)return;
 if(busy.has(doc.uuid))return;
 busy.add(doc.uuid);
 try{
  const response=await fetch(`systems/${ID}/data/gun.json`);
  if(!response.ok)throw Error('Could not load Biolizard forms.');
  const rows=await response.json(),form=rows.find(r=>r.name===target);
  if(!form?.img)throw Error('Biolizard form template is missing.');
  const old={name:actor.name,img:actor.img,form:actor.getFlag(ID,'biolizardForm')??current};
  await actor.update({name:target,img:form.img,[`flags.${ID}.biolizardForm`]:target});
  try{await doc.update({name:target,'texture.src':form.img});}
  catch(error){await actor.update({name:old.name,img:old.img,[`flags.${ID}.biolizardForm`]:old.form});throw error;}
  ui.notifications.info(`Changed to ${target}. HP, conditions, items and initiative preserved.`);
 }finally{busy.delete(doc.uuid);}
}
export async function installBiolizardTransformation(){
 if(!game.user.isGM||game.users.activeGM&&game.users.activeGM.id!==game.user.id)return;
 const Macro=foundry.documents.Macro;
 const command="try { await game.stth.transformBiolizard(); } catch (error) { ui.notifications.error(error.message); }";
 const existing=game.macros.find(m=>m.getFlag(ID,'biolizardTransform'));
 if(existing){if(existing.command!==command)await existing.update({command});return;}
 await Macro.create({name:'Biolizard — Switch Phase',type:'script',img:`systems/${ID}/assets/tokens/biolizard-phase-2.svg`,command,flags:{[ID]:{biolizardTransform:true}}});
}
