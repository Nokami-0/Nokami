const ID='original-stth';
export function sourceToken(actor){
 if(actor?.token?.object)return actor.token.object;
 const controlled=globalThis.canvas?.tokens?.controlled?.find(t=>t.actor?.uuid===actor?.uuid);
 return controlled??actor?.getActiveTokens?.()?.[0]??null;
}
export async function emitVisualEffect({actor,item,attack,defense,damage,pilot=null}){
 try{
  const source=sourceToken(actor);
  const targets=[...(globalThis.game?.user?.targets??[])];
  const payload={actor,item,source,targets,attack,defense,damage,pilot,userId:game.user.id};
  // Publish once on the rolling client. Integrations own their network synchronization.
  globalThis.Hooks?.callAll?.('stthAttackRolled',payload);
  const config=item?.getFlag?.(ID,'visualEffect');
  if(!config?.file||!source||!game.settings.get(ID,'visualEffects'))return;
  if(!game.modules.get('sequencer')?.active||typeof globalThis.Sequence!=='function')return;
  const seq=new globalThis.Sequence();
  const effect=seq.effect().file(config.file).atLocation(source);
  if(config.stretch&&targets[0])effect.stretchTo(targets[0]);
  await seq.play();
 }catch(error){console.warn('STTH optional visual effect failed; roll remains valid.',error);}
}
