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

const VENUS_O_CONTOURS = ["o1", "o2", "o3"];

const CONTOUR_COLORS = {
  o1: [0.12, 0.15, 0.78],
  o2: [1.0, 0.66, 0.80],
  o3: [1.0, 0.66, 0.80]
}

const container = document.getElementById("brain-container");

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(3, 3, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.rotationSpeed = 0.5;
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

const MERCURY_TEXTURES = {
  albedo: TEXTURE_FILES.mercury_surface_albedo,
  composition: TEXTURE_FILES.mercury_surface_comp
}

const layers = {venus: {planet:[], lines: [], contours: []}, mercury: {planet:[], lines:[]},};

const textureLoader = new THREE.TextureLoader();
const textureCache = {};

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

function createOxygenCountour(mesh) {
  const pos = Array.from(new Int16Array(deodeData(mesh.v).buffer), v => v / 1000);
  const normals = new Int16Array(deodeData(mesh.n).buffer);
  const indices = new Uint16Array(deodeData(mesh.i).buffer);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  return geometry;
}

function createContourMaterial(color) {
  const countour = new THREE.ShaderMaterial({
    uniforms: {uColor: {value: new THREE.Vector3(...color)}},
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vToCamera;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vToCamera = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }`,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vToCamera;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vToCamera))), 2.0);
        gl_FragColor = vec4(uColor, 0.1 + 0.3 * rim);
      }`,
  });
  return countour
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
    layers[planetName].planet.push(planet);
    for (const group of Object.values(lines[planetName])){
      const lineObj = createFieldLines(group);
      layers[planetName].lines.push(lineObj);
      worldGroup.add(lineObj)
    }
    if (planetName === "venus") {
      for (const key of VENUS_O_CONTOURS) {
        const shell = new THREE.Mesh(createOxygenCountour(meshes[key]), createContourMaterial(CONTOUR_COLORS[key]));
        layers.venus.contours.push(shell);
        worldGroup.add(shell)
      }
    }

    planetSetup.scene.add(worldGroup);
  }
} 
buildScenes().catch((error) => {
  console.error("Error building scenes:", error);
});

document.getElementById("venus-button").addEventListener("click", () => {
  active_scene = venus_scene;
  showOptions("venus")
  document.getElementById("venus-button").classList.add("active");
  document.getElementById("mercury-button").classList.remove("active");
});

document.getElementById("mercury-button").addEventListener("click", () => {
  active_scene = mercury_scene;
  showOptions("mercury")
  document.getElementById("mercury-button").classList.add("active");
  document.getElementById("venus-button").classList.remove("active");
})

document.getElementById("auto-rotate-button").addEventListener("click", () => {
  controls.autoRotate = !controls.autoRotate;
  document.getElementById("auto-rotate-button").classList.toggle("active", controls.autoRotate);
});


function showOptions(planetName) {
  document.getElementById("venus-panel").hidden = planetName !== "venus";
  document.getElementById("mercury-panel").hidden = planetName !== "mercury";

}
showOptions("venus");

function setVisible(objects, visible) {
  for (const object of objects) object.visible = visible;
}

function onCheckbox(id, action) {
  document.getElementById(id).addEventListener("change", (event) => action(event.target.checked));
}

onCheckbox("venus-planet-toggle", (on) => setVisible(layers.venus.planet, on));
onCheckbox("venus-B-toggle", (on) => setVisible(layers.venus.lines, on));
onCheckbox("venus-O-toggle", (on) => setVisible(layers.venus.contours, on));

onCheckbox("mercury-planet-toggle", (on) => setVisible(layers.mercury.planet, on));
onCheckbox("mercury-B-toggle", (on) => setVisible(layers.mercury.lines, on));

let selectedMercuryTexture = "albedo"

function setMercuryTexture(name) {
  selectedMercuryTexture = name;
  const path = MERCURY_TEXTURES[name];
  const apply = (texture) => {
    if (selectedMercuryTexture !== name) return;
    for (const planet of layers.mercury.planet) {
      planet.material.map = texture;
      planet.material.needsUpdate = true;
    }
  };
  if (textureCache[path]) apply(textureCache[path]);
  else textureLoader.load(path, (texture) => { textureCache[path] = texture; apply(texture); });
}

for (const radio of document.querySelectorAll('input[name="mercury-texture"]')) {
  radio.addEventListener("change", () => {
    if (radio.checked) setMercuryTexture(radio.value);
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(active_scene, camera);
}
animate()