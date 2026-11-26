export const dotoKazahana = {
  name: 'Dotō Kazahana',
  type: 'personagem',
  img: 'icons/svg/mystery-man.svg',
  prototypeToken: {name: 'Dotō Kazahana', actorLink: false, disposition: -1},
  flags: {'shinobi-no-sho-revamp': {bestiaryBoss: 'doto-kazahana'}},
  system: {
    cabecalho: {nome: 'Dotō Kazahana', nc: 14, patente: 'Land of Snow Ruler', filiacao: 'Land of Snow'},
    atributos: {
      for: {valor: 8}, des: {valor: 8}, agi: {valor: 10}, per: {valor: 8},
      vig: {valor: 10}, int: {valor: 14}, esp: {valor: 14}
    },
    pericias: {
      concentracao: {pontos: 7}, prontidao: {pontos: 7}, procurar: {pontos: 7},
      ciencias: {pontos: 7}, mecanismo: {pontos: 7}, cultura: {pontos: 7}, atletismo: {pontos: 6}
    },
    energias: {vitalidade: {value: 110, max: 110}, chakra: {value: 52, max: 52}},
    databook: {
      biografia: '<p><strong>Film · Ninja Clash in the Land of Snow</strong></p><p>Dotō is the ruler of the Land of Snow. His black prototype Chakra Armor protects him while he attacks with dragons formed from existing snow and ice.</p><p>Start the fight with Black Dragon Blizzard. Bring out Twin Dragon Blizzard while the armor still has absorption. Once its absorption is depleted, the prototype shuts down. Resolve techniques manually. The armor values and attack profiles are tabletop adaptations.</p>'
    }
  },
  items: [
    {
      name: 'Black Prototype Chakra Armor', type: 'equipamento', img: 'icons/svg/shield.svg',
      system: {
        equipped: true, isArmor: true, absorption: 20, absorptionRemaining: 20, quantidade: 1,
        descricao: 'The prototype absorbs damage using the normal armor rules. At zero absorption, its chakra amplifier shuts down. It grants no blanket immunity.'
      }
    },
    {
      name: 'Black Dragon Blizzard', type: 'poder', img: 'icons/svg/book.svg',
      system: {
        tipo: 'Ice Release', nivelUsado: 5, custo: '5 Chakra', custoChakra: 5,
        descricao: 'Standard action. Requires existing snow or ice. Make one ranged attack against a target within 20 m. Resolve 10 base damage using the normal damage degree.'
      }
    },
    {
      name: 'Twin Dragon Blizzard', type: 'poder', img: 'icons/svg/book.svg',
      system: {
        tipo: 'Ice Release', nivelUsado: 7, custo: '7 Chakra', custoChakra: 7,
        descricao: 'Standard action. Once per scene. Requires existing snow or ice and positive armor absorption. Make one ranged attack against up to two targets within 20 m. Each target defends separately against 14 base damage. Both dragons count as one hit against any one target.'
      }
    }
  ]
};
