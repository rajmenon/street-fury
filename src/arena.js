import * as THREE from "three";

function skin(texture, repeatX = 1, repeatY = 1) {
  const map = texture.clone();
  map.needsUpdate = true;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({
    map,
    roughness: 0.82,
    metalness: 0.06,
  });
}

function box(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function lamp(x, z) {
  const group = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.45, metalness: 0.7 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5.2, 8), metal);
  pole.position.y = 2.6;
  pole.castShadow = true;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), metal);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(0.55, 5.05, 0);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffc14d, emissiveIntensity: 2.2 }),
  );
  bulb.position.set(1.15, 4.9, 0);
  const light = new THREE.PointLight(0xffc56a, 4.2, 16, 2);
  light.position.copy(bulb.position);
  light.castShadow = false;
  group.add(pole, arm, bulb, light);
  group.position.set(x, 0, z);
  return group;
}

export function createArena(scene, textures) {
  const root = new THREE.Group();
  scene.add(root);

  scene.background = new THREE.Color(0x100818);
  scene.fog = new THREE.Fog(0x100818, 14, 48);

  const hemi = new THREE.HemisphereLight(0x6a7cff, 0x2a140c, 0.7);
  const moon = new THREE.DirectionalLight(0xc8d6ff, 0.85);
  moon.position.set(-6, 12, -4);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -16;
  moon.shadow.camera.right = 16;
  moon.shadow.camera.top = 10;
  moon.shadow.camera.bottom = -4;
  const fill = new THREE.DirectionalLight(0xff6a4a, 0.28);
  fill.position.set(8, 4, 6);
  const neonA = new THREE.PointLight(0xff2fa0, 3.4, 22, 2);
  neonA.position.set(-6, 3.2, 4.5);
  const neonB = new THREE.PointLight(0x2de0ff, 3.2, 22, 2);
  neonB.position.set(7, 3.4, 5);
  scene.add(hemi, moon, fill, neonA, neonB);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(48, 18),
    new THREE.MeshStandardMaterial({
      map: textures.asphalt,
      roughness: 0.55,
      metalness: 0.12,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, 2);
  ground.receiveShadow = true;
  root.add(ground);

  const curb = box(48, 0.22, 1.2, new THREE.MeshStandardMaterial({ color: 0x2a2a30 }), 0, 0.11, 5.4);
  root.add(curb);

  const brickA = skin(textures.brick, 1.4, 2.1);
  const brickB = skin(textures.brick, 1.1, 1.7);
  const warehouse = skin(textures.warehouse, 1, 1.3);
  const neon = new THREE.MeshStandardMaterial({
    map: textures.neon,
    roughness: 0.5,
    metalness: 0.15,
    emissive: 0x3a1028,
    emissiveIntensity: 0.55,
  });

  const buildings = [
    { x: -14, z: 8.4, w: 6.4, h: 11.5, d: 4.2, mat: brickA },
    { x: -8.2, z: 8.8, w: 5.2, h: 8.6, d: 3.6, mat: warehouse },
    { x: -3.1, z: 8.2, w: 4.6, h: 13.2, d: 3.8, mat: brickB },
    { x: 1.8, z: 8.6, w: 5.0, h: 7.4, d: 3.4, mat: neon },
    { x: 7.0, z: 8.3, w: 5.6, h: 12.4, d: 4.0, mat: brickA },
    { x: 12.6, z: 8.7, w: 6.2, h: 9.2, d: 3.8, mat: warehouse },
    { x: -16.8, z: 9.4, w: 4.2, h: 7.8, d: 3.2, mat: neon },
    { x: 17.4, z: 9.2, w: 4.8, h: 14.0, d: 3.5, mat: brickB },
  ];

  for (const b of buildings) {
    root.add(box(b.w, b.h, b.d, b.mat, b.x, b.h / 2, b.z));
  }

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 16),
    new THREE.MeshBasicMaterial({ map: textures.title, toneMapped: false }),
  );
  backdrop.position.set(0, 7.2, 16);
  root.add(backdrop);

  root.add(lamp(-5.4, 4.6));
  root.add(lamp(5.6, 4.8));
  root.add(lamp(-11.2, 5.0));
  root.add(lamp(11.5, 5.0));

  const dumpsterMat = new THREE.MeshStandardMaterial({ color: 0x2f6b3a, roughness: 0.6, metalness: 0.2 });
  root.add(box(1.6, 1.0, 0.8, dumpsterMat, -7.4, 0.5, 3.6));
  root.add(box(1.6, 1.0, 0.8, dumpsterMat, 8.1, 0.5, 3.8));

  const hydrant = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 0.55, 8),
    new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.45, metalness: 0.25 }),
  );
  hydrant.position.set(3.2, 0.28, 3.3);
  hydrant.castShadow = true;
  root.add(hydrant);

  const crate = box(0.7, 0.7, 0.7, new THREE.MeshStandardMaterial({ color: 0x6b4226 }), -3.8, 0.35, 3.4);
  root.add(crate);

  return { root, ground };
}
