const SYS='shinobi-no-sho-revamp', ROOT=`systems/${SYS}/integrated`;
let SPECIES=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Math.max(0,Number(v)||0);
const skmap={'acrobatics':'acrobacia','athletics':'atletismo','escape':'escapar','stealth':'furtividade','search':'procurar','alertness':'prontidao','tracking':'rastrear','medicine':'medicina','natural sciences':'ciencias','concentration':'concentracao','disguise':'disfarce'};

// Size table, translated from the user's page 271 screenshot. Duplicate translated
// names are disambiguated by rank; 1 grid square represents the 1m baseline.
const SNS_SIZE_TABLE=[
 {id:'minute',label:'Tiny (smallest)',str:-7,vig:-7,attack:2,reach:1,stealth:5,intimidate:-2,move:-12,grid:0.5,minNC:0},
 {id:'tiny',label:'Tiny',str:-5,vig:-5,attack:1,reach:1,stealth:3,intimidate:-2,move:-9,grid:0.5,minNC:0},
 {id:'child',label:'Kid',str:-3,vig:-3,attack:1,reach:1,stealth:2,intimidate:-1,move:-6,grid:0.5,minNC:0},
 {id:'small',label:'Small',str:-1,vig:-1,attack:0,reach:1,stealth:1,intimidate:-1,move:-3,grid:1,minNC:0},
 {id:'medium',label:'Average / Medium',str:0,vig:0,attack:0,reach:1,stealth:0,intimidate:0,move:0,grid:1,minNC:0},
 {id:'large',label:'Big / Large',str:1,vig:1,attack:0,reach:2,stealth:-1,intimidate:1,move:3,grid:2,minNC:12},
 {id:'huge',label:'Huge',str:3,vig:3,attack:0,reach:3,stealth:-2,intimidate:1,move:6,grid:3,minNC:14},
 {id:'gargantuan',label:'Gargantuan (Immense tier)',str:5,vig:5,attack:0,reach:4,stealth:-3,intimidate:2,move:9,grid:4,minNC:16},
 {id:'colossal',label:'Colossal',str:7,vig:7,attack:0,reach:5,stealth:-5,intimidate:2,move:12,grid:5,minNC:Infinity},
 {id:'incredible',label:'Incredible',str:9,vig:9,attack:0,reach:6,stealth:-7,intimidate:3,move:15,grid:6,minNC:Infinity}
];
function sizeById(id){if(id==='immense')id='gargantuan';return SNS_SIZE_TABLE.find(s=>s.id===id)||SNS_SIZE_TABLE[4]}
function speciesSize(p,nc){
 const locked=fixedSize(p);
 if(locked)return locked;
 const name=String(p.name||'').toLowerCase();
 if(/bee swarm/.test(name))return nc>=12?'large':'medium';
 return 'medium';
}
function fixedSize(p){
 // Catalog fixedSize is authoritative for named summons, including Animal Path.
 if(p.fixedSize)return p.fixedSize;
 const n=String(p.name||'').toLowerCase();
 if(/doki/.test(n))return 'huge';
 if(/bee \(individual\)/.test(n))return 'tiny';
 if(/giant bee/.test(n))return 'huge';
 if(/ordinary spider|spider \(ordinary\)/.test(n))return 'medium';
 return null;
}
function sizeLegal(p,size,nc){
 const fixed=fixedSize(p);
 if(fixed&&size!==fixed)return false;
 const s=sizeById(size);
 if(nc<s.minNC)return false;
 const name=String(p.name||'').toLowerCase();
 if(/bee swarm/.test(name)&&size!==(nc>=12?'large':'medium'))return false;
 return true;
}
function sizeDetails(size){
 return {id:size.id,label:size.label,strengthModifier:size.str,vigorModifier:size.vig,
 attackVsMedium:size.attack,reachMeters:size.reach,stealthModifier:size.stealth,
 intimidateModifier:size.intimidate,movementMeters:size.move,tokenSquares:size.grid,
 attackNote:'Attack adjustment applies only when target uses Dodge, Block or Anticipate. Recalculate for other size differences.',
 blockNote:'Cannot Block an enemy at least two size categories larger.',
 movementNote:'Final movement cannot fall below 1m.'};
}

function attacks(p){
 if(p.dokiWeapon==='club')return [['Club','Bludgeoning']];
 if(p.dokiWeapon==='claws')return [['Tekko-kagi','Slashing/Piercing']];
 if(p.dokiWeapon==='unarmed')return [['Unarmed Strike','Bludgeoning']];
 const n=p.name.toLowerCase();if(n.includes('spider'))return [['Bite','Piercing'],['Body Strike','Bludgeoning']];if(n.includes('snake'))return [['Bite','Piercing'],['Tail Strike','Bludgeoning']];if(n.includes('eagle'))return [['Claws','Slashing'],['Beak','Piercing']];if(n.includes('dog'))return [['Bite','Piercing']];if(n.includes('slug'))return [['Body Slam','Bludgeoning']];if(n.includes('monkey'))return [['Punch','Bludgeoning'],['Kick','Bludgeoning']];if(n.includes('bee'))return [['Sting','Piercing']];if(n.includes('toad')||n.includes('frog'))return [['Club','Bludgeoning'],['Spear','Piercing'],['Sword','Slashing']];return []}
function list(){return [...SPECIES,...game.actors.filter(a=>a.getFlag(SYS,'customSpecies')).map(a=>a.getFlag(SYS,'customSpecies'))]}
async function actorFor(p,nc,owner,mode,sizeId){
 const summonerUsers=game.users.filter(u=>!u.isGM&&owner.testUserPermission(u,'OWNER'));
 const primary=summonerUsers.find(u=>u.active)||summonerUsers[0]||game.user;
 const folderName=`Summons — ${primary.name}`;
 let folder=game.folders.find(f=>f.type==='Actor'&&f.name===folderName);
 if(!folder)folder=await Folder.create({type:'Actor',name:folderName});
 // Foundry permissions belong to Actors, not folders. The folder only shows documents the player can see.
 const summonOwnership={default:0,[primary.id]:3};

 const img=p.image||`${ROOT}/assets/${p.token_file||'eagle.png'}`;
 const skills=String(p.skills||'').split(',').map(s=>s.trim()).filter(Boolean);
 const size=sizeById(sizeId||speciesSize(p,nc));
 const profile={size:sizeDetails(size),species:p.name,nc,ownerId:owner.id,source:p.source,page:p.page,primaryAttributes:p.key_attributes,skills,aptitudes:p.aptitudes||'',techniques:p.techniques||p.powers||'',attacks:attacks(p),attackTypes:attacks(p).map(a=>({name:a[0],damageType:a[1],attackType:'melee',nonDamaging:nc<4})),skillRules:'Listed species skills use associated attributes; all other skills are 0.',aptitudeRules:'Species aptitude list contains purchase options, not automatic grants.',powerPoints:Math.floor(nc/2),commonPenalty:mode==='common'?-3:0,attributeAllocationRequired:nc>=4,attributePointBudget:nc>=4?12:null,attributePointsSpent:0,notes:p.notes||''};
 const actor=await Actor.create({system:{cabecalho:{nc},energias:{tamanho:size.label,alcance:`${size.reach}m`}},name:`${p.name} (NC ${nc})`,type:'personagem',img,folder:folder.id,ownership:summonOwnership,prototypeToken:{name:p.name,width:size.grid,height:size.grid,texture:{src:img},actorLink:true,disposition:1},flags:{[SYS]:{summonProfile:profile}}});
 if(nc<4)await actor.update({'system.energias.vitalidade.max':1,'system.energias.vitalidade.value':1});
 const items=[...attacks(p).map(([name,type])=>({name:`${name} (${type})`,type:'equipamento',system:{
   descricao:p.dokiWeapon==='claws'?'Tekko-kagi (Advanced Shinobi Guide, pp. 69–72): +3/+1 damage, 15–16 critical, Slashing/Piercing.':`Summon attack. Base melee damage = max(3, Strength − 3); NC below 4 cannot deal attack damage.`,
   weaponCategory:p.dokiWeapon==='claws'?'martial':(p.dokiWeapon==='club'?'simple':'none'),
   damageType:type.toLowerCase().includes('slashing')?'slashing':type.toLowerCase().includes('piercing')?'piercing':'bludgeoning',
   weaponBonus:p.dokiWeapon==='claws'?3:0,criticalRange:p.dokiWeapon==='claws'?'15-16':'15-16',
   attackType:'melee',equipped:true
  },flags:{[SYS]:{summonAttack:true,attackType:'melee',damageType:type,noDamage:nc<4,baseDamageFormula:'max(3, Strength - 3)'}}})),...String(p.aptitudes||'').split(',').map(x=>x.trim()).filter(Boolean).map(name=>({name:`Allowed Aptitude: ${name}`,type:'aptidao',system:{descricao:'Species aptitude OPTION, not automatically granted. Purchase according to NC power points and prerequisites before using.'},flags:{[SYS]:{summonAllowedAptitude:true}}})),...skills.map(s=>({name:`Skill: ${s}`,type:'aptidao',system:{descricao:`Species Skill (not an aptitude purchase). Use the corresponding attribute as skill accuracy; skills not listed for this species are level zero.`},flags:{[SYS]:{speciesSkill:true,skillKey:skmap[s.toLowerCase()]||null}}}))];
 if(items.length)await actor.createEmbeddedDocuments('Item',items);
 return actor;
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
async function summon(owner,p,level,qty,mode,nc,sizeId){
 if(!game.user.isGM)return ui.notifications.warn('GM permission required to spawn and deduct chakra.');
 const token=canvas.tokens.controlled.find(t=>t.actor?.id===owner.id);if(!token)return ui.notifications.warn('Select the summoner token on the canvas.');
 const scene=canvas.scene;if(!scene)return ui.notifications.warn('Open a scene first.');
 const known=num(owner.getFlag(SYS,'kuchiyoseLevel'));if(!known||level<1||level>known)return ui.notifications.warn(`Set Kuchiyose level; power used must be 1–${known}.`);
 const dog=/ninken|dog/i.test(p.name),slug=/slug|katsuyu/i.test(p.name);
 if(qty===8&&!dog)return ui.notifications.warn('Eight helpers only applies to Ninken.');if(qty>2&&qty!==8)return ui.notifications.warn('Maximum two normal summons.');if(slug&&qty!==1)return ui.notifications.warn('Slugs are limited to one summon.');
 const cap=Math.max(0,2*level-(qty===2?2:0));if(nc>cap||nc<0)return ui.notifications.warn(`NC must be 0–${cap}.`);
 const size=sizeById(sizeId||speciesSize(p,nc));if(!sizeLegal(p,size.id,nc))return ui.notifications.warn(`Size ${size.label} is not allowed for ${p.name} at NC ${nc}.`);
 const pact=owner.getFlag(SYS,'summonContract');if(pact&&pact!==p.name&&!(pact.startsWith('Doki (')&&p.name.startsWith('Doki (')))return ui.notifications.warn(`Only one blood contract: ${pact}.`);
 const used=owner.getFlag(SYS,'summonSceneUsage')||{};const count=used.scene===scene.id?num(used.count):0;const limit=mode==='hijutsu'?2:1;if(count>=limit)return ui.notifications.warn(`Summoning limit for this scene reached (${limit}).`);
 const cost=level*2,available=num(owner.system?.energias?.chakra?.value);if(available<cost)return ui.notifications.warn(`Need ${cost} chakra; have ${available}.`);
 if(!await Dialog.confirm({title:'Kuchiyose',content:`<p>Summon ${qty} × ${esc(p.name)} (NC ${nc}), spending ${cost} chakra and one standard action?</p>`}))return;
 const spawned=[];let paid=false;
 try{
  await owner.update({'system.energias.chakra.value':available-cost});paid=true;
  for(let i=0;i<qty;i++){
   const actor=await actorFor(p,nc,owner,mode,size.id);
   if(qty===8)await actor.update({'system.energias.vitalidade.max':1,'system.energias.vitalidade.value':1});
   const pos=freePosition(token,scene,size.grid,spawned);
   if(!pos)throw new Error('No available map space for summon size.');
   const td=await actor.getTokenDocument({...pos,width:size.grid,height:size.grid,actorLink:true,flags:{[SYS]:{summonedBy:owner.id,summonScene:scene.id}}});
   const docs=await scene.createEmbeddedDocuments('Token',[td.toObject()]);spawned.push(...docs);
   // Select new summon for the summoner when their client is performing the summon.
   if(game.user.id===Object.keys(actor.ownership||{}).find(id=>id!=='default'&&actor.ownership[id]>=3)){
     const placed=canvas.tokens.get(docs[0]?.id);if(placed)placed.control({releaseOthers:true});
   }

  }
  if(!pact)await owner.setFlag(SYS,'summonContract',p.name);await owner.setFlag(SYS,'summonSceneUsage',{scene:scene.id,count:count+1});
  ui.notifications.info(`Summoned ${qty} ${p.name}; ${cost} chakra spent. Open the linked Actor sheet to allocate attributes.`);
 }catch(err){console.error('Kuchiyose error',err);if(spawned.length)await scene.deleteEmbeddedDocuments('Token',spawned.map(t=>t.id));if(paid)await owner.update({'system.energias.chakra.value':available});ui.notifications.error('Summoning failed; chakra refunded. Check console.');}
}
function dialog(owner){const opts=list().map((p,i)=>`<option value="${i}">${esc(p.name)} (${esc(p.group)})</option>`).join('');
 new Dialog({title:'Kuchiyose — Summon Creature',content:`<form><div class="form-group"><label>Creature</label><select name="species">${opts}</select></div><div class="form-group"><label>Power level used</label><input type="number" name="level" min="1" value="${num(owner.getFlag(SYS,'kuchiyoseLevel'))||1}"></div><div class="form-group"><label>Quantity</label><select name="qty"><option value="1">1</option><option value="2">2</option><option value="8">8 Ninken helpers</option></select></div><div class="form-group"><label>NC</label><input type="number" name="nc" min="0" value="4"></div><div class="form-group"><label>Creature size (fixed by species / NC)</label><select name="size"></select></div><p class="sns-size-info"></p><div class="form-group"><label>Kuchiyose type</label><select name="mode"><option value="hijutsu">Restricted Hijutsu</option><option value="common">Common Power (−3)</option></select></div><p class="sns-qty-help">Quantity starts at 1 each time. NC cap updates when quantity or level changes.</p><p>A GM must allocate NC 4+ attributes and energies using the character creation table.</p></form>`,buttons:{cast:{label:'Summon',callback:async html=>{const get=k=>html.find(`[name="${k}"]`).val();const p=list()[Number(get('species'))];if(p)await summon(owner,p,num(get('level')),num(get('qty')),get('mode'),num(get('nc')),get('size'));}}},render:html=>{const update=()=>{const profile=list()[Number(html.find('[name=species]').val())];const lv=Math.max(1,Number(html.find('[name=level]').val())||1),qty=Number(html.find('[name=qty]').val())||1;const cap=Math.max(0,2*lv-(qty===2?2:0));const field=html.find('[name=nc]');field.attr('max',cap);if(Number(field.val())>cap)field.val(cap);const suggested=speciesSize(profile||{name:''},Number(field.val()));const previous=html.find('[name=size]').val();const selected=previous&&sizeLegal(profile||{name:''},previous,Number(field.val()))?previous:suggested;
 const six=['tiny','small','medium','large','huge','gargantuan'];
 const available=SNS_SIZE_TABLE.filter(z=>six.includes(z.id));
 const legal=available.filter(z=>sizeLegal(profile||{name:''},z.id,Number(field.val())));
 const effective=legal.some(z=>z.id===selected)?selected:(legal.some(z=>z.id===suggested)?suggested:legal[0]?.id||'');
 
 html.find('[name=size]').html(available.map(z=>`<option value="${z.id}" ${sizeLegal(profile||{name:''},z.id,Number(field.val()))?'':'disabled'}>${esc(z.label)}${sizeLegal(profile||{name:''},z.id,Number(field.val()))?'':' (NC/species restricted)'}</option>`).join('')).val(effective);
 const detail=sizeById(effective||suggested);
 if(!legal.length)html.find('.sns-size-info').text(`No legal size at NC ${field.val()}; increase the power level / NC.`);
 html.find('.sns-size-info').text(`Selected size: ${detail.label}; token ${detail.grid}×${detail.grid} squares; Strength/Vigor ${detail.str>=0?'+':''}${detail.str}; reach ${detail.reach}m; Stealth ${detail.stealth}; Intimidate ${detail.intimidate}; movement ${detail.move>=0?'+':''}${detail.move}m.`);
 html.find('.sns-qty-help').text(`Quantity: ${qty} • Maximum NC: ${cap} • Chakra cost: ${2*lv} (current: ${num(owner.system?.energias?.chakra?.value)}). Quantity resets to 1 when this dialog reopens.`);};html.find('[name=qty], [name=level], [name=species], [name=nc]').on('change input',update);html.find('[name=qty]').val('1');update();}}).render(true);
}
function createCustom(owner){if(!game.user.isGM)return ui.notifications.warn('GM required.');new Dialog({title:'Create Custom Summon',content:'<form><label>Name <input name="name"></label><label>Image path <input name="img"></label><label>Skills (comma-separated) <input name="skills"></label></form>',buttons:{create:{label:'Create',callback:async html=>{const get=k=>String(html.find(`[name="${k}"]`).val()||'').trim();if(!get('name'))return ui.notifications.warn('Name required.');const p={name:get('name'),image:get('img'),skills:get('skills'),group:'Custom',source:'User-defined',key_attributes:'',notes:'Custom profile; assign aptitudes, attacks, and statistics manually.'};const a=await actorFor(p,4,owner,'hijutsu');await a.setFlag(SYS,'customSpecies',p);a.sheet.render(true);}}}}).render(true)}
Hooks.once('ready',async()=>{try{const r=await fetch(`${ROOT}/data/sns-kuchiyose-actors__summons.json`);if(!r.ok)throw Error(r.status);SPECIES=await r.json()}catch(e){console.error(e);ui.notifications.warn('Could not load Kuchiyose species.')}});
Hooks.on('renderActorSheet',(app,html)=>{if(app.actor.type!=='personagem'||!app.isEditable)return;const root=html instanceof jQuery?html:$(html);if(root.find('.sns-kuchiyose-engine').length)return;
 const panel=$(`<section class="sns-kuchiyose-engine" style="padding:8px;margin:8px;border:1px solid #887a59"><strong>Kuchiyose Summoning</strong><div style="display:flex;gap:5px"><label>Power level <input class="sns-klevel" type="number" min="0" style="width:50px" value="${num(app.actor.getFlag(SYS,'kuchiyoseLevel'))}"></label><button type="button" class="sns-cast">Summon Creature</button><button type="button" class="sns-custom">+ Custom Summon</button><button type="button" class="sns-reset-scene" title="GM: reset usage when a new scene begins">Reset Uses</button></div></section>`);
 const target=root.find('.sheet-body').first();(target.length?target:root.find('form').first()).prepend(panel);
 panel.find('.sns-klevel').on('change',e=>app.actor.setFlag(SYS,'kuchiyoseLevel',num(e.target.value)));panel.find('.sns-cast').on('click',()=>dialog(app.actor));panel.find('.sns-custom').on('click',()=>createCustom(app.actor));panel.find('.sns-reset-scene').on('click',async()=>{if(!game.user.isGM)return ui.notifications.warn('GM only.');const yes=await Dialog.confirm({title:'Reset Kuchiyose Uses',content:'Reset this character’s Kuchiyose uses for the current scene? Use only when beginning a new scene.'});if(yes){await app.actor.setFlag(SYS,'summonSceneUsage',{scene:canvas.scene?.id||'',count:0});ui.notifications.info('Kuchiyose uses reset for this scene.');}});});
Hooks.on('renderActorSheet',(app,html)=>{
 const actor=app.actor,profile=actor.getFlag(SYS,'summonProfile');
 if(!profile||!actor.testUserPermission(game.user,'OWNER'))return;
 const root=html instanceof jQuery?html:$(html);
 if(root.find('.sns-summon-allocation').length)return;
 const block=$(`<section class="sns-summon-allocation" style="padding:8px;margin:6px;border:1px solid #887a59"><strong>Summoned Creature — ${esc(profile.species)}</strong><p>NC ${profile.nc}; size ${esc(profile.size.label)}; base attribute allocation: ${profile.attributePointBudget??'not applicable'} points at NC 4 (check advancement rules for higher NC). Edit attributes normally on this Actor sheet. Size modifiers are listed in the summon profile and are not automatically added to the base attributes.</p></section>`);
 (root.find('.sheet-body').first().length?root.find('.sheet-body').first():root.find('form').first()).prepend(block);
});
Hooks.on('updateActor',async(actor)=>{if(!game.user.isGM||!actor.getFlag(SYS,'summonProfile')||num(actor.system?.energias?.vitalidade?.value)>0)return;for(const scene of game.scenes){const tokens=scene.tokens.filter(t=>t.actorId===actor.id&&t.getFlag(SYS,'summonedBy'));if(tokens.length)await scene.deleteEmbeddedDocuments('Token',tokens.map(t=>t.id))}});
