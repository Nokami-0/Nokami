const resistance = 'Starting at the beginning of the third turn after exposure, make a Vigor resistance test each turn under the normal Poisoncraft rules. Three successes suppress the effects until the scene ends. Track exposure and resistance manually.';

export function odourlessPoisonMist(quantity = 1) {
  return {
    name:'Odourless Poison Mist — Artificial Poison Smoke Bomb',
    type:'equipamento', img:'icons/svg/poison.svg',
    system:{quantidade:quantity, consumable:true, descricao:
      'Artificial Poison (Level 0; Veneno Artificial), Basic Book 4.1b, pp. 47–49. This is the tabletop equivalent of the film’s reaction-dulling mist. Resolve it as a poison smoke bomb using the ordinary smoke bomb area and duration. A creature that breathes it is exposed. Natural Sciences DC 13 can identify suspicious smoke as a reaction; trained Poisoncraft recognizes it automatically. A creature that notices can hold its breath under the book’s rules. ' +
      resistance + ' Vigor DC 13 (prepared at Poisoncraft 4). On failure, apply the Debilitated condition to tests other than resistance for four hours, subject to the normal poison rules.'}
  };
}

export function lesserParalysingPoison() {
  return {
    name:'Gauntlet Venom — Lesser Paralysing Poison',
    type:'equipamento', img:'icons/svg/poison.svg',
    system:{quantidade:1, consumable:true, descricao:
      'Lesser Paralysing Poison (Level I; Veneno Paralisante Menor), Basic Book 4.1b, pp. 47–50. Carried as one prepared gauntlet coating. A claw strike must deal Degree 3 or higher damage to expose the target. ' +
      resistance + ' Vigor DC 17 (prepared at Poisoncraft 10). On failure, apply Fatigued for four hours, subject to the normal poison rules.'}
  };
}

export const poisonReplacements = {
  karenbana:{'Reaction-Dulling Powder':odourlessPoisonMist(2).name},
  gozu:{'Gauntlet Venom':lesserParalysingPoison().name},
  meizu:{'Gauntlet Venom':lesserParalysingPoison().name}
};

export function poisonLoadoutChanges(actor, profile, id) {
  const replacements = poisonReplacements[id] ?? {};
  const create = [];
  const update = [];
  for (const item of profile.items) {
    if (item.type !== 'equipamento' || !item.system.consumable || item.img !== 'icons/svg/poison.svg') continue;
    if (actor.items.some(owned => owned.type === item.type && owned.name === item.name)) continue;
    const old = actor.items.find(owned => owned.type === item.type && replacements[owned.name] === item.name);
    if (old) {
      update.push({_id:old.id, name:item.name, img:item.img, 'system.descricao':item.system.descricao,
        'system.consumable':true});
    } else {
      create.push(item);
    }
  }
  if (id === 'gozu' || id === 'meizu') {
    const claw = actor.items.find(owned => owned.type === 'equipamento' && owned.name === 'Clawed Gauntlet');
    const description = profile.items.find(item => item.name === claw?.name)?.system.descricao;
    if (description && claw.system.descricao.endsWith('A first hit that deals Vitality damage can expend its prepared dose. See Gauntlet Venom.')) {
      update.push({_id:claw.id, 'system.descricao':description});
    }
  }
  if (id === 'karenbana') {
    const petals = actor.items.find(owned => owned.type === 'poder' && owned.name === 'Illusory Petals');
    const revised = profile.items.find(item => item.name === 'Illusory Petals');
    if (petals?.system.descricao.endsWith('No damage, and repeated uses do not stack.')) {
      update.push({_id:petals.id, 'system.descricao':revised.system.descricao});
    }
  }
  return {create, update};
}
