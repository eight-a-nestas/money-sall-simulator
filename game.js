let uang = 1000;
let data = {
  warung: {level:0, income:5, price:200},
  saham: {level:0, income:10, price:500},
  properti: {level:0, income:25, price:1500}
};

function totalIncome(){
  return Object.values(data).reduce((t,a)=>t+a.level*a.income,0);
}

function update(){
  document.getElementById("money").innerText = "Rp " + uang;
  document.getElementById("income").innerText =
    "Income: Rp " + totalIncome() + " / detik";
}

function buy(type){
  let a = data[type];
  if(uang >= a.price){
    uang -= a.price;
    a.level++;
    update();
  }
}

setInterval(()=>{
  uang += totalIncome();
  update();
},1000);

update();