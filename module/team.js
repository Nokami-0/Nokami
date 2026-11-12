import {pool,SKILLS,tagDamage,advantageOpposed,blastResult,clamp} from './engine.js';
import {owned,prompt,field,select,card,dice,renderResult,num,esc,spendPhase,attack} from './rolls.js';
import {itemDamage} from './actor.js';
const ID='sonic-tag-team-heroes';
function highest(a,skill){return Math.max(1,...a.items.filter(i=>i.type==='attack'&&!i.system.disabled&&!i.system.broken&&(!i.system.slots||i.system.equipped)&&(!skill||i.system.skill===skill)).map(i=>itemDamage(a,i)));}
function roundKey(){return `${game.combat?.id??'free'}:${game.combat?.round??0}`;}
function alreadyUsed(){return game.combat&&game.messages.some(m=>m.getFlag(ID,'teamRound')===roundKey());}
function actorChoices(exclude){return Object.fromEntries(game.actors.filter(a=>a.id!==exclude&&a.type==='character').map(a=>[a.id,a.name]));}
export async function tagTeam(actor,item){owned(actor);const choices=actorChoices(actor.id);const o=await prompt(item.name,select('partner','Partner',choices)+field('defense','Target Dodge dice',2)+field('advantage','Net Advantage',0)+field('spent','Extra hits spent on effects',0)+field('bonus','GM terrain damage bonus (Cunning Trap)',0)+`<p>${esc(item.system.description)}</p><p>Confirm participants are adjacent and target is within the move’s range. GM must own both actors to automate TP. Only the instigator pays TP.</p>`);if(!o)return;
 const partner=game.actors.get(o.partner);owned(partner);if(partner.id===actor.id)throw Error('Choose a different partner.');const cost=item.system.tpCost;if(actor.system.tp.value<cost)throw Error('Not enough TP.');if(alreadyUsed())throw Error('A Tag-Team Attack or Team Blast has already been used this round.');
 if(item.system.partnerType&&partner.system.heroType!==item.system.partnerType)throw Error(`Requires a ${item.system.partnerType} partner.`);
 const sk=item.system.aimSkill||item.system.skill,pk=item.system.partnerSkill||partner.items.find(i=>i.type==='attack')?.system.skill||'spin';const d=advantageOpposed({hit:clamp(num(o.defense),0,6),trick:0},num(o.advantage),{cap:6});
 await spendPhase(actor,'action');await actor.update({'system.tp.value':actor.system.tp.value-cost});
 if(item.system.comboKind==='teachable'){
 const support=await dice(pool(actor.system.derived.attributes[SKILLS[sk]],actor.system.derived.ranks[sk]),{difficulty:1});
 await card(actor,item.name,renderResult(support)+`<p>Difficulty1 support: ${support.success?'ally gains an additional attack':'no additional attack'}. ${cost} TP spent.</p>`,{rolls:support.rolls,data:{teamRound:roundKey()}});
 const attacks=partner.items.filter(i=>i.type==='attack'&&!i.system.disabled&&(!i.system.slots||i.system.equipped)).sort((a,b)=>itemDamage(partner,b)-itemDamage(partner,a));if(!attacks.length)throw Error('Partner needs an attack.');
 await attack(partner,attacks[0],{spend:false});if(support.success)await attack(partner,attacks[0],{spend:false});return;
 }
 const ar=await dice(pool(actor.system.derived.attributes[SKILLS[sk]],actor.system.derived.ranks[sk]+d.overflow,{masteryRanks:actor.system.derived.ranks[sk]}));const br=await dice(pool(partner.system.derived.attributes[SKILLS[pk]],partner.system.derived.ranks[pk]));const dr=await dice(d,{defense:true});
 let baseA=highest(actor),baseB=highest(partner,pk);if(cost===15){baseA=Math.max(1,baseA+item.system.damage)+num(o.bonus);}
 let dmg=tagDamage(cost,ar.hits,br.hits,dr.hits,baseA,baseB,{spentHits:num(o.spent)});
 if(cost===5&&actor.system.heroType==='speed'&&ar.hits>dr.hits)dmg.damage+=2*ar.criticalTricks;
 await card(actor,item.name,`<h4>${esc(actor.name)} (${esc(sk)})</h4>${renderResult(ar)}<h4>${esc(partner.name)} (${esc(pk)})</h4>${renderResult(br)}<p>Defense ${dr.hits} hits. <b>${dmg.damage} damage</b> before special move text. ${cost} TP paid by instigator.</p><p>${esc(item.system.description)}</p><p>Keep each participant’s Tricks and Slips separate. Apply special statuses, follow-up attacks and AoE per the move text. Teachable Moment uses its separate difficulty-1 support check, not combined damage.</p>`,{rolls:[...ar.rolls,...br.rolls,...dr.rolls],data:{teamRound:roundKey()}});
}
export async function teamBlast(instigator){owned(instigator);if(!game.user.isGM)throw Error('Ask the GM to run Team Blast so all three actors can be updated together.');if(alreadyUsed())throw Error('A team move has already been used this round.');
 const opts=type=>Object.fromEntries(game.actors.filter(a=>a.type==='character'&&a.system.heroType===type).map(a=>[a.id,a.name]));const o=await prompt('Team Blast',select('speed','Speed hero',opts('speed'))+select('power','Power hero',opts('power'))+select('fly','Fly hero',opts('fly'))+field('dodge','Highest enemy Dodge',2)+'<p>Each hero spends 15 TP and their turn (or next turn if already acted). Resolve damage against all enemies. Selected skills are configured on each hero sheet.</p>');if(!o)return;
 const heroes=['speed','power','fly'].map(t=>game.actors.get(o[t]));if(heroes.some(a=>!a||a.system.tp.value<15))throw Error('Each participant must have 15 TP.');const results=[];
 for(const a of heroes){const sk=a.system.blastSkill;results.push(await dice(pool(a.system.derived.attributes[SKILLS[sk]],a.system.derived.ranks[sk]),{mode:'blast'}));}
 const zeros=results.reduce((n,r)=>n+r.zeros,0);let outcome=blastResult(...results.map(r=>r.hits),highest(heroes[0],'spin'),highest(heroes[1],'melee'),num(o.dodge),0,zeros);const defense=await dice({hit:outcome.remainingDodge,trick:0},{defense:true});outcome=blastResult(...results.map(r=>r.hits),highest(heroes[0],'spin'),highest(heroes[1],'melee'),num(o.dodge),defense.hits,zeros);
 for(const a of heroes){await a.update({'system.tp.value':a.system.tp.value-15});const c=game.combat?.combatants.find(c=>c.actorId===a.id);if(c){const before=game.combat.turns.findIndex(x=>x.id===c.id)<=game.combat.turn;await c.setFlag(ID,'skipRound',game.combat.round+(before&&a.id!==instigator.id?1:0));}}
 await card(instigator,heroes.map(a=>a.system.blastName||a.name).join(' '),heroes.map((a,i)=>`<h4>${esc(a.name)}</h4>${renderResult(results[i])}`).join('')+`<p><b>${outcome.damage} damage to each enemy</b>; ${outcome.crits} crit(s). Speed status ${esc(heroes[0].system.blastStatus)} ${outcome.speedStacks}; ${outcome.buff?'team buff: '+esc(heroes[0].system.blastBuff):'no team buff'}.</p><p>Highest enemy Dodge rolled ${defense.hits} hits (${5*defense.hits} damage reduction). ${zeros} zero(s) added enemy Dodge dice. Apply results to targets individually, respecting crit thresholds and shields.</p>`,{rolls:[...results.flatMap(r=>r.rolls),...defense.rolls],data:{teamRound:roundKey()}});
}
