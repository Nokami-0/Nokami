function doton(name, level, descricao) {
 return {name,type:'poder',img:'icons/svg/book.svg',system:{tipo:'Doton',elemento:'doton',nivelUsado:level,custoChakra:level,custo:`${level} Chakra`,descricao}};
}

export function gitai(systemId) {
 return {
  name:'Gitai',type:'personagem',prototypeToken:{name:'Gitai',actorLink:false,disposition:-1},
  flags:{[systemId]:{bestiaryBoss:'gitai'}},
  system:{
   cabecalho:{nome:'Gitai',nc:11,patente:'Gang of Four',filiacao:'Land of Demons'},
   atributos:Object.fromEntries(Object.entries({for:9,des:6,agi:7,per:6,vig:9,int:6,esp:10}).map(([key,valor])=>[key,{valor}])),
   pericias:{atletismo:{pontos:5},concentracao:{pontos:5},prontidao:{pontos:4},escapar:{pontos:4}},
   energias:{vitalidade:{value:92,max:92},chakra:{value:40,max:40}},
   databook:{biografia:'<p>A member of the Gang of Four from the Land of Demons. His Earth Release is used with enhanced chakra in the film. This tabletop profile starts with his enhancement in effect and uses ordinary Chakra costs. Technique effects are resolved manually.</p>'}
  },
  items:[
   {name:'Unarmed Strike',type:'equipamento',img:'icons/svg/fist.svg',system:{quantidade:1,equipped:true,weaponCategory:'natural',weaponDamage:0,weaponSize:'light',attackType:'melee',damageType:'bludgeoning'}},
   {name:'Iron Fist',type:'aptidao',img:'icons/svg/book.svg',system:{descricao:'At Strength 9, gain +2 base damage on eligible unarmed attacks without weapon damage. This is a tabletop aptitude choice.'}},
   doton('Earth Release: Hardening Technique',3,'Partial Action. Gain +1 Hardness until the end of your next turn. Does not stack with Demonic Rock Spider Armour.'),
   doton('Earth Release: Demonic Rock Spider Armour',5,'Partial Action, once per scene. Through the end of your second turn after activation, gain +2 Hardness and +1 base damage with unarmed attacks. Does not stack with Hardening Technique.'),
   doton('Earth Release: Earth Corridor',4,'Standard Action. Raise earth around one target on earthen ground within 10 m. Make a ranged ninjutsu attack. On a hit, the target cannot leave its space until the end of its next turn. It can spend a Standard Action to break free with Strength or Escape (Difficulty 17). No damage.'),
   doton('Earth Release: Tracking Projectiles Technique',4,'Standard Action. Send earth projectiles toward one target within 16 m that shares a continuous earthen surface with you. Make a ranged ninjutsu attack for 7 base damage using normal damage degrees.')
  ]
 };
}
