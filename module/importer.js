Hooks.once("ready", () => {
  if (!game.user.isGM) return;
  game.settings.register("sns-advanced-equipment", "showImport", {name:"Show import button", scope:"world", config:true, type:Boolean, default:true});
  if (!game.settings.get("sns-advanced-equipment", "showImport")) return;
  Hooks.on("renderItemDirectory", (_app, html) => {
    const root = html instanceof HTMLElement ? html : html[0];
    if (!root || root.querySelector(".sns-advanced-import")) return;
    const button = document.createElement("button"); button.className="sns-advanced-import";
    button.innerHTML='<i class="fas fa-box-open"></i> Import SnS Advanced Equipment';
    button.addEventListener("click", importEquipment);
    (root.querySelector(".directory-header") || root).append(button);
  });
});
async function importEquipment() {
  const url = `modules/sns-advanced-equipment/equipment.json`;
  const response = await fetch(url); if (!response.ok) return ui.notifications.error("Cannot load SnS equipment catalog.");
  const data = await response.json();
  const types = game.system.documentTypes?.Item || [];
  const itemType = ["equipment","weapon","loot","item"].find(t=>types.includes(t)) || types[0];
  if (!itemType) return ui.notifications.error("This system exposes no compatible Item document type.");
  const folderName = "SnS Advanced Equipment (10 Years)";
  let folder = game.folders.find(f=>f.type==="Item" && f.name===folderName);
  if (!folder) folder = await Folder.create({name:folderName,type:"Item"});
  const existing = new Set(game.items.filter(i=>i.folder?.id===folder.id).map(i=>i.name));
  const docs = data.filter(i=>!existing.has(i.name)).map(i=>({
    name:i.name,type:itemType,folder:folder.id,
    system:{description:{value:`<p><strong>Category:</strong> ${i.category}</p><p><strong>Price:</strong> ${i.price} Ryo<br><strong>Weapon damage:</strong> ${i.damage}<br><strong>Reach:</strong> ${i.reach}<br><strong>Critical:</strong> ${i.critical}<br><strong>Compartments:</strong> ${i.compartments}<br><strong>Damage type:</strong> ${i.damageType}</p><p><em>Source: ${i.source}, pp. ${i.sourcePages}. Values are SnS modifiers, not dice formulas.</em></p>`}},
    flags:{"sns-advanced-equipment":{stats:i}}
  }));
  if (docs.length) await Item.createDocuments(docs);
  ui.notifications.info(`SnS Advanced Equipment: imported ${docs.length} items; ${data.length-docs.length} already present in module folder.`);
}
