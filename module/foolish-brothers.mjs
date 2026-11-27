export function foolishBrothers(systemId) {
 return [['fujin','Fūjin','Raijin',7,10],['raijin','Raijin','Fūjin',6,11]].map(([id,name,brother,agi,vig]) => {
  const vitality = 55 + 3 * vig;
  return {
   folderName:'Konohagakure',
   actor:{
    name,type:'personagem',prototypeToken:{name,actorLink:false,disposition:-1},
    flags:{[systemId]:{bestiaryBoss:id}},
    system:{
     cabecalho:{nome:name,nc:9,patente:'Prisoner',filiacao:'Legendary Foolish Brothers'},
     atributos:Object.fromEntries(Object.entries({for:12,des:4,agi,per:4,vig,int:2,esp:4}).map(([key,valor])=>[key,{valor}])),
     pericias:{atletismo:{pontos:5}},
     energias:{vitalidade:{value:vitality,max:vitality},chakra:{value:22,max:22}},
     databook:{biografia:`<p>One of the Legendary Foolish Brothers, imprisoned in Konoha. ${name} relies on his physical strength and fights alongside ${brother}. Stats and the teamwork effect are tabletop adaptations.</p>`}
    },
    items:[
     {name:'Unarmed Strike',type:'equipamento',img:'icons/svg/fist.svg',system:{quantidade:1,equipped:true,weaponCategory:'natural',weaponDamage:0,weaponSize:'light',attackType:'melee',damageType:'bludgeoning'}},
     {name:'Iron Fist',type:'aptidao',img:'icons/svg/book.svg',system:{descricao:'At Strength 12, gain +4 base damage on ordinary unarmed strikes without weapon damage.'}},
     {name:'Legendary Foolish Brothers',type:'poder',img:'icons/svg/book.svg',system:{tipo:'Teamwork Maneuver',nivelUsado:1,custoChakra:0,custo:'0 Chakra',descricao:`Once per round, when ${name} makes an unarmed attack against a target in reach of both brothers, gain +1 Accuracy if ${brother} is able to act. Resolve manually.`}}
    ]
   }
  };
 });
}
