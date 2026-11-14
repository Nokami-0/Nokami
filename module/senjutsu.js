const SYS='shinobi-no-sho-revamp';let catalogPromise;
export function validateSenjutsuCatalog(rows){
 if(!Array.isArray(rows)||!rows.length)throw Error('Senjutsu catalog is empty.');const ids=new Set();
 for(const r of rows){if(!r.id||ids.has(r.id)||!Number.isInteger(r.level)||r.level<0||r.level>10||r.restrictedTo!=='Senjutsu'||!['Rules','Benefit','Recharge','Technique','Milestone'].includes(r.kind)||!r.description||!r.sourcePages?.length||!r.cost||!r.action)throw Error('Invalid Senjutsu entry: '+r.name);ids.add(r.id);}return rows;
}
export function loadSenjutsuCatalog(){
 if(!catalogPromise)catalogPromise=(async()=>{const r=await fetch(`systems/${SYS}/integrated/data/sns-senjutsu__items.json`);if(!r.ok)throw Error('Could not load Senjutsu rules (HTTP '+r.status+').');return validateSenjutsuCatalog(await r.json());})().catch(error=>{catalogPromise=null;throw error;});return catalogPromise;
}
export function groupSenjutsuEntries(rows){return Array.from({length:10},(_,i)=>({level:i+1,entries:rows.filter(r=>r.level===i+1).map(r=>({...r,pageText:r.sourcePages.join(', ')}))}));}
export function senjutsuPowerLevel(actor){
 let level=0;for(const item of actor.items||[]){if(item.type!=='poder')continue;const own=item.flags?.[SYS]||{};
 const source=Object.values(item.flags||{}).some(s=>s&&typeof s==='object'&&s.hijutsu==='Senjutsu'&&/power/i.test(s.category||''));
 if(!source&&!(own.hierarchy?.owner==='Senjutsu'&&own.hierarchy?.kind==='Powers')&&!/^senjutsu\s*(?:\(|$)/i.test(item.name||''))continue;
 const n=Number(item.system?.nivelUsado??item.system?.nivelPoder??1);if(Number.isInteger(n)&&n>=1&&n<=10)level=Math.max(level,n);}return level;
}
export function senjutsuParameters(level,vigor){if(!Number.isInteger(level)||level<1||level>10||!Number.isFinite(vigor))return null;return {powerLevel:level,pool:level,vigor,vigorMet:vigor>=14};}
export async function senjutsuSheetContext(actor){
 try{const rows=await loadSenjutsuCatalog(),level=senjutsuPowerLevel(actor),vigor=Number(actor.system?.atributos?.vig?.valor)||0;return {senjutsuRules:rows.filter(r=>r.level===0).map(r=>({...r,pageText:r.sourcePages.join(', ')})),senjutsuGroups:groupSenjutsuEntries(rows),senjutsuStats:level?senjutsuParameters(level,vigor):null,senjutsuError:''};}
 catch(error){console.error('Senjutsu reference',error);return {senjutsuRules:[],senjutsuGroups:[],senjutsuStats:null,senjutsuError:error.message};}
}
export function filterSenjutsuEntries(rows,{level='',kind='',query=''}={}){const q=String(query).trim().toLowerCase();return rows.filter(r=>(level===''||String(r.level)===String(level))&&(!kind||r.kind===kind)&&(!q||`${r.name} ${r.description}`.toLowerCase().includes(q)));}
export function activateSenjutsuTab(html){
 const root=html.find('.sns-senjutsu-panel');if(!root.length)return;
 root.find('[data-senjutsu-filter]').on('change input',event=>event.stopPropagation());
 const draw=()=>{const level=root.find('[data-senjutsu-filter=level]').val(),kind=root.find('[data-senjutsu-filter=kind]').val(),q=String(root.find('[data-senjutsu-filter=query]').val()||'').trim().toLowerCase();
 root.find('.sns-senjutsu-entry').each((_i,el)=>{el.hidden=!!(level!==''&&el.dataset.senjutsuLevel!==level||kind&&el.dataset.senjutsuKind!==kind||q&&!el.textContent.toLowerCase().includes(q));});
 root.find('.sns-senjutsu-group').each((_i,el)=>{el.hidden=![...el.querySelectorAll('.sns-senjutsu-entry')].some(e=>!e.hidden);});};
 root.find('[data-senjutsu-filter=level], [data-senjutsu-filter=kind]').on('change',draw);root.find('[data-senjutsu-filter=query]').on('input',draw);draw();
}
