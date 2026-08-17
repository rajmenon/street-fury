const down = new Set();
const pressed = new Set();

const MAP = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  Enter: "start",
  Space: "start",
  Escape: "back",
};

function actionFromEvent(event) {
  const key = event.key;
  if (key === "<" || key === "," || event.code === "Comma") return "punch";
  if (key === ">" || key === "." || event.code === "Period") return "kick";
  if (key === "/" || key === "?" || event.code === "Slash") return "roundhouse";
  return MAP[event.code] || null;
}

export const input = {
  left: false,
  right: false,
  up: false,
  down: false,
  punch: false,
  kick: false,
  roundhouse: false,
};

export function bindInput() {
  window.addEventListener("keydown", (event) => {
    const action = actionFromEvent(event);
    if (!action) return;
    event.preventDefault();
    if (!down.has(action)) pressed.add(action);
    down.add(action);
    if (action in input) input[action] = true;
  });

  window.addEventListener("keyup", (event) => {
    const action = actionFromEvent(event);
    if (!action) return;
    down.delete(action);
    if (action in input) input[action] = false;
  });

  window.addEventListener("blur", () => {
    down.clear();
    pressed.clear();
    for (const key of Object.keys(input)) input[key] = false;
  });
}

export function wasPressed(action) {
  return pressed.has(action);
}

export function consume(action) {
  if (!pressed.has(action)) return false;
  pressed.delete(action);
  return true;
}

export function endFrame() {
  pressed.clear();
}

export function emptyInput() {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    punch: false,
    kick: false,
    roundhouse: false,
    punchPressed: false,
    kickPressed: false,
    roundhousePressed: false,
    upPressed: false,
  };
}

export function playerInput() {
  return {
    left: input.left,
    right: input.right,
    up: input.up,
    down: input.down,
    punch: input.punch,
    kick: input.kick,
    roundhouse: input.roundhouse,
    punchPressed: wasPressed("punch"),
    kickPressed: wasPressed("kick"),
    roundhousePressed: wasPressed("roundhouse"),
    upPressed: wasPressed("up"),
  };
}
