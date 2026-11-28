import {SNS_WEAPONS} from './weapon-catalog.js';

function gear(name, quantidade = 1, system = {}) {
  return {name, type:'equipamento', img:'icons/svg/item-bag.svg', system:{quantidade, ...system}};
}

function weapon(name, quantidade) {
  const rule = SNS_WEAPONS.find(item => item.name === name);
  return gear(name, quantidade, {equipped:true, weaponCategory:'simple', weaponSize:'light',
    attackType:'ranged', weaponDamage:rule.damage, damageType:rule.dtype, weaponRange:rule.range,
    criticalRange:rule.crit, peso:rule.slots, unitsPerSlot:rule.units});
}

function jutsu(name, tipo, custoChakra, descricao, nivelUsado = 1) {
  return {name, type:'poder', img:'icons/svg/book.svg',
    system:{tipo,nivelUsado,custoChakra,custo:`${custoChakra} Chakra`,descricao}};
}

function aptitude(name, descricao, preRequisito = '') {
  return {name,type:'aptidao',img:'icons/svg/book.svg',system:{descricao,preRequisito}};
}

const reflexes = aptitude('Reflexes','Gain +1 Accuracy on Dodge. Basic Book 4.1b, p. 66. Apply manually.');
const intuition = aptitude('Intuition','Gain +1 Accuracy on Read Motion. Basic Book 4.1b, p. 63. Apply manually.');
const diligent = aptitude('Diligent','Gain +3 on Initiative checks. Once per scene you may reroll Initiative and must accept the second result. Basic Book 4.1b, p. 63. Apply manually.');

export function soundAndClanNpcs(systemId, basicJutsu, clanCatalog, ninpou) {
  function clanItem(name) {
    const item = clanCatalog.find(entry => entry.name === name);
    if (!item) throw Error(`Missing clan catalog entry: ${name}`);
    return item;
  }
  const fireCannon = ninpou.find(item => item.id === 'effect:katon:cannon');
  if (!fireCannon) throw Error('Missing Katon Cannon catalog entry');
  const byakugan = clanItem('Byakugan');
  const gentleFist = clanItem('LEVEL 1: JUUKEN');
  const soundBasics = ['Bunshin No Jutsu','Kawarimi No Jutsu','Kai (Release)'];
  const entries = [
    {
      id:'zaku-abumi', name:'Zaku Abumi', folder:'Otogakure',
      attrs:{for:5,des:6,agi:7,per:6,vig:6,int:5,esp:8}, skills:{concentracao:5,prontidao:4,acrobacia:4,mecanismo:3},
      basics:soundBasics,
      items:[diligent,gear('Implanted Palm Vents'),weapon('Kunai',3),
        jutsu('Decapitating Airwaves','Sound Ninjutsu',2,'Standard Action. Requires one working palm vent. Make a ranged ninjutsu attack against one target within 12 m for 4 base damage using normal damage degrees.'),
        jutsu('Extreme Decapitating Airwaves','Sound Ninjutsu',4,'Standard Action, once per scene. Requires two working palm vents. Project a 6 m cone. Targets defend separately against 6 base damage using normal damage degrees.')]
    },
    {
      id:'kin-tsuchi', name:'Kin Tsuchi', folder:'Otogakure',
      attrs:{for:4,des:8,agi:8,per:6,vig:5,int:6,esp:8}, skills:{furtividade:5,acrobacia:4,prontidao:4,concentracao:3},
      basics:soundBasics,
      items:[reflexes,weapon('Senbon',12),gear('Bell',3),gear('Fine Wire'),weapon('Kunai',2),
        jutsu('Shadow Senbon','Weapon Technique',0,'Standard Action, once per round. Spend two senbon and make one ordinary ranged senbon attack. Gain +1 Accuracy if the target can hear the bell. Resolve one hit at most. Track senbon manually.'),
        jutsu('Bell Sound Clone','Magen',3,'Standard Action. Ring a bell against one target within 8 m that can hear it. On a failed genjutsu resistance test (Difficulty 16), the target sees illusory copies of Kin and takes −2 Accuracy on its next attack against her before the end of its next turn. Kai can end the effect early.')]
    },
    {
      id:'dosu-kinuta', name:'Dosu Kinuta', folder:'Otogakure',
      attrs:{for:6,des:6,agi:7,per:8,vig:6,int:7,esp:8}, skills:{prontidao:5,concentracao:5,procurar:4,mecanismo:3},
      basics:soundBasics,
      items:[intuition,gear('Resonating Echo Speaker'),weapon('Kunai',3),
        jutsu('Resonating Echo Drill','Sound Ninjutsu',3,'Standard Action, melee reach. Requires the working speaker. Make a melee ninjutsu attack for 4 base damage using normal damage degrees. On a hit, the target makes a Vigor test (Difficulty 16). On failure it takes −2 Accuracy on its next attack or defense test before the end of its next turn. This penalty does not stack.')]
    },
    {
      id:'hyuga-shinobi', name:'Hyūga Shinobi', folder:'Konohagakure', clan:'Hyuuga',
      attrs:{for:5,des:7,agi:8,per:9,vig:6,int:6,esp:8}, skills:{procurar:5,prontidao:5,rastrear:4,acrobacia:4,concentracao:3},
      basics:['Kai (Release)','Kawarimi No Jutsu','Kinobori','Shunshin No Jutsu'],
      items:[
        aptitude('Fighter','Ignore the normal −2 Accuracy penalty on special combat maneuvers performed unarmed or with natural weapons. Basic Book 4.1b, p. 63. Apply manually.'),
        intuition,
        aptitude('Acuity','For eligible attacks, use Dexterity in place of Strength to calculate Melee Combat Accuracy. This aptitude does not change damage. Basic Book 4.1b, p. 61. Apply manually.','Dexterity 3'),
        {...byakugan,system:{...byakugan.system,custoChakra:1,custo:'1 Chakra',preRequisito:'Perception 1'}},
        jutsu('Gentle Fist (Jūken) — Level 1','Hyūga Restricted Power',0,`${gentleFist.system.descricao}\n\n${clanItem('Base Damage of Melee Attack - Gentle Fist').system.descricao}\n\nRequires Spirit 1, Acuity and active Byakugan. Apply the stance and damage manually.`),
        gear('Unarmed Strike',1,{equipped:true,weaponCategory:'natural',attackType:'melee',weaponDamage:0,damageType:'bludgeoning'}),
        gear('Leaf Flak Vest',1,{equipped:true,isArmor:true,absorption:5,absorptionRemaining:5}),
        weapon('Kunai',3),weapon('Shuriken',4),gear('Field Pouch')
      ]
    },
    {
      id:'aburame-clan-member', name:'Aburame Clan Member', folder:'Konohagakure', clan:'Aburame',
      attrs:{for:4,des:6,agi:7,per:8,vig:6,int:8,esp:8},
      skills:{lidarAnimais:5,concentracao:5,procurar:4,prontidao:4,rastrear:4,furtividade:3},
      basics:['Kai (Release)','Kawarimi No Jutsu','Kinobori'],
      items:[intuition,
        clanItem('Kikaichuu (Destructive Parasitic Insect)'),
        jutsu('Kikai Ninpou — Cannon','Aburame Restricted Power',2,
          `${clanItem('Kikai Ninpou').system.descricao}\n\nLearned effect: Cannon (Level 2). Standard Action. Use two available kikaichuu groups for a single ranged attack. Range is 10 m + 2 m per Handling Animals level. On a hit, resolve 4 base damage using normal damage degrees and drain 2 Chakra. Apply handling, swarm availability and the power rules manually. Basic Book 4.1b, pp. 95, 147.`,2),
        weapon('Kunai',3),gear('Hooded Coat'),gear('Dark Glasses'),gear('Field Pouch')
      ]
    },
    {
      id:'nara-clan-member', name:'Nara Clan Member', folder:'Konohagakure', clan:'Nara',
      attrs:{for:4,des:6,agi:7,per:8,vig:5,int:9,esp:8},
      skills:{concentracao:6,prontidao:5,procurar:4,furtividade:4,rastrear:3},
      basics:['Kai (Release)','Kawarimi No Jutsu','Kinobori'],
      items:[intuition,diligent,weapon('Kunai',3),weapon('Shuriken',4),gear('Smoke Bomb',1,{consumable:true}),
        gear('Leaf Flak Vest',1,{equipped:true,isArmor:true,absorption:5,absorptionRemaining:5}),gear('Field Pouch'),
        ...['LEVEL 1: KAGE SHIBARI NO JUTSU','LEVEL 3: KAGE MANE NO JUTSU'].map((prefix,index) => {
          const name = clanCatalog.find(entry => entry.name.startsWith(prefix))?.name;
          const rule = clanItem(name);
          return jutsu(index ? 'Shadow Possession (Kage Mane)' : 'Shadow Prison (Kage Shibari)',
            'Kagejutsu',3,`Kagejutsu Level 3. Range 11 m. Resolve the effect manually.

${rule.system.descricao}`,3);
        })]
    },
    {
      id:'uchiha-clan-member', name:'Uchiha Clan Member', folder:'Konohagakure', clan:'Uchiha',
      attrs:{for:5,des:8,agi:7,per:8,vig:6,int:7,esp:8},
      skills:{prontidao:5,concentracao:5,acrobacia:4,procurar:4,furtividade:3},
      basics:['Kai (Release)','Kawarimi No Jutsu','Bunshin No Jutsu','Kinobori'],
      items:[reflexes,weapon('Kunai',3),weapon('Shuriken',6),gear('Field Pouch'),
        {...clanItem('Sharingan'),system:{...clanItem('Sharingan').system,custoChakra:1,custo:'1 Chakra',preRequisito:'Perception 3'}},
        {...clanItem('NIDAN SHARINGAN'),name:'Nidan Sharingan',system:{...clanItem('NIDAN SHARINGAN').system,preRequisito:'Perception 6 and Sharingan'}},
        jutsu('Katon — Cannon','Ninpou',2,`Level 2. At Spirit 8, range 26 m. Paid cast: 4 base damage before normal damage degrees. Resolve manually.

${fireCannon.description}`,2)]
    },
    {
      id:'kedoin-clan-member', name:'Kedōin Clan Member', folder:'Kedōin Clan', clan:'Kedōin',
      attrs:{for:4,des:7,agi:8,per:8,vig:5,int:8,esp:8}, skills:{disfarce:5,furtividade:5,procurar:4,prontidao:4,concentracao:3},
      basics:['Henge No Jutsu','Kawarimi No Jutsu','Shunshin No Jutsu','Kai (Release)'],
      items:[reflexes,intuition,gear('Clan Mask'),gear('Dark Cloak'),weapon('Kunai',3),gear('Smoke Bomb',1,{consumable:true}),
        jutsu('Face Copying Technique','Kedōin Clan Technique',4,'Personal. After observing a person up close, spend one minute to copy their appearance, scent and chakra signature for up to three days. Use Disguise if someone challenges the impersonation through knowledge of the person or conversation. The technique does not copy memories, skills or jutsu. Tabletop adaptation.')]
    }
  ];
  const hyuga = entries.find(entry => entry.id === 'hyuga-shinobi');
  entries.push({
    id:'hyuga-elder', name:'Elder of the Hyūga Clan', folder:hyuga.folder, clan:hyuga.clan,
    nc:10, rank:'Clan Elder',
    biography:'<p>A main-branch elder of the Hyūga clan. This tabletop NPC emphasizes perception and experience, with the same Byakugan and Gentle Fist rules as the Hyūga Shinobi.</p>',
    attrs:{for:5,des:8,agi:7,per:10,vig:6,int:9,esp:9},
    skills:{procurar:5,prontidao:5,concentracao:5},
    basics:['Kai (Release)','Kawarimi No Jutsu'],
    items:[
      ...hyuga.items.filter(item => item.type !== 'equipamento' || item.name === 'Unarmed Strike'),
      gear('Hyūga Clan Robes')
    ]
  });
  return entries.map(({id,name,folder,clan,attrs,skills,basics,items,nc=8,rank='Specialist',biography}) => {
    const vitality = 50 + 3 * attrs.vig;
    const chakra = 10 + 3 * attrs.esp;
    return {
      folderName:folder,
      actor:{
        name,type:'personagem',prototypeToken:{name,actorLink:false,disposition:-1},
        flags:{[systemId]:{bestiaryBoss:id}},
        system:{
          cabecalho:{nome:name,nc,patente:rank,filiacao:folder,cla:clan ?? ''},
          atributos:Object.fromEntries(Object.entries(attrs).map(([key,valor]) => [key,{valor}])),
          pericias:Object.fromEntries(Object.entries(skills).map(([key,pontos]) => [key,{pontos}])),
          energias:{vitalidade:{value:vitality,max:vitality},chakra:{value:chakra,max:chakra}},
          databook:{biografia:biography ?? '<p>Full NPC. Use the listed rules for Chakra costs and resolve equipment, aptitude and technique effects manually.</p>'}
        },
        items:[...items,...basicJutsu.filter(item => basics.includes(item.name))]
      }
    };
  });
}
