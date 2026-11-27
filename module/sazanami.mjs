export function sazanami(systemId) {
 return {
  name:'Sazanami',type:'personagem',prototypeToken:{name:'Sazanami',actorLink:false,disposition:0},
  flags:{[systemId]:{bestiaryBoss:'sazanami'}},
  system:{
   cabecalho:{nome:'Sazanami',nc:7,patente:'Bounty Hunter',filiacao:'Independent'},
   atributos:Object.fromEntries(Object.entries({for:8,des:7,agi:8,per:7,vig:6,int:6,esp:5}).map(([key,valor])=>[key,{valor}])),
   pericias:{rastrear:{pontos:5},mecanismo:{pontos:5},prontidao:{pontos:4},procurar:{pontos:4}},
   energias:{vitalidade:{value:63,max:63},chakra:{value:25,max:25}},
   databook:{biografia:'<p>Tokichi, a bladesmith who took the name Sazanami and became a bounty hunter while pursuing Gosunkugi. His stats and quick-draw rules are tabletop adaptations.</p>'}
  },
  items:[
   {name:'Katana',type:'equipamento',img:'icons/svg/sword.svg',system:{quantidade:1,equipped:true,weaponCategory:'martial',weaponDamage:3,weaponSize:'medium',attackType:'melee',damageType:'slashing'}},
   {name:'Bounty Notices',type:'equipamento',img:'icons/svg/book.svg',system:{quantidade:1}},
   {name:'Expert (Tracking)',type:'aptidao',img:'icons/svg/book.svg',system:{aptitudeChoice:'Tracking',descricao:'Gain +2 Accuracy on Tracking tests.'}},
   {name:'Iaidō (Blade Slash)',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Sword Maneuver',nivelUsado:1,custoChakra:0,custo:'0 Chakra',descricao:'Standard Action. Begin with the katana sheathed and a free hand. Draw it and make one normal melee attack at standard reach as part of the same action. Resolve manually.'}}
  ]
 };
}
