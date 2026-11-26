export const sora = {
  name: 'Sora',
  type: 'personagem',
  img: 'icons/svg/mystery-man.svg',
  prototypeToken: {name: 'Sora', actorLink: false, disposition: 0},
  flags: {'shini-no-sho-altered': {bestiaryBoss: 'sora'}},
  system: {
    cabecalho: {nome: 'Sora', nc: 10, patente: 'Ninja Monk', filiacao: 'Fire Temple'},
    atributos: {
      for: {valor: 7}, des: {valor: 6}, agi: {valor: 8}, per: {valor: 6},
      vig: {valor: 6}, int: {valor: 5}, esp: {valor: 10}
    },
    pericias: {
      acrobacia: {pontos: 5}, atletismo: {pontos: 5}, concentracao: {pontos: 5},
      prontidao: {pontos: 5}, furtividade: {pontos: 4}, procurar: {pontos: 4},
      cultura: {pontos: 4}
    },
    energias: {vitalidade: {value: 78, max: 78}, chakra: {value: 40, max: 40}},
    calculadora: {danoForca: {dda: 2}},
    databook: {
      biografia: '<p><strong>Anime · Twelve Guardian Ninja arc</strong></p><p>Sora is a Fire Temple ninja monk and Kazuma’s son. This is his baseline form. He fights with a triple-bladed claw and Wind Release. His token starts neutral so the GM can use him as a rival or ally.</p><p>If Kazuma releases the Nine-Tails chakra sealed inside Sora, treat the rampage as a separate story phase. This sheet represents Sora before the release. The technique profile and claw damage below are tabletop adaptations.</p>'
    }
  },
  items: [
    {
      name: 'Triple-Bladed Claw', type: 'equipamento', img: 'icons/svg/sword.svg',
      system: {
        equipped: true, weaponCategory: 'simple', attackType: 'melee',
        weaponSize: 'light', damageType: 'slashing', weaponDamage: 2, quantidade: 1
      }
    },
    {
      name: 'Beast Wave Palm', type: 'poder', img: 'icons/svg/wind.svg',
      system: {
        tipo: 'Wind Release', nivelUsado: 3, custo: '3 Chakra', custoChakra: 3,
        descricao: 'Standard action. Send a cutting wave at one target within 15 m. Roll a ranged attack against normal defense. On a hit, resolve 6 base slashing damage using the normal damage degree. Resolve attack and damage manually.'
      }
    }
  ]
};
