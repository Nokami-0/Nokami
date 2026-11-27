export function shiin(systemId) {
 return {
  name:'Shiin',type:'personagem',prototypeToken:{name:'Shiin',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'shiin'}},
  system:{
   cabecalho:{nome:'Shiin',nc:8,patente:'Bandit Leader',filiacao:'Shiin Clan'},
   atributos:Object.fromEntries(Object.entries({for:5,des:7,agi:6,per:6,vig:6,int:8,esp:8}).map(([key,valor])=>[key,{valor}])),
   pericias:{arte:{pontos:6},concentracao:{pontos:5},prontidao:{pontos:4},furtividade:{pontos:4}},
   periciasSociais:{intimidar:{pontos:4}},
   energias:{vitalidade:{value:68,max:68},chakra:{value:34,max:34}},
   databook:{biografia:'<p>Leader of the Shiin Clan bandits from the Land of Rice Fields. He uses his flute to immobilize opponents and fights with a tethered kunai. Statistics and technique mechanics are tabletop adaptations.</p>'}
  },
  items:[
   {name:'Demonic Flute',type:'equipamento',img:'icons/svg/item-bag.svg',system:{quantidade:1,equipped:true,descricao:'Required for Paralysing Flute Genjutsu.'}},
   {name:'Rope-Tethered Kunai',type:'equipamento',img:'icons/svg/dagger.svg',system:{quantidade:1,equipped:true,weaponCategory:'simple',weaponDamage:1,attackType:'ranged',weaponSize:'light',damageType:'piercing',weaponRange:6,descricao:'A tethered kunai with 6 m range for this build. Retrieve it as a Move Action if the tether is intact and unobstructed.'}},
   {name:'Paralysing Flute Genjutsu',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Magen (Yin Release)',nivelUsado:3,custoChakra:3,custo:'3 Chakra',
    descricao:'Standard Action. Requires the Demonic Flute. Choose one creature within 10 m that can hear Shiin. On a failed genjutsu resistance test (Difficulty 17), the target is Paralysed until the end of its next turn. Kai can end the effect early. No damage. Once per target per scene. Resolve manually.'}}
  ]
 };
}
