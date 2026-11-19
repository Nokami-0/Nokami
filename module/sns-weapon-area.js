import {previewSnsArea} from './sns-area-preview.js';
const SYS='shinobi-no-sho-revamp';
export function snsDeviceArea(item,mechanics){
 const name=item.name.toLowerCase(),d=item.flags?.[SYS]?.puppetDevice||{},slot=String(d.slot||'').toLowerCase(),m=Math.max(0,Number(mechanics)||0);
 if(/flamethrower|flame thrower/.test(name)&&m>=8&&slot==='standard')return {t:'cone',distance:m,angle:90,description:'Flamethrower cone: 1m per Mechanics level'};
 if(/cutting water jet/.test(name)&&m>=10&&slot==='standard')return {t:'ray',distance:m,width:1,description:'Cutting Water Jet line: 1m per Mechanics level'};
 if(/projectiles/.test(name)&&m>=8&&slot==='standard')return {t:'circle',distance:m/2,description:'Projectile rain: diameter 1m per Mechanics level'};
 if(/bombs/.test(name)&&slot==='standard')return {t:'circle',distance:(5+m)/2,description:'Smoke bomb: diameter 5m + 1m per Mechanics level'};
 return null;
}
export async function placeSnsWeaponArea(actor,item,originActor=actor,controller=null){
 if(!canvas?.scene)throw Error('Open a scene first.');
 const token=originActor.getActiveTokens().find(t=>t.scene?.id===canvas.scene.id);
 if(!token)throw Error('Place the attacking character or puppet token on the current scene.');
 const mechanics=Number(controller?.system?.pericias?.mecanismo?.total??actor.system?.pericias?.mecanismo?.total??0);
 const preset=snsDeviceArea(item,mechanics);
 const answer=await new Promise(resolve=>new Dialog({title:'Weapon area — '+foundry.utils.escapeHTML(item.name),content:'<p>'+(preset?preset.description:'Choose a shape and range permitted by this weapon. No automatic damage or ammunition cost.')+'</p><label>Shape</label><select name="shape"><option value="cone">Cone</option><option value="ray">Line</option><option value="circle">Circle</option><option value="rect">Rectangle</option></select><label>Distance / radius (scene units)</label><input type="number" name="distance" min="0.1" step="any" value="'+(preset?.distance||5)+'"><label>Removal</label><select name="cleanup"><option value="manual">Manual</option><option value="next-area">On next area placement</option></select>',render:h=>{if(preset)h.find('[name=shape]').val(preset.t)},buttons:{place:{label:'Preview on map',callback:h=>resolve({t:h.find('[name=shape]').val(),distance:Number(h.find('[name=distance]').val()),cleanup:h.find('[name=cleanup]').val()})},cancel:{label:'Cancel',callback:()=>resolve(null)}},close:()=>resolve(null)}).render(true));
 if(!answer)return;
 if(!Number.isFinite(answer.distance)||answer.distance<=0)throw Error('Invalid area size.');
 if(preset&&(answer.t!==preset.t||answer.distance!==preset.distance))throw Error('This device area must use the shape and range from the Kugutsu rules.');
 const p=token.center;
 const doc=await previewSnsArea({t:answer.t,distance:answer.distance,direction:0,angle:preset?.angle||90,width:1,x:p.x,y:p.y,user:game.user.id,fillColor:'#e87724'});
 if(!doc)return;
 const existing=canvas.scene.templates.filter(x=>x.getFlag(SYS,'areaActor')===actor.id&&x.getFlag(SYS,'cleanup')==='next-area');
 if(existing.length)await canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate',existing.map(x=>x.id));
 await canvas.scene.createEmbeddedDocuments('MeasuredTemplate',[{...doc,user:game.user.id,flags:{[SYS]:{areaActor:actor.id,areaItem:item.id,cleanup:answer.cleanup}}}]);
}
