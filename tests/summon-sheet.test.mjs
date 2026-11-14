import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import Handlebars from 'handlebars';import {parseHTML} from 'linkedom';
import {summonSheetContext,summonReferenceKind} from '../module/summon-sheet.js';
const SYS='shinobi-no-sho-revamp';
Handlebars.registerHelper('checked',v=>v?'checked':'');
Handlebars.registerHelper('selectOptions',()=>new Handlebars.SafeString(''));
Handlebars.registerHelper('editor',()=>new Handlebars.SafeString('<div class="editor"></div>'));
const render=Handlebars.compile(fs.readFileSync(new URL('../templates/actor-sheet.hbs',import.meta.url),'utf8'));
const actor=(flags={})=>({name:'Doki',system:{cabecalho:{nc:14}},getFlag:(_s,key)=>flags[key]});
function context(a){
 const c={actor:a,system:{configuracoes:{},cabecalho:{nc:14}},evolucao:{},erros:{},editable:true,...summonSheetContext(a,new Map([['owner',{name:'Summoner Name'}]])),equipamentos:[{id:'club',name:'Club',system:{equipped:true,weaponCategory:'simple'}}],poderes:[{id:'jutsu',name:'Technique'}],elementos:[],aptidoes:[{id:'purchased',name:'Purchased Aptitude',system:{}}],aptidoesGratuitas:[{id:'free',name:'Free Aptitude',system:{}}]};
 if(c.isSummon){c.summonTechniqueItems=[{id:'innate',name:'Innate: Species Ability'}];c.summonAllowedItems=[{id:'allowed',name:'Allowed Aptitude Option'}];c.summonReferenceItems=[{id:'reference',name:'Species Rules'}];c.summonSkillItems=[{id:'skill',name:'Species Skill'}];}
 return c;
}
test('ordinary actors keep their primary tabs including basic jutsu',()=>{
 const {document}=parseHTML(render(context(actor())));
 const nav=[...document.querySelectorAll('.sns-nav [data-tab]')];
 assert.deepEqual(nav.map(n=>n.dataset.tab),['principal','inventario','poderes','tensai','senjutsu','magen','tecnicas','databook','configuracoes']);
 assert.ok(!document.querySelector('[data-tab="summon-aptitudes"]'));
});
test('summon sheets render all five requested tabs plus Settings with matching panels',()=>{
 const {document}=parseHTML(render(context(actor({summonProfile:{species:'Doki (Club)',ownerId:'owner',size:{label:'Huge'},skills:['Athletics']}}))));
 const nav=[...document.querySelectorAll('.sns-nav [data-tab]')];
 assert.deepEqual(nav.map(n=>n.textContent.trim()),['Stats','Attacks','Techniques','Aptitudes','Summoning Details','Settings']);
 for(const n of nav)assert.ok(document.querySelector('.sheet-body .tab[data-group="primary"][data-tab="'+n.dataset.tab+'"]'),n.dataset.tab);
 assert.match(document.querySelector('.sns-summon-details').textContent,/Summoner Name/);
});
test('weapon, technique, aptitude and reference rows appear once in the correct tabs',()=>{
 const {document}=parseHTML(render(context(actor({summonTemplate:true,summonProfile:{species:'Doki'}}))));
 for(const [id,tab]of [['club','inventario'],['jutsu','poderes'],['purchased','summon-aptitudes'],['free','summon-aptitudes'],['allowed','summon-aptitudes'],['reference','databook'],['skill','databook']]){
  const rows=document.querySelectorAll('.item-row[data-item-id="'+id+'"]');assert.equal(rows.length,1,id);assert.equal(rows[0].closest('.tab[data-group="primary"]').dataset.tab,tab,id);assert.ok(rows[0].querySelector('.item-edit'));assert.ok(rows[0].querySelector('.item-delete'));
 }
 assert.ok(document.querySelector('[data-item-id="club"] .weapon-attack'));
 assert.ok(document.querySelector('[data-item-id="purchased"] .item-use'));
 assert.ok(!document.querySelector('[data-item-id="allowed"] .item-use'));
 assert.ok(document.querySelector('textarea[name="flags.'+SYS+'.summonProfile.notes"]'));
});
test('summon metadata uses live NC, handles missing owners, and escapes source notes',()=>{
 const a=actor({summonProfile:{nc:4,ownerId:'missing',species:'<script>bad()</script>',skills:['Athletics','Search'],notes:'<b>note</b>'}});
 const c=summonSheetContext(a,new Map());assert.equal(c.summonNC,14);assert.equal(c.summonOwnerName,'Summoner unavailable');assert.equal(c.summonSkillsText,'Athletics, Search');
 const html=render({...context(a),...c});assert.ok(!html.includes('<script>bad()</script>'));assert.ok(html.includes('&lt;script&gt;'));
 assert.equal(summonReferenceKind({flags:{[SYS]:{summonAllowedAptitude:true}}}),'summonAllowedItems');
 assert.equal(summonReferenceKind({flags:{[SYS]:{speciesSkill:true}}}),'summonSkillItems');
 assert.equal(summonReferenceKind({flags:{[SYS]:{summonReference:true}}}),'summonReferenceItems');
 assert.equal(summonReferenceKind({flags:{}}),null);
});


test('innate abilities appear in Techniques as readable cards, without a purchase or use button',()=>{
 const {document}=parseHTML(render(context(actor({summonProfile:{species:'Doki'}}))));
 const row=document.querySelector('[data-item-id="innate"]');assert.ok(row);assert.equal(row.closest('.tab[data-group="primary"]').dataset.tab,'poderes');assert.ok(row.querySelector('.item-to-chat'));assert.ok(row.querySelector('.item-edit'));assert.ok(!row.querySelector('.item-use'));
});

