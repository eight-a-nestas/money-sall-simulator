let uang=1000;
const MAX_UANG=1_000_000_000_000;
let prestige=0,boost=1,ipo=false;
let eventMultiplier=1;

let data={
  warung:{level:0,cost:500,income:5},
  saham:{level:0,cost:1500,income:15},
  properti:{level:0,cost:5000,income:40}
};

let ai={uang:5000,income:8};

// AUDIO
const clickS=new Audio("assets/sound/click.mp3");
const coinS=new Audio("assets/sound/coin.mp3");
const bg=new Audio("assets/sound/bg.mp3");
bg.loop=true;bg.volume=0.4;
document.body.addEventListener("click",()=>bg.play(),{once:true});

function format(n){return"Rp "+Math.floor(n).toLocaleString("id-ID");}
function prestigeBonus(){return 1+prestige*0.5;}

function totalIncome(){
  let base=Object.values(data).reduce((t,a)=>t+a.level*a.income,0);
  return Math.floor(base*boost*prestigeBonus()*eventMultiplier);
}

function buy(t){
  clickS.play();
  let a=data[t];
  if(uang>=a.cost){
    uang-=a.cost;a.level++;a.cost*=1.4;
    coinS.play();
  }
}

let missions=[
 {t:"Beli 5 Warung",d:false,c:()=>data.warung.level>=5},
 {t:"Rp 10.000",d:false,c:()=>uang>=10000}
];

function update(){
  uang=Math.min(uang,MAX_UANG);
  uang+=totalIncome();

  uangEl.innerText=format(uang);
  income.innerText="Income/detik: "+format(totalIncome());
  warungLevel.innerText=data.warung.level;
  sahamLevel.innerText=data.saham.level;
  propertiLevel.innerText=data.properti.level;

  ai.uang+=ai.income;
  aiInfo.innerText="AI Corp: "+format(ai.uang);

  prestigeInfo.innerText="Prestige: "+prestige;
  ipoStatus.innerText=ipo?"Public":"Private";

  missions.forEach(m=>{
    if(!m.d&&m.c()){m.d=true;uang+=2000;alert("Misi selesai");}
  });
  missionsEl.innerHTML=missions.map(m=>(m.d?"✅ ":"❌ ")+m.t).join("<br>");

  drawChart();
}

function doIPO(){
  if(ipo||uang<500_000_000)return;
  ipo=true;boost+=1;
}

function doPrestige(){
  if(uang<1_000_000_000)return;
  prestige++;uang=1000;boost=1;ipo=false;
  Object.values(data).forEach(a=>a.level=0);
}

let history=[];
function drawChart(){
  history.push(uang);if(history.length>20)history.shift();
  let c=chart.getContext("2d");
  c.clearRect(0,0,300,120);
  c.beginPath();
  history.forEach((v,i)=>{
    let x=i*15,y=120-(v/MAX_UANG)*120;
    i?c.lineTo(x,y):c.moveTo(x,y);
  });
  c.strokeStyle="#4CAF50";c.stroke();
}

setInterval(update,1000);