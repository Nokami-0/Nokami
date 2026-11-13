const SYS='shinobi-no-sho-revamp';
export function rashoumonRank(actor){
 let rank=0;
 for(const item of actor.items||[]){
  if(item.type!=='aptidao'||item.flags?.[SYS]?.summonTechnique||item.flags?.[SYS]?.summonReference)continue;
  const name=String(item.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const source=JSON.stringify(item.flags?.[SYS]?.sourceFlags||item.flags||{});
  if(!/rash(?:ou|o)mon/i.test(name+' '+source))continue;
  const named=Number(name.match(/(?:level|nivel)\s*([123])/i)?.[1]||0);
  const stored=Number(item.system?.nivel||0);
  rank=Math.max(rank,named,Number.isInteger(stored)&&stored>=1&&stored<=3?stored:1);
 }
 return rank;
}
export function rashoumonParameters(actor,attribute,quantity,existing=0){
 const rank=rashoumonRank(actor),score=Number(actor.system?.atributos?.[attribute]?.valor)||0;
 if(!['esp','int'].includes(attribute))throw Error('Choose Spirit or Intelligence.');
 if(!rank)throw Error('Purchase Kuchiyose: Rashoumon before summoning gates.');
 const required=[0,8,12,18][rank];
 if(score<required)throw Error(`Rashoumon level ${rank} requires ${attribute==='esp'?'Spirit':'Intelligence'} ${required}.`);
 const maximum=[0,1,3,5][rank];
 if(!Number.isInteger(quantity)||quantity<1||quantity+existing>maximum)throw Error(`Level ${rank} allows ${maximum} active gates; ${existing} already active.`);
 const hardness=score+[0,0,2,3][rank];
 return {rank,score,maximum,quantity,hardness:hardness/quantity,totalHardness:hardness,chakra:Math.ceil(score/2),widthMeters:score/2,heightMeters:score/2,rangeMeters:5+score,action:rank>=2&&quantity===1?'Partial':'Movement',nonDegrading:rank===3};
}
export function rashoumonTemplate(){
 return {name:'Rashoumon (Rashomon) — Defensive Gates',type:'personagem',img:'icons/svg/shield.svg',system:{},prototypeToken:{name:'Rashoumon Gate',actorLink:false,texture:{src:'icons/svg/shield.svg'},displayBars:0},flags:{core:{sheetClass:`${SYS}.RashoumonSheet`},[SYS]:{kuchiyoseCompendiumKey:'Rashoumon (Rashomon)',rashoumonGate:{template:true},summonRulesRevision:2}},items:[]};
}
export function rashoumonGridSize(parameters,grid){
 const units=String(grid.units||'m').toLowerCase();
 const metresPerUnit=/^(ft|feet|foot)$/.test(units)?0.3048:/^(m|metres?|meters?|metro?s?)$/.test(units)?1:null;
 if(!metresPerUnit)throw Error('Set the scene grid units to metres (m) or feet (ft) before placing gates.');
 const metresPerSquare=Number(grid.distance)*metresPerUnit;
 if(!(metresPerSquare>0))throw Error('Scene grid distance must be positive.');
 return {width:parameters.widthMeters/metresPerSquare,height:1,metresPerSquare};
}
export function rashoumonPositions(token,scene,size,quantity,rangeMeters){
 const g=scene.grid.size||100,w=size.width*g,h=g,doc=token.document;
 const rect=scene.dimensions.sceneRect||{x:0,y:0,width:scene.dimensions.width,height:scene.dimensions.height};
 const tx=doc.x,ty=doc.y,tw=doc.width*g,th=doc.height*g;
 const occupied=scene.tokens.map(t=>({x:t.x,y:t.y,w:t.width*g,h:t.height*g})),result=[];
 for(let ring=1;ring<=Math.ceil(rangeMeters/size.metresPerSquare)+1&&result.length<quantity;ring++){
  const candidates=[{x:tx+(tw-w)/2,y:ty-ring*g},{x:tx+(tw-w)/2,y:ty+th+(ring-1)*g},{x:tx+tw+(ring-1)*g,y:ty},{x:tx-w-(ring-1)*g,y:ty}];
  for(const p of candidates){
   const gapX=Math.max(0,tx-(p.x+w),p.x-(tx+tw)),gapY=Math.max(0,ty-(p.y+h),p.y-(ty+th));
   if(Math.hypot(gapX,gapY)/g*size.metresPerSquare>rangeMeters)continue;
   if(p.x<rect.x||p.y<rect.y||p.x+w>rect.x+rect.width||p.y+h>rect.y+rect.height)continue;
   if(occupied.some(o=>p.x<o.x+o.w&&p.x+w>o.x&&p.y<o.y+o.h&&p.y+h>o.y))continue;
   result.push(p);occupied.push({...p,w,h});if(result.length===quantity)break;
  }
 }
 if(result.length!==quantity)throw Error('Not enough unobstructed map space in range for all gates.');
 return result;
}
const casting=new Set();
export async function summonRashoumon(owner,attribute,quantity){
 if(!game.user.isGM)throw Error('GM permission is required to place gate actors and spend chakra.');
 if(casting.has(owner.id))throw Error('A Rashoumon summon is already in progress.');
 casting.add(owner.id);let gateActor,spawned=[],paid=false,available=0;
 try{
  const scene=canvas.scene,token=canvas.tokens.controlled.find(t=>t.actor?.id===owner.id);
  if(!scene||!token)throw Error('Select the summoner token on an open scene.');
  const existing=[...game.scenes].flatMap(s=>[...s.tokens]).filter(t=>t.flags?.[SYS]?.rashoumonOwner===owner.id).length;
  const p=rashoumonParameters(owner,attribute,quantity,existing),size=rashoumonGridSize(p,scene.grid),positions=rashoumonPositions(token,scene,size,quantity,p.rangeMeters);
  available=Number(owner.system?.energias?.chakra?.value)||0;if(available<p.chakra)throw Error(`Need ${p.chakra} chakra; have ${available}.`);
  const data=rashoumonTemplate();data.name=`Rashoumon — ${owner.name}`;data.ownership={...owner.ownership};
  data.flags[SYS].rashoumonGate={...p,ownerId:owner.id,attribute,remainingHardness:p.hardness,template:false};
  data.flags.core={sheetClass:`${SYS}.RashoumonSheet`};
  gateActor=await Actor.create(data);
  await owner.update({'system.energias.chakra.value':available-p.chakra});paid=true;
  const docs=positions.map((pos,i)=>({...pos,name:`Rashoumon Gate ${i+1}`,actorId:gateActor.id,actorLink:false,width:size.width,height:size.height,texture:{src:data.img},displayBars:0,disposition:1,flags:{[SYS]:{rashoumonOwner:owner.id,rashoumonGate:true,rashoumonScene:scene.id}}}));
  spawned=await scene.createEmbeddedDocuments('Token',docs);
  await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:owner}),content:`<p>Rashoumon level ${p.rank}: ${quantity} gate(s), ${p.chakra} Chakra, ${p.action} action. Each: ${p.widthMeters} m wide × ${p.heightMeters} m high; Hardness ${p.hardness}. Defense: Magic Level +2; roll and resolve attacks manually. Gates do not block adjacent attacks. Token footprint is a one-square-deep wall marker; height is recorded on the gate sheet.</p>`});
  ui.notifications.info(`Summoned ${quantity} Rashoumon gate(s).`);return {actor:gateActor,tokens:spawned,parameters:p};
 }catch(error){
  // Roll back only this failed cast, including its generated actor.
  if(spawned.length)await canvas.scene.deleteEmbeddedDocuments('Token',spawned.map(t=>t.id));
  if(paid)await owner.update({'system.energias.chakra.value':available});
  if(gateActor)await gateActor.delete();throw error;
 }finally{casting.delete(owner.id);}
}
export function openRashoumonDialog(owner){
 const rank=rashoumonRank(owner),maximum=[0,1,3,5][rank]||0;
 if(!rank)return ui.notifications.warn('Add the purchased Kuchiyose: Rashoumon aptitude to this character first.');
 new Dialog({title:'Kuchiyose: Rashoumon — Defensive Gates',content:`<form><p>Purchased aptitude level: ${rank}. Requirements: Spirit or Intelligence ${[0,8,12,18][rank]}. This aptitude uses its own rules: no blood contract, creature NC or normal Kuchiyose scene-use cost.</p><label>Attribute</label><select name="attribute"><option value="esp">Spirit</option><option value="int">Intelligence</option></select><label>Gates</label><select name="quantity">${Array.from({length:maximum},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select><p class="rash-preview"></p><p>Cost: half the selected attribute, rounded up. Hardness is divided across gates created together. Defenses, confinement rolls, opening/closing once per round, destruction and scene-end dismissal are resolved manually. Delete dismissed gate tokens to free the active-gate limit.</p></form>`,buttons:{summon:{label:'Summon Gates',callback:async html=>{try{await summonRashoumon(owner,html.find('[name=attribute]').val(),Number(html.find('[name=quantity]').val()));}catch(e){ui.notifications.error(e.message);}}},cancel:{label:'Cancel'}},render:html=>{const update=()=>{try{const p=rashoumonParameters(owner,html.find('[name=attribute]').val(),Number(html.find('[name=quantity]').val()));html.find('.rash-preview').text(`${p.action} action; ${p.chakra} Chakra. Each gate: ${p.widthMeters}m wide × ${p.heightMeters}m high, Hardness ${p.hardness}. Range ${p.rangeMeters}m.`);}catch(e){html.find('.rash-preview').text(e.message);}};html.find('select').on('change',update);update();}}).render(true);
}
