const SUMMON_GIF = "https://cdn.dribbble.com/userupload/37211946/file/original-69349159821e5492011711b2c26c2318.gif";
const PLAYBACK_MS = 2030;

function observeSummonPlacement(systemId) {
  Hooks.on("createToken", (document, options) => {
    if (!options?.shiniSummonEffect || !document.getFlag(systemId, "summonedBy")) return;
    requestAnimationFrame(() => {
      const board = globalThis.canvas;
      if (!board?.ready || board.scene?.id !== document.parent?.id) return;
      const token = board.tokens.get(document.id);
      if (!token || (!game.user.isGM && (document.hidden || !token.isVisible))) return;
      showSummonEffect(board, token);
    });
  });
}

function showSummonEffect(board, token) {
  const image = document.createElement("img");
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  Object.assign(image.style, {
    position: "fixed",
    zIndex: "1",
    pointerEvents: "none",
    transform: "translate(-50%, -50%)",
    border: "0",
    maxWidth: "none",
    visibility: "hidden"
  });

  function reposition() {
    const center = token.center;
    const edge = {x: center.x + Math.max(token.w, token.h), y: center.y};
    const start = viewportPoint(board, center);
    const end = viewportPoint(board, edge);
    image.style.left = `${start.x}px`;
    image.style.top = `${start.y}px`;
    image.style.width = `${Math.abs(end.x - start.x) * 2}px`;
  }

  const panHook = Hooks.on("canvasPan", reposition);
  const teardownHook = Hooks.on("canvasTearDown", remove);
  const timeout = setTimeout(remove, 10000);
  function remove() {
    clearTimeout(timeout);
    Hooks.off("canvasPan", panHook);
    Hooks.off("canvasTearDown", teardownHook);
    window.removeEventListener("resize", reposition);
    image.remove();
  }

  window.addEventListener("resize", reposition);
  image.addEventListener("error", remove, {once: true});
  image.addEventListener("load", () => {
    if (!image.isConnected) return;
    reposition();
    image.style.visibility = "visible";
    image.animate([{opacity: 1}, {opacity: 1, offset: 0.68}, {opacity: 0}], {
      duration: PLAYBACK_MS,
      fill: "forwards"
    }).finished.then(remove, remove);
  }, {once: true});
  document.body.append(image);
  image.src = SUMMON_GIF;
}

function viewportPoint(board, point) {
  if (typeof board.clientCoordinatesFromCanvas === "function") {
    return board.clientCoordinatesFromCanvas(point);
  }

  // Keep the renderer-based conversion for older Foundry builds.
  const screen = board.app.screen;
  const view = board.app.view.getBoundingClientRect();
  const global = board.stage.toGlobal(point);
  return {
    x: view.left + global.x * view.width / screen.width,
    y: view.top + global.y * view.height / screen.height
  };
}

observeSummonPlacement("shini-no-sho-altered");
