/**
 * Shinobi no Sho measured-template placement preview.
 * Uses Foundry's native MeasuredTemplate drawing, with an interactive cursor,
 * mouse-wheel rotation and click-to-confirm. No resource costs are applied here.
 */
export async function previewSnsArea(data) {
  if (!canvas?.ready || !canvas?.scene || !canvas?.templates) throw Error('Open a canvas scene first.');
  const layer = canvas.templates;
  const Doc = CONFIG.MeasuredTemplate.documentClass;
  const document = new Doc({ ...data, x: 0, y: 0 }, { parent: canvas.scene });
  const preview = new CONFIG.MeasuredTemplate.objectClass(document);
  const stage = canvas.stage;
  const view = canvas.app.view;
  const previousLayer = canvas.activeLayer;
  layer.activate();
  layer.preview.addChild(preview);
  await preview.draw();
  let done = false;
  return await new Promise((resolve) => {
    const snapPoint = (event) => {
      const pos = event.data?.getLocalPosition?.(canvas.stage) ?? event.getLocalPosition?.(canvas.stage);
      if (!pos) return null;
      const grid = canvas.grid;
      if (grid?.getSnappedPoint)
        return grid.getSnappedPoint(pos, { mode: CONST.GRID_SNAPPING_MODES?.CENTER ?? 0 });
      if (grid?.getSnappedPosition) return grid.getSnappedPosition(pos.x, pos.y);
      return pos;
    };
    const move = (event) => {
      const p = snapPoint(event);
      if (!p) return;
      document.updateSource({ x: p.x, y: p.y });
      preview.refresh();
    };
    const wheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const step = event.shiftKey ? 5 : 15;
      document.updateSource({
        direction: (((document.direction + (event.deltaY > 0 ? step : -step)) % 360) + 360) % 360,
      });
      preview.refresh();
    };
    const finish = async (save, event) => {
      if (done) return;
      if (event?.button === 2) save = false;
      done = true;
      stage.off('pointermove', move);
      stage.off('pointerdown', click);
      view.removeEventListener('wheel', wheel, true);
      view.removeEventListener('contextmenu', context, true);
      window.removeEventListener('keydown', key, true);
      layer.preview.removeChild(preview);
      preview.destroy({ children: true });
      if (previousLayer && previousLayer !== layer) previousLayer.activate();
      if (!save) return resolve(null);
      const result = document.toObject();
      delete result._id;
      resolve(result);
    };
    const click = (event) => {
      const button = event.data?.button ?? event.button;
      if (button === 2) return void finish(false, event);
      if (button !== 0) return;
      move(event);
      void finish(true, event);
    };
    const context = (event) => {
      event.preventDefault();
      void finish(false, event);
    };
    const key = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        void finish(false, event);
      }
    };
    stage.on('pointermove', move);
    stage.on('pointerdown', click);
    view.addEventListener('wheel', wheel, { capture: true, passive: false });
    view.addEventListener('contextmenu', context, true);
    window.addEventListener('keydown', key, true);
    ui.notifications.info(
      'Move the cursor to position the area. Mouse wheel rotates; Shift + wheel fine-tunes. Left-click confirms; right-click or Esc cancels.',
    );
  });
}
