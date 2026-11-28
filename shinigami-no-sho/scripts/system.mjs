import {ATTRIBUTES, COMBAT, EXPERTISE, LINEAGES, ACTIONS, derive, vitalityState, checkResult,
  applyLethalDamage} from "./rules.mjs";

const ID = "shinigami-no-sho";
const ROOT = `systems/${ID}`;
const {NumberField, StringField, SchemaField, BooleanField} = foundry.data.fields;
const {ActorSheetV2, ItemSheetV2} = foundry.applications.sheets;
const {HandlebarsApplicationMixin, DialogV2} = foundry.applications.api;
const {DocumentSheetConfig} = foundry.applications.apps;

function integer(initial = 0, options = {}) {
  return new NumberField({required: true, nullable: false, integer: true, initial, ...options});
}

function fieldSet(keys, initial, options = {}) {
  return new SchemaField(Object.fromEntries(Object.keys(keys).map(key => [key, integer(initial, options)])));
}

function resource() {
  // A null current value lets a new actor start at their calculated maximum.
  return new SchemaField({
    value: new NumberField({required: true, nullable: true, integer: true, initial: null}),
    max: integer(0, {min: 0})
  });
}

class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      campaignLevel: integer(4, {min: 1}),
      lineage: new StringField({initial: "Custom", choices: LINEAGES}),
      notes: new StringField({initial: ""}),
      attributes: fieldSet(ATTRIBUTES, 0, {min: 0}),
      combatBase: fieldSet(COMBAT, 3, {min: 0}),
      expertiseRanks: fieldSet(EXPERTISE, 0, {min: 0}),
      vitality: resource(), reiatsu: resource(),
      vitalityBonus: integer(), reiatsuBonus: integer(), initiativeBonus: integer(),
      stabilized: new BooleanField({initial: false})
    };
  }

  prepareDerivedData() {
    const stats = derive(this);
    this.vitality.max = stats.vitalityMax;
    this.reiatsu.max = stats.reiatsuMax;
    this.vitality.value = Math.min(this.vitality.value ?? this.vitality.max, this.vitality.max);
    this.reiatsu.value = Math.max(0, Math.min(this.reiatsu.value ?? this.reiatsu.max, this.reiatsu.max));
    this.combat = stats.combat;
    this.expertise = stats.expertise;
    this.initiative = stats.initiative;
  }
}

class EntryData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new StringField({initial: ""}), source: new StringField({initial: ""}),
      prerequisites: new StringField({initial: ""}), action: new StringField({initial: "", choices: ACTIONS}),
      range: new StringField({initial: ""}), duration: new StringField({initial: ""}),
      level: integer(0, {min: 0}), cost: new NumberField({integer: true, min: 0, nullable: true, initial: null}),
      quantity: integer(1, {min: 0}), equipped: new BooleanField({initial: false})
    };
  }
}

class ShinigamiActor extends foundry.documents.Actor {
  getRollData() {
    return {...super.getRollData(), initiative: this.system.initiative};
  }

  async changeVitality(amount) {
    const current = this.system.vitality.value;
    const next = amount < 0 ? applyLethalDamage(current, -amount) : Math.min(this.system.vitality.max, current + amount);
    await this.update({"system.vitality.value": next, ...(amount < 0 || next >= -10 ? {"system.stabilized": false} : {})});
  }
}

function dialog(title, content, callback) {
  return DialogV2.input({window: {title}, content,
    ok: {label: "Confirm", callback: (_event, button) => callback(button.form.elements)},
    rejectClose: false});
}

function checkedInteger(value) {
  if (value === "") return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

async function announce(actor, message, title) {
  const body = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = title;
  body.append(heading, document.createElement("br"), document.createTextNode(message));
  return foundry.documents.ChatMessage.create({
    speaker: foundry.documents.ChatMessage.getSpeaker({actor}),
    content: body.outerHTML
  });
}

async function rollCheck(actor, label, accuracy) {
  const options = await dialog(label, `<label>Modifier <input name="modifier" type="number" step="1" value="0"></label>
    <label>Difficulty (optional) <input name="difficulty" type="number" step="1"></label>`, fields =>
    ({modifier: checkedInteger(fields.modifier.value), difficulty: checkedInteger(fields.difficulty.value)}));
  if (!options || options.modifier == null) return;
  const totalAccuracy = accuracy + options.modifier;
  const roll = await new foundry.dice.Roll("2d8 + @accuracy", {accuracy: totalAccuracy}).evaluate();
  const result = checkResult(roll.dice[0].total, totalAccuracy, options.difficulty);
  const target = options.difficulty == null ? "" : ` vs. difficulty ${options.difficulty}`;
  const escape = document.createElement("span");
  escape.textContent = `${label}${target}${result ? ` · ${result}` : ""}`;
  await roll.toMessage({speaker: foundry.documents.ChatMessage.getSpeaker({actor}), flavor: escape.innerHTML});
}

const ITEM_TYPES = {
  power: "Power", technique: "Technique", aptitude: "Aptitude",
  equipment: "Equipment", condition: "Condition", lineage: "Lineage"
};

class ShinigamiActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: [ID, "sns-actor"],
    position: {width: 790, height: 760},
    form: {submitOnChange: true, closeOnSubmit: false},
    window: {resizable: true},
    actions: {
      roll: ShinigamiActorSheet.roll,
      editItem: ShinigamiActorSheet.editItem,
      addItem: ShinigamiActorSheet.addItem,
      deleteItem: ShinigamiActorSheet.deleteItem,
      equip: ShinigamiActorSheet.equip,
      useItem: ShinigamiActorSheet.useItem,
      vitality: ShinigamiActorSheet.vitality,
      rest: ShinigamiActorSheet.rest,
      stabilize: ShinigamiActorSheet.stabilize,
      bleed: ShinigamiActorSheet.bleed
    }
  };

  static PARTS = {main: {template: `${ROOT}/templates/actor.hbs`, scrollable: [".sns-scroll"]}};

  _prepareSubmitData(event, form, formData, updateData) {
    const data = super._prepareSubmitData(event, form, formData, updateData);
    const changed = event?.target?.name;
    if (event?.type !== "change" || !changed) return data;
    // Do not persist unrelated derived resource values on a stat edit.
    const value = foundry.utils.getProperty(data, changed);
    return value === undefined ? {} : {[changed]: value};
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const system = actor.system;
    const groups = Object.entries(ITEM_TYPES).map(([type, label]) => ({
      type, label, items: actor.items.filter(item => item.type === type).sort((a,b) => a.name.localeCompare(b.name))
        .map(item => ({id: item.id, name: item.name, img: item.img, ...item.system.toObject(),
          equipment: type === "equipment", usable: ["power","technique"].includes(type)}))
    }));
    return {...context, actor, system, editable: this.isEditable,
      state: vitalityState(system.vitality.value),
      dying: system.vitality.value >= -20 && system.vitality.value <= -11,
      dodge: 9 + system.combat.dodge,
      lineages: LINEAGES,
      attributes: Object.entries(ATTRIBUTES).map(([key,label]) => ({key,label,value:system.attributes[key]})),
      combat: Object.entries(COMBAT).map(([key,[label]]) => ({key,label,base:system.combatBase[key],value:system.combat[key]})),
      expertise: Object.entries(EXPERTISE).map(([key,[label]]) => ({key,label,rank:system.expertiseRanks[key],value:system.expertise[key]})),
      groups};
  }

  static async roll(_event, target) {
    if (!this.document.isOwner) return;
    const {group, key} = target.dataset;
    const labels = group === "attributes" ? ATTRIBUTES : group === "combat" ? COMBAT : EXPERTISE;
    const label = labels[key];
    if (label) await rollCheck(this.document, Array.isArray(label) ? label[0] : label, this.document.system[group][key]);
  }

  static editItem(_event, target) {
    return this.document.items.get(target.dataset.id)?.sheet?.render({force: true});
  }

  static async addItem(_event, target) {
    if (!this.isEditable) return;
    const type = target.dataset.type;
    if (!(type in ITEM_TYPES)) return;
    const [item] = await this.document.createEmbeddedDocuments("Item", [{name: `New ${ITEM_TYPES[type]}`, type}]);
    await item.sheet.render({force: true});
  }

  static async deleteItem(_event, target) {
    if (!this.isEditable) return;
    const item = this.document.items.get(target.dataset.id);
    if (item && await DialogV2.confirm({window: {title: "Delete entry"}, content: "<p>Remove this entry from the actor?</p>", rejectClose: false})) {
      await item.delete();
    }
  }

  static async equip(_event, target) {
    if (!this.isEditable) return;
    const item = this.document.items.get(target.dataset.id);
    if (item?.type === "equipment") await item.update({"system.equipped": !item.system.equipped});
  }

  static async useItem(_event, target) {
    if (!this.isEditable) return;
    const actor = this.document;
    const item = actor.items.get(target.dataset.id);
    if (!item || !["power","technique"].includes(item.type)) return;
    const cost = await dialog(item.name, `<label>Reiatsu cost <input name="cost" type="number" min="0" step="1"
      value="${item.system.cost ?? ""}" required></label>`, fields => checkedInteger(fields.cost.value));
    if (cost == null || cost < 0 || this.pendingSpend) return;
    this.pendingSpend = true;
    try {
      if (cost > actor.system.reiatsu.value) return ui.notifications.warn("Insufficient Reiatsu.");
      if (cost) await actor.update({"system.reiatsu.value": actor.system.reiatsu.value - cost});
      await announce(actor, `Reiatsu spent ${cost}${item.system.action ? ` · ${item.system.action} action` : ""}`, item.name);
    } finally {
      this.pendingSpend = false;
    }
  }

  static async vitality(_event, target) {
    if (!this.isEditable) return;
    const heal = target.dataset.mode === "heal";
    const amount = await dialog(heal ? "Heal Vitality" : "Apply lethal damage",
      '<label>Amount <input type="number" name="amount" min="1" step="1" required></label>',
      fields => checkedInteger(fields.amount.value));
    if (amount > 0) await this.document.changeVitality(heal ? amount : -amount);
  }

  static async rest() {
    if (!this.isEditable) return;
    const actor = this.document;
    if (actor.system.vitality.value <= -21) return ui.notifications.warn("A dead character cannot recover by resting.");
    if (!await DialogV2.confirm({window: {title:"Full night's rest"}, content:"<p>Recover Vitality and Reiatsu after at least eight hours of uninterrupted sleep.</p>", rejectClose:false})) return;
    const {attributes, vitality, reiatsu} = actor.system;
    await actor.update({
      "system.vitality.value": Math.min(vitality.max, vitality.value + 10 + 2 * attributes.vigor),
      "system.reiatsu.value": Math.min(reiatsu.max, reiatsu.value + 5 + 2 * attributes.spirit)
    });
  }

  static async stabilize() {
    if (!this.isEditable) return;
    const actor = this.document;
    if (vitalityState(actor.system.vitality.value) === "Dying") {
      await actor.update({"system.stabilized": !actor.system.stabilized});
    }
  }

  static async bleed() {
    if (!this.isEditable) return;
    const actor = this.document;
    if (vitalityState(actor.system.vitality.value) === "Dying" && !actor.system.stabilized) await actor.changeVitality(-2);
  }
}

class ShinigamiItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: [ID, "sns-item"], position: {width: 530, height: 590},
    form: {submitOnChange: true, closeOnSubmit: false}, window: {resizable: true}
  };
  static PARTS = {main: {template: `${ROOT}/templates/item.hbs`, scrollable: [".sns-scroll"]}};
  async _prepareContext(options) {
    return {...await super._prepareContext(options), item: this.document,
      system: this.document.system, editable: this.isEditable, actions: ACTIONS,
      kind: ITEM_TYPES[this.document.type], equipment: this.document.type === "equipment"};
  }
}

Hooks.once("init", () => {
  CONFIG.Actor.documentClass = ShinigamiActor;
  CONFIG.Actor.dataModels = {character: CharacterData, npc: CharacterData};
  CONFIG.Item.dataModels = Object.fromEntries(Object.keys(ITEM_TYPES).map(type => [type, EntryData]));
  DocumentSheetConfig.registerSheet(foundry.documents.Actor, ID, ShinigamiActorSheet, {makeDefault: true});
  DocumentSheetConfig.registerSheet(foundry.documents.Item, ID, ShinigamiItemSheet, {makeDefault: true});
});
