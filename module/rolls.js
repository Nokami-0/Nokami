import {emitVisualEffect} from './visual-effects.js';
const {Roll}=foundry.dice;
const {ChatMessage}=foundry.documents;
import {pool,tally,advantageFixed,advantageOpposed,attackDamage,SKILLS,ROWS,clamp,zoneRank} from './engine.js';
import {conditionStacks,itemDamage} from './actor.js';
export const esc=s=>foundry.utils.escapeHTML(String(s??''));
export const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
export async function prompt(title,content){
 return foundry.applications.api.DialogV2.input({window:{title},content:`<div class="stth-dialog">${content}</div>`,rejectClose:false,modal:true,ok:{label:'Confirm'}});
}

export const field=(name,label,value=0,type='number')=>`<label>${esc(label)} <input type="${type}" name="${name}" value="${esc(value)}" ${type==='number'?'step="1"':''}></label>`;
export const select=(name,label,options,value)=>`<label>${esc(label)}<select name="${name}">${Object.entries(options).map(([k,v])=>`<option value="${esc(k)}" ${k===String(value)?'selected':''}>${esc(v)}</option>`).join('')}</select></label>`;
export function owned(actor){if(!actor?.isOwner)throw Error('You must own this actor.');}
export async function dice(p,options={}){
 const hit=clamp(p.hit,0,50),trick=clamp(p.trick,0,50);
 if(hit+trick===0)return {...tally([],[],options),rolls:[]};
 const rolls=[];let h=[],t=[];
 if(hit){const r=await new Roll(`${hit}d6`).evaluate();rolls.push(r);h=r.dice[0].results.filter(x=>x.active!==false).map(x=>x.result);}
 if(trick){const r=await new Roll(`${trick}d10`).evaluate();rolls.push(r);t=r.dice[0].results.filter(x=>x.active!==false).map(x=>x.result===10?0:x.result);}
 return {...tally(h,t,options),rolls};
}
export function renderResult(r){const d=(v,t)=>`<span class="stth-die ${t} ${v>=5?'hit':'miss'}">${v}</span>`;return `<div class="stth-dice">${r.hitDice.map(v=>d(v,'d6')).join('')}${r.trickDice.map(v=>d(v,'d10')).join('')}</div><p><b>${r.hits} hits</b> · ${r.tricks} Tricks · ${r.slips} Slips · ${r.criticalTricks} Critical Tricks · ${r.criticalSlips} Critical Slips</p>`;}
export async function card(actor,title,content,{rolls=[],data={}}={}){const mode=game.settings.get('core','rollMode');const msg={speaker:ChatMessage.getSpeaker({actor}),content:`<article class="stth-chat"><h3>${esc(title)}</h3>${content}</article>`,rolls,flags:{'sonic-tag-team-heroes':data}};ChatMessage.applyRollMode(msg,mode);return ChatMessage.create(msg);}
export async function rollSkill(actor,skill,{difficulty=1,advantage=0,upgrade=0,downgrade=0,ask=true,mode='check',attribute,rankOverride,opposed=false}={}){
 owned(actor);const s=actor.system;if(conditionStacks(actor,'ko'))throw Error('This actor is KO.');if(!(skill in SKILLS)&&!attribute)throw Error('Unknown skill');
 const dazzled=conditionStacks(actor,'dazzled');if(dazzled)downgrade+=2;
 if(ask){const opt=await prompt(`${actor.name} — ${skill}`,field('difficulty','Difficulty (0 = no fixed threshold)',difficulty)+field('advantage','Net Advantage (negative = Disadvantage)',advantage)+field('upgrade','Extra upgrades / helpers',upgrade)+field('downgrade','Downgrades',downgrade)+`<p>Against an opposed roll, only the defender’s pool changes. Use an attack or the opposed-check tool for that.</p>`);if(!opt)return null;difficulty=Math.max(0,num(opt.difficulty));advantage=num(opt.advantage);upgrade=num(opt.upgrade);downgrade=num(opt.downgrade);}
 const adjusted=advantageFixed(difficulty,advantage);const a=attribute??s.derived.attributes[SKILLS[skill]],r=rankOverride??s.derived.ranks[skill];
 const pp=pool(a,r+adjusted.overflow,{upgrade,downgrade,masteryRanks:r});
 if(dazzled&&!Math.min(a,r))adjusted.difficulty++;
 const result=await dice(pp,{difficulty:adjusted.difficulty,mode});
 await card(actor,`${skill} check`,renderResult(result)+`<p>Pool ${pp.hit}d6 + ${pp.trick}d10 (attribute d6 + 1d6 per effective skill rank; only explicit Trick Die effects create d10s, whose face 10 reads as 0). Difficulty ${adjusted.difficulty}: <b>${result.success?'Success':'Failure'}</b>.</p><p>Player chooses Tricks; opponent chooses Slips. Effects do not cancel each other.</p>`,{rolls:result.rolls,data:{kind:'check',actor:actor.uuid,skill,result:{...result,rolls:undefined}}});
 if(dazzled)for(const e of actor.effects.filter(e=>e.statuses.has('dazzled')))await e.delete();
 return result;
}
export async function rollDodge(actor,{advantage=0,ask=true}={}){owned(actor);if(conditionStacks(actor,'ko'))throw Error('This actor is KO.');let count=actor.type==='vehicle'?actor.system.dodge:actor.system.derived.dodge;if(ask){const opt=await prompt('Dodge',field('advantage','Attacker net Advantage',advantage));if(!opt)return;advantage=num(opt.advantage);}const p=advantageOpposed({hit:count,trick:0},advantage,{cap:6});const r=await dice(p,{defense:true});await card(actor,'Dodge',renderResult(r)+`<p>Defensive rolls resolve hits only. Attacker overflow Advantage: ${p.overflow} upgrade(s).</p>`,{rolls:r.rolls});return r;}
export async function attack(actor,item,{spend=true}={}){owned(actor);if(conditionStacks(actor,'ko'))throw Error('This actor is KO.');if(item.type==='attack'&&item.system.slots>0&&!item.system.equipped)throw Error('Equip this weapon before using it.');if(item.system.disabled||item.system.broken)throw Error('This equipment is disabled.');if(item.system.remainingRecharge>0)throw Error(`${item.name} needs ${item.system.remainingRecharge} more Interact phases to recharge.`);
 if(item.system.ammoLimited&&item.system.quantity<=0)throw Error('This attack is out of ammunition.');if(actor.type==='vehicle')return vehicleAttack(actor,item);
 const target=[...game.user.targets][0]?.actor;
 const o=await prompt(item.name,field('defense','Target Dodge dice (0–6)',target?.system.derived?.dodge??target?.system.dodge??0)+field('advantage','Net Advantage',item.system.advantage)+field('upgrade','Extra upgrades',0)+field('downgrade','Downgrades',0)+field('spent','Extra hits spent on status (instead of damage)',0)+field('squares','Vehicle squares hit by base AoE',1)+`<p>${esc(item.system.description)}</p><p>Range ${item.system.range||actor.system.derived.attributes.dexterity} squares. Resolve range, cover, Height and movement requirements before confirming. Select a target token for a damage button.</p>`);if(!o)return;
 if(!(item.system.skill in SKILLS))throw Error('Choose a valid attack skill on the item sheet.');const tpCost=item.system.tpCost||0;if(actor.system.tp.value<tpCost)throw Error(`Requires ${tpCost} TP.`);if(spend)await spendPhase(actor,'action');
 const d=advantageOpposed({hit:clamp(num(o.defense),0,6),trick:0},num(o.advantage),{cap:6});
 const sk=item.system.skill;if(!(sk in SKILLS))throw Error('Choose a valid attack skill on the item sheet.');if(conditionStacks(actor,'dazzled')&&!Math.min(actor.system.derived.attributes[SKILLS[sk]],actor.system.derived.ranks[sk]))d.hit=Math.min(6,d.hit+1);const p=pool(actor.system.derived.attributes[SKILLS[sk]],actor.system.derived.ranks[sk]+d.overflow,{masteryRanks:actor.system.derived.ranks[sk],upgrade:num(o.upgrade),downgrade:num(o.downgrade)+(conditionStacks(actor,'dazzled')?2:0)});
 const atk=await dice(p),def=await dice(d,{defense:true});let base=itemDamage(actor,item);if(actor.system.shield==='flame'&&['spin','melee'].includes(sk))base++;
 const dmg=attackDamage(base,atk.hits,def.hits,{spentHits:num(o.spent),extra:item.system.extraDamage||1,squares:num(o.squares,1)});
 if(item.system.statusOnly)dmg.damage=0;
 const outcome={kind:'damage',target:target?.uuid,damage:dmg.damage,criticalAvailable:atk.criticalTricks>0&&dmg.net>0,applied:false};
 await card(actor,item.name,renderResult(atk)+`<h4>Defense</h4>${renderResult(def)}<p>Base ${base}; ${dmg.net} net hits. <b>${dmg.damage} damage</b>. ${tpCost?tpCost+' TP spent.':''}</p><p>Status allocation: ${num(o.spent)} extra hits; ${esc(item.system.effect||'none')}. Apply chosen statuses separately.</p>${target&&dmg.damage?'<button type="button" data-stth-chat="damage">Apply damage</button>':''}${outcome.criticalAvailable?'<p>A Critical Trick can inflict a crit instead of another benefit. Choose it in the damage dialog.</p>':''}`,{rolls:[...atk.rolls,...def.rolls],data:outcome});
 if(tpCost)await actor.update({'system.tp.value':actor.system.tp.value-tpCost});
 if(item.system.ammoLimited)await item.update({'system.quantity':Math.max(0,item.system.quantity-1)});
 if(item.system.recharge)await item.update({'system.remainingRecharge':item.system.recharge});
 if(conditionStacks(actor,'dazzled'))for(const e of actor.effects.filter(e=>e.statuses.has('dazzled')))await e.delete();
 void emitVisualEffect({actor,item,attack:atk,defense:def,damage:dmg});
}
export async function vehicleAttack(vehicle,item){
 owned(vehicle);if(item.system.ammoLimited&&item.system.quantity<=0)throw Error('This attack is out of ammunition.');if(item.system.remainingRecharge>0)throw Error('This weapon must recharge before firing.');
 const turnKey=`${game.combat?.id??'free'}:${game.combat?.round??0}`;if(game.combat&&item.system.lastUsed===turnKey)throw Error('This weapon has already fired this round.');
 const pilot=await fromUuid(vehicle.system.pilot);if(!pilot)throw Error('Set a pilot Actor UUID on the vehicle sheet.');owned(pilot);
 const o=await prompt(item.name,field('defense','Target Dodge dice',2)+field('advantage','Net Advantage',item.system.advantage)+field('squares','Target vehicle squares hit',1)+field('spent','Hits spent on status',0));if(!o)return;
 const d=advantageOpposed({hit:clamp(num(o.defense),0,6),trick:0},num(o.advantage),{cap:6});const sk=item.system.skill;
 const r=await dice(pool(pilot.system.derived.attributes[SKILLS[sk]],pilot.system.derived.ranks[sk]+d.overflow,{masteryRanks:pilot.system.derived.ranks[sk]}));const defense=await dice(d,{defense:true});
 const dmg=attackDamage(item.system.damage,r.hits,defense.hits,{squares:num(o.squares),spentHits:num(o.spent)});
 await card(vehicle,item.name,renderResult(r)+`<p>Defense ${defense.hits} hits. <b>${dmg.damage} damage</b>. Range ${item.system.range}; arc ${esc(item.system.arc)}; facing ${esc(item.system.facing)}. GM adjudicates firing arc and AoE coverage.</p>`,{rolls:[...r.rolls,...defense.rolls]});
 await item.update({'system.remainingRecharge':item.system.recharge,'system.lastUsed':turnKey,...(item.system.ammoLimited?{'system.quantity':Math.max(0,item.system.quantity-1)}:{})});
 void emitVisualEffect({actor:vehicle,item,attack:r,defense,damage:dmg,pilot});
}
export async function spendPhase(actor,kind){
 if(!game.combat)return;if(conditionStacks(actor,'ko'))throw Error('This actor is KO.');if(conditionStacks(actor,'restrained')&&['action','move'].includes(kind))throw Error('Restrained prevents Action and Move phases. Use a saving throw to escape.');const key=`${game.combat.id}:${game.combat.round}:${game.combat.turn}`;const phases=actor.system.phases.key===key?{...actor.system.phases}:{key,move:0,interact:0,action:0};
 if(phases[kind]>0&&!game.user.isGM&&game.settings.get('sonic-tag-team-heroes','enforcePhases'))throw Error(`Your ${kind} phase is already spent. Use phase controls to exchange an Action for a second Move or Interact.`);
 phases[kind]=(phases[kind]||0)+1;await actor.update({'system.phases':phases});
}
export async function opposed(a,skill,b,defSkill,advantage=0){owned(a);owned(b);const base=pool(b.system.derived.attributes[SKILLS[defSkill]],b.system.derived.ranks[defSkill]);const dp=advantageOpposed(base,advantage);const ar=await dice(pool(a.system.derived.attributes[SKILLS[skill]],a.system.derived.ranks[skill]+dp.overflow,{masteryRanks:a.system.derived.ranks[skill]}));const br=await dice(dp);await card(a,`${skill} vs ${b.name}: ${defSkill}`,`<h4>${esc(a.name)}</h4>${renderResult(ar)}<h4>${esc(b.name)}</h4>${renderResult(br)}<p>${ar.hits>br.hits?esc(a.name)+' succeeds':ar.hits<br.hits?esc(b.name)+' succeeds':'Tie — resolve with the GM'}. Each side keeps its own Tricks and Slips.</p>`,{rolls:[...ar.rolls,...br.rolls]});}
