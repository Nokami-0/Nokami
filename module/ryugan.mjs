export function ryugan(systemId) {
 return {
  name:'Ryūgan',type:'personagem',prototypeToken:{name:'Ryūgan',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'ryugan'}},
  system:{
   cabecalho:{nome:'Ryūgan',nc:9,patente:'Four Celestial Symbols',filiacao:'Takumi Village'},
   atributos:Object.fromEntries(Object.entries({for:6,des:9,agi:8,per:7,vig:6,int:8,esp:7}).map(([key,valor])=>[key,{valor}])),
   pericias:{mecanismo:{pontos:5},prontidao:{pontos:4},acrobacia:{pontos:4},concentracao:{pontos:4}},
   energias:{vitalidade:{value:73,max:73},chakra:{value:31,max:31}},
   databook:{biografia:'<p>A member of the Four Celestial Symbols from Takumi Village who fights with the segmented Garian Sword. Statistics and weapon maneuvers are tabletop adaptations.</p>'}
  },
  items:[
   {name:'Garian Sword',type:'equipamento',img:'icons/svg/sword.svg',system:{quantidade:1,equipped:true,weaponCategory:'martial',weaponDamage:3,weaponSize:'medium',attackType:'melee',damageType:'slashing',descricao:'Use standard melee reach in sword form. For extended attacks, use Garian Sword — Segmented Strike.'}},
   {name:'Expert (Mechanics)',type:'aptidao',img:'icons/svg/book.svg',system:{aptitudeChoice:'Mechanics',descricao:'Gain +2 Accuracy on Mechanics tests.'}},
   {name:'Garian Sword — Segmented Strike',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Weapon Maneuver',nivelUsado:1,custoChakra:0,custo:'0 Chakra',descricao:'Standard Action. With the Garian Sword equipped, send its linked blade segments toward one target within 6 m. Make a Ranged Combat attack, using 7 base slashing damage before the usual damage degree. Apply cover normally and resolve manually.'}}
  ]
 };
}
