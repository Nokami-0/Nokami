export const ishidate = {
  name: 'Ishidate',
  type: 'personagem',
  img: 'icons/svg/mystery-man.svg',
  prototypeToken: {name: 'Ishidate', actorLink: false, disposition: -1},
  flags: {'shini-no-sho-altered': {bestiaryBoss: 'ishidate'}},
  system: {
    cabecalho: {nome: 'Ishidate', nc: 12, patente: 'Mercenary Shinobi', filiacao: 'Shabadaba’s mercenaries'},
    atributos: {
      for: {valor: 10}, des: {valor: 7}, agi: {valor: 10}, per: {valor: 8},
      vig: {valor: 8}, int: {valor: 7}, esp: {valor: 10}
    },
    pericias: {
      atletismo: {pontos: 6}, acrobacia: {pontos: 6}, prontidao: {pontos: 6},
      furtividade: {pontos: 6}, procurar: {pontos: 5}, concentracao: {pontos: 5},
      escapar: {pontos: 3}, rastrear: {pontos: 3}
    },
    energias: {vitalidade: {value: 94, max: 94}, chakra: {value: 40, max: 40}},
    databook: {
      biografia: '<p><strong>Film · Guardians of the Crescent Moon Kingdom</strong></p><p>Ishidate is a mercenary with a petrifying gauntlet. Telegraph the attack by describing the eye opening before he goes for a touch. Use ordinary strikes between attempts. His petrification profile is a tabletop adaptation and is resolved manually.</p>'
    }
  },
  items: [
    {
      name: 'Unarmed Strike', type: 'equipamento', img: 'icons/svg/fist.svg',
      system: {
        equipped: true, weaponCategory: 'natural', attackType: 'melee',
        weaponSize: 'light', weaponDamage: 0, damageType: 'bludgeoning', quantidade: 1
      }
    },
    {
      name: 'Petrifying Touch', type: 'poder', img: 'icons/svg/eye.svg',
      system: {
        tipo: 'Petrification Gauntlet', nivelUsado: 1, custo: 'Once per target per scene',
        descricao: 'Standard action. Make one melee touch attack against a target within 1 m using normal defense. On a hit, one leg partially petrifies. The target cannot move under its own power through the end of its next turn, but can still attack and defend. This attack deals no damage and cannot fully petrify a creature. A successful Iryou Ninjutsu treatment ends the effect early. Apply and clear the effect manually.'
      }
    }
  ]
};
