const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const H=require('handlebars');
const root=__dirname+'/..';
function runtime(source, actor, legacy=false){
 class Base {constructor(){this.actor=actor;}async getData(){return {actor};}activateListeners(){}}
 const deepClone=v=>{if(Object.getPrototypeOf(v)!==Object.prototype)throw Error('Cannot clone advanced object');return structuredClone(v)};
 const c={foundry:{utils:{deepClone},appv1:{sheets:{ActorSheet:Base}},applications:{ux:{TextEditor:{enrichHTML:async s=>s}}}},game:{actors:new Map()},SNS_CONDITIONS:[],console};
 if(legacy){c.ActorSheet=Base;c.TextEditor=c.foundry.applications.ux.TextEditor;delete c.foundry.appv1;delete c.foundry.applications;}
 vm.createContext(c);
 vm.runInContext('(function(){'+fs.readFileSync(root+'/module/summon-rules.js','utf8').replace(/export /g,'')+';this.normalizeSummonProfile=normalizeSummonProfile;}).call(this)',c);
 vm.runInContext(fs.readFileSync(root+'/module/summon-sheet.js','utf8').replace(/^import .*;$/gm,'').replace(/export /g,''),c);
 vm.runInContext(source.replace(/^import .*;?$/gm,'').replace('export class ShinobiActorSheet','class ShinobiActorSheet')+'\nthis.Sheet=ShinobiActorSheet;',c);
 return new c.Sheet();
}
const current=fs.readFileSync(root+'/module/actor-sheet.js','utf8');
const flags={};
function actor(summon=false,synthetic=false){const model=Object.assign(Object.create({toObject(){return {...this}}}),{cabecalho:{nc:4},databook:{biografia:'Biography',curiosidades:'',relacoesTexto:''}});return {system:model,isToken:synthetic,items:[],effects:[],getFlag:(_s,k)=>summon?{summonProfile:{species:'Toad',skills:['Athletics']}}[k]:undefined};}
for(const [label,summon,synthetic]of [['character',false,false],['summon',true,false],['unlinked token actor',false,true]])test(label+' prepares and renders without legacy globals',async()=>{
 const c=await runtime(current,actor(summon,synthetic)).getData({});assert.equal(c.system.cabecalho.nc,4);assert.equal(c.biografiaHTML,'Biography');assert.equal(c.isSummon,summon);
 for(const n of ['checked','selectOptions','editor'])H.registerHelper(n,()=> '');
 const html=H.compile(fs.readFileSync(root+'/templates/actor-sheet.hbs','utf8'))(c);assert(html.includes('sheet-body'));
});
test('legacy v12 globals remain supported',async()=>{const a=actor();const sheet=runtime(current,a,true);await sheet.getData({});});

test('regression: cloning a live data model throws before the fix',async()=>{const old=current.replace('systemData?.toObject ? systemData.toObject(false) : (systemData || {})','systemData || {}');await assert.rejects(runtime(old,actor()).getData({}),/Cannot clone advanced object/);});
