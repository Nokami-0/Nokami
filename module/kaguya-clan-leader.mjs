export const kaguyaClanLeader = {
  name: 'Kaguya Clan Leader',
  type: 'personagem',
  img: 'icons/svg/mystery-man.svg',
  prototypeToken: {name: 'Kaguya Clan Leader', actorLink: false, disposition: -1},
  flags: {'shinobi-no-sho-revamp': {bestiaryBoss: 'kaguya-clan-leader'}},
  system: {
    cabecalho: {
      nome: 'Kaguya Clan Leader', nc: 10, cla: 'Kaguya',
      patente: 'Clan Patriarch', filiacao: 'Kaguya clan'
    },
    atributos: {
      for: {valor: 9}, des: {valor: 5}, agi: {valor: 8}, per: {valor: 7},
      vig: {valor: 9}, int: {valor: 5}, esp: {valor: 5}
    },
    pericias: {
      atletismo: {pontos: 5}, prontidao: {pontos: 5}, furtividade: {pontos: 5},
      acrobacia: {pontos: 5}, concentracao: {pontos: 4}, procurar: {pontos: 4},
      rastrear: {pontos: 4}
    },
    sociais: {carisma: {valor: 3}, manipulacao: {valor: 2}},
    periciasSociais: {intimidar: {pontos: 5}},
    energias: {vitalidade: {value: 87, max: 87}, chakra: {value: 25, max: 25}},
    databook: {
      biografia: `<p><strong>Kaguya clan · Anime-inspired boss</strong></p>
       <p>The patriarch led the clan’s raid on Kirigakure and released Kimimaro to fight in it.</p>
       <p><strong>Run the encounter:</strong> Pair him with Kaguya Clan Raiders from the Henchmen compendium. He presses into melee and uses standard unarmed attacks. Use Intimidate when he confronts defenders or rallies the scene through threats.</p>
       <p>This NC 10 adaptation gives him a taijutsu-focused sheet. His fighting style is a table interpretation. Shikotsumyaku is reserved for confirmed wielders such as Kimimaro.</p>`
    }
  },
  items: [{
    name: 'Unarmed Attack', type: 'equipamento', img: 'icons/svg/fist.svg',
    system: {equipped: true, attackType: 'melee', weaponCategory: 'natural',
      weaponDamage: 0, damageType: 'bludgeoning', criticalRange: '15-16', quantidade: 1}
  }]
};
