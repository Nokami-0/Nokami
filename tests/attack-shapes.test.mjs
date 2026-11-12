import test from 'node:test';
import assert from 'node:assert/strict';
import {areaDefaults,buildAttackShape,attackShapeLabel} from '../module/attack-shapes.js';
test('PDF cone firing arc remains distinct from 3x3 splash',()=>{
 const item={system:{arc:'Cone',aoe:'3×3',range:5}};
 assert.deepEqual(areaDefaults(item),{shape:'rectangle',width:3,height:3,angle:90});
 assert.match(attackShapeLabel(item),/Arc: Cone; area: 3×3/);
});
test('straight arcs and single target defaults',()=>{
 assert.equal(areaDefaults({system:{arc:'Straight'}}).shape,'line');
 assert.equal(areaDefaults({system:{arc:'360'}}).shape,'single');
 assert.equal(areaDefaults({system:{arc:'Cone'}}).shape,'cone');
 assert.equal(areaDefaults({system:{arc:'Cone',templateShape:'single'}}).shape,'single');
});
test('one square dimensions use grid pixels regardless of scene distance units',()=>{
 const a=buildAttackShape({shape:'rectangle',length:5,width:3,height:3},100);
 assert.equal(a.width,300);assert.equal(a.height,300);
 const c=buildAttackShape({shape:'circle',length:4},100);assert.equal(c.radius,400);
 const single=buildAttackShape({shape:'single',length:1},75);assert.equal(single.width,75);
});
test('line width and rotated direction are correct',()=>{
 const p=buildAttackShape({shape:'line',length:5,width:1,direction:0},100).points;
 assert.deepEqual(p,[0,-50,500,-50,500,50,0,50]);
 const q=buildAttackShape({shape:'line',length:5,width:1,direction:90},100).points;
 assert.ok(Math.abs(q[2]-50)<1e-9);assert.ok(Math.abs(q[3]-500)<1e-9);
});
test('cone geometry respects radius and full angular extent',()=>{
 const c=buildAttackShape({shape:'cone',length:3,angle:90},100);
 assert.equal(c.type,'polygon');assert.equal(c.points.length,68);
 assert.ok(Math.abs(Math.hypot(c.points[2],c.points[3])-300)<1e-9);
 assert.ok(Math.abs(c.points[2]-c.points[4])>0);
});
test('invalid geometry cannot create a region',()=>{
 for(const length of [0,-1,NaN,Infinity])assert.throws(()=>buildAttackShape({shape:'cone',length},100));
 assert.throws(()=>buildAttackShape({shape:'cone',length:3,angle:200},100));
 assert.throws(()=>buildAttackShape({shape:'unknown',length:3},100));
});
