const SYS='shinobi-no-sho-revamp';let catalogPromise;
export function validateTensaiCatalog(rows){
 if(!Array.isArray(rows)||!rows.length)throw Error('Tensai catalog is empty.');const ids=new Set();
 for(const r of rows){if(!r.id||ids.has(r.id)||!Number.isInteger(r.level)||r.level<0||r.level>10||r.restrictedTo!=='Tensai'||!['Rules','Versatility','Power Route','Limited Aptitude','Special Aptitude','Clan Reference','Technique','Level Choice'].includes(r.kind)||!r.description||!r.sourcePages?.length||!r.prerequisites)throw Error('Invalid Tensai entry: '+r.name);ids.add(r.id);}return rows;
}
export function loadTensaiCatalog(){
 if(!catalogPromise)catalogPromise=(async()=>{const r=await fetch(`systems/${SYS}/integrated/data/sns-tensai__items.json`);if(!r.ok)throw Error('Could not load Tensai rules (HTTP '+r.status+').');return validateTensaiCatalog(await r.json());})().catch(error=>{catalogPromise=null;throw error;});return catalogPromise;
}
export function groupTensaiEntries(rows){return Array.from({length:10},(_,i)=>({level:i+1,entries:rows.filter(r=>r.level===i+1).map(r=>({...r,pageText:r.sourcePages.join(', ')}))}));}
export function tensaiPowerSummary(actor){
 return [...(actor.items||[])].filter(i=>i.type==='poder'&&(/^(?:versatility|versatilidade)\b/i.test(i.name||'')||/^hibon\s+ninpou\b/i.test(i.name||''))).map(i=>({name:i.name,level:Number(i.system?.nivelUsado??i.system?.nivelPoder??1)||1,route:/^hibon/i.test(i.name)?'Hibon Ninpou':'Versatility'}));
}
export async function tensaiSheetContext(actor){
 try{const rows=await loadTensaiCatalog();return {tensaiRules:rows.filter(r=>r.level===0).map(r=>({...r,pageText:r.sourcePages.join(', ')})),tensaiGroups:groupTensaiEntries(rows),tensaiPowers:tensaiPowerSummary(actor),tensaiError:''};}
 catch(error){console.error('Tensai reference',error);return {tensaiRules:[],tensaiGroups:[],tensaiPowers:[],tensaiError:error.message};}
}
export function filterTensaiEntries(rows,{level='',kind='',query=''}={}){const q=String(query).trim().toLowerCase();return rows.filter(r=>(level===''||String(r.level)===String(level))&&(!kind||r.kind===kind)&&(!q||`${r.name} ${r.description}`.toLowerCase().includes(q)));}
export function activateTensaiTab(html){
 const root=html.find('.sns-tensai-panel');if(!root.length)return;
 root.find('[data-tensai-filter]').on('change input',event=>event.stopPropagation());
 const draw=()=>{const level=root.find('[data-tensai-filter=level]').val(),kind=root.find('[data-tensai-filter=kind]').val(),q=String(root.find('[data-tensai-filter=query]').val()||'').trim().toLowerCase();
 root.find('.sns-tensai-entry').each((_i,el)=>{el.hidden=!!(level!==''&&el.dataset.tensaiLevel!==level||kind&&el.dataset.tensaiKind!==kind||q&&!el.textContent.toLowerCase().includes(q));});
 root.find('.sns-tensai-group').each((_i,el)=>{el.hidden=![...el.querySelectorAll('.sns-tensai-entry')].some(e=>!e.hidden);});};
 root.find('[data-tensai-filter=level], [data-tensai-filter=kind]').on('change',draw);root.find('[data-tensai-filter=query]').on('input',draw);draw();
}
