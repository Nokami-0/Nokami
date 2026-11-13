import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const SYS='shinobi-no-sho-revamp';
const {rashoumonRank,rashoumonParameters,rashoumonTemplate,rashoumonGridSize,rashoumonPositions,summonRashoumon}=await import('../module/rashoumon.js');
function owner(rank,score=18){return {id:'owner',name:'Summoner',ownership:{player:3},items:rank?[{name:`Rashoumon — Level ${rank}`,type:'aptidao',system:{},flags:{}}]:[],system:{atributos:{esp:{valor:score},int:{valor:score}},energias:{chakra:{value:50}}},async update(data){this.system.energias.chakra.value=data['system.energias.chakra.value'];}};}
test('requires purchased aptitude, not attribute alone or an innate reference',()=>{
 assert.throws(()=>rashoumonParameters(owner(0), 'esp',1),/Purchase/);
 const a=owner(3);a.items[0].flags={[SYS]:{summonTechnique:true}};assert.equal(rashoumonRank(a),0);
});
for(const [rank,required,max,bonus]of [[1,8,1,0],[2,12,3,2],[3,18,5,3]])test(`level ${rank} enforces attribute ${required}, ${max} active gates and source size`,()=>{
 assert.throws(()=>rashoumonParameters(owner(rank,required-1),'esp',1),/requires/);
 const p=rashoumonParameters(owner(rank,required),'esp',max);
 assert.equal(p.maximum,max);assert.equal(p.widthMeters,required/2);assert.equal(p.heightMeters,required/2);assert.equal(p.hardness,(required+bonus)/max);assert.equal(p.chakra,required/2);
 assert.throws(()=>rashoumonParameters(owner(rank,required),'esp',max+1),/active gates/);
 assert.throws(()=>rashoumonParameters(owner(rank,required),'esp',1,max),/already active/);
});
test('chosen attribute must meet the rank and upgrades must be purchased',()=>{
 const a=owner(1,18);assert.throws(()=>rashoumonParameters(a,'esp',3),/active gates/);
 const b=owner(3,18);b.system.atributos.int.valor=17;assert.throws(()=>rashoumonParameters(b,'int',1),/requires/);
 assert.throws(()=>rashoumonParameters(b,'for',1),/Choose/);
});
test('size converts metres to scene squares; upgrade hardness does not stack',()=>{
 const p=rashoumonParameters(owner(3,18),'int',5);assert.equal(p.totalHardness,21);assert.equal(p.nonDegrading,true);
 assert.equal(rashoumonGridSize(p,{units:'m',distance:1}).width,9);
 assert.equal(rashoumonGridSize(p,{units:'m',distance:2}).width,4.5);
 assert.ok(Math.abs(rashoumonGridSize(p,{units:'ft',distance:5}).width-9/1.524)<1e-9);
 assert.equal(rashoumonParameters(owner(2,13),'esp',1).chakra,7);
 assert.equal(rashoumonParameters(owner(2,12),'esp',1).action,'Partial');
 assert.equal(rashoumonParameters(owner(1,8),'esp',1).action,'Movement');
});
function world(){const tokens=[],a=owner(3,18);const scene={id:'scene',grid:{size:100,distance:1,units:'m'},dimensions:{width:5000,height:5000},tokens,async createEmbeddedDocuments(type,docs){return docs.map((d,i)=>{const t={...d,id:'gate'+i};tokens.push(t);return t;});},async deleteEmbeddedDocuments(type,ids){for(let i=tokens.length-1;i>=0;i--)if(ids.includes(tokens[i].id))tokens.splice(i,1);}};
 globalThis.game={user:{isGM:true},scenes:[scene]};globalThis.canvas={scene,tokens:{controlled:[{actor:a,document:{x:2000,y:2000,width:1,height:1}}]}};const actors=[];
 globalThis.Actor={async create(data){const doc={...data,id:'gate-actor',async delete(){actors.splice(actors.indexOf(this),1);}};actors.push(doc);return doc;}};
 globalThis.ChatMessage={getSpeaker:()=>({}),create:async()=>{}};globalThis.ui={notifications:{info(){}}};return {a,scene,actors};}
test('full summon places 5 legal gate tokens, charges aptitude cost and preserves creature contract/usage',async()=>{
 const {a,scene,actors}=world();a.flags={contract:'Toads',sceneUsage:1};const result=await summonRashoumon(a,'esp',5);
 assert.equal(scene.tokens.length,5);assert.equal(a.system.energias.chakra.value,41);assert.equal(result.parameters.hardness,4.2);assert.equal(actors[0].flags[SYS].summonProfile,undefined);
 for(const t of scene.tokens){assert.equal(t.width,9);assert.equal(t.height,1);assert.equal(t.flags[SYS].rashoumonOwner,a.id);assert.equal(t.actorLink,false);}
 assert.deepEqual(a.flags,{contract:'Toads',sceneUsage:1});await assert.rejects(summonRashoumon(a,'esp',1),/already active/);assert.equal(a.system.energias.chakra.value,41);
});
test('rejected prerequisites and low chakra do not create actors or tokens',async()=>{
 const {a,scene,actors}=world();a.items=[];await assert.rejects(summonRashoumon(a,'esp',1),/Purchase/);assert.equal(actors.length,0);a.items=owner(3).items;a.system.energias.chakra.value=1;
 await assert.rejects(summonRashoumon(a,'esp',1),/Need/);assert.equal(actors.length,0);assert.equal(scene.tokens.length,0);
});
test('failed placement refunds chakra and removes generated actor',async()=>{
 const {a,scene,actors}=world();scene.createEmbeddedDocuments=async()=>{throw Error('placement failed');};await assert.rejects(summonRashoumon(a,'esp',3),/placement failed/);assert.equal(a.system.energias.chakra.value,50);assert.equal(actors.length,0);
});
test('catalog dispatch uses gate template without creature NC or invented attacks',()=>{
 const rows=JSON.parse(fs.readFileSync(new URL('../integrated/data/sns-kuchiyose-actors__summons.json',import.meta.url)));assert.equal(rows.filter(r=>r.specialSummon==='rashoumon').length,1);
 const t=rashoumonTemplate();assert.equal(t.type,'personagem');assert.equal(t.items.length,0);assert.equal(t.flags.core.sheetClass,`${SYS}.RashoumonSheet`);assert.equal(t.flags[SYS].summonProfile,undefined);
 const source=fs.readFileSync(new URL('../module/kuchiyose-engine.js',import.meta.url),'utf8');assert.match(source,/if\(p.specialSummon==='rashoumon'\)return openRashoumonDialog\(owner\)/);assert.match(source,/if\(p.specialSummon==='rashoumon'\)return rashoumonTemplate\(\)/);
});
test('gate sheet registers and renders dimensions and editable per-token Hardness',async()=>{
 let registration;globalThis.Hooks={once:(name,callback)=>callback()};
 class Base{constructor(actor){this.actor=actor;}async getData(){return {actor:this.actor};}static get defaultOptions(){return {};}}
 globalThis.foundry={appv1:{sheets:{ActorSheet:Base}},utils:{mergeObject:(a,b)=>({...a,...b})},documents:{collections:{Actors:{registerSheet:(sys,cls,opts)=>registration={sys,cls,opts}}}}};
 const {RashoumonSheet}=await import('../module/rashoumon-sheet.js');assert.equal(registration.cls,RashoumonSheet);assert.equal(registration.opts.makeDefault,false);
 const data=rashoumonTemplate();data.flags[SYS].rashoumonGate={...rashoumonParameters(owner(3),'esp',5),remainingHardness:4.2,template:false};
 const context=await new RashoumonSheet(data).getData({});const {default:H}=await import('handlebars');const html=H.compile(fs.readFileSync(new URL('../templates/rashoumon-sheet.hbs',import.meta.url),'utf8'))(context);
 assert.match(html,/9 m wide × 9 m high/);assert.match(html,/flags.shinobi-no-sho-revamp.rashoumonGate.remainingHardness/);assert.match(html,/Level 3/);
});
