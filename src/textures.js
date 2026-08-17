import * as THREE from "three";

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${url}`));
    image.src = url;
  });
}

function canvasTexture(image) {
  const texture = new THREE.CanvasTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export async function loadColorTexture(url, { repeatX = 1, repeatY = 1, wrap = false } = {}) {
  const image = await loadImage(url);
  const texture = canvasTexture(image);
  if (wrap) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
  }
  return texture;
}

export async function loadKeyedTexture(url, threshold = 48) {
  const image = await loadImage(url);
  const source = document.createElement("canvas");
  source.width = image.width;
  source.height = image.height;
  const ctx = source.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, source.width, source.height);
  const [kr, kg, kb] = [pixels.data[0], pixels.data[1], pixels.data[2]];
  const limit = threshold * threshold;
  let minX = source.width;
  let minY = source.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const i = (y * source.width + x) * 4;
      const dr = pixels.data[i] - kr;
      const dg = pixels.data[i + 1] - kg;
      const db = pixels.data[i + 2] - kb;
      if (dr * dr + dg * dg + db * db < limit) {
        pixels.data[i + 3] = 0;
      } else {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(pixels, 0, 0);

  const pad = 8;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(source.width - 1, maxX + pad);
  maxY = Math.min(source.height - 1, maxY + pad);
  const width = Math.max(1, maxX - minX + 1);
  const height = Math.max(1, maxY - minY + 1);
  const cropped = document.createElement("canvas");
  cropped.width = width;
  cropped.height = height;
  cropped.getContext("2d").drawImage(source, minX, minY, width, height, 0, 0, width, height);

  const texture = canvasTexture(cropped);
  texture.premultiplyAlpha = false;
  return texture;
}

export async function loadGameTextures() {
  const [
    brick,
    warehouse,
    neon,
    asphalt,
    title,
    dragonFace,
    ironFace,
    dragonTorso,
    ironTorso,
  ] = await Promise.all([
    loadColorTexture("/assets/textures/brick.jpg", { wrap: true, repeatX: 1, repeatY: 1 }),
    loadColorTexture("/assets/textures/warehouse.jpg", { wrap: true }),
    loadColorTexture("/assets/textures/neon-shop.jpg"),
    loadColorTexture("/assets/textures/asphalt.jpg", { wrap: true, repeatX: 4, repeatY: 2 }),
    loadColorTexture("/assets/textures/title-street.jpg"),
    loadKeyedTexture("/assets/portraits/dragon-face.jpg"),
    loadKeyedTexture("/assets/portraits/iron-face.jpg"),
    loadKeyedTexture("/assets/textures/dragon-torso.jpg", 42),
    loadKeyedTexture("/assets/textures/iron-torso.jpg", 42),
  ]);

  return {
    brick,
    warehouse,
    neon,
    asphalt,
    title,
    faces: { dragon: dragonFace, iron: ironFace },
    torsos: { dragon: dragonTorso, iron: ironTorso },
  };
}
