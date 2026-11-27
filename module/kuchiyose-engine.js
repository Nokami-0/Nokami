import {SNS_SIZE_TABLE,NORMAL_SUMMON_SIZES,openSnsSizeReference,sizeById,isSummonSizeLegal,fixedSize} from './sizes.js';
import {openRashoumonDialog,rashoumonTemplate} from './rashoumon.js';
import {dokiEquipment} from './doki-equipment.js';
import {normalizeSummonProfile,skillKey,summonNCCap,summonContractFamily,summonGroupError,SUMMON_REVISION} from './summon-rules.js';
const SYS='shini-no-sho-altered', ROOT=`systems/${SYS}/integrated`;
let SPECIES=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Math.max(0,Number(v)||0);
const skmap={'acrobatics':'acrobacia','athletics':'atletismo','escape':'escapar','stealth':'furtividade','search':'procurar','alertness':'prontidao','tracking':'rastrear','medicine':'medicina','natural sciences':'ciencias','concentration':'concentracao','disguise':'disfarce'};

function speciesSize(p,nc){
 const locked=fixedSize(p);
 if(locked)return locked;
 const name=String(p.name||'').toLowerCase();
 if(/bee swarm/.test(name))return nc>=14?'huge':nc>=12?'large':'medium';
 return 'medium';
}
function sizeLegal(p,size,nc){return isSummonSizeLegal(p,size,nc,fixedSize(p));}
function sizeDetails(size){
 return {id:size.id,label:size.label,heightReference:size.height,weightReference:size.weight,strengthModifier:size.str,vigorModifier:size.vig,
 attackVsMedium:size.attack,reachMeters:size.reach,stealthModifier:size.stealth,
 intimidateModifier:size.intimidate,movementMeters:size.move,tokenSquares:size.grid,
 attackNote:'Attack adjustment applies only when target uses Dodge, Block or Anticipate. Recalculate for other size differences.',
 blockNote:'Cannot Block an enemy at least two size categories larger.',
 movementNote:'Final movement cannot fall below 1m.'};
}

function attacks(p){
 if(Array.isArray(p.attackList))return p.attackList.map(a=>[a.name,a.damageType]);
 if(p.dokiWeapon==='club')return [['Club','Bludgeoning'],['Unarmed Strike','Bludgeoning']];
 if(p.dokiWeapon==='claws')return [['Tekko-Kagi — Pair','Slashing/Piercing'],['Unarmed Strike','Bludgeoning']];
 if(p.dokiWeapon==='unarmed')return [['Unarmed Strike','Bludgeoning']];
 const n=p.name.toLowerCase();if(n.includes('spider'))return [['Bite','Piercing'],['Body Strike','Bludgeoning']];if(n.includes('snake'))return [['Bite','Piercing'],['Tail Strike','Bludgeoning']];if(n.includes('eagle'))return [['Claws','Slashing'],['Beak','Piercing']];if(n.includes('dog'))return [['Bite','Piercing']];if(n.includes('slug'))return [['Body Slam','Bludgeoning']];if(n.includes('monkey'))return [['Punch','Bludgeoning'],['Kick','Bludgeoning']];if(n.includes('bee'))return [['Sting','Piercing']];if(n.includes('toad')||n.includes('frog'))return [['Club','Bludgeoning'],['Spear','Piercing'],['Sword','Slashing']];return []}
function list(){return [...SPECIES,...game.actors.filter(a=>a.getFlag(SYS,'customSpecies')).map(a=>a.getFlag(SYS,'customSpecies'))]}
const summonFolderTasks = new Map();

function findSummonFolder(ownerId) {
 return game.folders.find(folder => folder.type === 'Actor' && folder.getFlag(SYS, 'summonerActorId') === ownerId);
}

function ensureSummonFolder(owner) {
 const pending = summonFolderTasks.get(owner.id);
 if (pending) return pending;
 const task = (async () => {
  const folder = findSummonFolder(owner.id);
  if (!folder) return Folder.create({type:'Actor', name:owner.name, flags:{[SYS]:{summonerActorId:owner.id}}});
  if (folder.name !== owner.name) await folder.update({name:owner.name});
  return folder;
 })().finally(() => summonFolderTasks.delete(owner.id));
 summonFolderTasks.set(owner.id, task);
 return task;
}

async function migrateSummonFolders() {
 for (const actor of game.actors) {
  const profile = actor.getFlag(SYS, 'summonProfile');
  const folder = actor.folder;
  if (!profile?.ownerId || folder?.type !== 'Actor' || !folder.name.startsWith('Summons — ') ||
      folder.getFlag(SYS, 'summonerActorId')) continue;
  const owner = game.actors.get(profile.ownerId);
  if (!owner) continue;
  try {
   const target = await ensureSummonFolder(owner);
   await actor.update({folder:target.id});
  } catch (error) {
   console.error('Could not move existing summon to its summoner folder', actor.id, error);
  }
 }
}

async function actorFor(p,nc,owner,mode,sizeId){
 const summonerUsers=game.users.filter(u=>!u.isGM&&owner.testUserPermission(u,'OWNER'));
 const primary=summonerUsers.find(u=>u.active)||summonerUsers[0]||game.user;
 const folder=await ensureSummonFolder(owner);
 // Foundry permissions belong to Actors, not folders. The folder only shows documents the player can see.
 const summonOwnership={default:0,[primary.id]:3};

 const img=p.image||`${ROOT}/assets/${p.token_file||'summons/eagle.webp'}`;
 const skills=String(p.skills||'').split(',').map(s=>s.trim()).filter(Boolean);
 const size=sizeById(fixedSize(p)||sizeId||speciesSize(p,nc));
 const profile=profileFor(p,nc,size,{ownerId:owner.id,commonPenalty:mode==='common'?p.commonPenalty??-3:0});
 const actor=await Actor.create({system:{cabecalho:{nc},energias:{tamanho:size.label,alcance:`${size.reach}m`}},name:`${p.name} (NC ${nc})`,type:'personagem',img,folder:folder.id,ownership:summonOwnership,prototypeToken:{name:p.name,width:size.grid,height:size.grid,texture:{src:img},actorLink:true,disposition:1},flags:{[SYS]:{summonProfile:profile,kuchiyoseSpecies:p,summonRulesRevision:SUMMON_REVISION}}});
 if(nc<4)await actor.update({'system.energias.vitalidade.value':actor.system.energias.vitalidade.max});
 const items=summonItems(p,nc,skills);
 if(items.length)await actor.createEmbeddedDocuments('Item',items);
 return actor;
}

function profileFor(p,nc,size,extra={}){
 return {size:sizeDetails(size),species:p.name,nc,source:p.source,page:p.page,primaryAttributes:p.key_attributes,
 skills:String(p.skills||'').split(',').map(s=>s.trim()).filter(Boolean),aptitudes:p.aptitudes||'',techniques:p.techniques||'',powerOptions:p.powerOptions||'None',
 attacks:attacks(p),powerPoints:Math.floor(nc/2),intelligenceZero:!!p.intelligenceZero,oneVitality:!!p.oneVitality,henchman:!!p.henchman,
 attributeAllocationRequired:nc>=4,attributePointBudget:nc>=4?12+6*(nc-4):0,attributePointsSpent:0,
 skillRules:'Species skills use their linked attribute as accuracy; other skills are zero. Listed specialties restrict use (e.g. Athletics: swimming only). Vitality is half normal. NC below 4: all accuracy zero, no damaging attacks.',
 aptitudeRules:'Choose three free aptitudes from allowed options, respecting prerequisites. Further aptitudes require purchase. Only one allowed power; power points floor(NC/2). Summoner techniques are not creature powers.',
 notes:p.notes||'',sourceNotes:p.notes||'',...extra};
}
function summonItems(p,nc,skills){
 const img=p.image||`${ROOT}/assets/${p.token_file||'summons/eagle.webp'}`;
 const flag=(key,extra={})=>({[SYS]:{summonContentKey:key,...extra}});
 const weapons=p.dokiWeapon?dokiEquipment(p,nc):(p.attackList||attacks(p).map(([name,damageType])=>({name,damageType,category:'natural'}))).map(a=>({name:`${a.name} (${a.damageType})`,type:'equipamento',img,system:{descricao:'Species attack. Base melee damage = max(3, Strength − 3), +1 only for a martial weapon. Ignore ordinary Weapon Damage. NC below 4 cannot deal attack damage.',weaponCategory:a.category||'natural',weaponDamage:0,damageType:a.damageType.toLowerCase().includes('slashing')?'slashing':a.damageType.toLowerCase().includes('piercing')?'piercing':'bludgeoning',attackType:'melee',equipped:true,quantidade:1},flags:flag('attack:'+`${a.name} (${a.damageType})`,{summonAttack:true,noDamage:nc<4,baseDamageFormula:'max(3, Strength - 3) + (martial ? 1 : 0)'})}));
 return [...weapons,...String(p.aptitudes||'').split(',').map(x=>x.trim()).filter(Boolean).map(name=>({name:`Allowed Aptitude: ${name}`,type:'aptidao',img,system:{descricao:'Species aptitude OPTION. Choose three free with prerequisites; others require purchase. This reference is not itself an active aptitude.'},flags:flag('aptitude:'+name,{summonAllowedAptitude:true})})),...skills.map(name=>({name:`Skill: ${name}`,type:'aptidao',img,system:{descricao:'Innate species skill: use its linked attribute for accuracy, not purchased skill points. Respect any specialty in parentheses; unlisted skills are zero.'},flags:flag('skill:'+skillKey(name),{speciesSkill:true,skillKey:skillKey(name)})})),
 ...(p.innateAbilities||[]).map(a=>({name:(a.summonerOnly?'Summoner Technique: ':'Innate: ')+a.name,type:'aptidao',img,system:{descricao:[a.summonerOnly?'Performed by the summoner; not a creature grant.':'Species ability; enforce prerequisites before use.',a.prerequisites?'Requirements: '+a.prerequisites:'',a.rules,'Source: '+p.source+', p. '+p.page,'Resolve actions, variable costs, targets and ongoing effects manually from this card.'].filter(Boolean).join('\n\n')},flags:flag('ability:'+a.name,{summonTechnique:true,summonerOnly:!!a.summonerOnly})})),
 {name:'Power Choice: '+(p.powerOptions||'None'),type:'aptidao',img,system:{descricao:'OPTION, not a free grant. '+(p.powerOptions||'None')+'. One power maximum, floor(NC/2) power points. Standard summon elemental effects: Cannon, Orb, Arrows, Column, Destructive Breath, Lightning Bolt, Missile, Ricochet, subject to species restrictions. Species effects listed as innate do not require buying the full power.'},flags:flag('power-options',{summonTechnique:true})}];
}
export async function loadKuchiyoseSpecies(){
 if(SPECIES.length)return SPECIES;
 const response=await fetch(`${ROOT}/data/sns-kuchiyose-actors__summons.json`);
 if(!response.ok)throw Error('Could not load Kuchiyose species: '+response.status);
 const rows=await response.json();if(!Array.isArray(rows))throw Error('Invalid Kuchiyose catalog.');
 SPECIES=rows;return SPECIES;
}
export function buildKuchiyoseTemplate(p){
 if(p.specialSummon==='rashoumon')return rashoumonTemplate();
 const locked=fixedSize(p),size=sizeById(locked||speciesSize(p,4));
 const nc=locked?4:Math.max(4,Number.isFinite(size.minNC)?size.minNC:4);
 const skills=String(p.skills||'').split(',').map(s=>s.trim()).filter(Boolean);
 const img=p.image||`${ROOT}/assets/${p.token_file||'summons/eagle.webp'}`;
 const profile=profileFor(p,nc,size,{template:true});
 const text=[
  'Kuchiyose species template — allocate attributes and energies at the chosen NC before combat.',
  'Use the summoner sheet Summon Creature button to apply chakra costs, contract restrictions and scene usage. Dragging this template onto a scene does not spend chakra.',
  'Source: '+(p.source||'Catalog')+'; page '+(p.page||'not specified'),
  'Group: '+(p.group||'Other Kuchiyose'),
  'Primary attributes: '+(p.key_attributes||'See source'),
  'Species skills: '+(p.skills||'See source'),
  'Allowed aptitude OPTIONS (choose three free, respecting prerequisites): '+(p.aptitudes||'See source'),
  'Allowed power choice: '+(p.powerOptions||'None'),
  'Innate / conditional / summoner techniques: '+(p.techniques||'None'),
  'Listed attacks: '+(p.attacks_description||attacks(p).map(a=>a.join(' — ')).join('; ')||'See source; no attack invented'),
  'Prerequisite: '+(p.prerequisite||'Follow species and summoning source rules'),
  'Size: '+size.label+'; template NC '+nc+' is a starting value for this compendium template.',
  'NC 4: 12 attribute points. Higher NC: allocate according to the source progression. Vitality is half normal; power points are floor(NC/2). Check source exceptions.',
  p.notes||'',p.stats_status||''
 ].filter(Boolean).join('\n\n');
 const items=summonItems(p,nc,skills);
 items.unshift({name:'Species Profile & Summoning Rules',type:'aptidao',img,system:{descricao:text},flags:{[SYS]:{summonReference:true,summonContentKey:'profile'}}});
 return {name:p.name,type:'personagem',img,system:{cabecalho:{nc},energias:{tamanho:size.label,alcance:`${size.reach}m`}},prototypeToken:{name:p.name,width:size.grid,height:size.grid,texture:{src:img},actorLink:false,disposition:1},items,flags:{[SYS]:{kuchiyoseCompendiumKey:p.name,kuchiyoseTemplateVersion:2,summonRulesRevision:SUMMON_REVISION,...(p.dokiWeapon?{dokiLoadoutVersion:2}:{}),summonTemplate:true,kuchiyoseSpecies:p,summonProfile:profile}}};
}

function freePosition(t,scene,squares=1,spawned=[]){
 const g=scene.grid.size||100,w=squares*g,h=squares*g;
 const tx=t.document.x,ty=t.document.y,tw=t.document.width*g,th=t.document.height*g;
 const occupied=[...scene.tokens,...spawned].map(v=>({x:v.x,y:v.y,w:(v.width||1)*g,h:(v.height||1)*g}));
 const blocked=(x,y)=>occupied.some(o=>x<o.x+o.w&&x+w>o.x&&y<o.y+o.h&&y+h>o.y);
 const candidates=[];
 for(let ring=0;ring<=12;ring++)for(let dy=-ring-1;dy<=ring+1;dy++)for(let dx=-ring-1;dx<=ring+1;dx++){
   const x=tx+dx*g,y=ty+dy*g;
   if(x<0||y<0||x+w>scene.dimensions.width||y+h>scene.dimensions.height||blocked(x,y))continue;
   const gapX=Math.max(0,tx-(x+w),x-(tx+tw)),gapY=Math.max(0,ty-(y+h),y-(ty+th));
   const distance=Math.hypot(gapX,gapY);
   if(distance<=ring*g+0.01)candidates.push({x,y,distance,offset:Math.abs(dx)+Math.abs(dy)});
 }
 candidates.sort((a,b)=>a.distance-b.distance||a.offset-b.offset);
 return candidates[0]?{x:candidates[0].x,y:candidates[0].y}:null;
}
async function summon(owner,selections,level,mode){
 const qty=selections.length;
 if(qty===1&&selections[0].profile?.specialSummon==='rashoumon')return openRashoumonDialog(owner);
 if(!game.user.isGM)return ui.notifications.warn('GM permission required to spawn and deduct chakra.');
 const token=canvas.tokens.controlled.find(t=>t.actor?.id===owner.id);if(!token)return ui.notifications.warn('Select the summoner token on the canvas.');
 const scene=canvas.scene;if(!scene)return ui.notifications.warn('Open a scene first.');
 const known=num(owner.getFlag(SYS,'kuchiyoseLevel'));if(!known||level<1||level>known)return ui.notifications.warn(`Set Kuchiyose level; power used must be 1–${known}.`);
 const pact=owner.getFlag(SYS,'summonContract');
 const pactFamily=SPECIES.find(s=>s.name===pact)?.contract||pact;
 const profiles=selections.map(({profile})=>profile);
 const error=summonGroupError(profiles,pactFamily);
 if(error)return ui.notifications.warn(error);
 const plans=[];
 for(const {profile,nc,sizeId} of selections){
  if(profile.name==='Giant Bee'&&level<8)return ui.notifications.warn('Giant Bee requires Bee Kuchiyose 8.');
  const cap=summonNCCap(profile,level,qty);
  if(!Number.isInteger(nc)||!Number.isInteger(level)||nc>cap||nc<0)return ui.notifications.warn(`${profile.name}: NC must be 0–${cap}.`);
  const size=sizeById(fixedSize(profile)||sizeId||speciesSize(profile,nc));
  if(!sizeLegal(profile,size.id,nc))return ui.notifications.warn(`Size ${size.label} is not allowed for ${profile.name} at NC ${nc}.`);
  plans.push({profile,nc,size});
 }
 const used=owner.getFlag(SYS,'summonSceneUsage')||{};const count=used.scene===scene.id?num(used.count):0;
 const limit=profiles.some(profile=>profile.singlePerScene)?1:2;
 if(count>=limit)return ui.notifications.warn(`Summoning limit for this scene reached (${limit}).`);
 if(count&&mode==='hijutsu'&&used.restricted!==false)return ui.notifications.warn('The extra scene use must be Common Power, with its common-power penalties.');
 if(count&&mode==='common'&&(used.common===true||used.restricted===false))return ui.notifications.warn('Common Power summoning already used this scene.');
 const cost=level*2,available=num(owner.system?.energias?.chakra?.value);if(available<cost)return ui.notifications.warn(`Need ${cost} chakra; have ${available}.`);
 const names=plans.map(({profile,nc})=>`${esc(profile.name)} (NC ${nc})`).join(', ');
 if(!await Dialog.confirm({title:'Kuchiyose',content:`<p>Summon ${names}, spending ${cost} chakra and one standard action?</p>`}))return;
 const spawned=[];let paid=false;
 try{
  await owner.update({'system.energias.chakra.value':available-cost});paid=true;
  for(const {profile:p,nc,size} of plans){
   const actor=await actorFor(p,nc,owner,mode,size.id);
   if(p.oneVitality)await actor.update({'system.energias.vitalidade.max':1,'system.energias.vitalidade.value':1});
   const pos=freePosition(token,scene,size.grid,spawned);
   if(!pos)throw new Error('No available map space for summon size.');
   const td=await actor.getTokenDocument({...pos,width:size.grid,height:size.grid,actorLink:true,flags:{[SYS]:{summonedBy:owner.id,summonScene:scene.id}}});
   const docs=await scene.createEmbeddedDocuments('Token',[td.toObject()]);spawned.push(...docs);

  }
  if(!pact)await owner.setFlag(SYS,'summonContract',summonContractFamily(profiles[0]));await owner.setFlag(SYS,'summonSceneUsage',{scene:scene.id,count:count+1,restricted:(used.scene===scene.id&&!!used.restricted)||mode==='hijutsu',common:(used.scene===scene.id&&!!used.common)||mode==='common'});
  ui.notifications.info(`Summoned ${qty} creature(s); ${cost} chakra spent. Open the linked Actor sheet to allocate attributes.`);
 }catch(err){console.error('Kuchiyose error',err);if(spawned.length)await scene.deleteEmbeddedDocuments('Token',spawned.map(t=>t.id));if(paid)await owner.update({'system.energias.chakra.value':available});ui.notifications.error('Summoning failed; chakra refunded. Check console.');}
}
function dialog(owner){
 const catalog=list();
 const pact=owner.getFlag(SYS,'summonContract');
 const pactFamily=catalog.find(profile=>profile.name===pact)?.contract||pact;
 const usage=owner.getFlag(SYS,'summonSceneUsage');
 const usedHere=usage?.scene===canvas.scene?.id&&usage?.count>0;
 const defaultMode=usedHere&&usage.restricted===true&&!usage.common?'common':'hijutsu';
 const matching=profile=>!pactFamily||summonContractFamily(profile)===pactFamily;
 const firstMatch=catalog.findIndex(profile=>matching(profile)&&profile.specialSummon!=='rashoumon');
 const options=catalog.map((profile,index)=>`<option value="${index}" ${matching(profile)||profile.specialSummon==='rashoumon'?'':'disabled'}>${esc(profile.name)} (${esc(profile.group)})</option>`).join('');
 const quantities=Array.from({length:8},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
 const rowMarkup=(index)=>`<fieldset class="sns-creature-row"><legend>Creature ${index+1}</legend>
  <div class="form-group"><label>Creature</label><select name="species" aria-label="Creature ${index+1}">${options}</select></div>
  <div class="form-group"><label>NC</label><input type="number" name="nc" min="0" value="4" aria-label="Creature ${index+1} NC"></div>
  <div class="form-group"><label>Size</label><select name="size" aria-label="Creature ${index+1} size"></select></div>
  <p class="sns-size-info"></p></fieldset>`;
 const readRows=html=>html.find('.sns-creature-row').toArray().map(element=>{
  const row=$(element);
  return {profile:catalog[Number(row.find('[name=species]').val())],
   nc:Number(row.find('[name=nc]').val()),sizeId:row.find('[name=size]').val()};
 });
 new Dialog({
  title:'Kuchiyose — Summon Creature',
  content:`<form><div class="form-group"><label>Power level used</label><input type="number" name="level" min="1" value="${num(owner.getFlag(SYS,'kuchiyoseLevel'))||1}"></div>
   <div class="form-group"><label>Quantity</label><select name="qty">${quantities}</select></div>
   ${pactFamily?`<p>Blood contract: <strong>${esc(pactFamily)}</strong></p>`:""}
   <div class="sns-creature-rows" style="max-height:45vh;overflow:auto">${rowMarkup(0)}</div>
   <div class="form-group"><label>Kuchiyose type</label><select name="mode"><option value="hijutsu">Restricted Hijutsu</option><option value="common">Common Power (−3)</option></select></div>
   <p class="sns-qty-help"></p><p>A GM must allocate NC 4+ attributes and energies using the character creation table.</p></form>`,
  buttons:{cast:{label:'Summon',callback:html=>summon(owner,readRows(html),Number(html.find('[name=level]').val()),html.find('[name=mode]').val())}},
  render:html=>{
   const rows=html.find('.sns-creature-rows');
   if(firstMatch>=0)rows.find('[name=species]').val(String(firstMatch));
   html.find('[name=mode]').val(defaultMode);
   const update=()=>{
    const first=readRows(html)[0]?.profile;
    const special=first?.specialSummon==='rashoumon';
    const quantity=html.find('[name=qty]');
    if(special)quantity.val('1');
    html.find('[name=qty], [name=level], [name=mode]').prop('disabled',special);
    const qty=Number(quantity.val());
    while(rows.children().length>qty)rows.children().last().remove();
    while(rows.children().length<qty){
     const index=rows.children().length;
     const selected=readRows(html).map(({profile})=>profile);
     const variant=first?.dokiWeapon&&catalog.find(p=>p.contract===first.contract&&p.dokiWeapon&&!selected.some(s=>s?.dokiWeapon===p.dokiWeapon));
     const row=$(rowMarkup(index)).appendTo(rows);
     row.find('[name=species]').val(String(catalog.indexOf(variant||first)));
    }
    if(special){
     rows.find('[name=nc], [name=size]').prop('disabled',true);
     rows.find('.sns-size-info').text('Rashoumon uses its own gate selector and aptitude requirements.');
     html.find('.sns-qty-help').text('Click Summon to choose the gate quantity.');
     return;
    }

    const level=Math.max(1,Number(html.find('[name=level]').val())||1);
    rows.children().each((_,element)=>{
     const row=$(element);
     const profile=catalog[Number(row.find('[name=species]').val())];
     if(!profile)return;
     const ncInput=row.find('[name=nc]');
     const cap=summonNCCap(profile,level,qty);
     ncInput.prop('disabled',false).attr('max',cap);
     const locked=fixedSize(profile);
     if(Number(ncInput.val())>cap)ncInput.val(cap);
     const nc=Number(ncInput.val());
     const choices=locked?[locked]:NORMAL_SUMMON_SIZES;
     const sizes=SNS_SIZE_TABLE.filter(size=>choices.includes(size.id));
     const legal=sizes.filter(size=>sizeLegal(profile,size.id,nc));
     const select=row.find('[name=size]');
     const preferred=[select.val(),speciesSize(profile,nc)].find(id=>legal.some(size=>size.id===id));
     const selected=legal.find(size=>size.id===preferred)??legal[0];
     select.html(sizes.map(size=>`<option value="${size.id}" ${legal.includes(size)?'':'disabled'}>${esc(size.label)}</option>`).join(''))
      .val(selected?.id??'').prop('disabled',Boolean(locked));
     const info=selected?`${locked?'Locked size':'Selected size'}: ${selected.label} · ${selected.grid}×${selected.grid} squares · Maximum NC ${cap} · Reach ${selected.reach}m · Strength/Vigor ${selected.str} · Stealth ${selected.stealth} · Intimidate ${selected.intimidate} · Movement ${selected.move}m`
      :`No legal size at NC ${nc}. Adjust the power level or NC (maximum ${cap}).`;
     row.find('.sns-size-info').text(info);
    });
    const error=summonGroupError(readRows(html).map(({profile})=>profile),pactFamily);
    html.find('.sns-qty-help').text(error||`One cast · ${2*level} chakra (current: ${num(owner.system?.energias?.chakra?.value)})`);
   };
   html.on('change','[name=qty], [name=species]',update);
   html.on('change input','[name=level], [name=nc]',update);
   update();
  }
 }).render(true);
}
const summonRosters = new Map();

function summonRoster(owner, scene) {
 const active = new Set((scene ? activeSummons(scene, owner.id) : [])
  .filter(token => game.user.isGM || !token.hidden).map(token => token.actorId));
 return game.actors.filter(actor =>
  actor.getFlag(SYS, 'summonProfile')?.ownerId === owner.id &&
  actor.testUserPermission(game.user, 'OBSERVER')
 ).map(actor => ({
  actor,
  active: active.has(actor.id),
  vitality: actor.system?.energias?.vitalidade,
  nc: actor.system?.cabecalho?.nc,
  size: actor.getFlag(SYS, 'summonProfile').size?.label
 })).sort((a,b) => Number(b.active) - Number(a.active) || a.actor.name.localeCompare(b.actor.name));
}

function drawSummonRoster(owner, roster) {
 const rows = summonRoster(owner, globalThis.canvas?.scene);
 roster.html(rows.length ? rows.map(({actor, active, vitality, nc, size}) => {
  const details = [
   active ? 'On this scene' : 'Off this scene',
   nc === undefined ? '' : `NC ${nc}`,
   size,
   vitality ? `Vitality ${vitality.value} / ${vitality.max}` : '',
   vitality?.value === 0 ? 'Defeated' : ''
  ].filter(Boolean).join(' · ');
  return `<li><button type="button" class="sns-open-summon" data-summon-id="${esc(actor.id)}">${esc(actor.name)}</button> <span>${esc(details)}</span>${active && game.user.isGM ? ` <button type="button" class="sns-roster-dismiss" data-summon-id="${esc(actor.id)}">Desummon</button>` : ''}</li>`;
 }).join('') : '<li>No creatures summoned by this actor yet.</li>');
}

function refreshSummonRosters(ownerId) {
 for (const [id, {owner, roster}] of summonRosters) {
  if (!roster[0]?.isConnected) {
   summonRosters.delete(id);
   continue;
  }
  if (ownerId === undefined || owner.id === ownerId) drawSummonRoster(owner, roster);
 }
}

function refreshSummonToken(token) {
 if (token.parent?.id !== globalThis.canvas?.scene?.id) return;
 const ownerId = token.getFlag(SYS, 'summonedBy');
 if (ownerId) refreshSummonRosters(ownerId);
}

Hooks.on('createToken', refreshSummonToken);
Hooks.on('deleteToken', refreshSummonToken);
Hooks.on('updateToken', (token, changes) => {
 if ('hidden' in changes) refreshSummonToken(token);
});
Hooks.on('canvasReady', () => refreshSummonRosters());
for (const hook of ['createActor', 'updateActor', 'deleteActor']) {
 Hooks.on(hook, actor => {
  const ownerId = actor.getFlag(SYS, 'summonProfile')?.ownerId;
  if (ownerId) refreshSummonRosters(ownerId);
 });
}

function activeSummons(scene, ownerId) {
 return scene.tokens.filter(token =>
  token.getFlag(SYS, 'summonedBy') === ownerId ||
  (token.getFlag(SYS, 'rashoumonGate') === true && token.getFlag(SYS, 'rashoumonOwner') === ownerId)
 );
}

function openDesummonDialog(owner, actorId = null) {
 if (!game.user.isGM) return ui.notifications.warn('GM permission required to desummon creatures.');
 const scene = canvas.scene;
 if (!scene) return ui.notifications.warn('Open a scene first.');
 const summons = activeSummons(scene, owner.id).filter(token => !actorId || token.actorId === actorId);
 if (!summons.length) return ui.notifications.info('This summoner has no active summons on this scene.');
 const options = summons.map(token => `<option value="${esc(token.id)}">${esc(token.name)}</option>`).join('');
 const all = summons.length > 1 ? '<option value="all">All listed summons</option>' : '';
 return new Dialog({
  title: 'Desummon',
  content: `<form><div class="form-group"><label for="sns-desummon-target">Summon</label><select id="sns-desummon-target" name="summon">${options}${all}</select></div></form>`,
  buttons: {
   dismiss: {
    label: 'Desummon',
    callback: async html => {
     if (!game.user.isGM || canvas.scene?.id !== scene.id) return ui.notifications.warn('Return to the summon’s scene first.');
     const choice = html.find('[name=summon]').val();
     const selected = new Set(summons.filter(token => choice === 'all' || token.id === choice).map(token => token.id));
     const ids = activeSummons(scene, owner.id).filter(token => selected.has(token.id)).map(token => token.id);
     if (!ids.length) return ui.notifications.info('Those summons have already left the scene.');
     try {
      const removed = await scene.deleteEmbeddedDocuments('Token', ids);
      ui.notifications.info(`Desummoned ${removed.length} summon(s).`);
     } catch (error) {
      console.error('Kuchiyose desummon failed', error);
      ui.notifications.error('Could not remove the selected summons.');
     }
    }
   },
   cancel: {label: 'Cancel'}
  },
  default: 'cancel'
 }).render(true);
}

function createCustom(owner){if(!game.user.isGM)return ui.notifications.warn('GM required.');new Dialog({title:'Create Custom Summon',content:'<form><label>Name <input name="name"></label><label>Image path <input name="img"></label><label>Skills (comma-separated) <input name="skills"></label></form>',buttons:{create:{label:'Create',callback:async html=>{const get=k=>String(html.find(`[name="${k}"]`).val()||'').trim();if(!get('name'))return ui.notifications.warn('Name required.');const p={name:get('name'),image:get('img'),skills:get('skills'),group:'Custom',source:'User-defined',key_attributes:'',notes:'Custom profile; assign aptitudes, attacks, and statistics manually.'};const a=await actorFor(p,4,owner,'hijutsu');await a.setFlag(SYS,'customSpecies',p);a.sheet.render(true);}}}}).render(true)}
Hooks.once('ready',async()=>{try{await loadKuchiyoseSpecies()}catch(e){console.error(e);ui.notifications.warn('Could not load Kuchiyose species.')}});
Hooks.once('ready', () => {
 if (game.user.isGM && (!game.users.activeGM || game.users.activeGM.id === game.user.id)) return migrateSummonFolders();
});
Hooks.on('updateActor', async (actor, changes) => {
 if (!game.user.isGM || (game.users.activeGM && game.users.activeGM.id !== game.user.id) ||
     actor.isToken || !('name' in changes)) return;
 const folder = findSummonFolder(actor.id);
 if (folder && folder.name !== actor.name) await folder.update({name:actor.name});
});
Hooks.on('renderActorSheet',(app,html)=>{if(app.actor.flags?.[SYS]?.puppetProfile||app.actor.flags?.[SYS]?.rashoumonGate||app.actor.type!=='personagem'||!app.isEditable||app.actor.getFlag(SYS,'summonProfile')||app.actor.getFlag(SYS,'summonTemplate'))return;const root=html instanceof jQuery?html:$(html);if(root.find('.sns-kuchiyose-engine').length)return;
 const panel=$(`<section class="sns-kuchiyose-engine">
  <div class="sns-kuchiyose-toolbar">
   <strong>Kuchiyose</strong>
   <label>Power level <input class="sns-klevel" type="number" min="0" value="${num(app.actor.getFlag(SYS,'kuchiyoseLevel'))}"></label>
   <button type="button" class="sns-cast">Summon Creature</button>
   <button type="button" class="sns-desummon">Desummon</button>
   <button type="button" class="sns-open-kuchiyose">Summon Compendium</button>
   <button type="button" class="sns-open-puppets">Puppets</button>
   <button type="button" class="sns-size-reference">Size Reference</button>
   ${game.user.isGM ? `<button type="button" class="sns-custom">+ Custom Summon</button>
   <button type="button" class="sns-reset-scene" title="GM: reset usage when a new scene begins">Reset Uses</button>` : ''}
  </div>
  <details class="sns-kuchiyose-roster">
   <summary>Summoned Creatures</summary>
   <ul class="sns-summon-roster"></ul>
  </details>
 </section>`);
 const target=root.find('.sheet-body').first();(target.length?target:root.find('form').first()).prepend(panel);
 const roster = panel.find('.sns-summon-roster');
 summonRosters.set(app, {owner: app.actor, roster});
 drawSummonRoster(app.actor, roster);
 roster.on('click', '.sns-open-summon', event => {
  const actor = game.actors.get(event.currentTarget.dataset.summonId);
  if (actor?.getFlag(SYS, 'summonProfile')?.ownerId === app.actor.id &&
      actor.testUserPermission(game.user, 'OBSERVER')) actor.sheet?.render(true);
 });
 roster.on('click', '.sns-roster-dismiss', event => {
  openDesummonDialog(app.actor, event.currentTarget.dataset.summonId);
 });
 panel.find('.sns-open-puppets').on('click',()=>{const pack=game.packs.get('world.sns-puppets');if(pack)pack.render(true);else ui.notifications.warn('The GM can build Puppets — Initial Types in System Settings.');});panel.find('.sns-size-reference').on('click',()=>openSnsSizeReference());panel.find('.sns-klevel').on('change',e=>app.actor.setFlag(SYS,'kuchiyoseLevel',num(e.target.value)));panel.find('.sns-cast').on('click',()=>dialog(app.actor));panel.find('.sns-desummon').on('click',()=>openDesummonDialog(app.actor));panel.find('.sns-open-kuchiyose').on('click',()=>{const pack=game.packs.get('world.sns-kuchiyose');if(pack)pack.render(true);else ui.notifications.warn('Ask the GM to build the Kuchiyose compendium in System Settings.');});panel.find('.sns-custom').on('click',()=>createCustom(app.actor));panel.find('.sns-reset-scene').on('click',async()=>{if(!game.user.isGM)return ui.notifications.warn('GM only.');const yes=await Dialog.confirm({title:'Reset Kuchiyose Uses',content:'Reset this character’s Kuchiyose uses for the current scene? Use only when beginning a new scene.'});if(yes){await app.actor.setFlag(SYS,'summonSceneUsage',{scene:canvas.scene?.id||'',count:0});ui.notifications.info('Kuchiyose uses reset for this scene.');}});});
Hooks.on('renderActorSheet',(app,html)=>{
 const actor=app.actor,profile=normalizeSummonProfile(actor.getFlag(SYS,'summonProfile'));
 if(!profile||!actor.testUserPermission(game.user,'OWNER'))return;
 const root=html instanceof jQuery?html:$(html);
 if(root.find('.sns-summon-allocation').length)return;
 const block=$(`<section class="sns-summon-allocation" style="padding:8px;margin:6px;border:1px solid #887a59"><strong>Summoned Creature — ${esc(profile.species)}</strong><p>NC ${actor.system.cabecalho.nc}; size ${esc(profile.size.label)}; attribute allocation: ${Number(actor.system.cabecalho.nc)>=4?12+6*(Number(actor.system.cabecalho.nc)-4):0} points (12 at NC4, +6 per NC). Edit attributes normally on this Actor sheet. Size modifiers are listed in the summon profile and are not automatically added to the base attributes.</p></section>`);
 const stats=root.find('.tab[data-tab="status"]').first();(stats.length?stats:root.find('.sheet-body').first()).prepend(block);
});
Hooks.on('updateActor',async(actor,changes)=>{const vitalityChanged=Object.hasOwn(changes||{},'system.energias.vitalidade.value')||changes?.system?.energias?.vitalidade?.value!==undefined;if(!vitalityChanged)return;if(!game.user.isGM||!actor.getFlag(SYS,'summonProfile')||num(actor.system?.energias?.vitalidade?.value)>0)return;for(const scene of game.scenes){const tokens=scene.tokens.filter(t=>t.actorId===actor.id&&t.getFlag(SYS,'summonedBy'));if(tokens.length)await scene.deleteEmbeddedDocuments('Token',tokens.map(t=>t.id))}});





