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
    const screen = board.app.screen;
    const view = board.app.view.getBoundingClientRect();
    const center = board.stage.toGlobal(token.center);
    const edge = board.stage.toGlobal({x: token.center.x + Math.max(token.w, token.h), y: token.center.y});
    image.style.left = `${view.left + center.x * view.width / screen.width}px`;
    image.style.top = `${view.top + center.y * view.height / screen.height}px`;
    image.style.width = `${(edge.x - center.x) * 2 * view.width / screen.width}px`;
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

observeSummonPlacement("shini-no-sho-altered");
