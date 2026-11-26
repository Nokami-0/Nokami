export const ranmaru = {
  name: 'Ranmaru',
  type: 'personagem',
  img: 'icons/svg/mystery-man.svg',
  prototypeToken: {name: 'Ranmaru', actorLink: false, disposition: 0},
  flags: {'shini-no-sho-altered': {bestiaryBoss: 'ranmaru'}},
  system: {
    cabecalho: {nome: 'Ranmaru', nc: 7, patente: 'Sensory Support', filiacao: 'Raiga’s companion'},
    atributos: {
      for: {valor: 2}, des: {valor: 3}, agi: {valor: 4}, per: {valor: 7},
      vig: {valor: 2}, int: {valor: 5}, esp: {valor: 7}
    },
    pericias: {
      procurar: {pontos: 3}, prontidao: {pontos: 3}, rastrear: {pontos: 3},
      concentracao: {pontos: 3}, ocultismo: {pontos: 3}, furtividade: {pontos: 3},
      medicina: {pontos: 2}
    },
    energias: {vitalidade: {value: 51, max: 51}, chakra: {value: 31, max: 31}},
    databook: {
      biografia: '<p><strong>Anime · Kurosuki Family Removal Mission</strong></p><p>Ranmaru uses his unnamed dōjutsu to guide Raiga, observe hidden creatures and fool chakra-based sight. Use him as sensory support for Raiga or as a neutral NPC when encountered alone.</p><p>The techniques are homebrew adaptations. Resolve detection and deception manually.</p>'
    }
  },
  items: [
    {
      name: 'Life-Sensing Vision', type: 'poder', img: 'icons/svg/eye.svg',
      system: {
        tipo: 'Dōjutsu', custo: '2 Chakra', custoChakra: 2,
        descricao: 'Move action. Until the start of your next turn, use Search to detect life and chakra signatures within 15 m, including through ordinary walls. The GM sets the difficulty for concealment or sensory interference. Reveals location and whether the target is alive. Grants no line of effect.'
      }
    },
    {
      name: 'False Chakra Signature', type: 'poder', img: 'icons/svg/eye.svg',
      system: {
        tipo: 'Dōjutsu', custo: '3 Chakra', custoChakra: 3,
        descricao: 'Standard action. Mask your own life or chakra signature, or place one false signature at a known point within 15 m, until the start of your next turn. Oppose an observer’s Search with Concentration. Can fool chakra-based sight, including Byakugan. Physical inspection can expose the deception.'
      }
    }
  ]
};
