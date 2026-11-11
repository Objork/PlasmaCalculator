import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const TEXTURE_FILES = {
    mercury_surface_comp: "spaceAR_textures/Mercury_MESSENGER_MDIS_Basemap_EnhancedColor_Mosaic_Global_8192.png",
    mercury_surface_albedo: "spaceAR_textures/Mercury_MESSENGER_mosaic_global_500m_2013.png",
    venus_surface: "spaceAR_textures/venusmap.png",
};

const DATA_FILES = {
  lines: "lines.json",
  meshes: "meshes.json",
}

const COLOR_MAP = [
    [0, 0, 16],
    [51, 4, 150],
    [79, 1, 162],
    [104, 0, 167],
    [132, 5, 165],
    [156, 22, 159],
    [175, 41, 145],
    [193, 60, 127],
    [211, 81, 112],
    [225, 99, 96],
    [236, 121, 82],
    [247, 142, 66],
    [252, 166, 54],
    [252, 191, 41],
    [249, 220, 35],
    [240, 249, 33],
]

const container = document.getElementById("brain-container");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(3, 3, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

new ResizeObserver(resize).observe(container);
resize();

const venus_scene = new THREE.Scene();
const mercury_scene = new THREE.Scene();

let active_scene = venus_scene;

const PLANETS = {
    venus: { scene: venus_scene, texture: TEXTURE_FILES.venus_surface, texture_rotation: Math.PI },
    mercury: { scene: mercury_scene, texture: TEXTURE_FILES.mercury_surface_albedo, texture_rotation: Math.PI  / 2 },
};

// reading data

function deodeData(data) {
  return Uint8Array.from(atob(data), c => c.charCodeAt(0));
}

function colorFromData(data) {
  const position = (data / 255) * (COLOR_MAP.length - 1);
  const index = Math.min(COLOR_MAP.length - 2, Math.floor(position));
  const fraction = position - index;
  return COLOR_MAP[index].map((c, i) => (c + (COLOR_MAP[index + 1][i] - c) * fraction) / 255);
}

function createFieldLines(data) {
  const points = new Int16Array(deodeData(data.pts).buffer);
  const colors = deodeData(data.col);;
  const pos = [];
  const clr = [];
  let start = 0;
  for (const length of data.lens) {
    for (let i = start; i < start + length - 1; i++) {
      for (const p of [i, i + 1]) {
        pos.push(points[p * 3] / 1000, points[p * 3 + 1] / 1000, points[p * 3 + 2] / 1000);
        clr.push(...colorFromData(colors[p]));
      }
    }
    start += length;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(clr, 3));
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ vertexColors: true }));
}

async function loadJson(file) {
  const response = await fetch(file);
  if (!response.ok) {
    throw new Error(`Failed to load data from ${file}: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

// Get data and build scenes 

async function buildScenes() {
  const [lines, meshes] = await Promise.all([loadJson(DATA_FILES.lines), loadJson(DATA_FILES.meshes)]);
  const planetMeshes = meshes.planets;

  const largestRadius = Math.max(...Object.values(planetMeshes).map((p) => p.radius_m));

  for (const [planetName, planetSetup] of Object.entries(PLANETS)) {
    const worldGroup = new THREE.Group();
    worldGroup.scale.setScalar(planetMeshes[planetName].radius_m / largestRadius);
    const planet = new THREE.Mesh( new THREE.SphereGeometry(1, 64, 64), new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(planetSetup.texture) }));
    planet.rotation.y = planetSetup.texture_rotation;
    planet.position.set(...planetMeshes[planetName].offset);
    worldGroup.add(planet);

    worldGroup.add(createFieldLines(lines[planetName]));
    planetSetup.scene.add(worldGroup);
  }
} 
buildScenes().catch((error) => {
  console.error("Error building scenes:", error);
});

document.getElementById("venus-button").addEventListener("click", () => {
  active_scene = venus_scene;
  document.getElementById("venus-button").classList.add("active");
  document.getElementById("mercury-button").classList.remove("active");
});

document.getElementById("mercury-button").addEventListener("click", () => {
  active_scene = mercury_scene;
  document.getElementById("mercury-button").classList.add("active");
  document.getElementById("venus-button").classList.remove("active");
})

function animate() {
  requestAnimationFrame(animate);
  renderer.render(active_scene, camera);
}
animate()