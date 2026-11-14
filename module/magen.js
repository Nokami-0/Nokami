const SYS='shinobi-no-sho-revamp';
let catalogPromise;
export function validateMagenCatalog(rows){
 if(!Array.isArray(rows)||!rows.length)throw Error('Magen catalog is empty.');const ids=new Set();
 for(const r of rows){if(!r.id||ids.has(r.id)||!Number.isInteger(r.level)||r.level<0||r.level>10||r.restrictedTo!=='Magen'||!['Rules','Compulsion','Affliction','Phantom','Limited Aptitude'].includes(r.kind)||!r.description||!r.sourcePages?.length||!Number.isSafeInteger(r.chakraCost)||r.chakraCost<0)throw Error('Invalid Magen rules entry: '+r.name);ids.add(r.id);}
 return rows;
}
export function loadMagenCatalog(){
 if(!catalogPromise)catalogPromise=(async()=>{const r=await fetch(`systems/${SYS}/integrated/data/sns-magen__items.json`);if(!r.ok)throw Error('Could not load Magen rules (HTTP '+r.status+').');return validateMagenCatalog(await r.json());})().catch(error=>{catalogPromise=null;throw error;});return catalogPromise;
}
export function groupMagenEntries(rows){
 return Array.from({length:10},(_,i)=>({level:i+1,entries:rows.filter(r=>r.level===i+1&&r.kind!=='Limited Aptitude').map(r=>({...r,pageText:r.sourcePages.join(', ')}))}));
}
export function magenPowerLevel(actor){
 let level=0;
 for(const item of actor.items||[]){
  if(item.type!=='poder')continue;
  const own=item.flags?.[SYS]||{},sources=Object.values(item.flags||{});
  const sourceMagen=sources.some(s=>s&&typeof s==='object'&&s.hijutsu==='Magen'&&/power/i.test(s.category||''));
  if(!sourceMagen&&!(own.hierarchy?.owner==='Magen'&&own.hierarchy?.kind==='Powers')&&!/^magen\s*(?:\(|$)/i.test(item.name||''))continue;
  const n=Number(item.system?.nivelUsado??item.system?.nivelPoder??1);if(Number.isInteger(n)&&n>=1&&n<=10)level=Math.max(level,n);
 }return level;
}
export function magenParameters(powerLevel,intelligence){
 if(!Number.isInteger(powerLevel)||powerLevel<0||powerLevel>10||!Number.isFinite(intelligence)||intelligence<0)return null;
 return {powerLevel,intelligence,resistanceDC:9+powerLevel+Math.ceil(intelligence/2),touchDC:8+2*powerLevel,range:5+intelligence};
}
export async function magenSheetContext(actor){
 try{const rows=await loadMagenCatalog(),level=magenPowerLevel(actor),intelligence=Number(actor.system?.atributos?.int?.valor)||0;
 return {magenGroups:groupMagenEntries(rows),magenRules:rows.filter(r=>r.kind==='Rules').map(r=>({...r,pageText:r.sourcePages.join(', ')})),magenMeta:rows.filter(r=>r.kind==='Limited Aptitude').map(r=>({...r,pageText:r.sourcePages.join(', ')})),magenStats:level?magenParameters(level,intelligence):null,magenError:''};
 }catch(error){console.error('Magen reference',error);return {magenGroups:[],magenRules:[],magenMeta:[],magenStats:null,magenError:error.message};}
}
export function filterMagenEntries(rows,{level='',kind='',query=''}={}){
 const q=String(query).trim().toLowerCase();return rows.filter(r=>(level===''||String(r.level)===String(level))&&(!kind||r.kind===kind)&&(!q||`${r.name} ${r.description}`.toLowerCase().includes(q)));
}
export function activateMagenTab(html){
 const root=html.find('.sns-magen-panel');if(!root.length)return;
 root.find('[data-magen-filter]').on('change input',event=>event.stopPropagation());
 const draw=()=>{const level=root.find('[data-magen-filter=level]').val(),kind=root.find('[data-magen-filter=kind]').val(),q=String(root.find('[data-magen-filter=query]').val()||'').trim().toLowerCase();
  root.find('.sns-magen-entry').each((_i,el)=>{el.hidden=!!(level!==''&&el.dataset.magenLevel!==level||kind&&el.dataset.magenKind!==kind||q&&!el.textContent.toLowerCase().includes(q));});
  root.find('.sns-magen-group').each((_i,el)=>{el.hidden=![...el.querySelectorAll('.sns-magen-entry')].some(e=>!e.hidden);});
 };
 root.find('[data-magen-filter=level], [data-magen-filter=kind]').on('change',draw);root.find('[data-magen-filter=query]').on('input',draw);draw();
}
