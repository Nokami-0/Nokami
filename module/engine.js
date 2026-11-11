// Pure STTH 1.5.0 rules. No Foundry globals: independently testable.
export const ATTRIBUTES={speed:'Speed',power:'Power',dexterity:'Dexterity',intellect:'Intellect',charisma:'Charisma'};
export const SKILLS={spin:'speed',acrobat:'speed',run:'speed',melee:'power',move:'power',climb:'power',ranged:'dexterity',sneak:'dexterity',ride:'dexterity',perceive:'intellect',tech:'intellect',knowledge:'intellect',persuade:'charisma',deceive:'charisma',resolve:'charisma'};
export const ROWS={spin:0,melee:0,ranged:0,perceive:0,persuade:0,acrobat:1,move:1,sneak:1,tech:1,deceive:1,run:2,climb:2,ride:2,knowledge:2,resolve:2};
export const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
export const int=n=>Math.max(0,Math.trunc(Number(n)||0));
export const movement=s=>s<=0?0:s<3?2:s<4?4:s<6?8:16;
export function pool(attribute,ranks,{upgrade=0,downgrade=0}={}){
 attribute=int(attribute);ranks=int(ranks);let total=Math.max(attribute,ranks);let trick=Math.min(attribute,ranks);
 // An upgrade replaces a die; it never adds dice beyond the existing pool.
 trick=clamp(trick+int(upgrade)-int(downgrade),0,total);return {hit:total-trick,trick,total};
}
export function advantageFixed(difficulty,advantage=0){
 const d=int(difficulty),a=Math.trunc(Number(advantage)||0);
 if(d===0)return {difficulty:Math.max(0,-a),overflow:Math.max(0,a)};
 return {difficulty:Math.max(1,d-a),overflow:Math.max(0,a-(d-1))};
}
export function advantageOpposed(defense,advantage=0,{cap=Infinity}={}){
 let hit=int(defense.hit),trick=int(defense.trick),a=Math.trunc(Number(advantage)||0),overflow=0;
 if(a>0){let removed=Math.min(hit,a);hit-=removed;a-=removed;removed=Math.min(trick,a);trick-=removed;a-=removed;overflow=a;}
 else hit+=-a;
 if(hit+trick>cap){hit=Math.max(0,cap-trick);trick=Math.min(trick,cap);}
 return {hit,trick,total:hit+trick,overflow};
}
export function tally(hitDice=[],trickDice=[],{difficulty=1,defense=false,mode='check'}={}){
 const values=[...hitDice,...trickDice],counts=Array(10).fill(0);for(const v of values)counts[v]++;
 let tricks=0,slips=0,criticalTricks=0,criticalSlips=0;
 for(const v of [5,6]){criticalTricks+=Math.floor(counts[v]/3);tricks+=Math.floor((counts[v]%3)/2);}
 for(const v of [7,8]){criticalTricks+=Math.floor(counts[v]/2);tricks+=counts[v]%2;}
 criticalTricks+=counts[9];
 for(const v of [1,2]){criticalSlips+=Math.floor(counts[v]/3);slips+=difficulty>=4?counts[v]%3:Math.floor((counts[v]%3)/2);}
 criticalSlips+=Math.floor(counts[0]/2);slips+=counts[0]%2;
 const baseHits=values.filter(v=>v>=5).length;
 let hits=baseHits+criticalTricks;
 if(mode==='blast')hits=baseHits+counts[9];
 if(defense){hits=baseHits;tricks=slips=criticalTricks=criticalSlips=0;}
 if(mode==='blast')tricks=slips=criticalTricks=criticalSlips=0;
 return {hitDice,trickDice,hits,baseHits,tricks,slips,criticalTricks,criticalSlips,zeros:counts[0],success:hits>=difficulty};
}
export function attackDamage(base,attackHits,defenseHits,{spentHits=0,extra=1,squares=1}={}){
 const net=int(attackHits)-int(defenseHits);if(net<1)return {net,damage:0,extraHits:0};
 const extraHits=Math.max(0,net-1-int(spentHits));return {net,damage:int(base)*Math.max(1,int(squares))+extraHits*extra,extraHits};
}
export function tagDamage(cost,aim,partner,defense,baseA,baseB,{spentHits=0,extra=1}={}){
 if(cost===5){const connects=aim>defense&&partner>0;return {net:aim-defense,damage:connects?int(baseB)+Math.max(0,partner-1-int(spentHits)):0};}
 return attackDamage(cost===10?int(baseA)+int(baseB):int(baseA),aim+partner,defense,{spentHits,extra:cost===15?2:extra});
}
export function blastResult(speedHits,powerHits,flyHits,baseSpin,baseMelee,dodge,dodgeHits,zeros=0){
 const s=clamp(speedHits,0,4),p=clamp(powerHits,0,4),f=clamp(flyHits,0,4);
 const flyBonus=f===1?4:f===2?5:f===3?6:0;const advantage=f<4?f*2:Infinity;
 const enemyDice=int(dodge)+int(zeros);const remaining=f>=4?0:Math.max(0,enemyDice-advantage);
 const overflow=f>=4?0:Math.max(0,advantage-enemyDice);
 const damage=(s?int(baseSpin)+5*(s-1)+flyBonus:0)+(p?int(baseMelee)+5*(p-1)+flyBonus:0)+(f>=4?20:0)+2*overflow-5*int(dodgeHits);
 return {damage:Math.max(0,damage),crits:(s>=3?1:0)+(p?Math.max(1,p-1):0),speedStacks:Math.min(3,s),buff:s>=3,remainingDodge:remaining,advantage,overflow};
}
export function ringSpill(rings,critNumber){return critNumber>=5?0:Math.min(int(rings),critNumber===4?1:Math.floor(8/2**Math.max(0,critNumber-1)));}
export function applyDamage(state,damage,{critical=false,shield=false}={}){
 const hp=Math.max(0,Number(state.hp)-int(damage)),pc=state.pc!==false;
 if(shield&&damage>0)return {...state,shieldBroken:true,stunned:critical,damage:0};
 if(pc){const crit=damage>0&&(critical||hp===0);const count=int(state.crits)+(crit?1:0);return {...state,hp,crits:count,rings:crit?0:int(state.rings),spilled:crit?ringSpill(state.rings,count):0,stunned:crit,ko:hp===0&&(crit?int(state.rings)===0:int(state.rings)===0),damage:int(damage)};}
 let crits=int(state.crits),threshold=int(state.threshold),bonus=0,stunned=false;
 if(critical||damage>0&&hp===0){if(crits<threshold){crits++;stunned=true;}else if(critical)bonus=10;}
 return {...state,hp:Math.max(0,hp-bonus),crits,stunned,ko:Math.max(0,hp-bonus)===0&&crits>=threshold&&!stunned,damage:int(damage)+bonus};
}
export function skillCost(rank,type,archetype,skill){const focus={speed:'speed',power:'power',fly:'dexterity',genius:'intellect',figurehead:'charisma'};const discount=archetype==='generalist'||SKILLS[skill]===focus[type==='technique'?archetype:type]?5:0;return 5*(int(rank)+1)+5-discount;}
export function validateCreation(a,ranks,type,archetype){
 const errors=[];const focus={speed:'speed',power:'power',fly:'dexterity',genius:'intellect',figurehead:'charisma'}[type==='technique'?archetype:type];
 const general=type==='technique'&&archetype==='generalist';const total=Object.values(a).reduce((x,y)=>x+Number(y),0);
 if(total!==14)errors.push('Starting attributes must total 14 points.');
 if(Object.values(a).some(v=>v<1||v>5))errors.push('Starting attributes must be 1–5.');
 if(!general&&focus&&a[focus]<4)errors.push('Primary attribute must start at 4 or 5.');
 if(type==='technique'&&['speed','power','dexterity'].some(k=>a[k]>3))errors.push('Technique Hero attributes cannot exceed 3 at creation.');
 if(!general&&focus&&Object.values(a).some(v=>v>a[focus]))errors.push('No attribute may exceed the primary attribute.');
 if(general&&(Object.values(a).filter(v=>v===3).length!==4||Object.values(a).filter(v=>v===2).length!==1))errors.push('Generalist starts with four 3s and one 2.');
 if(Object.values(ranks).reduce((x,y)=>x+Number(y),0)!==6||Object.values(ranks).some(v=>v<0||v>2))errors.push('Assign six skill ranks, maximum two in one skill.');
 return errors;
}
export function qteThreshold(players){return {success:2*int(players),failure:int(players)+1};}
export function zoneRank(result){let rank=result.hits;if(result.criticalSlips)rank--;return ['E','D','C','B','A','S'][clamp(rank+(rank<0?0:1),0,5)];}
