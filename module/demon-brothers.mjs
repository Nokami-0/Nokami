import {SNS_WEAPONS} from './weapon-catalog.js';

const chainRules = 'Once per round for the pair, one brother spends a Standard Action to ready the chain. Before his next turn, the other spends a Standard Action to make one Close Combat attack against a target between them and within 3 m of both. Both brothers must be able to act, have their gauntlets equipped, and be within 6 m of each other. On a hit the target cannot leave its space until the end of its next turn, but can attack and defend. It can spend a Standard Action to escape with Strength or Escape (Difficulty 16). The bind ends if either brother releases the chain, is incapacitated, or moves out of range. This maneuver deals no damage and does not apply venom.';

const profiles = [
  {
    id:'gozu', name:'Gōzu', arm:'Right',
    attributes:{for:8,des:6,agi:7,per:7,vig:7,int:6,esp:7},
    skills:{atletismo:5,furtividade:5,prontidao:4,rastrear:4,concentracao:3},
    aptitude:'Block Weapon', aptitudeRule:'Gain +1 Accuracy when Blocking armed melee attacks. Beat the opposing roll by at least 4 to attempt a free Disarm. A critical Block disarms automatically. Basic Book 4.1b, p. 69.',
    effect:'cannon', effectName:'Cannon',
    effectRule:'At Level 2, range 24 m and 4 base damage before normal damage degrees.'
  },
  {
    id:'meizu', name:'Meizu', arm:'Left',
    attributes:{for:6,des:8,agi:8,per:7,vig:6,int:6,esp:7},
    skills:{furtividade:5,acrobacia:5,prontidao:4,rastrear:4,concentracao:3},
    aptitude:'Reflexes', aptitudeRule:'Gain +1 Accuracy on Dodge. Basic Book 4.1b, p. 66.',
    effect:'repel', effectName:'Repel',
    effectRule:'At Level 2, 6 Hardness for this defense. Spend Chakra before making the reaction roll.'
  }
];

function equipment(name, descricao, system = {}) {
  return {name,type:'equipamento',img:'icons/svg/item-bag.svg',system:{quantidade:1,descricao,...system}};
}

export function demonBrothers(systemId, basicJutsu, ninpou) {
  const basics = basicJutsu.filter(({name}) => ['Kawarimi No Jutsu','Tadayou','Kai (Release)'].includes(name));
  const kunai = SNS_WEAPONS.find(item => item.name === 'Kunai');
  return profiles.map(profile => {
    const rule = ninpou.find(item => item.id === `effect:suiton:${profile.effect}`);
    if (!rule) throw Error(`Missing Suiton rule: ${profile.effect}`);
    const vitality = 50 + 3 * profile.attributes.vig;
    const chakra = 10 + 3 * profile.attributes.esp;
    return {
      folderName:'Kirigakure',
      actor:{
        name:profile.name,type:'personagem',prototypeToken:{name:profile.name,actorLink:false,disposition:-1},
        flags:{[systemId]:{bestiaryBoss:profile.id}},
        system:{
          cabecalho:{nome:profile.name,nc:8,patente:'Missing-nin',filiacao:'Demon Brothers · Kirigakure'},
          atributos:Object.fromEntries(Object.entries(profile.attributes).map(([key,valor])=>[key,{valor}])),
          pericias:Object.fromEntries(Object.entries(profile.skills).map(([key,pontos])=>[key,{pontos}])),
          energias:{vitalidade:{value:vitality,max:vitality},chakra:{value:chakra,max:chakra}},
          databook:{biografia:'<p>One of the Demon Brothers, missing-nin from the Hidden Mist. The two identical chain entries represent one shared weapon. Track the paired maneuver and poison manually. Suiton is a tabletop addition.</p>'}
        },
        items:[
          ...basics,
          {name:profile.aptitude,type:'aptidao',img:'icons/svg/book.svg',system:{descricao:profile.aptitudeRule+' Apply manually.'}},
          {name:`Suiton — ${profile.effectName}`,type:'poder',img:'icons/svg/book.svg',system:{
            tipo:'Ninpou',elemento:'suiton',nivelUsado:2,custoChakra:2,custo:'2 Chakra',
            descricao:`${profile.effectRule}\n\n${rule.description}\n\nBasic Book 4.1b, p. ${rule.sourcePages}. Resolve the effect manually.`
          }},
          equipment('Clawed Gauntlet',`${profile.arm}-arm gauntlet. A first hit that deals Vitality damage can expend its prepared dose. See Gauntlet Venom.`,{
            equipped:true,attackType:'melee',weaponCategory:'simple',weaponSize:'light',weaponDamage:2,damageType:'slashing'
          }),
          equipment('Gauntlet Venom','One prepared dose. Expend it on the first claw hit that deals Vitality damage. The target tests Vigor against Difficulty 16. On failure, it moves at half speed until the end of its next turn. Does not stack. Track manually.'),
          equipment('Retractable Shuriken Chain','One shared weapon for the pair. '+chainRules),
          equipment('Rebreather','Standard face-mounted rebreather.'),
          equipment('Kunai','Standard throwing kunai.',{quantidade:3,equipped:true,weaponCategory:'simple',
            attackType:'ranged',weaponSize:'light',weaponDamage:kunai.damage,weaponRange:kunai.range,damageType:kunai.dtype}),
          equipment('Field Pouch','Carries spare shinobi equipment.'),
          {name:'Demon Brothers’ Chain Bind',type:'poder',img:'icons/svg/book.svg',system:{
            tipo:'Paired Maneuver',custoChakra:0,custo:'0 Chakra',descricao:chainRules+' Resolve manually.'
          }}
        ]
      }
    };
  });
}
