// =====================
// Scene & Camera
// =====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // langit biru

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('gameCanvas')});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// =====================
// World & Blocks
// =====================
const worldSize = 20;
const blockSize = 1;
let blocks = [];

// Load textures
const loader = new THREE.TextureLoader();
const grassTex = loader.load('assets/textures/grass.png');
const dirtTex = loader.load('assets/textures/dirt.png');
const grassMat = new THREE.MeshBasicMaterial({map: grassTex});
const dirtMat  = new THREE.MeshBasicMaterial({map: dirtTex});

// Build ground
for(let x=0;x<worldSize;x++){
  for(let z=0;z<worldSize;z++){
    const geo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    const cube = new THREE.Mesh(geo, grassMat);
    cube.position.set(x,0,z);
    scene.add(cube);
    blocks.push(cube);

    const dirtCube = new THREE.Mesh(geo, dirtMat);
    dirtCube.position.set(x,-1,z);
    scene.add(dirtCube);
    blocks.push(dirtCube);
  }
}

// =====================
// Camera position
// =====================
camera.position.set(worldSize/2,5,worldSize+10);
camera.lookAt(worldSize/2,0,worldSize/2);

// =====================
// Inventory
// =====================
let inventoryCount = 0;
let selectedBlock = grassMat;

function selectBlock(type){
  selectedBlock = type==='grass' ? grassMat : dirtMat;
}

// =====================
// Raycaster & Add Block (Cegah tabrakan)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function addBlock(pos){
  const occupied = blocks.some(b=>b.position.x===pos.x && b.position.y===pos.y && b.position.z===pos.z);
  if(occupied) return;

  const geo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
  const cube = new THREE.Mesh(geo, selectedBlock);
  cube.position.copy(pos);
  scene.add(cube);
  blocks.push(cube);

  inventoryCount++;
  document.getElementById("invCount").innerText = inventoryCount;
}

window.addEventListener('click', e=>{
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(blocks);
  if(intersects.length>0){
    const face = intersects[0].face.normal;
    const pos = intersects[0].object.position.clone();
    pos.add(face);
    addBlock(pos);
  }
});

// =====================
// Clouds
let clouds = [];
function createCloud(x,y,z){
  const cloudGroup = new THREE.Group();
  for(let i=0;i<5;i++){
    const geo = new THREE.BoxGeometry(1,1,1);
    const mat = new THREE.MeshBasicMaterial({color:0xffffff});
    const cube = new THREE.Mesh(geo, mat);
    cube.position.set(i*0.8, Math.random()*0.5, Math.random()*0.5);
    cloudGroup.add(cube);
  }
  cloudGroup.position.set(x,y,z);
  scene.add(cloudGroup);
  clouds.push(cloudGroup);
}
createCloud(5,8,5);
createCloud(10,9,10);
createCloud(15,7,15);

// =====================
// Settings
let cameraSensitivity = 1.0;

document.getElementById("hudToggle").addEventListener("change", e=>{
  const display = e.target.checked ? "block" : "none";
  document.getElementById("inventory").style.display = display;
  document.getElementById("settings").style.display = display;
  document.getElementById("profile").style.display = display;
});

document.getElementById("sensSlider").addEventListener("input", e=>{
  cameraSensitivity = parseFloat(e.target.value);
  document.getElementById("sensValue").innerText = cameraSensitivity.toFixed(1);
});

document.getElementById("langSelect").addEventListener("change", e=>{
  const lang = e.target.value;
  if(lang==="id") alert("Bahasa diubah ke Indonesia");
  if(lang==="en") alert("Language changed to English");
});

// =====================
// Profil
let playerName = "Pemain";
function saveProfile(){
  const name = document.getElementById("profileNameInput").value;
  if(name.trim()!==""){
    playerName = name;
    document.getElementById("playerNameDisplay").innerText = playerName;
    alert("Profil disimpan: "+playerName);
  }
}

// =====================
// Animate
function animate(){
  requestAnimationFrame(animate);
  clouds.forEach(c=>{
    c.position.x += 0.01;
    if(c.position.x > worldSize) c.position.x = -2;
  });
  renderer.render(scene, camera);
}
animate();