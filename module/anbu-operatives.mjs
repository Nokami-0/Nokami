import {SNS_WEAPONS} from './weapon-catalog.js';
import {villageSpecialists} from './village-techniques.mjs';

function equipment(name, quantidade = 1, system = {}) {
  return {name, type:'equipamento', img:'icons/svg/item-bag.svg', system:{quantidade, ...system}};
}

function weapon(name, quantidade, attackType = 'melee') {
  const item = SNS_WEAPONS.find(row => row.name === name);
  return equipment(name, quantidade, {
    equipped:true, weaponCategory:item.group.toLowerCase(), attackType,
    weaponSize:item.size === 'ranged' ? 'light' : item.size,
    weaponDamage:item.damage, damageType:item.dtype, weaponRange:item.range,
    criticalRange:item.crit, valorRyo:item.price, peso:item.slots, unitsPerSlot:item.units
  });
}

export function anbuOperatives(systemId, basicJutsu, puppetAptitudes) {
  const common = ['Bunshin No Jutsu', 'Kawarimi No Jutsu', 'Shunshin No Jutsu', 'Kinobori', 'Kai (Release)'];
  const profiles = [
    {
      id:'konoha-anbu', name:'Konoha ANBU Operative', village:'Konohagakure',
      agility:10, perception:9, skills:{furtividade:5, acrobacia:5, prontidao:5, procurar:4, concentracao:4},
      jutsu:'Henge No Jutsu', mission:'Covert reconnaissance, protection, and investigation.',
      gear:[equipment('ANBU Animal Mask'), weapon('Shuriken',4,'ranged'),
        equipment('Smoke Bomb',2,{consumable:true, descricao:'Use the normal Smoke Bomb rules. Track scene effects manually.'})]
    },
    {
      id:'suna-anbu', name:'Suna ANBU Puppeteer', village:'Sunagakure',
      agility:9, perception:10, skills:{mecanismo:5, furtividade:5, prontidao:5, procurar:4, concentracao:4},
      jutsu:'Henge No Jutsu',
      mission:'A masked Hidden Sand operative who uses chakra threads to control a puppet from cover. Assign this actor as the puppet’s controller when deploying it.',
      signature:puppetAptitudes,
      gear:[equipment('Horned ANBU Mask'), weapon('Senbon',6,'ranged'),
        equipment('Puppet Storage Scroll',1,{descricao:'Carries one medium Balanced Puppet. Deploy it from the Puppets tab and assign this operative as controller.'}),
        equipment('Puppet Repair Kit'),
        equipment('Smoke Bomb',2,{consumable:true, descricao:'Use the normal Smoke Bomb rules. Track scene effects manually.'})]
    },
    {
      id:'kiri-hunter-nin', name:'Kiri Hunter-nin', village:'Kirigakure',
      agility:9, perception:10, skills:{rastrear:5, procurar:5, prontidao:5, furtividade:4, concentracao:4},
      jutsu:'Tadayou', mission:'Track missing-nin and recover their remains to protect village secrets.',
      gear:[equipment('Hunter-nin Mask'), weapon('Senbon',6,'ranged'),
        equipment('Waterproof Field Pouch'), equipment('Recovery Scroll Case')],
      signature:villageSpecialists.find(entry => entry.folderName === 'Kirigakure').actor.items.filter(item => item.type === 'poder')
    }
  ];
  return profiles.map(profile => ({
    folderName:profile.village,
    actor:{
      name:profile.name, type:'personagem',
      prototypeToken:{name:profile.name, actorLink:false, disposition:-1},
      flags:{[systemId]:{bestiaryBoss:profile.id}},
      system:{
        cabecalho:{nome:profile.name,nc:10,patente:'ANBU Specialist',filiacao:profile.village},
        atributos:{for:{valor:6},des:{valor:8},agi:{valor:profile.agility},per:{valor:profile.perception},vig:{valor:7},int:{valor:7},esp:{valor:8}},
        pericias:Object.fromEntries(Object.entries(profile.skills).map(([key,pontos]) => [key,{pontos}])),
        energias:{vitalidade:{value:81,max:81},chakra:{value:34,max:34}},
        databook:{biografia:`<p>${profile.mission} This is a full NPC. Use the item rules for Chakra costs and resolve technique effects manually.</p>`}
      },
      items:[
        weapon('Short Sword',1), weapon('Kunai',4,'ranged'),
        equipment('Light Armor',1,{equipped:true,isArmor:true,absorption:5,absorptionRemaining:5}),
        ...profile.gear,
        ...basicJutsu.filter(item => common.includes(item.name) || item.name === profile.jutsu),
        ...(profile.signature ?? [])
      ]
    }
  }));
}
