export const konohaMedic = {
  name: 'Konoha Medic',
  type: 'personagem',
  img: 'icons/svg/mystery-man.svg',
  prototypeToken: {name: 'Konoha Medic', actorLink: false, disposition: 1},
  flags: {'shinobi-no-sho-revamp': {bestiarySupport: 'konoha-medic'}},
  system: {
    cabecalho: {nome: 'Konoha Medic', nc: 8, patente: 'Medical Ninja', filiacao: 'Konohagakure'},
    atributos: {
      for: {valor: 3}, des: {valor: 3}, agi: {valor: 4}, per: {valor: 5},
      vig: {valor: 5}, int: {valor: 8}, esp: {valor: 8}
    },
    pericias: {
      medicina: {pontos: 4}, concentracao: {pontos: 4}, prontidao: {pontos: 4},
      procurar: {pontos: 4}, ciencias: {pontos: 4}, atletismo: {pontos: 4}
    },
    energias: {vitalidade: {value: 65, max: 65}, chakra: {value: 34, max: 34}},
    databook: {
      biografia: '<p>A Hidden Leaf medical ninja for casualty evacuation and treatment. Medicine accuracy +8. For first aid, take a standard action and roll Medicine against Difficulty 16 to reduce bleeding by one level. Prioritize casualties over combat.</p>'
    }
  },
  items: [
    {
      name: 'Medical Ninja', type: 'aptidao', img: 'icons/svg/book.svg',
      system: {preRequisito: 'Medicine 7', descricao: 'Enables healing techniques, surgery, and preparing remedies or antidotes. The medic is not caught off guard when healing an ally during combat.'}
    },
    {
      name: 'Iryou Ninjutsu', type: 'poder', img: 'icons/svg/book.svg',
      system: {
        tipo: 'Medical Ninjutsu', nivelUsado: 4, custoChakra: 4, custo: '1 Chakra per level used',
        descricao: 'Touch. Standard action to begin. Concentration. At the end of each treatment turn, restore Vitality equal to the level used plus half Medicine rounded up (8 at level 4). Both characters must stay motionless. The first treatment turn clears bleeding and Chakra Scalpel tissue cuts. Self-treatment restores half unless used at level 4 or higher. Apply healing manually. Basic Book 4.1b, p. 120.'
      }
    }
  ]
};
