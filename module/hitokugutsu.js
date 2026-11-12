const prerequisite = "Kugutsu; Medical Ninja; Mechanics 16; Medicine 16; Occultism 16";
const complete = "Kugutsu; Medical Ninja; Fuuinjutsu 9; Mechanics 18; Medicine 18; Occultism 18";
const entries = [
 ["Hitokugutsu — Partial", prerequisite, "Replace or adapt parts of your own body with devices, up to a maximum of two Standard or Light slots. Using a device consumes one of your character’s actions and follows Kugutsu combat and puppet action rules."],
 ["Hitokugutsu — Complete", complete, "Automatically evolves from Partial without additional purchase when its prerequisites are met. You may transform a corpse or your own complete body into a puppet. Making a Living Puppet receptacle or a Dead Puppet requires a Medicine surgery test against difficulty 26 and one week of sealing. Failing the surgery by 4 or more destroys the body or kills the character. Created puppets use normal Kugutsu construction, actions, Absorption, size and device rules except as described by Living Puppet and Dead Puppet."],
 ["Living Puppet", complete, "Seal your heart and Chakra into a receptacle. Attach it to a regular puppet and control that body as your character. It cannot attach to a human puppet. See Vessel, Vitality, Immunities, Light Body and Eject for its benefits."],
 ["Living Puppet — Vessel", complete, "You become a living, eternal object. Replace Agility with Sleight of Hand for checks and movement. Replace Strength and Vigor with Mechanics for checks only. Keep other attributes, skills, Chakra, powers and aptitudes. Character progression continues normally."],
 ["Living Puppet — Vitality", complete, "The receptacle has Vitality equal to twice Mechanics. It can be directly attacked only when its host puppet reaches 0 Absorption or is defenseless."],
 ["Living Puppet — Immunities", complete, "Immune to poison, fatigue, tiredness, aging, hunger, thirst, sleep deprivation, pain, bleeding and other physical conditions affecting humans."],
 ["Living Puppet — Light Body", complete, "While attached, the body is light enough to use an installed Steel Cable as support. Gain Flight equal to Mechanics and +3 m movement and jumps. Due to its small height, it is not considered winged."],
 ["Living Puppet — Eject", complete, "At most twice per scene and once per round, eject the receptacle into another puppet within 10 m as a Free Action. As a defensive action, spend 1 Chakra to avoid an attack automatically without either side testing; the abandoned puppet is destroyed regardless of remaining Absorption. With Akahigi puppets, change the control center while retaining the group’s shared Absorption. Cannot eject when circumstances prevent reaching another puppet, such as isolation in an enclosed space."],
 ["Dead Puppet", complete, "Make ordinary puppets from corpses, or seal a human’s Chakra inside their own body to make a human puppet. Human puppets retain powers, including restricted powers, at their original levels; these levels cannot be changed. Use the controller’s Chakra and accuracy. Retain Technique aptitudes and Restricted aptitudes; other aptitudes must be compatible with the Kugutsu aptitude list. Abilities requiring physical or mental senses, or changing the body (such as Baika Ninpou), cannot be used through human puppets. Only one human puppet can be summoned per scene. You cannot act with a human puppet and other puppets in the same round. Exception: when inside another puppet’s Chest, you can move with the Chest puppet but cannot use its devices."]
];

export async function ensureHitokugutsu(pack, folder) {
 const index = await pack.getIndex();
 const missing = entries.filter(([name]) => !index.some(item => item.folder === folder && item.name === name));
 if (!missing.length) return;
 await Item.createDocuments(missing.map(([name, preRequisito, descricao]) => ({
  name, type: "aptidao", folder,
  system: {
   tipo: "Kugutsu — Restricted Aptitude / Rule Reference",
   preRequisito,
   gratuita: name !== "Hitokugutsu — Partial",
   caracteristicas: "Book of Hijutsus Vol. 2, printed pages 98–100. Living Puppet subentries and Dead Puppet are benefits of Hitokugutsu Complete, not separate purchases.",
   descricao
  }
 })), { pack: pack.collection });
}
