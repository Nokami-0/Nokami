import {owned,prompt,field,select} from './rolls.js';
import {areaDefaults,buildAttackShape} from './attack-shapes.js';
export {attackShapeLabel} from './attack-shapes.js';
const ID='sonic-tag-team-heroes';
export async function placeAttackTemplate(actor,item){
 owned(actor);
 if(!canvas?.scene||typeof canvas.regions?.placeRegion!=='function')throw Error('Open a scene with Foundry V14 Regions enabled.');
 const s=item.system,d=areaDefaults(item);
 const range=Number(s.templateDistance)||Number(s.range)||(['melee','spin'].includes(s.skill)?1:Number(actor.system.derived?.attributes?.dexterity)||1);
 const options=await prompt('Attack arc / area',
 '<p>Dimensions are in squares. A firing arc limits targeting; it does not damage every square. Area placement does not spend an Action or ammunition. GM checks range, cover, altitude and affected targets.</p>'+
 select('purpose','Preview',{area:'Attack area / splash',arc:'Firing arc'},'area')+
 select('shape','Area shape',{single:'Single target',cone:'Cone',line:'Line',circle:'Circle / radius',rectangle:'Rectangle / square'},d.shape)+
 field('length','Range / line length / radius (squares)',range)+field('width','Area width (squares)',d.width)+field('height','Rectangle height (squares)',d.height)+
 field('angle','Cone angle (degrees)',d.angle)+field('direction','Direction (0 east, 90 south, 180 west, 270 north)',0));
 if(!options)return;
 let shape=options.shape;
 if(options.purpose==='arc'){const arc=String(s.arc||'360').toLowerCase();shape=arc==='cone'?'cone':['straight','line','ray'].includes(arc)?'line':'circle';}
 const data=buildAttackShape({...options,shape,length:Number(options.length),width:Number(options.width),height:Number(options.height),angle:Number(options.angle),direction:Number(options.direction)},canvas.grid.size);
 return canvas.regions.placeRegion({name:`${item.name} — ${options.purpose==='arc'?'Firing arc (targeting only)':'Attack area'}`,shapes:[data],color:game.user.color?.toString()||'#ffaa00',visibility:CONST.REGION_VISIBILITY.ALWAYS,highlightMode:'coverage',displayMeasurements:true,ownership:{[game.user.id]:CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER},...(canvas.level?.id?{levels:[canvas.level.id]}:{}),flags:{[ID]:{attackTemplate:true,itemUuid:item.uuid,purpose:options.purpose,squares:{length:Number(options.length),width:Number(options.width),height:Number(options.height)}}}});
}
