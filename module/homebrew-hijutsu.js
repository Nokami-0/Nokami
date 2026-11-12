// Ensure an editable homebrew destination without generating or replacing items.
export async function ensureHomebrewHijutsu() {
  if (!game.user.isGM) return;
  const name = 'Homebrew Hijutsu';
  let pack = game.packs.get('world.sns-hijutsu');
  if (!pack) pack = await CompendiumCollection.createCompendium({
    name: 'sns-hijutsu', label: 'Hijutsu Powers', type: 'Item', package: 'world',
    ownership: { PLAYER: 'OBSERVER', ASSISTANT: 'OWNER' }
  });
  const locked = pack.locked;
  try {
    if (locked) await pack.configure({ locked: false });
    if (!pack.folders.find(f => f.name === name && !f.folder)) {
      await Folder.create({ name, type: 'Item', sorting: 'a', color: '#875237' }, { pack: pack.collection });
    }
  } finally {
    if (locked) await pack.configure({ locked: true });
  }
  if (!game.folders.find(f => f.type === 'Item' && f.name === name && !f.folder)) {
    await Folder.create({ name, type: 'Item', sorting: 'a', color: '#875237' });
  }
}
Hooks.once('ready', async () => {
  if (!game.user.isGM || (game.users.activeGM && game.users.activeGM.id !== game.user.id)) return;
  try { await ensureHomebrewHijutsu(); }
  catch (error) {
    console.error('Shinobi no Sho: Homebrew Hijutsu folder setup failed', error);
    ui.notifications.error('Could not create Homebrew Hijutsu folders. See console.');
  }
});
