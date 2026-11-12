export class ShinobiItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["shinobi", "sheet", "item"], width: 520, height: 480,
      // Ligação correta às abas
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "caracteristicas" }]
    });
  }

  get template() { return `systems/shinobi-no-sho-revamp/templates/item-sheet.hbs`; }

  async getData(options) {
    const context = await super.getData(options);
    context.system = context.item.system;
    
    context.isPoder = context.item.type === "poder";
    context.isAptidao = context.item.type === "aptidao";
    context.isEquipamento = context.item.type === "equipamento";
    context.isEquipment = context.isEquipamento;
    context.isElemento = context.item.type === "elemento";
    context.isElement = context.isElemento;
    
    context.weaponCategories={none:'Non-weapon',natural:'Natural',simple:'Simple',martial:'Martial',special:'Special',firearm:'Firearms'};
    context.attackTypes={melee:'Melee (Strength)',ranged:'Ranged / Thrown (Dexterity)'};
    context.weaponSizes={light:'Light',medium:'Medium',long:'Long',heavy:'Heavy'};
    context.damageTypes={piercing:'Piercing',slashing:'Slashing',bludgeoning:'Bludgeoning',fire:'Fire',none:'Not applicable'};
    context.criticalRanges={'15-16':'15–16 (standard)','14-15-16':'14–16 (expanded)','—':'No critical'};
    return context;
  }
}