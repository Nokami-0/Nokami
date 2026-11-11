import {owned,prompt,select,field,num} from './rolls.js';
export const MODIFIERS={
 status:{label:'−1 damage: extra hit may trigger status',damage:-1,skills:['spin','melee','ranged']},
 spinKnock:{label:'−2 damage: automatic Knocked Back',damage:-2,skills:['spin']},
 removableDamage:{label:'+1 damage: Removable personal gear',damage:1,removable:true},
 removableAccuracy:{label:'+1 Advantage: Removable personal gear',advantage:1,removable:true},
 spinDash:{label:'+2 damage: sacrifice half Move (Speed)',damage:2,skills:['spin'],hero:'speed',movement:'half'},
 speedAccuracy:{label:'−1 damage: +1 Advantage (Speed Spin)',damage:-1,advantage:1,skills:['spin'],hero:'speed'},
 chain:{label:'−1 damage: chain half damage to adjacent target per hit (Speed)',damage:-1,skills:['spin'],hero:'speed',description:'Each additional hit may deal half base damage, rounded down, to another target adjacent to the previous target.'},
 inaccurate:{label:'+1 damage: +1 Disadvantage',damage:1,advantage:-1,skills:['melee','ranged']},
 heavy:{label:'+2 damage: +2 Disadvantage (Power)',damage:2,advantage:-2,skills:['melee'],hero:'power'},
 powerAccuracy:{label:'−1 damage: +1 Advantage (Power)',damage:-1,advantage:1,skills:['melee'],hero:'power'},
 powerKnock:{label:'−2 damage: automatic Knocked Back (Power)',damage:-2,skills:['melee'],hero:'power'},
 meleeArea:{label:'2 damage to chosen adjacent bystanders; forfeit Move (Power)',skills:['melee'],hero:'power',movement:'all',description:'Deal 2 damage to chosen adjacent characters besides initial target; forfeit Move phase.'},
 rangedArea:{label:'−1 damage: 3×3 splash, base damage only',damage:-1,skills:['ranged'],aoe:'3x3'},
 shorter:{label:'+1 damage: reduce range by1',damage:1,skills:['ranged'],range:-1},
 recharge:{label:'+4 damage: three Interacts to reload',damage:4,skills:['ranged'],recharge:3},
 flyAcc1:{label:'−1 damage: +1 Advantage (Fly)',damage:-1,advantage:1,skills:['ranged'],hero:'fly'},
 flyAcc2:{label:'−2 damage: +2 Advantage (Fly)',damage:-2,advantage:2,skills:['ranged'],hero:'fly'}
};
export function buildLoadout({type,skill,power,dexterity,mods=[],effect=''}){
 const aligned=(type==='speed'&&skill==='spin')||(type==='power'&&skill==='melee')||(type==='fly'&&skill==='ranged');const max=(aligned?2:1)+(skill==='ranged'?1:0);
 if(mods.length>max)throw Error(`Maximum ${max} modifiers for this loadout.`);if(new Set(mods).size!==mods.length)throw Error('Each modifier can only be chosen once.');
 let damage=skill==='spin'?power+1:skill==='melee'?power+2:5,advantage=0,range=skill==='ranged'?dexterity:1;const system={skill,damageMode:'fixed',slots:0,effect,description:''};
 for(const key of mods){const m=MODIFIERS[key];if(!m)throw Error('Unknown modifier.');if(m.skills&&!m.skills.includes(skill)||m.hero&&m.hero!==type)throw Error('Modifier is not allowed for this skill / Type.');damage+=m.damage||0;advantage+=m.advantage||0;range+=m.range||0;if(m.removable)system.removable=true;if(m.movement)system.movementCost=m.movement;if(m.aoe)system.aoe=m.aoe;if(m.recharge)system.recharge=m.recharge;if(key==='spinKnock'||key==='powerKnock'){system.automaticEffect=true;system.effect='prone';}system.description+=m.label+'. '+(m.description||'')+'\n';}
 if(mods.includes('heavy')&&mods.includes('inaccurate'))throw Error('Power +2 Disadvantage does not stack with +1 Disadvantage modifier.');
 if(damage<1||damage>10)throw Error('Loadout damage must be between1 and10.');if(range<1)throw Error('Range cannot fall below1 square.');
 const bonus=damage-(skill==='spin'?power+1:skill==='melee'?power+2:0);
 return {...system,damageMode:skill==='spin'?'spin':skill==='melee'?'melee':'fixed',damage:bonus,range,advantage,description:system.description+'Spin and Melee base damage scales with effective Power. Apply movement, chain targets and statuses using the described rules.'};
}
export async function loadoutWizard(actor){owned(actor);const o=await prompt('Build Signature Attack',field('name','Attack name','Signature Attack','text')+select('skill','Attack skill',{spin:'Spin',melee:'Melee',ranged:'Ranged'},'spin')+[1,2,3].map(i=>select('mod'+i,`Modifier ${i}`,{'':'None',...Object.fromEntries(Object.entries(MODIFIERS).map(([k,m])=>[k,m.label]))},'')).join('')+select('effect','Status (if purchased)',{'':'None',stunned:'Stunned',restrained:'Restrained',dazzled:'Dazzled',prone:'Knocked Back',burning:'Burning',soaked:'Soaked'},''));if(!o)return;const data=buildLoadout({type:actor.system.heroType,skill:o.skill,power:actor.system.derived.attributes.power,dexterity:actor.system.derived.attributes.dexterity,mods:[o.mod1,o.mod2,o.mod3].filter(Boolean),effect:o.effect});
 const [item]=await actor.createEmbeddedDocuments('Item',[{name:o.name,type:'attack',system:data}]);item.sheet.render({force:true});
}
