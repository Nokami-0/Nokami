import {SNS_WEAPONS} from './weapon-catalog.js';

export function hanzaki(systemId) {
 const sword = SNS_WEAPONS.find(weapon => weapon.name === 'Greatsword');
 return {
  name:'Hanzaki',type:'personagem',prototypeToken:{name:'Hanzaki',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'hanzaki'}},
  system:{
   cabecalho:{nome:'Hanzaki',nc:9,patente:'Fūma Clan Leader',filiacao:'Land of Sound',cla:'Fūma'},
   atributos:Object.fromEntries(Object.entries({for:9,des:6,agi:7,per:7,vig:8,int:6,esp:6}).map(([key,valor])=>[key,{valor}])),
   pericias:{atletismo:{pontos:5},prontidao:{pontos:4},furtividade:{pontos:4}},
   energias:{vitalidade:{value:79,max:79},chakra:{value:28,max:28}},
   databook:{biografia:'<p>Leader of the Land of Sound Fūma clan. He fights with a large sword. The NPC statistics are a tabletop adaptation.</p>'}
  },
  items:[
   {name:'Hanzaki’s Greatsword',type:'equipamento',img:'icons/svg/sword.svg',
    system:{quantidade:1,equipped:true,weaponCategory:'martial',weaponDamage:sword.damage,weaponSize:sword.size,weaponRange:sword.range,criticalRange:sword.crit,attackType:sword.attack,damageType:sword.dtype,peso:sword.slots,unitsPerSlot:sword.units}},
   {name:'Diligent',type:'aptidao',img:'icons/svg/book.svg',
    system:{descricao:'Gain +3 on Initiative checks. Once per scene you may reroll Initiative and must accept the second result. Apply manually.'}}
  ]
 };
}
