// Basic Book pp. 227, 271–272. Stable IDs preserve existing world/token data.
export const SNS_SIZE_TABLE=[
 {id:'minute',label:'Minuscule',str:-7,vig:-7,attack:2,reach:1,stealth:5,intimidate:-2,move:-12,grid:0.5,minNC:0,height:'15 cm or less',weight:'125 g or less'},
 {id:'tiny',label:'Tiny',str:-5,vig:-5,attack:1,reach:1,stealth:3,intimidate:-2,move:-9,grid:0.5,minNC:0,height:'15–30 cm',weight:'125 g–0.5 kg'},
 {id:'child',label:'Little',str:-3,vig:-3,attack:1,reach:1,stealth:2,intimidate:-1,move:-6,grid:0.5,minNC:14,height:'30–60 cm',weight:'0.5–4 kg'},
 {id:'small',label:'Small',str:-1,vig:-1,attack:0,reach:1,stealth:1,intimidate:-1,move:-3,grid:1,minNC:0,maxNC:8,height:'60 cm–1.2 m',weight:'4–30 kg'},
 {id:'medium',label:'Medium',str:0,vig:0,attack:0,reach:1,stealth:0,intimidate:0,move:0,grid:1,minNC:0,height:'1.2–2.4 m',weight:'30–250 kg'},
 {id:'large',label:'Large',str:1,vig:1,attack:0,reach:2,stealth:-1,intimidate:1,move:3,grid:2,minNC:12,height:'2.4–4.8 m',weight:'250 kg–2 t'},
 {id:'huge',label:'Huge',str:3,vig:3,attack:0,reach:3,stealth:-2,intimidate:1,move:6,grid:3,minNC:14,height:'4.8–9.6 m',weight:'2–16 t'},
 {id:'gargantuan',label:'Immense',str:5,vig:5,attack:0,reach:4,stealth:-3,intimidate:2,move:9,grid:4,minNC:16,height:'9.6–19.2 m',weight:'16–125 t'},
 {id:'colossal',label:'Colossal',str:7,vig:7,attack:0,reach:5,stealth:-5,intimidate:2,move:12,grid:5,minNC:Infinity,height:'19.2–38.4 m',weight:'125–1,000 t'},
 {id:'incredible',label:'Incredible',str:9,vig:9,attack:0,reach:6,stealth:-7,intimidate:3,move:15,grid:6,minNC:Infinity,height:'38.4 m or more',weight:'1,000 t or more'}
];
export const NORMAL_SUMMON_SIZES=['child','small','medium','large','huge','gargantuan'];
export const canonicalSizeId=id=>({immense:'gargantuan',minuscule:'minute',little:'child',kid:'child',average:'medium',big:'large'}[id]||id);
export function sizeById(id){return SNS_SIZE_TABLE.find(s=>s.id===canonicalSizeId(id))||SNS_SIZE_TABLE[4];}
export function isSummonSizeLegal(p,size,nc,fixed=null){
 size=canonicalSizeId(size);fixed=fixed?canonicalSizeId(fixed):null;
 if(!Number.isInteger(nc)||nc<0)return false;
 const s=SNS_SIZE_TABLE.find(s=>s.id===size);if(!s)return false;
 if(fixed&&size!==fixed)return false;
 if(!fixed&&!NORMAL_SUMMON_SIZES.includes(size))return false;
 if(nc<s.minNC||nc>(s.maxNC??Infinity))return false;
 if(/salamander/i.test(p.name||'')&&!['child','small','medium','large','huge'].includes(size))return false;
 if(/bee swarm/i.test(p.name||'')&&!['medium',...(nc>=12?['large']:[]),...(nc>=14?['huge']:[])].includes(size))return false;
 return true;
}
export function correctedSizeDetails(size){
 const id=canonicalSizeId(size?.id);const s=SNS_SIZE_TABLE.find(s=>s.id===id);if(!s)return size;
 return {...size,id:s.id,label:s.label,strengthModifier:s.str,vigorModifier:s.vig,attackVsMedium:s.attack,reachMeters:s.reach,stealthModifier:s.stealth,intimidateModifier:s.intimidate,movementMeters:s.move,heightReference:s.height,weightReference:s.weight,tokenSquares:size.tokenSquares??s.grid};
}
export async function repairSummonSize(actor){
 const p=actor?.flags?.['shinobi-no-sho-revamp']?.summonProfile;
 if(!actor?.isOwner||!p?.size?.id)return false;
 const size=correctedSizeDetails(p.size);if(JSON.stringify(size)===JSON.stringify(p.size))return false;
 await actor.update({'flags.shinobi-no-sho-revamp.summonProfile.size':size,'system.energias.tamanho':size.label});return true;
}
export function openSnsSizeReference(){
 const row=s=>`<tr><td>${s.label}</td><td>${s.str>0?'+':''}${s.str}</td><td>+${s.attack}</td><td>${s.reach}m</td><td>${s.stealth>0?'+':''}${s.stealth}</td><td>${s.intimidate>0?'+':''}${s.intimidate}</td><td>${s.move>0?'+':''}${s.move}m</td><td>${s.height}</td><td>${s.weight}</td></tr>`;
 return new Dialog({title:'Creature Sizes — Basic Book 271–272',content:`<div style="overflow:auto"><table><thead><tr><th>Size</th><th>STR/VIG</th><th>Attack vs Medium</th><th>Reach</th><th>Stealth</th><th>Intimidate</th><th>Move</th><th>Height/length</th><th>Weight</th></tr></thead><tbody>${SNS_SIZE_TABLE.map(row).join('')}</tbody></table></div><p>Labels distinguish duplicate machine translations. The third tier (Little, translated as Kid) is the smallest normal Kuchiyose option: minimum NC 14. Small: maximum NC 8; Large: minimum NC 12; Huge: 14; Immense: 16. Species restrictions still apply. Strength/Vigor adjustments are applied after character creation; Strength size bonuses do not increase Melee Combat accuracy. Temporary size changes do not grant the permanent-size prerequisite/Vitality benefits. Movement never falls below 1m. Attack adjustments apply against Dodge, Block or Anticipate; you cannot Block an enemy at least two categories larger.</p>`,buttons:{close:{label:'Close'}},width:1000}).render(true);
}
