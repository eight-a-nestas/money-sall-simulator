// =====================
// VARIABEL GAME
// =====================
let uang = 0;
let diamond = 0;
let data = { warung:{level:1, income:100}, properti:{level:0, income:0}, saham:{level:0, income:0} };
let prestige = 0;
let boost = 0;
let skills = {invest:false, negosiasi:false};
let achievements = [
  {t:"💰 Kaya Pertama (Rp 10K)",d:false,c:()=>uang>=10000},
  {t:"🏪 Pemilik 10 Warung",d:false,c:()=>data.warung.level>=10},
  {t:"👑 Prestige Pertama",d:false,c:()=>prestige>=1},
  {t:"🏢 IPO Pertama",d:false,c:()=>data.saham.level>=1}
];
let playerLevel = 1;
let exp = 0;
let playerName = "Pemain";
let playerLocation = "Rumah";
let isDay = true;
let lastEventDay = null;
let eventMultiplier = 1;
let priceHistory = [];
let hargaSaham = 1000, hargaWarung = 500, hargaProperti = 5000;

// =====================
// LOAD / SAVE GAME
// =====================
function saveGame(){
  const uid = localStorage.getItem("userUID") || "guest";
  const hash = btoa(uang + "|" + diamond);
  localStorage.setItem("save_"+uid, JSON.stringify({
    uang, diamond, data, prestige, skills, achievements, playerLevel, exp, playerName, playerLocation, hash
  }));
}

function loadGame(){
  const uid = localStorage.getItem("userUID") || "guest";
  const d = JSON.parse(localStorage.getItem("save_"+uid));
  if(d){
    const check = btoa(d.uang + "|" + d.diamond);
    if(check !== d.hash){
      alert("🚨 Cheat detected! Data di-reset.");
      uang = 0; diamond = 0;
    } else {
      uang=d.uang; diamond=d.diamond; data=d.data;
      prestige=d.prestige; skills=d.skills; achievements=d.achievements;
      playerLevel=d.playerLevel; exp=d.exp;
      playerName=d.playerName; playerLocation=d.playerLocation;
    }
  }
  // PEMAIN BARU BONUS
  if(!localStorage.getItem("firstPlay")){
    uang += 2000; diamond += 1;
    showToast("🎉 Selamat datang! Kamu mendapatkan 2000 koin & 1 berlian!");
    localStorage.setItem("firstPlay","no");
  }
}

// =====================
// TUTORIAL
// =====================
let firstPlay = localStorage.getItem("firstPlay") === null;
function showTutorial(){
  alert("👋 Selamat datang!\n💰 Hasilkan uang dengan investasi\n🏪 Bangun bisnis\n📈 Kembangkan aset\nSelamat bermain!");
  localStorage.setItem("firstPlay","no");
}
if(firstPlay) showTutorial();

// =====================
// CUSTOM NAMA PEMAIN
// =====================
function setPlayerName(){
  const input = document.getElementById("playerNameInput").value.trim();
  if(input.length===0) return alert("Nama tidak boleh kosong!");
  playerName = input;
  document.getElementById("playerNameDisplay").innerText = playerName;
  localStorage.setItem("playerName", playerName);
  showToast("✅ Nama pemain diubah menjadi " + playerName);
}
if(localStorage.getItem("playerName")){
  playerName = localStorage.getItem("playerName");
  document.getElementById("playerNameDisplay").innerText = playerName;
}

// =====================
// LEVEL & EXP
// =====================
function addExp(x){
  exp += x;
  if(exp >= playerLevel*100){
    exp=0; playerLevel++;
    alert("🎉 Level naik ke "+playerLevel);
  }
}

// =====================
// ACHIEVEMENT
// =====================
function updateAchievement(){
  const ul = achievementsEl;
  ul.innerHTML="";
  achievements.forEach(a=>{
    if(!a.d && a.c()){
      a.d=true; diamond++;
      showToast("🏆 Prestasi tercapai! +1 Berlian");
    }
    const li=document.createElement("li");
    li.innerText=(a.d?"✅ ":"❌ ")+a.t;
    ul.appendChild(li);
  });
}

// =====================
// BOOSTER
// =====================
function buyBoost(){
  if(uang >= 50000){
    uang-=50000; boost +=0.5;
    alert("⚡ Income meningkat!");
  }
}

// =====================
// DUNIA INTERAKTIF
// =====================
function goTo(location){
  playerLocation = location;
  document.getElementById("playerLocation").innerText = locationName(location);
  showToast("🚶 Kamu pergi ke "+locationName(location));
  switch(location){
    case 'warung': boost+=0.05; break;
    case 'bank': boost+=0.03; break;
    case 'saham': boost+=0.07; break;
    case 'properti': boost+=0.06; break;
  }
  updatePlayerLocation();
}
function locationName(loc){
  switch(loc){
    case 'warung': return "🏪 Warung";
    case 'bank': return "🏦 Bank";
    case 'saham': return "📈 Bursa Saham";
    case 'properti': return "🏠 Properti";
    default: return "🏠 Rumah";
  }
}

// =====================
// SIKLUS SIANG / MALAM
// =====================
function toggleDayNight(){
  isDay = !isDay;
  document.body.style.background = isDay ?
    "linear-gradient(135deg,#0f2027,#203a43,#2c5364)" :
    "linear-gradient(135deg,#000428,#004e92,#000000)";
  showToast(isDay?"☀️ Siang tiba!":"🌙 Malam tiba!");
}
setInterval(toggleDayNight, 160000);

// =====================
// EVENT MIDNIGHT
// =====================
function midnightEvent(){
  const now = new Date(); const currentDay=now.getDate();
  if(currentDay === lastEventDay) return;
  lastEventDay=currentDay;
  const events = [
    {name:"🎉 Lebaran", mult:3, msg:"Income x3 hari ini!"},
    {name:"🔥 Diskon Properti", mult:1.5, msg:"Properti lebih untung!"},
    {name:"📉 Krisis Saham", mult:0.6, msg:"Income turun!"}
  ];
  const e = events[Math.floor(Math.random()*events.length)];
  eventMultiplier = e.mult;
  eventStatus.innerText = e.name+" — "+e.msg;
  setTimeout(()=>{eventMultiplier=1; eventStatus.innerText="Tidak ada event";},24*60*60*1000);
}
setInterval(()=>{ const now=new Date(); if(now.getHours()===0 && now.getMinutes()===0) midnightEvent();},60000);

// =====================
// GRAFIK HARGA DINAMIS
// =====================
function updateHarga(){
  hargaSaham = Math.max(100, Math.floor(hargaSaham*(0.95+Math.random()*0.1)));
  hargaWarung = Math.max(100, Math.floor(hargaWarung*(0.95+Math.random()*0.1)));
  hargaProperti = Math.max(500, Math.floor(hargaProperti*(0.95+Math.random()*0.1)));
  priceHistory.push({saham:hargaSaham, warung:hargaWarung, properti:hargaProperti});
  if(priceHistory.length>20) priceHistory.shift();
}
function drawPriceChart(){
  let c = chart.getContext("2d"); c.clearRect(0,0,300,120);
  ["saham","#4CAF50","warung","#FFC107","properti","#2196F3"].reduce((i,arr,j)=>{
    const [key,color]=arr;
    c.beginPath();
    priceHistory.forEach((p,index)=>{
      let x=index*15, y=120-(p[key]/(key==="saham"?2000:key==="warung"?1000:5000)*120);
      index?c.lineTo(x,y):c.moveTo(x,y);
    });
    c.strokeStyle=color; c.stroke();
  },0);
}

// =====================
// FEEDBACK EMAIL
// =====================
function sendFeedback(){
  const feedback=document.getElementById("feedbackInput").value.trim();
  if(feedback.length===0){alert("Feedback kosong!");return;}
  const subject=encodeURIComponent("Feedback Idle Tycoon");
  const body=encodeURIComponent(feedback);
  window.location.href=`mailto:faisalr3257n@gmail.com?subject=${subject}&body=${body}`;
  showToast("📧 Feedback siap dikirim!");
  document.getElementById("feedbackInput").value="";
}

// =====================
// MULTIPLAYER REAL-TIME
// =====================
function updatePlayerLocation(){
  const uid=localStorage.getItem("userUID")||"guest";
  firebase.database().ref('multiplayer/players/'+uid).set({
    name:playerName, money:uang, location:playerLocation
  });
}
function loadOnlinePlayers(){
  firebase.database().ref('multiplayer/players').on('value', snapshot=>{
    const ul=document.getElementById("onlinePlayers"); ul.innerHTML="";
    snapshot.forEach(child=>{
      const p=child.val();
      const li=document.createElement("li");
      li.innerText=`${p.name} — Rp ${p.money} — Lokasi: ${p.location}`;
      ul.appendChild(li);
    });
  });
}
loadOnlinePlayers();

// =====================
// CHAT GLOBAL REAL-TIME
// =====================
function sendChat(){
  const msg=document.getElementById("chatInput").value.trim();
  if(msg.length===0) return;
  const uid=localStorage.getItem("userUID")||"guest";
  firebase.database().ref('multiplayer/chat/'+Date.now()).set({
    uid:uid, name:playerName, message:msg
  });
  document.getElementById("chatInput").value="";
}
firebase.database().ref('multiplayer/chat').limitToLast(50).on('value', snapshot=>{
  const chatBox=document.getElementById("chatBox"); chatBox.innerHTML="";
  snapshot.forEach(child=>{
    const c=child.val();
    const p=document.createElement("p");
    p.innerHTML=`<strong>${c.name}:</strong> ${c.message}`;
    chatBox.appendChild(p);
  });
  chatBox.scrollTop=chatBox.scrollHeight;
});

// =====================
// TOAST NOTIFIKASI
// =====================
function showToast(text){
  const t=document.getElementById("toast"); t.innerText=text; t.style.display="block";
  setTimeout(()=>t.style.display="none",3000);
}

// =====================
// UPDATE GAME LOOP
// =====================
function update(){
  updateHarga();
  drawPriceChart();
  updateAchievement();
  // update UI harga
  document.getElementById("hargaWarung").innerText=hargaWarung;
  document.getElementById("hargaSaham").innerText=hargaSaham;
  document.getElementById("hargaProperti").innerText=hargaProperti;
  document.getElementById("playerLevel").innerText=playerLevel;
  document.getElementById("statMoney").innerText=uang;
  document.getElementById("statWarung").innerText=data.warung.level;
  document.getElementById("statPrestige").innerText=prestige;
  requestAnimationFrame(update);
}
loadGame();
update();