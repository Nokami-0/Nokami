export function oboro(systemId) {
 const technique = (name, tipo, descricao) => ({
  name, type:'poder', img:'icons/svg/book.svg',
  system:{tipo, nivelUsado:2, custoChakra:2, custo:'2 Chakra', descricao}
 });
 return {
  name:'Oboro', type:'personagem', prototypeToken:{name:'Oboro',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'oboro'}},
  system:{
   cabecalho:{nome:'Oboro',nc:5,patente:'Genin',filiacao:'Amegakure'},
   atributos:Object.fromEntries(Object.entries({for:4,des:6,agi:5,per:4,vig:4,int:5,esp:5}).map(([key,valor])=>[key,{valor}])),
   pericias:{furtividade:{pontos:5},disfarce:{pontos:3},prontidao:{pontos:3},escapar:{pontos:3}},
   energias:{vitalidade:{value:47,max:47},chakra:{value:25,max:25}},
   databook:{biografia:'<p>Hidden Rain genin who uses intangible decoys to conceal attacks from underground. Technique costs and checks are tabletop adaptations.</p>'}
  },
  items:[
   {name:'Kunai',type:'equipamento',img:'icons/svg/dagger.svg',system:{quantidade:3,equipped:true,weaponCategory:'simple',weaponDamage:1,attackType:'ranged',weaponSize:'light',damageType:'piercing',weaponRange:15}},
   technique('Haze Clone Technique','Ninjutsu','Standard action. Create intangible copies within 6 m that last until the start of your next turn. The copies cannot attack, deal damage, or occupy space. An observer can distinguish the real Oboro by beating his Stealth with Readiness; striking a copy also reveals its nature. Resolve manually.'),
   technique('Earth Release: Underground Projection Fish Technique','Doton','Move action. Move up to your normal movement through loose earth and emerge on an unoccupied surface before the end of the action. Roll Stealth against Readiness if observers could detect your movement. Solid stone and constructed floors block this movement. Resolve manually.')
  ]
 };
}
