/**
 * Shinobi no Sho measured-template placement preview.
 * Uses Foundry's native MeasuredTemplate drawing, with an interactive cursor,
 * mouse-wheel rotation and click-to-confirm. No resource costs are applied here.
 */
export async function previewSnsArea(data) {
  if (!canvas?.ready || !canvas?.scene) throw Error('Open a canvas scene first.');
  if (areaDocumentType() === 'Region') return previewRegion(data);
  if (!canvas.templates) throw Error('The measured template layer is unavailable.');
  const layer=canvas.templates;
  const Doc=CONFIG.MeasuredTemplate.documentClass;
  const document=new Doc({...data, x:0, y:0}, {parent:canvas.scene});
  const preview=new CONFIG.MeasuredTemplate.objectClass(document);
  const stage=canvas.stage;
  const view=canvas.app.view;
  const previousLayer=canvas.activeLayer;
  layer.activate();
  layer.preview.addChild(preview);
  await preview.draw();
  let done=false;
  return await new Promise(resolve=>{
    const snapPoint=event=>{
      const pos=event.data?.getLocalPosition?.(canvas.stage) ?? event.getLocalPosition?.(canvas.stage);
      if(!pos)return null;
      const grid=canvas.grid;
      if(grid?.getSnappedPoint)return grid.getSnappedPoint(pos,{mode:CONST.GRID_SNAPPING_MODES?.CENTER??0});
      if(grid?.getSnappedPosition)return grid.getSnappedPosition(pos.x,pos.y);
      return pos;
    };
    const move=event=>{
      const p=snapPoint(event);
      if(!p)return;
      document.updateSource({x:p.x,y:p.y});
      preview.refresh();
    };
    const wheel=event=>{
      event.preventDefault();
      event.stopPropagation();
      const step=event.shiftKey?5:15;
      document.updateSource({direction:((document.direction+(event.deltaY>0?step:-step))%360+360)%360});
      preview.refresh();
    };
    const finish=async(save,event)=>{
      if(done)return;
      if(event?.button===2)save=false;
      done=true;
      stage.off('pointermove',move);
      stage.off('pointerdown',click);
      view.removeEventListener('wheel',wheel,true);
      view.removeEventListener('contextmenu',context,true);
      window.removeEventListener('keydown',key,true);
      layer.preview.removeChild(preview);
      preview.destroy({children:true});
      if(previousLayer&&previousLayer!==layer)previousLayer.activate();
      if(!save)return resolve(null);
      const result=document.toObject();
      delete result._id;
      resolve(result);
    };
    const click=event=>{
      const button=event.data?.button??event.button;
      if(button===2)return void finish(false,event);
      if(button!==0)return;
      move(event);
      void finish(true,event);
    };
    const context=event=>{event.preventDefault();void finish(false,event);};
    const key=event=>{if(event.key==='Escape'){event.preventDefault();void finish(false,event);}};
    stage.on('pointermove',move);
    stage.on('pointerdown',click);
    view.addEventListener('wheel',wheel,{capture:true,passive:false});
    view.addEventListener('contextmenu',context,true);
    window.addEventListener('keydown',key,true);
    ui.notifications.info('Move the cursor to position the area. Mouse wheel rotates; Shift + wheel fine-tunes. Left-click confirms; right-click or Esc cancels.');
  });
}

const AREA_SCOPE = 'shini-no-sho-altered';

function areaDocumentType() {
  return game.release.generation >= 14 ? 'Region' : 'MeasuredTemplate';
}

export function snsAreas(scene, actorId) {
  const documents = areaDocumentType() === 'Region' ? scene.regions : scene.templates;
  return documents.filter(doc => {
    if (doc.getFlag(AREA_SCOPE, 'areaActor') !== actorId) return false;
    const creator = doc.getFlag(AREA_SCOPE, 'areaCreator') ?? doc.user?.id ?? doc.user;
    return game.user.isGM || creator === game.user.id;
  });
}

export function deleteSnsAreas(scene, areas) {
  return scene.deleteEmbeddedDocuments(areaDocumentType(), areas.map(area => area.id));
}

export function createSnsArea(scene, positioned, {actorId, itemId, cleanup, name}) {
  const type = areaDocumentType();
  const data = type === 'Region' ? {
    name,
    color: positioned.fillColor,
    visibility: CONST.REGION_VISIBILITY.ALWAYS,
    shapes: [regionShape(positioned, scene.grid.size / scene.grid.distance)],
    ownership: {[game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER}
  } : {...positioned, user: game.user.id};
  data.flags = {[AREA_SCOPE]: {areaActor: actorId, areaItem: itemId, cleanup, areaCreator: game.user.id}};
  return scene.createEmbeddedDocuments(type, [data]);
}

// Both the preview and the saved region use the same pixel coordinates.
function regionShape(data, pixelsPerUnit) {
  const {t, x, y, direction, angle} = data;
  const length = data.distance * pixelsPerUnit;
  const halfWidth = data.width * pixelsPerUnit / 2;
  const radians = direction * Math.PI / 180;
  let points;
  if (t === 'ray') {
    points = [[0,-halfWidth], [length,-halfWidth], [length,halfWidth], [0,halfWidth]];
  } else if (t === 'rect') {
    const side = length / Math.SQRT2;
    points = [[0,0], [side,0], [side,side], [0,side]];
  } else {
    const fullCircle = t === 'circle' || angle === 360;
    const sweep = fullCircle ? 2 * Math.PI : angle * Math.PI / 180;
    const steps = Math.max(4, Math.ceil(sweep / (Math.PI / 32)));
    points = fullCircle ? [] : [[0,0]];
    for (let i = 0; i < steps + (fullCircle ? 0 : 1); i++) {
      const a = -sweep / 2 + sweep * i / steps;
      points.push([length * Math.cos(a), length * Math.sin(a)]);
    }
  }
  const cos = Math.cos(radians), sin = Math.sin(radians);
  return {type: 'polygon', points: points.flatMap(([dx,dy]) => [x + dx*cos - dy*sin, y + dx*sin + dy*cos])};
}

function previewRegion(data) {
  const scene = canvas.scene;
  const view = document.getElementById('board');
  if (!view) throw Error('Open a canvas scene first.');
  const overlay = document.createElement('canvas');
  const ctx = overlay.getContext('2d');
  if (!ctx) throw Error('Could not draw the area preview.');
  Object.assign(overlay.style, {position:'fixed', inset:'0', zIndex:'1', pointerEvents:'none'});
  document.body.append(overlay);
  const position = {...data};
  const pixelsPerUnit = scene.grid.size / scene.grid.distance;
  function draw() {
    overlay.width = window.innerWidth;
    overlay.height = window.innerHeight;
    const {points} = regionShape(position, pixelsPerUnit);
    ctx.beginPath();
    for (let i = 0; i < points.length; i += 2) {
      const p = canvas.clientCoordinatesFromCanvas({x:points[i], y:points[i+1]});
      if (i === 0) ctx.moveTo(p.x,p.y);
      else ctx.lineTo(p.x,p.y);
    }
    ctx.closePath();
    ctx.fillStyle = position.fillColor;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = position.fillColor;
    ctx.stroke();
  }

  return new Promise(resolve => {
    const move = event => {
      const point = canvas.canvasCoordinatesFromClient({x:event.clientX, y:event.clientY});
      Object.assign(position, canvas.grid.getSnappedPoint(point, {mode:CONST.GRID_SNAPPING_MODES.CENTER}));
      draw();
    };
    const wheel = event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const step = event.shiftKey ? 5 : 15;
      position.direction = (position.direction + (event.deltaY > 0 ? step : 360 - step)) % 360;
      draw();
    };
    const finish = result => {
      controller.abort();
      Hooks.off('canvasTearDown', teardownHook);
      Hooks.off('canvasPan', panHook);
      overlay.remove();
      resolve(result);
    };
    const controller = new AbortController();
    const options = {capture:true, signal:controller.signal};
    const teardownHook = Hooks.on('canvasTearDown', () => finish(null));
    const panHook = Hooks.on('canvasPan', draw);
    view.addEventListener('pointermove', move, options);
    view.addEventListener('wheel', wheel, {...options, passive:false});
    view.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      move(event);
      finish(position);
    }, options);
    view.addEventListener('contextmenu', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      finish(null);
    }, options);
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') finish(null);
    }, options);
    window.addEventListener('resize', draw, options);
    draw();
    ui.notifications.info('Move to position the area. Scroll to rotate. Click to place, or press Esc to cancel.');
  });
}
