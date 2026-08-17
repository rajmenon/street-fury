const FILES = ["kick", "hit", "punch", "block", "jump", "ko", "select", "go", "land"];

const buffers = new Map();
let ctx = null;
let master = null;
let musicNodes = null;
let unlocked = false;

function context() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);
  }
  return ctx;
}

export async function loadAudio() {
  const audio = context();
  await Promise.all(
    FILES.map(async (name) => {
      const response = await fetch(`/assets/sfx/${name}.wav`);
      const raw = await response.arrayBuffer();
      buffers.set(name, await audio.decodeAudioData(raw));
    }),
  );
}

export async function unlockAudio() {
  const audio = context();
  if (audio.state === "suspended") await audio.resume();
  unlocked = true;
}

export function play(name, { volume = 1, rate = 1 } = {}) {
  if (!unlocked) return;
  const buffer = buffers.get(name);
  if (!buffer) return;
  const audio = context();
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(master);
  source.start();
}

export function startMusic() {
  if (!unlocked || musicNodes) return;
  const audio = context();
  const gain = audio.createGain();
  gain.gain.value = 0.07;
  gain.connect(master);

  const bass = audio.createOscillator();
  bass.type = "triangle";
  bass.frequency.value = 49;
  const bassGain = audio.createGain();
  bassGain.gain.value = 0.9;
  bass.connect(bassGain);
  bassGain.connect(gain);

  const pulse = audio.createOscillator();
  pulse.type = "square";
  pulse.frequency.value = 2.2;
  const pulseGain = audio.createGain();
  pulseGain.gain.value = 0.35;
  pulse.connect(pulseGain);

  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 180;
  pulseGain.connect(filter);
  filter.connect(gain);

  bass.start();
  pulse.start();
  musicNodes = { bass, pulse, gain };
}

export function stopMusic() {
  if (!musicNodes) return;
  try {
    musicNodes.bass.stop();
    musicNodes.pulse.stop();
  } catch {
    /* already stopped */
  }
  musicNodes = null;
}
