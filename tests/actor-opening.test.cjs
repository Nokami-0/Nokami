const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const H=require('handlebars');
const root=__dirname+'/..';
function runtime(source, actor, legacy=false){
 class Base {constructor(){this.actor=actor;}async getData(){return {actor};}activateListeners(){}}
 const deepClone=v=>{if(Object.getPrototypeOf(v)!==Object.prototype)throw Error('Cannot clone advanced object');return structuredClone(v)};
 const c={Hooks:{on(){}},foundry:{utils:{deepClone},appv1:{sheets:{ActorSheet:Base}},applications:{ux:{TextEditor:{enrichHTML:async s=>s}}}},game:{actors:new Map()},SNS_CONDITIONS:[],fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+'/integrated/data/'+(url.includes('sns-initial-puppets')?'sns-initial-puppets__actors.json':url.includes('sns-tensai')?'sns-tensai__items.json':url.includes('sns-senjutsu')?'sns-senjutsu__items.json':'sns-magen__items.json'),'utf8'))}),console};
 if(legacy){c.ActorSheet=Base;c.TextEditor=c.foundry.applications.ux.TextEditor;delete c.foundry.appv1;delete c.foundry.applications;}
 vm.createContext(c);
 vm.runInContext('(function(){'+fs.readFileSync(root+'/module/puppets.js','utf8').replace(/export /g,'')+';this.puppetTabContext=puppetTabContext;this.activatePuppetTab=activatePuppetTab;}).call(this)',c);
 vm.runInContext('(function(){'+fs.readFileSync(root+'/module/tensai.js','utf8').replace(/export /g,'')+';this.tensaiSheetContext=tensaiSheetContext;this.activateTensaiTab=activateTensaiTab;}).call(this)',c);
 vm.runInContext('(function(){'+fs.readFileSync(root+'/module/senjutsu.js','utf8').replace(/export /g,'')+';this.senjutsuSheetContext=senjutsuSheetContext;this.activateSenjutsuTab=activateSenjutsuTab;}).call(this)',c);
 vm.runInContext('(function(){'+fs.readFileSync(root+'/module/magen.js','utf8').replace(/export /g,'')+';this.magenSheetContext=magenSheetContext;this.activateMagenTab=activateMagenTab;}).call(this)',c);
 vm.runInContext('(function(){'+fs.readFileSync(root+'/module/sizes.js','utf8').replace(/export /g,'')+';this.correctedSizeDetails=correctedSizeDetails;}).call(this)',c);
 vm.runInContext('(function(){'+fs.readFileSync(root+'/module/summon-rules.js','utf8').replace(/^import .*;$/gm,'').replace(/export /g,'')+';this.normalizeSummonProfile=normalizeSummonProfile;}).call(this)',c);
 vm.runInContext(fs.readFileSync(root+'/module/summon-sheet.js','utf8').replace(/^import .*;$/gm,'').replace(/export /g,''),c);
 vm.runInContext(fs.readFileSync(root+'/module/aptitude-effects.js','utf8').replace(/^export /gm,''),c);
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
function equippedItem(armor=false){return {id:'equipment',name:armor?'Legacy Armor':'Bite',type:'equipamento',system:{equipped:true},flags:armor?{'sns-weapon-library':{armor:true,bodyHardnessBonus:2}}:{},getFlag(scope,key){if(scope==='sns-weapon-library')throw Error('Flag scope "sns-weapon-library" is not valid or not currently active');return this.flags?.[scope]?.[key]}};}
for(const [name,summon,token]of [['character',false,false],['summon',true,false],['token',true,true]])test(name+' with equipped species weapons opens when legacy flag scope is inactive',async()=>{
 const a=actor(summon,token);a.items=[equippedItem()];const c=await runtime(current,a).getData({});assert.equal(c.equippedArmor,null);assert.equal(c.equipamentos.length,1);
});
test('legacy armor metadata is retained without calling inactive-scope getFlag',async()=>{const a=actor(true);a.items=[equippedItem(true)];const c=await runtime(current,a).getData({});assert.equal(c.equippedArmor.id,'equipment');assert.equal(c.armorHardnessBonus,2);});
test('regression reproduces the screenshot error before the flag lookup fix',async()=>{const old=current.replace("i?.flags?.['sns-weapon-library']?.armor","i.getFlag('sns-weapon-library','armor')");const a=actor(true);a.items=[equippedItem()];await assert.rejects(runtime(old,a).getData({}),/Flag scope "sns-weapon-library" is not valid/);});
test('equipping a species weapon and legacy armor never reads an inactive flag scope',async()=>{
 const source=fs.readFileSync(root+'/module/equipment-state.js','utf8').replace('export async function','async function');const c={};vm.createContext(c);vm.runInContext(source+';this.setEquipmentState=setEquipmentState;',c);
 for(const armor of [false,true]){const i=equippedItem(armor);const items=[i];items.get=id=>items.find(x=>x.id===id);const a={isOwner:true,items,updateEmbeddedDocuments:async()=>{}};assert.equal(await c.setEquipmentState(a,i.id,true),true);}
});

test('custom powers track purchased points independently of casting and keep legacy defaults',async()=>{
 const a=actor();
 const power={id:'power',name:'Custom Fuuton',type:'poder',system:{powerPoints:2,nivelUsado:1,custoChakra:3},getFlag:()=>undefined};
 const effect={id:'effect',name:'Separate effect card',type:'elemento',system:{powerPoints:0,nivel:'3'},getFlag:()=>undefined};
 const legacy={id:'legacy',name:'Legacy jutsu',type:'poder',system:{nivelUsado:5},getFlag:()=>undefined};
 const basic={id:'basic',name:'Basic jutsu',type:'poder',system:{powerPoints:5},getFlag:(_scope,key)=>key==='basicJutsu'};
 a.items=[power,effect,legacy,basic];
 const sheet=runtime(current,a);
 const initial=await sheet.getData({});
 assert.equal(initial.evolucao.poderesGastos,3);
 assert.equal(initial.evolucao.poderes,1);
 assert.equal(initial.elementos[0].powerPoints,0);
 power.system.nivelUsado=2;
 assert.equal((await sheet.getData({})).evolucao.poderes,1);
 power.system.powerPoints=4;
 const upgraded=await sheet.getData({});
 assert.equal(upgraded.evolucao.poderes,-1);
 assert.equal(upgraded.evolucao.poderesNegativo,true);
 assert.equal(upgraded.poderes[0].system.custoChakra,3);
 for(const helper of ['checked','selectOptions','editor']) H.registerHelper(helper,()=> '');
 const html=H.compile(fs.readFileSync(root+'/templates/actor-sheet.hbs','utf8'))(upgraded);
 assert.match(html,/5 \/ 4 spent · -1 remaining/);
 power.system.powerPoints=null;
 assert.equal((await sheet.getData({})).poderes[0].powerPoints,1);
});

test('summon power pool keeps legacy level accounting and supports explicit costs',async()=>{
 const a=actor(true);
 a.items=[
  {id:'power',type:'poder',system:{nivelUsado:2},getFlag:()=>undefined},
  {id:'effect',type:'elemento',system:{nivel:'4',powerPoints:0},getFlag:()=>undefined}
 ];
 const sheet=runtime(current,a);
 assert.equal((await sheet.getData({})).evolucao.poderes,0);
 a.items[1].system.powerPoints=null;
 assert.equal((await sheet.getData({})).evolucao.poderes,-4);
});
