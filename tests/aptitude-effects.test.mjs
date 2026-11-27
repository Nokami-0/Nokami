import test from 'node:test';
import assert from 'node:assert/strict';
import {aptitudeEffects, weaponAptitudeEffects} from '../module/aptitude-effects.js';

const aptitude = (name, system = {}) => ({type:'aptidao', name, system});
const actor = items => ({
  items,
  system:{atributos:{des:{valor:12},for:{valor:8}},configuracoes:{diligente:true}}
});
const weapon = (name, overrides = {}) => ({
  name, system:{attackType:'ranged', weaponCategory:'simple', weaponDamage:2, ...overrides}
});

test('Shooter is limited to the selected weapon family and ranged attacks with weapon damage', () => {
  const archer = actor([aptitude('Shooter', {aptitudeChoice:'Bows'}), aptitude('Shooter (Bows)')]);
  assert.equal(weaponAptitudeEffects(archer, weapon('Short Bow')).damage, 1);
  assert.equal(weaponAptitudeEffects(archer, weapon('Light Crossbow')).damage, 0);
  assert.equal(weaponAptitudeEffects(archer, weapon('Kunai')).damage, 0);
  const thrower = actor([aptitude('Shooter (Throwing)')]);
  assert.equal(weaponAptitudeEffects(thrower, weapon('Kunai')).damage, 3);
  for (const overrides of [{attackType:'melee'},{weaponCategory:'martial'},{weaponDamage:0}]) {
    assert.equal(weaponAptitudeEffects(thrower, weapon('Kunai',overrides)).damage, 0);
  }
  thrower.system.atributos.des.valor = 11;
  assert.equal(weaponAptitudeEffects(thrower, weapon('Kunai')).damage, 0);
});

test('fixed, selected and manual sheet modifiers respect disabled aptitudes', () => {
  const owner = actor([
    aptitude('Diligent'),
    aptitude('Expert (Stealth)'),
    aptitude('Expert', {aptitudeChoice:'Stealth'}),
    aptitude('Reflexes', {aptitudeInactive:true}),
    aptitude('Resilience'),
    aptitude('Custom', {aptitudeModifiers:'skill.Stealth=1\nmovement=2\nunknown=999'})
  ]);
  const effects = aptitudeEffects(owner);
  assert.equal(effects.config.diligente,true);
  assert.equal(effects.config.resiliencia,true);
  assert.equal(effects.bonus('skill.furtividade'),3);
  assert.equal(effects.bonus('movement'),2);
  assert.equal(effects.bonus('combat.esquiva'),0);
  owner.getFlag = () => 'kiri';
  assert.equal(aptitudeEffects(owner).bonus('skill.furtividade'),0);
});

test('weapon accuracy, critical range, and unarmed damage are independent', () => {
  const owner = actor([aptitude('Acuity'), aptitude('Iron Fist'), aptitude('Enhanced Critic (Unarmed)')]);
  const strike = weapon('Unarmed Strike',{attackType:'melee',weaponDamage:0,criticalRange:'15-16'});
  assert.deepEqual(weaponAptitudeEffects(owner,strike), {accuracy:4,damage:2,criticalMin:14});
  strike.system.weaponDamage = 1;
  assert.equal(weaponAptitudeEffects(owner,strike).damage,0);
  assert.equal(weaponAptitudeEffects(owner,weapon('Kunai')).criticalMin,15);
});
