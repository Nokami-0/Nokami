export function menma(systemId) {
 const technique = (name,nivelUsado,custoChakra,descricao) => ({
  name,type:'poder',img:'icons/svg/book.svg',
  system:{tipo:'Ocarina Ninjutsu',nivelUsado,custoChakra,custo:`${custoChakra} Chakra`,descricao}
 });
 return {
  name:'Menma',type:'personagem',prototypeToken:{name:'Menma',actorLink:false,disposition:0},
  flags:{[systemId]:{bestiaryBoss:'menma'}},
  system:{
   cabecalho:{nome:'Menma',nc:6,patente:'Wandering Shinobi',filiacao:'Shiin Clan'},
   atributos:Object.fromEntries(Object.entries({for:4,des:5,agi:5,per:5,vig:5,int:6,esp:6}).map(([key,valor])=>[key,{valor}])),
   pericias:{arte:{pontos:5},concentracao:{pontos:4},prontidao:{pontos:3},furtividade:{pontos:3}},
   energias:{vitalidade:{value:55,max:55},chakra:{value:28,max:28}},
   databook:{biografia:'<p>Menma is an ocarina-playing shinobi and former member of the Shiin bandits. Use him as a support ally. His statistics and ocarina rules are tabletop adaptations.</p>'}
  },
  items:[
   {name:'Ocarina',type:'equipamento',img:'icons/svg/item-bag.svg',system:{quantidade:1,equipped:true,descricao:'Required for Menma’s ocarina techniques. The intended target must be able to hear him play.'}},
   technique('Offsetting Sound',2,2,'Standard Action. Choose one ally within 10 m who can hear the ocarina. Test Spirit against the genjutsu’s resistance difficulty. On success, end that genjutsu for the ally. Resolve manually.'),
   technique('Chakra Enhancement',3,3,'Standard Action. Choose one willing ally within 10 m who can hear the ocarina. Until the end of its next turn, it gains +2 m movement and +1 base damage on Strength-based attacks. Repeated uses do not stack. Resolve manually.'),
   technique('Memory Blocking Technique',3,3,'Standard Action. Choose one target within 6 m that can hear the ocarina. On a failed Spirit resistance test (Difficulty 15), the target temporarily cannot recall the events of the previous round. Memories return after one hour. This does not change known skills, allegiance, or combat actions. Resolve manually.')
  ]
 };
}
