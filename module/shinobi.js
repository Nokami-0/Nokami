import { SHINOBI_CONFIG } from "./config.js";
import {summonStats,normalizeSummonProfile} from './summon-rules.js';
class ShinobiPersonagemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    
    const criarAtributo = () => new fields.SchemaField({
      valor: new fields.NumberField({ initial: 0, integer: true }),
      precisao: new fields.NumberField({ initial: 0, integer: true }),
      resMaior: new fields.BooleanField({ initial: false })
    });

    const criarPericia = (attrBase) => new fields.SchemaField({
      pontos: new fields.NumberField({ initial: 0, integer: true }),
      outro: new fields.NumberField({ initial: 0, integer: true }),
      attr: new fields.StringField({ initial: attrBase })
    });

    const criarCombate = (attrBase) => new fields.SchemaField({
      base: new fields.NumberField({ initial: 3, integer: true }),
      outro: new fields.NumberField({ initial: 0, integer: true }),
      attr: new fields.StringField({ initial: attrBase })
    });

    const criarCalculadora = () => new fields.SchemaField({
      dda: new fields.NumberField({ initial: 0, integer: true }),
      outro: new fields.NumberField({ initial: 0, integer: true }),
      meioGrau: new fields.BooleanField({ initial: false })
    });

    const criarPericiaSocial = (attrBase, socialBase) => new fields.SchemaField({
      pontos: new fields.NumberField({ initial: 0, integer: true }),
      outro: new fields.NumberField({ initial: 0, integer: true }),
      attr: new fields.StringField({ initial: attrBase }),
      social: new fields.StringField({ initial: socialBase })
    });

    return {
      configuracoes: new fields.SchemaField({
        regraTresPontos: new fields.BooleanField({ initial: false }),
        regraQuatroPontos: new fields.BooleanField({ initial: false }),
        acuidade: new fields.BooleanField({ initial: false }),
        combateDefensivo: new fields.BooleanField({ initial: false }),
        diligente: new fields.BooleanField({ initial: false }),
        quimico: new fields.BooleanField({ initial: false }),
        velocista: new fields.BooleanField({ initial: false }),
        shunjutsu1: new fields.BooleanField({ initial: false }),
        burroCarga: new fields.BooleanField({ initial: false }),
        acelerado: new fields.BooleanField({ initial: false }),
        armaduraOssea: new fields.BooleanField({ initial: false }),
        byakugou: new fields.BooleanField({ initial: false }),
        chakraExpandido: new fields.BooleanField({ initial: false }),
        cloneReserva: new fields.BooleanField({ initial: false }),
        controlePerfeito1: new fields.BooleanField({ initial: false }),
        controlePerfeito2: new fields.BooleanField({ initial: false }),
        corpulencia: new fields.BooleanField({ initial: false }),
        furtividadePerceptiva: new fields.BooleanField({ initial: false }),
        mantoBijuu: new fields.BooleanField({ initial: false }),
        modoBijuu: new fields.BooleanField({ initial: false }),
        formaBijuu: new fields.BooleanField({ initial: false }),
        predadorAquatico: new fields.BooleanField({ initial: false }),
        resiliencia: new fields.BooleanField({ initial: false }),
        resistenciaInsaciavel: new fields.BooleanField({ initial: false }),
        rinnegan: new fields.BooleanField({ initial: false }),
        sharinganEsquiva: new fields.BooleanField({ initial: false }),
        shykakyu: new fields.BooleanField({ initial: false })
      }),
      ryo: new fields.NumberField({ initial: 0, min: 0, integer: true }),
      recursoExtra: new fields.SchemaField({
        ativo: new fields.StringField({ initial: "nenhum" }),
        cor: new fields.StringField({ initial: "#800080" }),
        atual: new fields.NumberField({ initial: 0, integer: true })
      }),
      cabecalho: new fields.SchemaField({
        nome: new fields.StringField({ initial: "" }), nc: new fields.NumberField({ initial: 4, integer: true, min: 1 }),
        cla: new fields.StringField({ initial: "" }), patente: new fields.StringField({ initial: "" }),
        filiacao: new fields.StringField({ initial: "Sede do Ciclo" }), genero: new fields.StringField({ initial: "" }),
        tendencia: new fields.StringField({ initial: "" }), idade: new fields.StringField({ initial: "" }),
        localNascimento: new fields.StringField({ initial: "" }), sexualidade: new fields.StringField({ initial: "" })
      }),
      atributos: new fields.SchemaField({
        for: criarAtributo(), des: criarAtributo(), agi: criarAtributo(),
        per: criarAtributo(), vig: criarAtributo(), int: criarAtributo(), esp: criarAtributo()
      }),
      sociais: new fields.SchemaField({
        carisma: criarAtributo(),
        manipulacao: criarAtributo()
      }),
      pericias: new fields.SchemaField({
        acrobacia: criarPericia("agi"), arte: criarPericia("int"), atletismo: criarPericia("for"),
        ciencias: criarPericia("int"), concentracao: criarPericia("int"), cultura: criarPericia("int"),
        disfarce: criarPericia("per"), escapar: criarPericia("des"), furtividade: criarPericia("agi"),
        lidarAnimais: criarPericia("per"), mecanismo: criarPericia("int"), medicina: criarPericia("int"),
        ocultismo: criarPericia("int"), prestidigitacao: criarPericia("des"), procurar: criarPericia("per"),
        prontidao: criarPericia("per"), rastrear: criarPericia("per"), veneficio: criarPericia("int"), voo: criarPericia("agi")
      }),
      combate: new fields.SchemaField({
        corporal: criarCombate("for"), distancia: criarCombate("des"),
        esquiva: criarCombate("agi"), lerMovimentos: criarCombate("per")
      }),
      periciasSociais: new fields.SchemaField({
        acalmar: criarPericiaSocial("int", "manipulacao"), compostura: criarPericiaSocial("int", "manipulacao"),
        convencer: criarPericiaSocial("int", "carisma"), empatia: criarPericiaSocial("per", "manipulacao"),
        encorajar: criarPericiaSocial("esp", "carisma"), enganar: criarPericiaSocial("per", "manipulacao"),
        etiqueta: criarPericiaSocial("per", "manipulacao"), intimidar: criarPericiaSocial("int", "carisma"),
        ouvirBoatos: criarPericiaSocial("per", "manipulacao"), espalharBoatos: criarPericiaSocial("per", "carisma"),
        presenca: criarPericiaSocial("int", "carisma"), provocar: criarPericiaSocial("int", "carisma")
      }),
      defesas: new fields.SchemaField({
        absorcao: new fields.NumberField({ initial: 0, integer: true }),
        dureza: new fields.NumberField({ initial: 0, integer: true }),
        sangramento: new fields.NumberField({ initial: 0, integer: true, min: 0 })
      }),
      calculadora: new fields.SchemaField({
        danoForca: criarCalculadora(), danoDestreza: criarCalculadora(), danoEspirito: criarCalculadora()
      }),
      energias: new fields.SchemaField({
        vitalidade: new fields.SchemaField({ max: new fields.NumberField({ initial: 10, integer: true }), value: new fields.NumberField({ initial: 10, integer: true }), perdido: new fields.NumberField({ initial: 0, integer: true }) }),
        chakra: new fields.SchemaField({ max: new fields.NumberField({ initial: 10, integer: true }), value: new fields.NumberField({ initial: 10, integer: true }), perdido: new fields.NumberField({ initial: 0, integer: true }) }),
        iniciativa: new fields.SchemaField({ pericia: new fields.StringField({ initial: "prontidao" }), atributo: new fields.StringField({ initial: "agi" }), bonus: new fields.NumberField({ initial: 0, integer: true }) }),
        reacaoEsquiva: new fields.SchemaField({ pericia: new fields.StringField({ initial: "esquiva" }), fixo: new fields.NumberField({ initial: 9, integer: true }), bonus: new fields.NumberField({ initial: 0, integer: true }) }),
        deslocamento: new fields.SchemaField({ base: new fields.NumberField({ initial: 10, integer: true }), atributo: new fields.StringField({ initial: "agi" }), divisor: new fields.NumberField({ initial: 2, integer: true }), bonus: new fields.NumberField({ initial: 0, integer: true }) }),
        alcance: new fields.StringField({ initial: "1m" }), tamanho: new fields.StringField({ initial: "MÉDIO" })
      }),
      databook: new fields.SchemaField({
        biografia: new fields.HTMLField({ initial: "" }), curiosidades: new fields.HTMLField({ initial: "" }), relacoesTexto: new fields.HTMLField({ initial: "" }),
        relacoes: new fields.ArrayField(new fields.SchemaField({ nome: new fields.StringField({ initial: "" }), vinculo: new fields.StringField({ initial: "" }), detalhes: new fields.StringField({ initial: "" }) }))
      })
    };
  }

  prepareDerivedData() {
    const summonProfile=normalizeSummonProfile(this.parent?.getFlag?.('shinobi-no-sho-revamp','summonProfile'));
    const nc = summonProfile ? Number(this.cabecalho.nc ?? 0) : this.cabecalho.nc || 1;
    if(summonProfile&&nc<4)for(const attr of Object.values(this.atributos))attr.valor=0;
    if(summonProfile?.intelligenceZero)this.atributos.int.valor=0;
    const conf = this.configuracoes || {};
    
    // Atributos base e efetivos (para cálculos, como o bônus do Modo Bijuu)
    const forFinal = this.atributos.for.valor || 0;
    const desFinal = this.atributos.des.valor || 0;
    const agiFinal = (this.atributos.agi.valor || 0) + (conf.modoBijuu ? 2 : 0);
    const perFinal = this.atributos.per.valor || 0;
    const vigFinal = this.atributos.vig.valor || 0;
    const intFinal = this.atributos.int.valor || 0;
    const espFinal = this.atributos.esp.valor || 0;

    const attrsFinal = { for: forFinal, des: desFinal, agi: agiFinal, per: perFinal, vig: vigFinal, int: intFinal, esp: espFinal };

    // Precisões
    for (let key of Object.keys(this.atributos || {})) { this.atributos[key].precisao = this.atributos[key].valor; }
    for (let key of Object.keys(this.sociais || {})) { this.sociais[key].precisao = this.sociais[key].valor; }

    // Vitalidade MÁX
    let vitBase = 10 + (3 * vigFinal) + (5 * nc);
    if (conf.corpulencia) vitBase += (vigFinal * 3);
    if (conf.cloneReserva) vitBase -= 3;
    this.energias.vitalidade.max = vitBase;

    // Chakra MÁX
    let chkBase = 10 + (3 * (conf.controlePerfeito1 ? intFinal : espFinal));
    if (conf.controlePerfeito2) chkBase += intFinal;
    if (conf.cloneReserva) chkBase -= 5;
    if (conf.byakugou) chkBase -= 15;
    if (conf.chakraExpandido) chkBase = Math.floor(chkBase * 1.5);
    if (conf.rinnegan) chkBase = Math.floor(chkBase * 0.9);
    this.energias.chakra.max = chkBase;

    // Dureza (A base editável do jogador fica salva. Aqui somamos os bônus.)
    let durezaExtra = 0;
    if (conf.armaduraOssea) durezaExtra += (vigFinal < 10 ? 1 : (vigFinal < 14 ? 2 : 3));
    if (conf.predadorAquatico) durezaExtra += (vigFinal < 8 ? 1 : (vigFinal < 12 ? 2 : 3));
    if (conf.resistenciaInsaciavel) durezaExtra += (vigFinal < 10 ? 1 : (vigFinal < 14 ? 2 : 3));
    if (conf.mantoBijuu) durezaExtra += 1;
    if (conf.modoBijuu) durezaExtra += 2;
    if (conf.formaBijuu) durezaExtra += 3;
    if (conf.resiliencia) durezaExtra += Math.floor(vigFinal / 4);
    
    // Only the first equipped armor contributes; this prevents armor stacking.
    const equippedArmor = this.parent?.items?.find(i => i.type === "equipamento" && i.system.equipped && (i.system.isArmor || i?.flags?.['sns-weapon-library']?.armor));
    const armorHardness = Math.max(0, Number(equippedArmor?.system.bodyHardnessBonus ?? equippedArmor?.flags?.['sns-weapon-library']?.bodyHardnessBonus ?? 0));
    durezaExtra += armorHardness;
    // Explicitly enabled defensive powers add their Hardness to the wearer.
    const powerHardness = [...(this.parent?.items ?? [])].filter(i => i.type === "poder" && i.system.hardnessActive).reduce((total,i) => total + Math.max(0,Number(i.system.hardness)||0),0);
    durezaExtra += powerHardness;
    Object.defineProperty(this.defesas, "equippedArmorName", { value: equippedArmor?.name ?? "None", configurable: true });
    Object.defineProperty(this.defesas, "armorAbsorptionMax", { value: Math.max(0,Number(equippedArmor?.system.absorption ?? 0)), configurable: true });
    Object.defineProperty(this.defesas, "armorAbsorptionRemaining", { value: Math.max(0,Number(equippedArmor?.system.absorptionRemaining ?? equippedArmor?.system.absorption ?? 0)), configurable: true });
    const durezaBase = this.defesas.dureza || 0;
    Object.defineProperty(this.defesas, "durezaTotal", { value: durezaBase + durezaExtra, configurable: true });

    // Perícias Gerais
    for (let key of Object.keys(this.pericias || {})) {
      const pericia = this.pericias[key];
      let attrLigado = pericia.attr;
      if (conf.furtividadePerceptiva && key === "furtividade") attrLigado = "per";
      const valorDoAtributo = attrsFinal[attrLigado] || 0;
      const baseCalc = Math.ceil(valorDoAtributo / 2);
      const totalCalc = baseCalc + pericia.pontos + pericia.outro;
      Object.defineProperty(pericia, "base", { value: baseCalc, configurable: true });
      Object.defineProperty(pericia, "total", { value: totalCalc, configurable: true });
    }

    // Combate
    for (let key of Object.keys(this.combate || {})) {
      const combateItem = this.combate[key];
      let attrLigado = combateItem.attr;
      if (conf.acuidade && key === "corporal") attrLigado = "des";
      const valorDoAtributo = attrsFinal[attrLigado] || 0;
      let totalCalc = (combateItem.base !== undefined ? combateItem.base : 3) + valorDoAtributo + (combateItem.outro || 0);
      if (conf.combateDefensivo && key === "corporal") totalCalc -= 2;
      Object.defineProperty(combateItem, "total", { value: totalCalc, configurable: true });
    }

    // Sociais
    for (let key of Object.keys(this.periciasSociais || {})) {
      const pericia = this.periciasSociais[key];
      const valorSocial = this.sociais[pericia.social] ? this.sociais[pericia.social].valor : 0;
      const valorAttr = attrsFinal[pericia.attr] || 0;
      const baseCalc = valorSocial + Math.ceil(valorAttr / 2);
      let totalCalc = baseCalc + pericia.pontos + pericia.outro;
      if (conf.shykakyu && key === "intimidar") totalCalc += 1;
      Object.defineProperty(pericia, "base", { value: baseCalc, configurable: true });
      Object.defineProperty(pericia, "total", { value: totalCalc, configurable: true });
    }

    // Calculadora de Danos
    const atributosBaseDano = { danoForca: forFinal, danoDestreza: desFinal, danoEspirito: espFinal };
    for (let key of Object.keys(this.calculadora || {})) {
      const calc = this.calculadora[key];
      const baseAtributo = Math.ceil(atributosBaseDano[key] / 2);
      const totalBase = Math.max(0, baseAtributo + calc.dda + calc.outro);
      const extraGrau = calc.meioGrau ? 0.5 : 0;
      Object.defineProperty(calc, "baseAtributo", { value: baseAtributo, configurable: true });
      Object.defineProperty(calc, "totalBase", { value: totalBase, configurable: true });
      Object.defineProperty(calc, "grau1", { value: Math.ceil(totalBase * (1 + extraGrau)), configurable: true });
      Object.defineProperty(calc, "grau2", { value: Math.ceil(totalBase * (2 + extraGrau)), configurable: true });
      Object.defineProperty(calc, "grau3", { value: Math.ceil(totalBase * (3 + extraGrau)), configurable: true });
      Object.defineProperty(calc, "grau4", { value: Math.ceil(totalBase * (4 + extraGrau)), configurable: true });
    }

    if(summonProfile){
      const derived=summonStats(summonProfile,nc,attrsFinal,this.energias.vitalidade.max,this.pericias,Object.fromEntries(Object.entries(this.combate).map(([key,v])=>[key,v.total])));
      this.energias.vitalidade.max=derived.vitality;
      for(const [key,total] of Object.entries(derived.skills))Object.defineProperty(this.pericias[key],'total',{value:total,configurable:true});
      for(const [key,total] of Object.entries(derived.combat))Object.defineProperty(this.combate[key],'total',{value:total,configurable:true});
      if(nc<4){for(const attr of Object.values(this.atributos))attr.precisao=0;for(const attr of Object.values(this.sociais))attr.precisao=0;for(const skill of Object.values(this.periciasSociais))Object.defineProperty(skill,'total',{value:0,configurable:true});}
      for(const skill of Object.values(this.periciasSociais))Object.defineProperty(skill,'total',{value:0,configurable:true});
      const summoner=globalThis.game?.actors?.get?.(summonProfile.ownerId);
      if(summonProfile.species?.startsWith('Doki (')&&summoner&&nc>=4)Object.defineProperty(this.pericias.furtividade,'total',{value:Number(summoner.system?.pericias?.arte?.total)||0,configurable:true});
      if(summonProfile.species==='Turtle')Object.defineProperty(this.defesas,'durezaTotal',{value:Math.max(this.defesas.durezaTotal,nc>=16?3:nc>=12?2:1),configurable:true});
    }

    // Iniciativa
    let iniBonusExtra = (conf.diligente ? 3 : 0) + (conf.acelerado ? 2 : 0) + (conf.shykakyu ? 2 : 0);
    const iniPericia = this.pericias[this.energias.iniciativa.pericia] ? this.pericias[this.energias.iniciativa.pericia].total : 0;
    const iniAttrVal = attrsFinal[this.energias.iniciativa.atributo] || 0;
    Object.defineProperty(this.energias.iniciativa, "total", { value: iniPericia + iniAttrVal + this.energias.iniciativa.bonus + iniBonusExtra, configurable: true });

    // Reação Esquiva
    let escBonusExtra = (conf.combateDefensivo ? 3 : 0) - (conf.resiliencia ? 3 : 0);
    let keyEsquiva = conf.sharinganEsquiva ? "lerMovimentos" : this.energias.reacaoEsquiva.pericia;
    const escPericia = this.combate[keyEsquiva] ? this.combate[keyEsquiva].total : 0;
    Object.defineProperty(this.energias.reacaoEsquiva, "total", { value: escPericia + this.energias.reacaoEsquiva.fixo + this.energias.reacaoEsquiva.bonus + escBonusExtra, configurable: true });

    // Deslocamento
    let divExtra = (conf.velocista || conf.acelerado) ? 1 : (this.energias.deslocamento.divisor || 2);
    let attrDesloc = conf.shunjutsu1 ? "esp" : this.energias.deslocamento.atributo;
    const desAttrVal = attrsFinal[attrDesloc] || 0;
    let desBonusExtra = conf.resiliencia ? -5 : 0;
    Object.defineProperty(this.energias.deslocamento, "total", { value: this.energias.deslocamento.base + Math.floor(desAttrVal / divExtra) + this.energias.deslocamento.bonus + desBonusExtra, configurable: true });

    // Recurso Extra MAX
    let maxRecurso = 0;
    switch(this.recursoExtra?.ativo) {
        case "jashin": maxRecurso = (this.pericias.mecanismo?.total || 0) * 3; break;
        case "kikaichuu": maxRecurso = (this.pericias.lidarAnimais?.total || 0); break;
        case "kamiArte": maxRecurso = (this.pericias.arte?.total || 0) * 3; break;
        case "kamiEsp": maxRecurso = espFinal * 3; break;
        case "mangekyou": maxRecurso = 10; break;
        case "kujaku": maxRecurso = 10; break;
        case "suika": maxRecurso = vigFinal * 3; break;
    }
    if (this.recursoExtra) { Object.defineProperty(this.recursoExtra, "max", { value: maxRecurso, configurable: true }); }
  }
}

class ShinobiEquipamentoData extends foundry.abstract.TypeDataModel { static defineSchema() { const fields = foundry.data.fields; return { caracteristicas: new fields.StringField({ initial: "" }), descricao: new fields.StringField({ initial: "" }), quantidade: new fields.NumberField({ initial: 1, integer: true, min: 0 }), consumable: new fields.BooleanField({ initial: false }), consumableKind: new fields.StringField({ initial: "" }), valorRyo: new fields.NumberField({ initial: 0, min: 0, integer: true }), hardness: new fields.NumberField({ initial: 0, min: 0, integer: true }), absorption: new fields.NumberField({ initial: 0, min: 0, integer: true }), absorptionRemaining: new fields.NumberField({ initial: 0, min: 0, integer: true }), isArmor: new fields.BooleanField({ initial: false }), bodyHardnessBonus: new fields.NumberField({ initial: 0, min: 0, integer: true }), peso: new fields.NumberField({ initial: 0, min: 0 }), modificadorCompartimento: new fields.NumberField({ initial: 0, integer: true }), weaponCategory: new fields.StringField({ initial: "none" }), weaponDamage: new fields.NumberField({ initial: 0, integer: true }), weaponBonus: new fields.NumberField({ initial: 0, integer: true }), attackType: new fields.StringField({ initial: "melee" }), weaponSize: new fields.StringField({ initial: "light" }), damageType: new fields.StringField({ initial: "piercing" }), weaponRange: new fields.NumberField({ initial: 0, min: 0 }), criticalRange: new fields.StringField({ initial: "15-16" }), unitsPerSlot: new fields.NumberField({ initial: 1, integer: true, min: 1 }), equipped: new fields.BooleanField({ initial: false }) }; } }
class ShinobiPoderData extends foundry.abstract.TypeDataModel { static defineSchema() { const fields = foundry.data.fields; return { caracteristicas: new fields.StringField({ initial: "" }), descricao: new fields.StringField({ initial: "" }), tipo: new fields.StringField({ initial: "" }), elemento: new fields.StringField({ initial: "" }), nivelUsado: new fields.NumberField({ initial: 1, min: 0, integer: true }), hardness: new fields.NumberField({ initial: 0, min: 0, integer: true }), hardnessActive: new fields.BooleanField({ initial: false }), custo: new fields.StringField({ initial: "" }), custoChakra: new fields.NumberField({ initial: 0, min: 0, integer: true }), custoVitalidade: new fields.NumberField({ initial: 0, min: 0, integer: true }) }; } }
class ShinobiAptidaoData extends foundry.abstract.TypeDataModel { static defineSchema() { const fields = foundry.data.fields; return { caracteristicas: new fields.StringField({ initial: "" }), descricao: new fields.StringField({ initial: "" }), tipo: new fields.StringField({ initial: "" }), custo: new fields.StringField({ initial: "" }), custoChakra: new fields.NumberField({ initial: 0, min: 0, integer: true }), custoVitalidade: new fields.NumberField({ initial: 0, min: 0, integer: true }), nivel: new fields.StringField({ initial: "" }), preRequisito: new fields.StringField({ initial: "" }), gratuita: new fields.BooleanField({ initial: false }) }; } }
class ShinobiElementoData extends foundry.abstract.TypeDataModel { static defineSchema() { const fields = foundry.data.fields; return { caracteristicas: new fields.StringField({ initial: "" }), descricao: new fields.StringField({ initial: "" }), nivel: new fields.StringField({ initial: "" }), efeitos: new fields.StringField({ initial: "" }), nivelUsado: new fields.NumberField({ initial: 1, min: 0, integer: true }), custo: new fields.StringField({ initial: "" }), custoChakra: new fields.NumberField({ initial: 0, min: 0, integer: true }), custoVitalidade: new fields.NumberField({ initial: 0, min: 0, integer: true }) }; } }

import { ShinobiActorSheet } from "./actor-sheet.js";
import { ShinobiItemSheet } from "./item-sheet.js";

Hooks.once("init", () => {

  CONFIG.Actor.dataModels["personagem"] = ShinobiPersonagemData;
  CONFIG.Item.dataModels["equipamento"] = ShinobiEquipamentoData;
  CONFIG.Item.dataModels["poder"] = ShinobiPoderData;
  CONFIG.Item.dataModels["aptidao"] = ShinobiAptidaoData;
  CONFIG.Item.dataModels["elemento"] = ShinobiElementoData;

  CONFIG.Combat.initiative = { formula: SHINOBI_CONFIG.initiativeFormula, decimals: 2 };

  const actors = foundry.documents?.collections?.Actors ?? globalThis.Actors;
  const items = foundry.documents?.collections?.Items ?? globalThis.Items;
  const actorSheet = foundry.appv1?.sheets?.ActorSheet ?? globalThis.ActorSheet;
  const itemSheet = foundry.appv1?.sheets?.ItemSheet ?? globalThis.ItemSheet;
  actors.unregisterSheet("core", actorSheet);
  actors.registerSheet(SHINOBI_CONFIG.systemId, ShinobiActorSheet, { makeDefault: true });
  items.unregisterSheet("core", itemSheet);
  items.registerSheet(SHINOBI_CONFIG.systemId, ShinobiItemSheet, { makeDefault: true });
});
Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  try {
    const { ensureWeaponLibrary } = await import("./weapon-library.js");
    await ensureWeaponLibrary();
  } catch (error) { console.error("Shinobi no Sho: weapon folder creation failed", error); ui.notifications.error("Weapon folders could not be created; check the console."); }
});


