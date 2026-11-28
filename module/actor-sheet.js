import {aptitudeEffects, weaponAptitudeEffects} from './aptitude-effects.js';
import {henchmanNumbers} from "./village-henchmen.mjs";
import {placeSnsWeaponArea} from './sns-weapon-area.js';
import {previewSnsArea,snsAreas,deleteSnsAreas,createSnsArea} from './sns-area-preview.js';
import {puppetTabContext,activatePuppetTab} from './puppets.js';
import {summonSheetContext,summonReferenceKind} from './summon-sheet.js';
import {summonRollRestriction} from './summon-rules.js';
import {summonEquipmentBase} from './doki-equipment.js';
import { setEquipmentState } from './equipment-state.js';
import { fireSkyKunaiLauncher, isSkyKunaiLauncher } from "./sky-equipment.js";
import { fireBombLauncher, isBombLauncher } from "./bomb-launcher.js";
import { openSnsAbilityBrowser } from "./sns-ability-browser.js";
import { SNS_CONDITIONS } from "./sns-conditions.js";
import { rollShinobiTest } from "./dice.js";
function hasUnlimitedResources(actor) {
  const id = actor?.getFlag?.('shini-no-sho-altered', 'bestiaryBoss');
  return /^(?:bijuu-(?:shukaku|matatabi|isobu|son-goku|kokuo|saiken|chomei|gyuki|kurama))$/.test(id ?? '');
}

function powerPoolRow(item, isSummon) {
  const {id, name, img, system} = item;
  const purchased = system.powerPoints;
  const legacyLevel = Number(item.type === 'poder' ? system.nivelUsado : system.nivel);
  const legacyCost = isSummon
    ? Math.max(0, Number.isFinite(legacyLevel) ? legacyLevel : 0)
    : item.type === 'poder' ? 1 : 0;
  const powerPoints = Number.isSafeInteger(purchased) && purchased >= 0 ? purchased : legacyCost;
  return {id, name, img, system, powerPoints};
}

const BaseActorSheet = foundry.appv1?.sheets?.ActorSheet ?? globalThis.ActorSheet;
const RichTextEditor = foundry.applications?.ux?.TextEditor ?? globalThis.TextEditor;
// Fallback inventory controls are installed by the render hook, independently of
// activateListeners. This keeps Add/Edit/Delete/Equip functional even when another
// sheet listener fails while initializing.
Hooks.on('renderActorSheet',(app,html)=>{
  if(!(app instanceof ShinobiActorSheet)||app.actor?.flags?.['shini-no-sho-altered']?.puppetProfile)return;
  const root=html?.[0]??html;
  if(!root?.addEventListener||root.dataset?.snsInventoryFallback==='1')return;
  root.dataset.snsInventoryFallback='1';
  root.addEventListener('click',async event=>{
    const button=event.target?.closest?.('.item-create,.item-edit,.item-delete,.weapon-equip');
    if(!button||!root.contains(button))return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    if(button.dataset.snsBusy==='1')return;
    button.dataset.snsBusy='1';
    try{
      if(!app.actor.isOwner)throw Error('Owner permission is required to edit this actor.');
      if(button.matches('.item-create')){
        const type=button.dataset.type;
        if(!['equipamento','poder','elemento','aptidao','tecnica'].includes(type))throw Error('Unsupported item type: '+type);
        const labels={equipamento:'New Equipment',poder:'New Power',elemento:'New Element',aptidao:'New Aptitude',tecnica:'New Technique'};
        const payload={name:labels[type],type};
        if(type==='aptidao'&&button.dataset.gratuita==='true')payload.system={gratuita:true};
        const created=await app.actor.createEmbeddedDocuments('Item',[payload]);
        if(!created?.[0])throw Error('Foundry returned no new item.');
        app.render(false);
        created[0].sheet?.render(true);
        return;
      }
      const id=button.dataset.itemId||button.closest('[data-item-id]')?.dataset.itemId;
      const item=app.actor.items.get(id);
      if(!item)throw Error('The item was not found on this actor.');
      if(button.matches('.item-edit'))return void item.sheet?.render(true);
      if(button.matches('.item-delete')){
        const ok=await Dialog.confirm({title:'Delete Item',content:'Delete '+foundry.utils.escapeHTML(item.name)+'?'});
        if(ok){await item.delete();app.render(false);}
        return;
      }
      await setEquipmentState(app.actor,item.id);
      app.render(false);
    }catch(error){console.error('Shinobi inventory fallback',error);ui.notifications.error('Inventory: '+(error.message||error));}
    finally{delete button.dataset.snsBusy;}
  },true);
});
export class ShinobiActorSheet extends BaseActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["shinobi", "sheet", "actor"], 
      template: "systems/shini-no-sho-altered/templates/actor-sheet.hbs",
      width: Math.min(1200, Math.max(520, Math.floor(window.innerWidth * 0.90))),
      height: Math.min(900, Math.max(480, Math.floor(window.innerHeight * 0.88))),
      resizable: true,
      scrollY: [".window-content", ".sheet-body", ".sheet-body .tab", ".sheet-body [style*='overflow-y: auto']"],
      tabs: [
        { navSelector: ".sheet-tabs[data-group='primary']", contentSelector: ".sheet-body", initial: "principal" },
        { navSelector: ".sheet-tabs[data-group='secundario']", contentSelector: ".principal-body", initial: "status" }
      ]
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    const systemData = this.actor.system;
    context.system = foundry.utils.deepClone(systemData?.toObject ? systemData.toObject(false) : (systemData || {}));
    const derivedFields = {
      atributos:['precisao'], sociais:['precisao'], pericias:['base','total'],
      periciasSociais:['base','total'], combate:['total'],
      energias:['total','max'], calculadora:['baseAtributo','totalBase','grau1','grau2','grau3','grau4']
    };
    for (const [group, fields] of Object.entries(derivedFields)) {
      for (const [key, value] of Object.entries(systemData?.[group] ?? {})) {
        const destination = context.system[group]?.[key];
        if (!destination) continue;
        for (const field of fields) {
          if (value?.[field] !== undefined) destination[field] = value[field];
        }
      }
    }
    if (context.system.defesas) {
      context.system.defesas.durezaTotal = systemData.defesas.durezaTotal;
      context.system.defesas.absorptionTotal = systemData.defesas.absorptionTotal;
    }
    context.unlimitedResources = hasUnlimitedResources(this.actor);
    Object.assign(context,summonSheetContext(this.actor,game.actors));
    if(!context.isSummon){Object.assign(context,await puppetTabContext(this.actor));}
    const {config:conf, bonus:aptitudeBonus} = aptitudeEffects(this.actor, 'shini-no-sho-altered');

    const nomesPericias = {
      voo: { nome: "Flight", sigla: "AGI" }, acrobacia: { nome: "Acrobatics", sigla: "AGI" }, arte: { nome: "Art", sigla: "INT" }, atletismo: { nome: "Athletics", sigla: "STR" },
      ciencias: { nome: "Natural Sciences", sigla: "INT" }, concentracao: { nome: "Concentration", sigla: "INT" }, cultura: { nome: "Culture", sigla: "INT" },
      disfarce: { nome: "Disguise", sigla: "PER" }, escapar: { nome: "Escape", sigla: "DEX" }, furtividade: { nome: "Stealth", sigla: "AGI" },
      lidarAnimais: { nome: "*Animal Handling", sigla: "PER" }, mecanismo: { nome: "*Mechanics", sigla: "INT" }, medicina: { nome: "*Medicine", sigla: "INT" },
      ocultismo: { nome: "*Occultism", sigla: "INT" }, prestidigitacao: { nome: "Sleight of Hand", sigla: "DEX" }, procurar: { nome: "Search", sigla: "PER" },
      prontidao: { nome: "Readiness", sigla: "PER" }, rastrear: { nome: "Tracking", sigla: "PER" }, veneficio: { nome: "**Poisoncraft", sigla: "INT" }
    };

    context.listaPericias = [];
    for (let key in nomesPericias) {
      if (context.system.pericias && context.system.pericias[key]) {
        let isLocked = (key === "veneficio" && !conf.quimico && !context.summonProfile?.skills?.includes("Poisoncraft"));
        context.listaPericias.push({ chave: key, nomeAmigavel: nomesPericias[key].nome, siglaAttr: nomesPericias[key].sigla, dados: context.system.pericias[key], isLocked: isLocked, showMechanismsRules: key === "mecanismo" });
      }
    }

    const nomesCombate = { corporal: { nome: "Melee Combat (MC)", sigla: "STR" }, distancia: { nome: "Ranged Combat (RC)", sigla: "DEX" }, esquiva: { nome: "Dodge", sigla: "AGI" }, lerMovimentos: { nome: "Read Movement (RM)", sigla: "PER" } };
    context.listaCombate = [];
    for (let key in nomesCombate) {
      if (context.system.combate && context.system.combate[key]) {
        context.listaCombate.push({ chave: key, nomeAmigavel: nomesCombate[key].nome, siglaAttr: nomesCombate[key].sigla, dados: context.system.combate[key] });
      }
    }

    const nomesSociais = { acalmar: { nome: "Calm", sigla: "Yin+½INT" }, compostura: { nome: "Composure", sigla: "Yin+½INT" }, convencer: { nome: "Persuade", sigla: "Yang+½INT" }, empatia: { nome: "Empathy", sigla: "Yin+½PER" }, encorajar: { nome: "Encourage", sigla: "Yang+½SPI" }, enganar: { nome: "Deceive", sigla: "Yin+½PER" }, etiqueta: { nome: "Etiquette", sigla: "Yin+½PER" }, intimidar: { nome: "Intimidate", sigla: "Yang+½INT" }, ouvirBoatos: { nome: "Hear Rumors", sigla: "Yin+½PER" }, espalharBoatos: { nome: "Spread Rumors", sigla: "Yang+½PER" }, presenca: { nome: "Presence", sigla: "Yang+½INT" }, provocar: { nome: "Provoke", sigla: "Yang+½INT" } };
    context.listaSociais = [];
    for (let key in nomesSociais) {
      if (context.system.periciasSociais && context.system.periciasSociais[key]) {
        context.listaSociais.push({ chave: key, nomeAmigavel: nomesSociais[key].nome, siglaAttr: nomesSociais[key].sigla, dados: context.system.periciasSociais[key] });
      }
    }

    context.opcoesAtributos = { for: "Strength", des: "Dexterity", agi: "Agility", per: "Perception", vig: "Vigor", int: "Intelligence", esp: "Spirit" };
    context.opcoesPericias = {}; for (let key in nomesPericias) { context.opcoesPericias[key] = nomesPericias[key].nome; }
    context.opcoesCombate = {}; for (let key in nomesCombate) { context.opcoesCombate[key] = nomesCombate[key].nome; }
    
    context.opcoesRecurso = { nenhum: "None", jashin: "Jashin Doll", kikaichuu: "Kikaichuu (Aburame)", kamiArte: "Kami Points (Art)", kamiEsp: "Kami Points (Spirit)", mangekyou: "Mangekyou Vision Points", kujaku: "Kujaku Health Points", suika: "Suika Points (Hozuki)" };
    
    if (!context.system.recursoExtra) {
      context.system.recursoExtra = { ativo: "nenhum", cor: "#800080", atual: 0, max: 0 };
    }
    
    const recAtivo = context.system.recursoExtra.ativo || "nenhum";
    context.mostrarRecursoExtra = (recAtivo !== "nenhum");
    context.nomeRecursoExtra = context.opcoesRecurso[recAtivo] || "";

    context.recIsNenhum = (recAtivo === "nenhum");
    context.recIsJashin = (recAtivo === "jashin");
    context.recIsKikaichuu = (recAtivo === "kikaichuu");
    context.recIsKamiArte = (recAtivo === "kamiArte");
    context.recIsKamiEsp = (recAtivo === "kamiEsp");
    context.recIsMangekyou = (recAtivo === "mangekyou");
    context.recIsKujaku = (recAtivo === "kujaku");
    context.recIsSuika = (recAtivo === "suika");

    let forFinal = context.system.atributos?.for?.valor || 0;
    let baseCompartimentos = 3;
    if (conf.burroCarga) {
      if (forFinal < 8) baseCompartimentos = 4;
      else if (forFinal < 12) baseCompartimentos = 5;
      else baseCompartimentos = 6;
    }

    baseCompartimentos = Math.max(0, baseCompartimentos + aptitudeBonus('inventory'));

    // Calculate inventory safely even for legacy items with missing fields.
    const num=(v,d=0)=>v===undefined||v===null||v===''||!Number.isFinite(Number(v))?d:Number(v);
    const armor=i=>Boolean(i.system?.isArmor||i.system?.snsArmor||i?.flags?.['sns-weapon-library']?.armor);
    const items=Array.from(this.actor.items || []);
    context.equippedArmor=items.find(i=>i.type==='equipamento'&&i.system?.equipped&&armor(i))||null;
    context.armorAbsorptionRemaining=Math.max(0,num(context.equippedArmor?.system?.absorptionRemaining,num(context.equippedArmor?.system?.absorption)));
    context.armorAbsorptionMax=Math.max(0,num(context.equippedArmor?.system?.absorption));
    context.armorHardnessBonus=Math.max(0,num(context.equippedArmor?.system?.bodyHardnessBonus,num(context.equippedArmor?.flags?.['sns-weapon-library']?.bodyHardnessBonus)));
    context.weaponGroups=['Simple','Martial','Natural','Special','Ammunition','Explosive'];
    context.tecnicas=[];context.equipamentos=[];context.poderes=[];context.aptidoes=[];context.aptidoesGratuitas=[];context.elementos=[];
    let used=0,added=0,removed=0,value=0;
    for(const item of items){
      const reference=context.isSummon?summonReferenceKind(item):null;
      if(reference){context[reference].push(item);continue;}
      if(item.type==='equipamento'){
        const sys=item.system||{},qty=Math.max(0,num(sys.quantidade,1)),perSlot=Math.max(1,num(sys.unitsPerSlot,1));
        const cost=Math.max(0,num(sys.peso,num(sys.snsEquipment?.slots,num(sys.snsWeapon?.slots))));
        const occupied=Math.ceil(qty/perSlot)*cost,modifier=num(sys.modificadorCompartimento);
        used+=occupied;if(modifier>=0)added+=modifier;else removed+=-modifier;
        const price=Math.max(0,num(sys.valorRyo,num(sys.preco,num(sys.price))));value+=qty*price;
        const aptitude = weaponAptitudeEffects(this.actor,item,'shini-no-sho-altered');
        context.equipamentos.push({aptitudeDamage:aptitude.damage, aptitudeAccuracy:aptitude.accuracy, id:item.id,name:item.name,img:item.img,system:{...sys,quantidade:qty,peso:cost,valorRyo:price,equipped:Boolean(sys.equipped)},slotsUsed:occupied});
      }else if(item.type==='poder'){if(item.getFlag('shini-no-sho-altered','basicJutsu'))context.tecnicas.push(item);else context.poderes.push(powerPoolRow(item, context.isSummon));}
      else if(item.type==='elemento')context.elementos.push(powerPoolRow(item, context.isSummon));
      else if(item.type==='aptidao')(item.system?.gratuita?context.aptidoesGratuitas:context.aptidoes).push(item);
    }
    context.preexistingTechniques=items.filter(i=>!i.getFlag('shini-no-sho-altered','basicJutsu')&&i.getFlag('shini-no-sho-altered','hierarchy')?.kind==='Techniques').map(i=>({id:i.id,name:i.name,img:i.img,system:i.system,association:i.getFlag('shini-no-sho-altered','hierarchy')?.owner}));
    context.inventoryValueRyo=value;
    context.compartimentosBase=baseCompartimentos;context.slotsAdded=added;context.slotsRemoved=removed;
    context.compartimentosUsados=used;context.compartimentosMaximos=Math.max(0,baseCompartimentos+added-removed);
    context.compartimentosDisponiveis=Math.max(0,context.compartimentosMaximos-used);
    context.compartimentosExcedidos=used>context.compartimentosMaximos;
    context.excessSlots=Math.max(0,used-3);context.encumbranceMovementPenalty=context.excessSlots*3;context.encumbranceAccuracyPenalty=context.excessSlots;

    if (context.system.databook) {
      context.biografiaHTML = await RichTextEditor.enrichHTML(context.system.databook.biografia || "", { async: true });
      context.curiosidadesHTML = await RichTextEditor.enrichHTML(context.system.databook.curiosidades || "", { async: true });
      context.relacoesHTML = await RichTextEditor.enrichHTML(context.system.databook.relacoesTexto || "", { async: true });
    }

    const nc = context.isSummon ? Number(context.system.cabecalho?.nc ?? 0) : context.system.cabecalho?.nc || 4;
    let niveisExtras = Math.max(0, nc - 4);
    
    let ptsAtributosTotais = context.isSummon && nc < 4 ? 0 : 12 + (niveisExtras * 6);
    let ptsPericiasTotais = 8 + (niveisExtras * 4);
    let ptsPoderesTotais;
    
    if(context.isSummon)ptsPoderesTotais=Math.floor(nc/2);
    else if (conf.regraQuatroPontos) { ptsPoderesTotais = 8 + (niveisExtras * 4); if (nc >= 20) ptsPoderesTotais += 4; }
    else if (conf.regraTresPontos) { ptsPoderesTotais = 6 + (niveisExtras * 3); if (nc >= 20) ptsPoderesTotais += 3; } 
    else { ptsPoderesTotais = 4 + (niveisExtras * 2); }
    
    let ptsSociaisTotais = 2; if (nc >= 7) ptsSociaisTotais += Math.floor((nc - 5) / 2) * 2;

    let gastosAtributos = Object.values(context.system.atributos || {}).reduce((acc, a) => acc + (Number(a?.valor) || 0), 0);
    let gastosSociais = Object.values(context.system.sociais || {}).reduce((acc, s) => acc + (Number(s?.valor) || 0), 0);
    let gastosPericias = 0;
    Object.values(context.system.pericias || {}).forEach(p => gastosPericias += (Number(p?.pontos) || 0));
    Object.values(context.system.combate || {}).forEach(c => { let valorBase = c.base !== undefined ? c.base : 3; gastosPericias += (valorBase - 3); });
    Object.values(context.system.periciasSociais || {}).forEach(ps => gastosPericias += (Number(ps?.pontos) || 0));
    
    const gastosPoderesEAptidoes = [...context.poderes, ...context.elementos]
      .reduce((total, item) => total + item.powerPoints, context.aptidoes.length * 2);
    if (context.isSummon) {
      ptsPericiasTotais = 0;
      gastosPericias = 0;
    }

    context.evolucao = {
      ncAtual: nc, atributos: ptsAtributosTotais - gastosAtributos, pericias: ptsPericiasTotais - gastosPericias,
      poderes: ptsPoderesTotais - gastosPoderesEAptidoes,
      poderesGastos: gastosPoderesEAptidoes, poderesTotais: ptsPoderesTotais, sociais: ptsSociaisTotais - gastosSociais,
      limiteAtributo: nc, limitePericiaPoder: Math.floor(nc / 2)
    };
    context.evolucao.atributosNegativo = context.evolucao.atributos < 0; context.evolucao.periciasNegativo = context.evolucao.pericias < 0; context.evolucao.poderesNegativo = context.evolucao.poderes < 0; context.evolucao.sociaisNegativo = context.evolucao.sociais < 0;

    context.erros = { atributos: {}, sociais: {} };
    for (let key in (context.system.atributos || {})) { if ((context.system.atributos[key]?.valor || 0) > context.evolucao.limiteAtributo) context.erros.atributos[key] = true; }
    for (let key in (context.system.sociais || {})) { if ((context.system.sociais[key]?.valor || 0) > context.evolucao.limiteAtributo) context.erros.sociais[key] = true; }
    context.listaPericias.forEach(p => { p.erroLimite = p.dados.pontos > context.evolucao.limitePericiaPoder; });
    context.listaCombate.forEach(c => { c.erroLimite = c.dados.base > context.evolucao.limitePericiaPoder; });
    context.listaSociais.forEach(s => { s.erroLimite = s.dados.pontos > context.evolucao.limitePericiaPoder; });

    const activeIds = new Set(Array.from(this.actor.effects ?? []).flatMap(effect => Array.from(effect.statuses ?? [])));
    context.snsStatusEffects = SNS_CONDITIONS.map(c => ({ ...c, active: activeIds.has(c.id) }));
    context.snsActiveCount = context.snsStatusEffects.filter(c => c.active).length;
    return context;
  }

  async _onDropItem(event, data) {
    try { return await super._onDropItem(event, data); }
    catch (error) {
      console.error("Shinobi no Sho: drag/drop failed", error);
      ui.notifications.error("Could not add dropped item. See browser console (F12).");
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    // A broken optional tab must not disable basic inventory actions.
    try{activatePuppetTab(html,this.actor);}catch(error){console.error('Puppet tab initialization failed',error);}
    html.find(".sns-technique-browser-open").on("click", event => { event.preventDefault(); openSnsAbilityBrowser(this.actor,true); });
    html.find(".sns-ability-browser-open").on("click", event => { event.preventDefault(); openSnsAbilityBrowser(this.actor); });
    html.find(".sns-status-open").on("click", event => {
      event.preventDefault();
      const active = new Set(Array.from(this.actor.effects ?? []).flatMap(e => Array.from(e.statuses ?? [])));
      const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
      const content = `<div class="sns-status-dialog" style="max-height:60vh;overflow-y:auto;padding:8px"><p>Select conditions to apply or remove from this actor.</p>${SNS_CONDITIONS.map(c => `<label style="display:flex;gap:8px;align-items:flex-start;margin:6px 0"><input type="checkbox" name="sns-status" value="${esc(c.id)}" ${active.has(c.id)?"checked":""} style="width:18px;height:18px;flex:none"><span><strong>${esc(c.name)}</strong><small style="display:block">${esc(c.description)}</small></span></label>`).join("")}</div>`;
      new Dialog({title:"Shinobi no Sho — Status Effects",content,buttons:{save:{label:"Apply Conditions",icon:'<i class="fas fa-check"></i>',callback: async html => {
        const selected = new Set(html.find('input[name="sns-status"]:checked').map((_,el)=>el.value).get());
        for (const condition of SNS_CONDITIONS) {
          if (selected.has(condition.id) !== active.has(condition.id)) {
            try { await this.actor.toggleStatusEffect(condition.id,{active:selected.has(condition.id)}); }
            catch(error) { console.error(`SNS condition ${condition.id}`,error);ui.notifications.error(`Could not update ${condition.name}`); }
          }
        }
        this.render(false);
      }},cancel:{label:"Cancel"}},default:"save",width:520}).render(true);
    });
    html.find(".sns-status-toggle").on("click", async event => {
      event.preventDefault();
      const id = event.currentTarget.dataset.statusId;
      if (!SNS_CONDITIONS.some(c=>c.id===id)) return;
      try { await this.actor.toggleStatusEffect(id); this.render(false); }
      catch(error) {console.error(error);ui.notifications.error("Could not toggle status effect");}
    });
    
    html.find('.roll-iniciativa').click(async ev => {
      ev.preventDefault();
      try {
        await this.actor.rollInitiative({ createCombatants: true });
      } catch (err) {
        const iniTotal = this.actor.system.energias.iniciativa.total || 0;
        const roll = new Roll(`1d8 + ${iniTotal}`);
        await roll.evaluate();
        roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), flavor: "<h3 style='margin: 0; color: darkred;'>Initiative Roll</h3>" });
      }
    });

    html.find('.rollable').click(this._onRoll.bind(this));

    // Item edit/delete are handled by delegated native listeners below.

    
    html.find('.weapon-attack').click(async ev => {
      ev.preventDefault();
      const item=this.actor.items.get($(ev.currentTarget).closest('.item-row').data('itemId'));
      if (!item) return;
      if (isBombLauncher(item)) return fireBombLauncher(this.actor, item);
      if (isSkyKunaiLauncher(item)) return fireSkyKunaiLauncher(this.actor, item);
      if (item.system.weaponCategory === 'none') return ui.notifications.warn('Set a weapon category on this equipment first.');
      const summonAttack=!!item.getFlag('shini-no-sho-altered','summonAttack');
      if(summonAttack&&Number(this.actor.system.cabecalho?.nc)<4)return ui.notifications.warn('Summons below NC 4 cannot deal attack damage.');
      const ranged=item.system.attackType === 'ranged';
      const attribute=Number((ranged?this.actor.system.atributos?.des:this.actor.system.atributos?.for)?.valor ?? 0);
      const aptitude = weaponAptitudeEffects(this.actor,item,'shini-no-sho-altered');
      const dda=Number(item.system.weaponDamage ?? 0), modifier=Number(item.system.weaponBonus ?? 0);
      const henchman=this.actor.getFlag('shini-no-sho-altered','villageHenchman');
      const targets=henchman?[...(game.user.targets ?? [])]:[];
      const capped=henchman&&(!targets.length||targets.some(token=>!token.actor?.getFlag('shini-no-sho-altered','villageHenchman')));
      const base=henchman?henchmanNumbers(this.actor.system.cabecalho.nc).damage
        :summonAttack?summonEquipmentBase(attribute,item):Math.max(0,Math.ceil(attribute/2)+dda+modifier+aptitude.damage);
      const accuracy = (this.actor.system.combate?.[ranged ? 'distancia' : 'corporal']?.total ?? 0) + aptitude.accuracy;
      const criticalMin = aptitude.criticalMin;
      const degrees=capped?[1,2,3]:[1,2,3,4];
      const options=degrees.map(n=>`<option value="${n}">Damage degree ${n}</option>`).join('');
      const degree=await new Promise(resolve=>new Dialog({
        title:`${item.name}: weapon damage`,
        content:`<form><p>Base damage: ${base}${aptitude.damage && !henchman && !summonAttack ? ` (aptitudes: +${aptitude.damage})` : ''}. Select the damage degree determined by the actual attack and defense result.</p><select name="degree">${options}</select><p>${capped?'Against ordinary opponents, Henchman damage caps at Degree 3.':`Critical threat: ${criticalMin === 16 ? '16' : `${criticalMin}–16`}.`}</p></form>`,
        buttons:{attack:{label:'Roll Attack',callback:()=>resolve('attack')},apply:{label:'Calculate',callback:html=>resolve(Number(html.find('[name=degree]').val()))},cancel:{label:'Cancel',callback:()=>resolve(null)}},
        default:'apply',close:()=>resolve(null)
      }).render(true));
      if (degree === 'attack') {
        return this._onRoll(ev, {
          nome: foundry.utils.escapeHTML(item.name),
          precisao: accuracy,
          combatRoll: 'true'
        }, criticalMin);
      }
      if (!degrees.includes(degree)) return;
      if (henchman) return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this.actor}),
        content:`<h3>${foundry.utils.escapeHTML(item.name)}</h3><p>Henchman base damage: ${base}. Degree ${degree}: <strong>${base*degree} damage</strong>.</p>`});
      await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this.actor}),
        content:`<h3>${foundry.utils.escapeHTML(item.name)}</h3><p>Base damage: ${summonAttack?'max(3, Strength '+attribute+' − 3)':'ceil('+(ranged?'Dexterity':'Strength')+' '+attribute+' / 2)'} + ${summonAttack?('Martial weapon bonus '+(item.system.weaponCategory==='martial'?1:0)):('Weapon Damage '+dda+' + Modifier '+modifier+(aptitude.damage?' + Aptitudes '+aptitude.damage:''))} = <strong>${base}</strong></p><p>Damage degree ${degree}: <strong>${base*degree} damage</strong>.</p><p>Critical threat: ${criticalMin === 16 ? '16' : `${criticalMin}–16`}. Resolve attack, critical result, defenses and hardness using the combat rules.</p>`});
    });
    html.find('.sns-armor-damage').click(async ev => {
      ev.preventDefault();
      const armor=this.actor.items.find(i=>i.type==="equipamento" && i.system.equipped && (i.system.isArmor || i?.flags?.['sns-weapon-library']?.armor));
      const response=await new Promise(resolve=>new Dialog({title:"Take Damage",content:'<form><label>Incoming damage</label><input type="number" name="damage" min="0" step="1" value="0"/><label>Damage resource</label><select name="damageResource"><option value="vitalidade">Vitality</option><option value="chakra">Chakra</option></select><p>Hardness reduces damage first; equipped armor uses its remaining Absorption pool; character Absorption then reduces the remainder before the selected resource. For effects that bypass defenses, use the checkboxes below.</p><label><input type="checkbox" name="bypassHardness"/> Bypass Hardness</label><label><input type="checkbox" name="bypassAbsorption"/> Bypass Absorption</label></form>',buttons:{apply:{label:"Take Damage",callback:html=>resolve({damage:Number(html.find('[name=damage]').val()),damageResource:html.find('[name=damageResource]').val(),bypassHardness:html.find('[name=bypassHardness]').is(':checked'),bypassAbsorption:html.find('[name=bypassAbsorption]').is(':checked')})},cancel:{label:"Cancel",callback:()=>resolve(null)}},default:"apply",close:()=>resolve(null)}).render(true));
      if(!response)return;
      const {damage,damageResource,bypassHardness,bypassAbsorption}=response;
      if(!Number.isSafeInteger(damage)||damage<0)return ui.notifications.error("Enter a non-negative whole number.");
      if(!['vitalidade','chakra'].includes(damageResource))return ui.notifications.error("Select Vitality or Chakra.");
      const hardness=bypassHardness?0:Math.max(0,Number(this.actor.system.defesas.durezaTotal)||0);
      const afterHardness=Math.max(0,damage-hardness);
      const armorRemaining=armor?Math.max(0,Number(armor.system.absorptionRemaining ?? armor.system.absorption)||0):0;
      const armorBlocked=bypassAbsorption?0:Math.min(armorRemaining,afterHardness);
      const afterArmor=afterHardness-armorBlocked;
      const characterAbsorption=bypassAbsorption?0:Math.max(0,Number(this.actor.system.defesas.absorptionTotal ?? this.actor.system.defesas.absorcao)||0);
      const characterBlocked=Math.min(characterAbsorption,afterArmor);
      const resourceDamage=afterArmor-characterBlocked;
      const resourcePath=`system.energias.${damageResource}.value`;
      const resourceBefore=Math.max(0,Number(this.actor.system.energias?.[damageResource]?.value)||0);
      const unlimited = hasUnlimitedResources(this.actor);
      const actualResourceLoss = unlimited ? 0 : Math.min(resourceBefore, resourceDamage);
      if(armorBlocked)await this.actor.updateEmbeddedDocuments("Item",[{_id:armor.id,"system.absorptionRemaining":armorRemaining-armorBlocked}]);
      if(actualResourceLoss)await this.actor.update({[resourcePath]:resourceBefore-actualResourceLoss});
      const resourceLabel=damageResource==='chakra'?'Chakra':'Vitality';
      await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this.actor}),content:`<h3>${resourceLabel} Damage Taken</h3><p>Incoming: ${damage}; Hardness prevented: ${Math.min(damage,hardness)}; Armor Absorption spent: ${armorBlocked}; Character Absorption prevented: ${characterBlocked}; ${resourceLabel} lost: ${actualResourceLoss}.</p><p>Remaining ${resourceLabel}: ${unlimited ? 'Unlimited' : resourceBefore-actualResourceLoss}; Armor Absorption: ${armorRemaining-armorBlocked}.</p>`});
      this.render(false);
    });
    html.find('.sns-armor-repair').click(async ev=>{
      ev.preventDefault();
      const armor=this.actor.items.find(i=>i.type==="equipamento" && i.system.equipped && (i.system.isArmor || i?.flags?.['sns-weapon-library']?.armor));
      if(!armor)return ui.notifications.warn("Equip armor first.");
      if(!game.user.isGM)return ui.notifications.warn("Only the GM can restore armor absorption.");
      await this.actor.updateEmbeddedDocuments("Item",[{_id:armor.id,"system.absorptionRemaining":Math.max(0,Number(armor.system.absorption)||0)}]);
      ui.notifications.info(`${armor.name}: armor absorption restored.`);
    });
    html.find('.ninpou-damage').click(async ev => {
      ev.preventDefault();
      const id=ev.currentTarget.closest('[data-item-id]')?.dataset.itemId;
      const item=this.actor.items.get(id);
      if (!item || !['poder','elemento'].includes(item.type)) return;
      const spirit=Number(this.actor.system.atributos?.esp?.valor ?? 0);
      const level=Number(item.system.nivelUsado ?? 1);
      if (!Number.isSafeInteger(level) || level<0) return ui.notifications.error('Set a valid Power Level Used on this jutsu.');
      const half=Math.ceil(spirit/2);
      const base=half+level;
      await ChatMessage.create({
        speaker:ChatMessage.getSpeaker({actor:this.actor}),
        content:`<h3>${foundry.utils.escapeHTML(item.name)} — Ninpou / Elemental Base Damage</h3><p>ceil(Spirit ${spirit} ÷ 2) + Power Level ${level} = <strong>${base} base damage</strong>.</p><p>Resolve the attack, defense, damage degree and any effect-specific exceptions separately. This button does not spend Chakra or Vitality; use the separate Use button to pay costs.</p>`
      });
    });
    html.find('.sns-consume-item').click(async ev => {
      ev.preventDefault();
      const row = ev.currentTarget.closest('[data-item-id]');
      const item = this.actor.items.get(row?.dataset.itemId);
      if (!item || !item.system.consumable) return;
      const qty = Math.max(0, Math.trunc(Number(item.system.quantidade ?? 0)));
      if (qty < 1) { ui.notifications.warn(`${item.name}: no uses remaining.`); return; }
      await item.update({'system.quantidade': qty - 1});
      await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this.actor}),content:`<p><strong>${foundry.utils.escapeHTML(this.actor.name)}</strong> uses 1 × <strong>${foundry.utils.escapeHTML(item.name)}</strong> (${qty - 1} remaining).</p>`});
    });

    html.find('.sns-weapon-area').on('click',async ev=>{
      ev.preventDefault();ev.stopPropagation();
      const item=this.actor.items.get(ev.currentTarget.dataset.itemId);
      if(!item)return ui.notifications.error('Weapon item not found.');
      try{await placeSnsWeaponArea(this.actor,item);}catch(e){console.error(e);ui.notifications.error(e.message);}
    });
    html.find('.sns-area-place').on('click',async ev=>{
      ev.preventDefault();
      const row=ev.currentTarget.closest('[data-item-id]'),item=this.actor.items.get(row?.dataset.itemId);
      if(!item||!canvas?.scene)return ui.notifications.warn('Open a scene and select an ability.');
      const token=this.actor.getActiveTokens().find(t=>(t.document?.parent?.id ?? t.scene?.id)===canvas.scene.id);
      if(!token)return ui.notifications.warn('Place this actor token on the scene first.');
      const allowed=item.getFlag('shini-no-sho-altered','allowedAreaShapes');
      const choices=['cone','circle','ray','rect'].filter(t=>!Array.isArray(allowed)||allowed.includes(t));
      if(!choices.length)return ui.notifications.warn('This ability has no allowed area shapes configured.');
      const labels={cone:'Cone',circle:'Circle / Burst',ray:'Line / Ray',rect:'Rectangle'};
      const options=choices.map(t=>'<option value="'+t+'">'+labels[t]+'</option>').join('');
      const answer=await new Promise(resolve=>new Dialog({
        title:'Area: '+foundry.utils.escapeHTML(item.name),
        content:'<p>Choose a shape permitted by this Ninpou, technique or device. The template is visual only; it does not deal damage or spend Chakra.</p><label>Shape</label><select name="shape">'+options+'</select><label>Distance (scene units)</label><input name="distance" type="number" min="0.1" step="any" value="5"><label>Direction (degrees)</label><input name="direction" type="number" value="0"><label>Cone angle</label><input name="angle" type="number" min="1" max="360" value="90"><label>Line width</label><input name="width" type="number" min="0.1" value="1"><label>Remove template</label><select name="cleanup"><option value="after-use">After ability is used (cast)</option><option value="next-area">When placing another area for this actor</option><option value="manual">Manually with Erase</option></select>',
        buttons:{place:{label:'Place',callback:h=>resolve({t:h.find('[name=shape]').val(),distance:Number(h.find('[name=distance]').val()),direction:Number(h.find('[name=direction]').val()),angle:Number(h.find('[name=angle]').val()),width:Number(h.find('[name=width]').val()),cleanup:h.find('[name=cleanup]').val()})},cancel:{label:'Cancel',callback:()=>resolve(null)}},default:'place',close:()=>resolve(null)
      }).render(true));
      if(!answer)return;
      if(!choices.includes(answer.t)||![answer.distance,answer.direction,answer.angle,answer.width].every(Number.isFinite)||answer.distance<=0||answer.width<=0||answer.angle<1||answer.angle>360)return ui.notifications.error('Invalid area dimensions.');
      try{
        const prior=snsAreas(canvas.scene,this.actor.id).filter(d=>d.getFlag('shini-no-sho-altered','cleanup')==='next-area');
        const p=token.center;
        const positioned=await previewSnsArea({t:answer.t,distance:answer.distance,direction:answer.direction,angle:answer.angle,width:answer.width,user:game.user.id,x:p.x,y:p.y,fillColor:'#ff9900'});
        if(!positioned)return;
        await createSnsArea(canvas.scene,positioned,{actorId:this.actor.id,itemId:item.id,cleanup:answer.cleanup,name:item.name});
        if(prior.length)await deleteSnsAreas(canvas.scene,prior);
        ui.notifications.info(answer.cleanup==='after-use'?'Area placed. It will disappear when this ability is used.':'Area placed. Use Erase to remove it at any time.');
      }catch(e){console.error(e);ui.notifications.error('Cannot place or remove area: check scene permissions.');}
    });
    html.find('.sns-area-clear').on('click',async ev=>{
      ev.preventDefault();
      if(!canvas?.scene)return;
      const areas=snsAreas(canvas.scene,this.actor.id);
      if(!areas.length)return ui.notifications.info('No areas from this actor on this scene.');
      if(!await Dialog.confirm({title:'Erase Areas',content:'Erase '+areas.length+' area templates for this actor?'}))return;
      try{await deleteSnsAreas(canvas.scene,areas);}catch(e){console.error(e);ui.notifications.error('Unable to erase templates.');}
    });
    html.find('.item-use').click(async ev => {
      ev.preventDefault();
      const row = $(ev.currentTarget).closest('.item-row');
      const item = this.actor.items.get(row.data('itemId'));
      if (!item) return;
      let chakraCost = Number(item.system.custoChakra ?? 0);
      const mode=item.getFlag('shini-no-sho-altered','costMode');
      if(mode==='kai'||mode==='bunshin'){
        const selected=await new Promise(resolve=>new Dialog({title:item.name,content:mode==='kai'?'<p>Self-release requires prior successful genjutsu detection. Self-release and canceling your own jutsu cost 0. Releasing another person requires a Spirit or Intelligence test against the original resistance difficulty.</p><label>Use</label><select name="mode"><option value="self">Self-release / cancel own jutsu (0)</option><option value="other">Release another person</option></select><label>Canceled genjutsu chakra cost</label><input name="cost" type="number" min="0" step="1" value="0">':'<label>Use</label><select name="cost"><option value="1">Illusory clones (1 Chakra)</option><option value="4">Feint (4 Chakra)</option></select>',buttons:{use:{label:'Use',callback:h=>resolve(mode==='kai'&&h.find('[name="mode"]').val()==='self'?0:Number(h.find('[name="cost"]').val()))},cancel:{label:'Cancel',callback:()=>resolve(null)}},close:()=>resolve(null)}).render(true));
        if(selected===null)return;chakraCost=selected;
      }
      const vitalityCost = Number(item.system.custoVitalidade ?? 0);
      if (![chakraCost, vitalityCost].every(n => Number.isSafeInteger(n) && n >= 0)) {
        return ui.notifications.error('Costs must be non-negative whole numbers.');
      }
      const chakra = Number(this.actor.system.energias?.chakra?.value ?? 0);
      const vitality = Number(this.actor.system.energias?.vitalidade?.value ?? 0);
      const unlimited = hasUnlimitedResources(this.actor);
      if (!unlimited && (chakra < chakraCost || vitality < vitalityCost)) {
        return ui.notifications.warn(`Not enough resources for ${item.name}. Requires ${chakraCost} Chakra and ${vitalityCost} Vitality.`);
      }
      try {
        if (!unlimited) await this.actor.update({
          'system.energias.chakra.value': chakra - chakraCost,
          'system.energias.vitalidade.value': vitality - vitalityCost
        });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: `<strong>${foundry.utils.escapeHTML(item.name)}</strong> used. ${unlimited ? 'Chakra and Vitality are unlimited.' : `Spent ${chakraCost} Chakra and ${vitalityCost} Vitality.`}`
        });
        // Remove only this ability's one-use visual areas after a successful cast.
        if(canvas?.scene){
          const spentAreas=snsAreas(canvas.scene,this.actor.id).filter(d=>d.getFlag('shini-no-sho-altered','areaItem')===item.id&&d.getFlag('shini-no-sho-altered','cleanup')==='after-use');
          if(spentAreas.length)try{await deleteSnsAreas(canvas.scene,spentAreas);}catch(error){console.warn('Area cleanup requires template deletion permission',error);ui.notifications.warn('Ability used; erase its area manually if permissions prevent automatic removal.');}
        }
      } catch (error) {
        console.error('Shinobi no Sho resource deduction failed:', error);
        ui.notifications.error('Could not deduct resources.');
      }
    });

    html.find('.item-to-chat').click(ev => {
      const li = $(ev.currentTarget).parents(".item-row"); const item = this.actor.items.get(li.data("itemId"));
      let cor = "#333"; if (item.type === "poder") cor = "darkblue"; if (item.type === "aptidao") cor = "darkgreen"; if (item.type === "equipamento") cor = "darkred"; if (item.type === "elemento") cor = "darkorange";
      
      let caracTexto = item.system.caracteristicas ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #b8b0a1;">${item.system.caracteristicas.replace(/\n/g, '<br>')}</div>` : "";
      let descTexto = item.system.descricao ? item.system.descricao.replace(/\n/g, '<br>') : "No description.";
      
      let caracteristicas = ""; let detalhes = "";
      if (item.type === "poder") { 
        caracteristicas = `<strong>Type:</strong> ${item.system.tipo || "-"}<br><strong>Element:</strong> ${item.system.elemento || "-"}<br><strong style="color: darkred;">Cost:</strong> ${item.system.custo || "-"}${caracTexto}`; 
        detalhes = `<em>No additional details.</em>`;
      } else if (item.type === "aptidao") { 
        caracteristicas = `<strong style="color: darkred;">Cost:</strong> ${item.system.custo || "-"}${caracTexto}`; 
        detalhes = `<strong>Type:</strong> ${item.system.tipo || "-"}<br><strong>Level:</strong> ${item.system.nivel || "-"}<br><strong>Prerequisite:</strong> ${item.system.preRequisito || "-"}`;
      } else if (item.type === "elemento") { 
        caracteristicas = `<strong>Level:</strong> ${item.system.nivel || "-"}<br><strong style="color: darkred;">Cost:</strong> ${item.system.custo || "-"}${caracTexto}`; 
        let efeitosTexto = item.system.efeitos ? item.system.efeitos.replace(/\n/g, '<br>') : "-";
        detalhes = `<strong>Efeitos Comprados:</strong><br>${efeitosTexto}`;
      } else if (item.type === "equipamento") { 
        caracteristicas = `<strong>Quantidade:</strong> ${item.system.quantidade || 0}<br><strong>Compartimentos:</strong> ${item.system.peso || 0}${caracTexto}`; 
        detalhes = `<em>No additional details.</em>`;
      }

      let content = `
      <div style="padding: 10px; border: 2px solid ${cor}; background: #e6dfcf; border-radius: 5px; font-family: 'Marcellus', serif; color: #332b22; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 10px 0; font-family: 'Kaushan Script', cursive; font-size: 24px; color: ${cor}; text-align: center; border-bottom: 2px solid ${cor}; padding-bottom: 5px; text-shadow: 1px 1px 2px rgba(255,255,255,0.5);">${item.name}</h3>
        <div style="text-align: center; margin-bottom: 15px;">
          <img src="${item.img}" style="width: 100%; max-width: 250px; height: auto; border-radius: 5px; border: 2px solid #332b22; box-shadow: 2px 2px 6px rgba(0,0,0,0.3); background: rgba(0,0,0,0.05);">
        </div>
        <details style="margin-bottom: 8px; border: 1px solid #b8b0a1; border-radius: 3px; background: rgba(245, 240, 230, 0.8);">
          <summary style="font-weight: bold; cursor: pointer; color: ${cor}; padding: 6px; background: rgba(0,0,0,0.05); outline: none;">📜 Features</summary>
          <div style="padding: 8px; font-size: 13px; line-height: 1.4; border-top: 1px dashed #b8b0a1;">${caracteristicas}</div>
        </details>
        ${(item.type === "aptidao" || item.type === "elemento") ? `
        <details style="margin-bottom: 8px; border: 1px solid #b8b0a1; border-radius: 3px; background: rgba(245, 240, 230, 0.8);">
          <summary style="font-weight: bold; cursor: pointer; color: ${cor}; padding: 6px; background: rgba(0,0,0,0.05); outline: none;">🔍 Detalhes</summary>
          <div style="padding: 8px; font-size: 13px; line-height: 1.4; border-top: 1px dashed #b8b0a1;">${detalhes}</div>
        </details>` : ""}
        <details style="border: 1px solid #b8b0a1; border-radius: 3px; background: rgba(245, 240, 230, 0.8);">
          <summary style="font-weight: bold; cursor: pointer; color: ${cor}; padding: 6px; background: rgba(0,0,0,0.05); outline: none;">📖 Description</summary>
          <div style="padding: 8px; font-size: 13px; line-height: 1.4; border-top: 1px dashed #b8b0a1;">${descTexto}</div>
        </details>
      </div>`;
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: content });
    });
  }

  async _onRoll(event, rollData = event.currentTarget.dataset, criticalMin = 15) {
    event.preventDefault(); const nomeTeste = rollData.nome; const precisao = parseInt(rollData.precisao) || 0;
    const henchman = this.actor.getFlag('shini-no-sho-altered','villageHenchman');
    if (henchman && !rollData.combatRoll) return ui.notifications.warn('Henchmen automatically fail ordinary attribute and skill tests.');
    const restriction=summonRollRestriction(this.actor.getFlag('shini-no-sho-altered','summonProfile'),Number(this.actor.system.cabecalho?.nc),nomeTeste);
    if(restriction)return ui.notifications.warn(restriction);
    const template = `<form><div class="form-group" style="margin-bottom: 10px;"><label>Extra Modifier (+ or -):</label><input type="number" id="modificador" name="modificador" value="0" autofocus /></div><div class="form-group" style="margin-bottom: 10px;"><label>Current Condition:</label><select id="condicao" name="condicao"><option value="0">None</option><option value="2">Advantage (+2)</option><option value="-2">Disadvantage (-2)</option><option value="-4">Severe Condition (-4)</option></select></div></form>`;
    new Dialog({
      title: `Teste de ${nomeTeste}`, content: template,
      buttons: {
        rolar: {
          label: "Roll 2d8",
          callback: async (html) => {
            const modTotal = (parseInt(html.find("#modificador").val()) || 0) + (parseInt(html.find("#condicao").val()) || 0);
            const roll = await rollShinobiTest(precisao, modTotal);
            const somaDados = roll.dice[0].total; let textoGrau = "", corCaixa = "rgba(0,0,0,0.05)", corBorda = "#333";
            if (somaDados <= 3) { textoGrau = "CRITICAL FAILURE (2-3)"; corCaixa = "rgba(255, 0, 0, 0.15)"; corBorda = "darkred"; } else if (somaDados >= criticalMin) { textoGrau = `CRITICAL HIT! DEGREE 4 (${criticalMin}–16)`; corCaixa = "rgba(0, 255, 0, 0.15)"; corBorda = "darkgreen"; } else if (somaDados <= 8) { textoGrau = "DEGREE 1 (4-8)"; } else if (somaDados <= 11) { textoGrau = "DEGREE 2 (9-11)"; } else { textoGrau = `DEGREE 3 (12–${criticalMin - 1})`; }
            const chatHtml = `<div style="padding: 8px; border: 2px solid ${corBorda}; border-radius: 5px; background: ${corCaixa};"><h3 style="margin-top: 0; border-bottom: 1px solid ${corBorda}; text-align: center;">${nomeTeste}</h3><p style="margin: 5px 0; font-size: 12px; text-align: center;"><strong>Accuracy:</strong> ${precisao} | <strong>Mods:</strong> ${modTotal}</p><h4 style="margin: 5px 0; text-align: center;">Dice (2d8): 🎲 ${somaDados}</h4><h2 style="margin: 5px 0; text-align: center; font-size: 28px; color: #000;">Total: ${roll.total}</h2><h3 style="margin: 0; text-align: center; font-weight: bold; color: ${corBorda};">${textoGrau}</h3></div>`;
            ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: chatHtml, rolls: [roll] });
          }
        }
      }, default: "rolar"
    }).render(true);
  }
}







