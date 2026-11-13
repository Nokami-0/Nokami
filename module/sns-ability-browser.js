/* Character-sheet browser for source-labeled clan/Hijutsu compendium entries. */
const SYS='shinobi-no-sho-revamp';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export async function openSnsAbilityBrowser(actor){
 const packs=game.packs.filter(p=>p.metadata?.type==='Item'&&p.collection.startsWith('world.sns-'));
 if(!packs.length){ui.notifications.warn('Build the Shinobi compendiums in System Settings first.');return;}
 const entries=[];
 for(const pack of packs){
  const index=await pack.getIndex({fields:[`flags.${SYS}.hierarchy`,`flags.${SYS}.compendiumUid`]});
  for(const row of index){const meta=row.flags?.[SYS]?.hierarchy;
   if(meta&&['Clan','Clans','Hijutsu','Common Ninpou'].includes(meta.family))entries.push({pack,id:row._id,name:row.name,meta:{...meta,family:meta.family==='Clan'?'Clans':meta.family}});
  }
 }
 if(!entries.length){ui.notifications.warn('No organized ability entries found. Rebuild the compendiums.');return;}
 const families=['Common Ninpou','Clans','Hijutsu'];
 const content=`<form class="sns-ability-browser"><p>Browse by source association. Adding an ability does not waive its prerequisites or purchase cost.</p>
 <div class="form-group"><label>Source</label><select name="family">${families.map(f=>`<option>${f}</option>`).join('')}</select></div>
 <div class="form-group"><label>Power / Association</label><select name="owner"></select></div>
 <div class="form-group"><label>Ability type</label><select name="kind"><option value="">All types</option></select></div>
 <div class="form-group"><label>Level</label><select name="level"><option value="">All levels</option></select></div>
 <div class="form-group"><label>Search</label><input name="query" type="search" placeholder="Filter by name"></div>
 <div class="sns-ability-results" style="max-height:380px;overflow:auto;border:1px solid #777;padding:5px"></div></form>`;
 const dlg=new Dialog({title:`Powers & Abilities — ${actor.name}`,content,buttons:{close:{label:'Close'}},render:html=>{
  const el=n=>html.find(`[name="${n}"]`);
  const selected=()=>entries.filter(x=>x.meta.family===el('family').val()&&x.meta.owner===el('owner').val());
  const rebuildOwners=()=>{const names=[...new Set(entries.filter(x=>x.meta.family===el('family').val()).map(x=>x.meta.owner))].sort();el('owner').html(names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join(''));rebuildFilters();};
  const rebuildFilters=()=>{const filtered=selected();const kinds=[...new Set(filtered.map(x=>x.meta.kind))].sort();el('kind').html('<option value="">All types</option>'+kinds.map(k=>`<option>${esc(k)}</option>`).join(''));const levels=[...new Set(filtered.map(x=>x.meta.level||'Unspecified'))].sort((a,b)=>Number(a)-Number(b));el('level').html('<option value="">All levels</option>'+levels.map(k=>`<option value="${esc(k)}">${esc(k==='Unspecified'?'Level unspecified':`Level ${k}`)}</option>`).join(''));draw();};
  const draw=()=>{const q=el('query').val().toLowerCase().trim();const rows=selected().filter(x=>(!el('kind').val()||x.meta.kind===el('kind').val())&&(!el('level').val()||String(x.meta.level||'Unspecified')===el('level').val())&&(!q||x.name.toLowerCase().includes(q)));
   html.find('.sns-ability-results').html(rows.length?rows.map((x,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:4px;border-bottom:1px solid #888"><span style="flex:1">${esc(x.name)} <small>(${esc(x.meta.kind)}, ${x.meta.level?'Level '+x.meta.level:'level unspecified'})</small></span><button type="button" class="sns-ability-add" data-row="${i}" style="width:auto">Add</button></div>`).join(''):'No matching entries.');
   html.find('.sns-ability-add').off('click').on('click',async ev=>{const btn=$(ev.currentTarget);const x=rows[Number(btn.data('row'))];if(!x||!actor.isOwner)return ui.notifications.warn('You need Owner permission to add an ability.');btn.prop('disabled',true);
    try{const item=await x.pack.getDocument(x.id);if(!item)throw Error('Item not found');const existing=actor.items.some(i=>i.getFlag(SYS,'compendiumUid')===item.getFlag(SYS,'compendiumUid'));
     if(existing){ui.notifications.warn('This exact compendium ability is already on the character.');return;}
     const data=item.toObject();delete data._id;delete data.folder;
     await actor.createEmbeddedDocuments('Item',[data]);ui.notifications.info(`Added ${x.name} to ${actor.name}. Check prerequisites and costs.`);
    }catch(err){console.error(err);ui.notifications.error(`Unable to add ability: ${err.message}`);}finally{btn.prop('disabled',false);}
   });
  };
  el('family').on('change',rebuildOwners);el('owner').on('change',rebuildFilters);el('kind').on('change',draw);el('level').on('change',draw);el('query').on('input',draw);rebuildOwners();
 },default:'close',width:680});dlg.render(true);
}

