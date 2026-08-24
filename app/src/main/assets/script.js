(() => {
"use strict";

const SAVE_KEY="wizard_dash_ultimate_v1";
const DAY=86400000;
const WORLD_COUNT=20;
const MISSIONS_PER_WORLD=100;

const worlds=[
 ["Cursed Forest","🌲"],["Neon Ruins","🏙️"],["Arcane Castle","🏰"],["Dragon Realm","🐉"],
 ["Storm Coast","🌊"],["Frost Citadel","❄️"],["Sunken Temple","🗿"],["Shadow Marsh","🌑"],
 ["Iron Wastes","⚙️"],["Sky Fortress","☁️"],["Arcane Desert","🏜️"],["Thunder Peaks","⛰️"],
 ["Blood Moon City","🌙"],["Void Library","📚"],["Celestial Gate","🌌"],["Phantom Kingdom","👻"],
 ["Starfall Crater","☄️"],["Ancient Nexus","🔱"],["Doom Cathedral","⛪"],["Eternal Throne","👑"]
];
const enemies=[
 ["Shadow Scout","👹",45],["Rune Thief","👺",55],["Arcane Wolf","🐺",70],["Void Archer","🏹",82],
 ["Iron Golem","🗿",105],["Frost Witch","🧙‍♀️",120],["Storm Beast","🐲",145],["Dread Knight","🛡️",170],
 ["Crystal Serpent","🐍",200],["Night Reaper","💀",230]
];
const bosses=[
 ["Forest Guardian","🌳",900],["Neon Tyrant","🤖",1100],["Arcane King","👑",1350],["Ancient Dragon","🐉",1700],
 ["Storm Colossus","⚡",2100],["Frost Emperor","❄️",2550],["Temple Devourer","🗿",3000],["Shadow Lord","👿",3500],
 ["Iron Overlord","🤖",4100],["Sky Devourer","🦅",4700],["Desert Behemoth","🦂",5400],["Thunder Titan","⚡",6200],
 ["Blood Moon Queen","🌙",7100],["Void Archmage","🧙",8200],["Celestial Dragon","🐲",9500],["Phantom King","👻",11000],
 ["Starfall Beast","☄️",12800],["Nexus Guardian","🔱",15000],["Doom Bishop","😈",17500],["Eternal Emperor","👑",20500]
];
const avatars=["🧙","🧝","🧛","🥷","🧚","🧞","🧑‍🚀","🦸","🧑‍🎤","🧑‍🎨","🧑‍🚒","🧑‍🔬"];
const shopItems=[
 ["weapon","Moonblade","⚔️",1200,"gold",25,"Rare",7],["weapon","Void Staff","🪄",35,"diamond",38,"Epic",12],
 ["weapon","Storm Spear","🔱",2600,"gold",44,"Epic",16],["weapon","Dragon Edge","🗡️",90,"diamond",65,"Legendary",25],
 ["armor","Night Jacket","🥋",1800,"gold",18,"Rare",20],["armor","Arcane Robe","🧥",42,"diamond",35,"Epic",32],
 ["armor","Dragon Armor","🛡️",5200,"gold",55,"Legendary",55],["skin","Shadow Skin","🥷",70,"diamond",50,"Epic",12],
 ["skin","Royal Skin","👑",6500,"gold",60,"Legendary",20],["boots","Swift Boots","🥾",1400,"gold",15,"Rare",8],
 ["boots","Storm Boots","👢",40,"diamond",30,"Epic",18],["magic","Violet Orb","🔮",2100,"gold",20,"Rare",10],
 ["magic","Star Crystal","💠",65,"diamond",42,"Legendary",25],["potion","Mega Potion","🧪",700,"gold",1,"Common",35],
 ["tactic","Battle Core","🧠",80,"diamond",1,"Legendary",50],["weapon","Solar Hammer","🔨",9000,"gold",85,"Legendary",35]
];
const rewards=[["500 Gold","🪙",500,"gold"],["5 Diamonds","💎",5,"diamond"],["Mega Potion","🧪",1,"potion"],["1500 Gold","🪙",1500,"gold"],["10 Diamonds","💎",10,"diamond"],["Random Gear","🎁",1,"random"]];

const baseState={
 name:"ArcaneX",avatar:"🧙",level:1,xp:0,gold:1250,diamonds:30,
 hp:100,power:20,speed:10,defense:10,mana:50,crit:5,
 currentWorld:1,currentMission:1,completed:[],owned:["starter-staff","starter-robe"],equipped:{weapon:"starter-staff",armor:"starter-robe",boots:null,skin:null,magic:null},
 inventory:["starter-staff","starter-robe"],lastWheel:0,sound:true,vibrate:true,language:"EN",online:false,room:"WD-4821"
};

let state=load();
let battle=null;
let timer=null;
let enemyTimer=null;

function load(){
 try{const x=JSON.parse(localStorage.getItem(SAVE_KEY));return Object.assign({},baseState,x||{});}catch(e){return {...baseState};}
}
function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
function $(id){return document.getElementById(id);}
function all(sel){return [...document.querySelectorAll(sel)];}
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),1900);}
function money(n){return Math.floor(n).toLocaleString();}
function currentKey(){return `${state.currentWorld}-${state.currentMission}`;}
function isDone(w,m){return state.completed.includes(`${w}-${m}`);}
function highestCompletedWorld(){let w=1;for(let i=1;i<=WORLD_COUNT;i++){if(isDone(i,100))w=i+1;else break;}return Math.min(w,WORLD_COUNT);}
function maxUnlockedMission(w){if(w===1)return Math.min(100,Math.max(1,state.currentWorld===1?state.currentMission:1));if(w<highestCompletedWorld())return 100;return w<state.currentWorld?100:(w===state.currentWorld?Math.min(100,state.currentMission):1);}
function worldUnlocked(w){return w===1||isDone(w-1,100);}
function enemyPower(w,m){return Math.round(22 + w*13 + m*2.4);}
function playerMaxHp(){return state.hp+state.level*12;}
function rank(){if(state.level>=50)return"Legend";if(state.level>=30)return"Master";if(state.level>=15)return"Elite";if(state.level>=5)return"Apprentice";return"Rookie";}
function xpNeed(){return 100+state.level*45;}

function showScreen(name){
 all(".screen").forEach(s=>s.classList.remove("active"));
 const target=$("screen-"+name);if(target)target.classList.add("active");
 all(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));
 if(name==="home")renderHome();
 if(name==="worlds")renderWorlds();
 if(name==="shop")renderShop();
 if(name==="inventory")renderInventory();
 if(name==="power")renderPower();
 if(name==="wheel")renderWheel();
 if(name==="profile")renderProfile();
 if(name==="friends")renderFriends();
 if(name==="settings")renderSettings();
}

function renderHome(){
 $("topName").textContent=state.name;$("topLevel").textContent=state.level;$("topRank").textContent=rank();$("topAvatar").textContent=state.avatar;
 $("gold").textContent=money(state.gold);$("diamonds").textContent=money(state.diamonds);
 $("homeHp").textContent=playerMaxHp();$("homePower").textContent=state.power;$("homeSpeed").textContent=state.speed;$("homeDefense").textContent=state.defense;
 $("progressTitle").textContent=`World ${state.currentWorld}`;$("progressText").textContent=`Mission ${state.currentMission} / 100`;
 $("progressBar").style.width=`${Math.max(1,(state.currentMission-1))}%`;
}
function renderWorlds(){
 const g=$("worldGrid");g.innerHTML="";
 worlds.forEach((w,i)=>{
  const n=i+1, unlocked=worldUnlocked(n), done=isDone(n,100);
  const el=document.createElement("button");el.className=`world-card ${unlocked?"unlocked":"locked"} ${n%5===0?"boss":""}`;
  el.innerHTML=`<span class="world-icon">${w[1]}</span><strong>${n}. ${w[0]}</strong><small>${done?"100/100 COMPLETE":unlocked?`${Math.max(0,missionsDone(n))}/100 missions`:"Complete previous world"}</small><span class="lock">${unlocked?"▶":"🔒"}</span>`;
  if(unlocked)el.onclick=()=>openWorld(n);else el.onclick=()=>toast(`World ${n} is locked. Finish World ${n-1}.`);
  g.appendChild(el);
 });
}
function missionsDone(w){return state.completed.filter(k=>k.startsWith(`${w}-`)).length;}
function openWorld(w){if(!worldUnlocked(w))return toast("World locked");state.currentWorld=w;state.currentMission=Math.max(1,Math.min(100,state.currentMission||1));save();$("missionWorldTitle").textContent=`WORLD ${w} • ${worlds[w-1][0]}`;renderMissions(w);showScreen("missions");}
function renderMissions(w){
 const g=$("missionGrid");g.innerHTML="";
 for(let m=1;m<=100;m++){
  const open=(m===1||isDone(w,m-1))&&worldUnlocked(w), done=isDone(w,m), boss=m===100;
  const b=document.createElement("button");b.className=`mission ${open?"open":"locked"} ${done?"done":""} ${boss?"boss":""}`;
  b.innerHTML=`${boss?"👑 ":""}${m}${done?'<span class="star">✓</span>':""}`;
  b.onclick=()=>open?startBattle(w,m):toast(`Mission ${m} is locked. Finish Mission ${m-1}.`);
  g.appendChild(b);
 }
}

function startBattle(w,m){
 stopBattle();state.currentWorld=w;state.currentMission=m;save();
 const boss=m===100;
 const count=boss?1:Math.min(5,2+Math.floor(m/25));
 const base=enemyPower(w,m);
 battle={w,m,boss,playerHp:playerMaxHp(),maxHp:playerMaxHp(),enemies:[],time:boss?180:120,shield:0,ultimate:0,ended:false};
 for(let i=0;i<count;i++){
  if(boss){const b=bosses[w-1];battle.enemies.push({id:i,name:b[0],icon:b[1],hp:b[2]+w*700,maxHp:b[2]+w*700,damage:Math.round(base*1.25),x:52,y:34});}
  else {const e=enemies[(w+m+i)%enemies.length];const hp=Math.round(e[2]*(1+w*.55+m*.025));battle.enemies.push({id:i,name:e[0],icon:e[1],hp,maxHp:hp,damage:Math.round(base*(.55+i*.08)),x:18+i*18,y:35+(i%2)*12});}
 }
 showScreen("battle");renderBattle();runBattle();
}
function renderBattle(){
 $("battleWorld").textContent=`WORLD ${battle.w} • MISSION ${battle.m}${battle.boss?" • BOSS":""}`;
 $("battleName").textContent=state.name;$("battleAvatar").textContent=state.avatar;
 $("battleHpText").textContent=`${Math.max(0,Math.ceil(battle.playerHp))} / ${battle.maxHp}`;$("playerHpBar").style.width=`${Math.max(0,battle.playerHp/battle.maxHp*100)}%`;
 $("battleGold").textContent=money(state.gold);$("battleDiamonds").textContent=money(state.diamonds);
 $("objectiveTitle").textContent=battle.boss?"DEFEAT THE BOSS":"DEFEAT ALL ENEMIES";
 $("objectiveText").textContent=battle.boss?`${battle.enemies[0]?.name||"Boss"} • ${money(battle.enemies[0]?.hp||0)} HP`:`Enemies remaining: ${battle.enemies.filter(e=>e.hp>0).length}`;
 $("bossLabel").classList.toggle("hidden",!battle.boss);
 const arena=$("arena");arena.innerHTML="";
 const p=document.createElement("div");p.className="player-unit";p.style.left="calc(50% - 50px)";p.style.top="54%";p.id="playerUnit";p.textContent=state.avatar;arena.appendChild(p);
 battle.enemies.forEach(e=>{if(e.hp<=0)return;const d=document.createElement("div");d.className=`enemy ${battle.boss?"boss":""}`;d.id=`enemy-${e.id}`;d.style.left=`${e.x}%`;d.style.top=`${e.y}%`;d.innerHTML=`<div class="enemy-hp"><i style="width:${e.hp/e.maxHp*100}%"></i></div><div class="enemy-body">${e.icon}</div>`;arena.appendChild(d);});
}
function runBattle(){
 $("battleTimer").textContent=timeText(battle.time);
 timer=setInterval(()=>{if(!battle||battle.ended)return;battle.time--;if(battle.time<=0)endBattle(false,"Time ran out.");$("battleTimer").textContent=timeText(battle.time);},1000);
 enemyTimer=setInterval(()=>enemyAttack(),1800);
}
function timeText(s){return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.max(0,s%60)).padStart(2,"0")}`;}
function stopBattle(){clearInterval(timer);clearInterval(enemyTimer);timer=null;enemyTimer=null;}
function enemyAttack(){
 if(!battle||battle.ended)return;
 const living=battle.enemies.filter(e=>e.hp>0);if(!living.length)return;
 const total=living.reduce((a,e)=>a+e.damage,0);
 const reduction=Math.min(.7,state.defense/180)+(battle.shield?0.35:0);
 const damage=Math.max(1,Math.round(total*(1-Math.min(.85,reduction))));
 battle.playerHp=Math.max(0,battle.playerHp-damage);battle.shield=0;
 showDamage(`-${damage}`,"#ff6075");renderBattle();
 if(battle.playerHp<=0)endBattle(false,"You were defeated. Upgrade your wizard and try again.");
}
function attack(mult=1){
 if(!battle||battle.ended)return;
 const target=battle.enemies.find(e=>e.hp>0);if(!target)return;
 const crit=Math.random()<state.crit/100;const raw=state.power+state.level*4+Math.floor(Math.random()*12);
 const damage=Math.max(1,Math.round(raw*mult*(crit?1.8:1)));
 target.hp=Math.max(0,target.hp-damage);showDamage(`-${damage}${crit?" CRIT":""}`,crit?"#f9d35b":"#c56cff");
 if(target.hp<=0) toast(`${target.name} defeated!`);
 renderBattle();
 if(battle.enemies.every(e=>e.hp<=0))endBattle(true,"Mission complete!");
}
function showDamage(text,color){const f=$("damageFloat");f.textContent=text;f.style.color=color;f.animate([{transform:"translate(-50%,0) scale(.8)",opacity:0},{transform:"translate(-50%,-25px) scale(1.1)",opacity:1},{transform:"translate(-50%,-70px) scale(1)",opacity:0}],{duration:650});}
function combat(action){
 if(!battle||battle.ended)return;
 if(action==="attack")attack(1);
 if(action==="skill")attack(1.6);
 if(action==="magic"){if(state.mana<10)return toast("Not enough mana");state.mana-=10;attack(2.2);}
 if(action==="ultimate"){if(battle.ultimate<100)return toast("Ultimate is not ready");battle.ultimate=0;attack(4);}
 if(action==="shield"){battle.shield=1;toast("Shield active");}
 if(action==="heal"){battle.playerHp=Math.min(battle.maxHp,battle.playerHp+Math.round(battle.maxHp*.28));toast("HP restored");renderBattle();}
 if(action==="dash"){battle.time+=5;attack(1.25);toast("Dash attack");}
 if(action.startsWith("move-"))toast(action==="move-up"?"You advanced.":"You moved.");
 if(action==="skill"||action==="attack"||action==="magic")battle.ultimate=Math.min(100,battle.ultimate+18);
}
function endBattle(win,msg){
 if(!battle||battle.ended)return;battle.ended=true;stopBattle();
 if(win){
  const rewardGold=120+battle.w*90+battle.m*14;
  const rewardXp=35+battle.w*8+battle.m*2;
  state.gold+=rewardGold;gainXp(rewardXp);state.completed=[...new Set([...state.completed,`${battle.w}-${battle.m}`])];
  if(Math.random()<.18||battle.boss){const item=shopItems[(battle.w+battle.m)%shopItems.length];if(!state.inventory.includes(item[1]))state.inventory.push(item[1]);toast(`🎁 Free reward: ${item[1]}`);}
  if(battle.m===100&&battle.w<WORLD_COUNT){state.currentWorld=battle.w+1;state.currentMission=1;toast(`👑 World ${battle.w} cleared! World ${battle.w+1} unlocked.`);}
  else state.currentMission=Math.min(100,battle.m+1);
  save();
  setTimeout(()=>{toast(`${msg} +${rewardGold} Gold • +${rewardXp} XP`);showScreen("missions");renderMissions(battle.w);},400);
 }else{save();setTimeout(()=>{toast(msg);showScreen("missions");renderMissions(battle.w);},350);}
}
function gainXp(xp){state.xp+=xp;while(state.xp>=xpNeed()){state.xp-=xpNeed();state.level++;state.hp+=10;state.power+=3;state.speed+=1;state.defense+=2;toast(`⭐ Level up! Level ${state.level}`);}}
function renderShop(){
 const tabs=["all","weapon","armor","skin","boots","magic","potion","tactic"];
 $("shopTabs").innerHTML=tabs.map(x=>`<button class="${x==="all"?"active":""}" data-tab="${x}">${x.toUpperCase()}</button>`).join("");
 const draw=(tab="all")=>{
  $("shopGrid").innerHTML="";
  shopItems.filter(i=>tab==="all"||i[0]===tab).forEach(item=>{
   const [type,name,icon,cost,currency,stat,rarity,bonus]=item,owned=state.inventory.includes(name);
   const el=document.createElement("div");el.className=`item-card ${owned?"owned":""}`;
   el.innerHTML=`<div class="item-icon">${icon}</div><strong>${name}</strong><small>${type.toUpperCase()} • +${bonus} stat</small><div class="rarity">${rarity}</div><div class="price"><span>${currency==="gold"?"🪙":"💎"} ${money(cost)}</span><button>${owned?"OWNED":"BUY"}</button></div>`;
   el.querySelector("button").onclick=()=>buyItem(item);
   $("shopGrid").appendChild(el);
  });
 };
 all("#shopTabs button").forEach(b=>b.onclick=()=>{all("#shopTabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");draw(b.dataset.tab);});
 draw();
}
function buyItem(item){
 const [type,name,icon,cost,currency,stat,rarity,bonus]=item;if(state.inventory.includes(name))return equipItem(name);
 const ok=currency==="gold"?state.gold>=cost:state.diamonds>=cost;if(!ok)return toast("Not enough currency");
 if(currency==="gold")state.gold-=cost;else state.diamonds-=cost;state.inventory.push(name);save();toast(`Bought ${name}!`);renderShop();
}
function equipItem(name){if(name.startsWith("Moon")||name.includes("Staff")||name.includes("Spear")||name.includes("Edge")||name.includes("Hammer"))state.equipped.weapon=name;else if(name.includes("Jacket")||name.includes("Robe")||name.includes("Armor"))state.equipped.armor=name;else if(name.includes("Boots"))state.equipped.boots=name;else if(name.includes("Skin"))state.equipped.skin=name;else if(name.includes("Orb")||name.includes("Crystal"))state.equipped.magic=name;save();toast(`${name} equipped`);renderInventory();}
function renderInventory(){
 $("loadout").innerHTML=[["weapon","⚔️"],["armor","🛡️"],["boots","🥾"],["magic","🔮"]].map(x=>`<div class="slot"><span>${x[1]}</span><small>${state.equipped[x[0]]||"EMPTY"}</small></div>`).join("");
 $("inventoryGrid").innerHTML="";
 const items=state.inventory.map(n=>shopItems.find(i=>i[1]===n)).filter(Boolean);
 items.forEach(item=>{const [type,name,icon,cost,currency,stat,rarity,bonus]=item;const d=document.createElement("div");d.className="item-card owned";d.innerHTML=`<div class="item-icon">${icon}</div><strong>${name}</strong><small>${type} • ${rarity} • +${bonus}</small><div class="price"><span>OWNED</span><button>EQUIP</button></div>`;d.querySelector("button").onclick=()=>equipItem(name);$("inventoryGrid").appendChild(d);});
}
function renderPower(){
 $("powerLevelText").textContent=`Power Level ${state.level}`;$("powerHero").textContent=state.level>=20?"⚡":state.level>=10?"🔥":"💪";
 const upgrades=[["hp","❤️","HP",state.hp,50+state.hp*4,5],["power","⚔️","POWER",state.power,70+state.power*7,4],["speed","⚡","SPEED",state.speed,90+state.speed*8,2],["defense","🛡️","DEFENSE",state.defense,80+state.defense*6,3],["mana","💧","MANA",state.mana,100+state.mana*3,10],["crit","🎯","CRIT",state.crit,250+state.crit*20,2]];
 $("upgradeGrid").innerHTML="";
 upgrades.forEach(u=>{const [key,icon,label,val,cost,inc]=u;const d=document.createElement("div");d.className="upgrade";d.innerHTML=`<div class="stat">${icon}</div><strong>${label}: ${val}${key==="crit"?"%":""}</strong><small>+${inc} • Permanent upgrade</small><button>🪙 ${money(cost)}</button>`;d.querySelector("button").onclick=()=>upgrade(key,cost,inc);$("upgradeGrid").appendChild(d);});
}
function upgrade(key,cost,inc){if(state.gold<cost)return toast("Not enough Gold");state.gold-=cost;state[key]+=inc;save();toast(`${key.toUpperCase()} upgraded!`);renderPower();renderHome();}
function renderWheel(){
 $("rewardList").innerHTML=rewards.map(r=>`<div>${r[1]} ${r[0]}</div>`).join("");
 const ready=!state.lastWheel||Date.now()-state.lastWheel>=DAY;$("spinButton").disabled=!ready;$("spinButton").style.opacity=ready?"1":".45";
 $("wheelStatus").textContent=ready?"Your free spin is ready.":`Next free spin in ${timeLeft(state.lastWheel+DAY)}.`;
}
function timeLeft(t){const d=Math.max(0,t-Date.now());const h=Math.floor(d/3600000),m=Math.floor(d%3600000/60000);return `${h}h ${m}m`;}
function spinWheel(){
 if(state.lastWheel&&Date.now()-state.lastWheel<DAY)return toast("Come back tomorrow.");
 state.lastWheel=Date.now();const wheel=$("wheel");wheel.classList.add("spinning");const r=rewards[Math.floor(Math.random()*rewards.length)];
 setTimeout(()=>{wheel.classList.remove("spinning");grantReward(r);save();renderWheel();},1450);
}
function grantReward(r){const [name,icon,value,type]=r;if(type==="gold")state.gold+=value;else if(type==="diamond")state.diamonds+=value;else if(type==="potion"){state.inventory.push(`Wheel ${name}`);}else{const item=shopItems[Math.floor(Math.random()*shopItems.length)];if(!state.inventory.includes(item[1]))state.inventory.push(item[1]);toast(`🎁 ${item[1]} added to inventory`);return;}toast(`🎁 You won ${icon} ${name}!`);}
function renderProfile(){
 $("profileAvatar").textContent=state.avatar;$("profileName").textContent=state.name;$("profileLevel").textContent=state.level;$("profileRank").textContent=rank();$("xpBar").style.width=`${state.xp/xpNeed()*100}%`;$("xpText").textContent=`${state.xp} / ${xpNeed()} XP`;
 $("avatarGrid").innerHTML=avatars.map(a=>`<button class="${a===state.avatar?"selected":""}">${a}</button>`).join("");
 all("#avatarGrid button").forEach(b=>b.onclick=()=>{state.avatar=b.textContent;save();renderProfile();renderHome();});
 const ach=[["First Blood",state.completed.length>=1],["Hunter",state.completed.length>=25],["Boss Slayer",state.completed.filter(k=>k.endsWith("-100")).length>=1],["World Walker",state.completed.filter(k=>k.endsWith("-100")).length>=5],["Collector",state.inventory.length>=10],["Legend",state.level>=30]];
 $("achievementGrid").innerHTML=ach.map(a=>`<div class="achievement"><b>${a[1]?"🏆":"🔒"} ${a[0]}</b><small>${a[1]?"Unlocked":"Keep playing to unlock"}</small></div>`).join("");
}
function renderFriends(){
 $("connectionTitle").textContent=state.online?"ONLINE MODE":"OFFLINE MODE";$("connectionText").textContent=state.online?"Online room is ready for a network backend.":"Everything works without internet.";
 $("onlineToggle").textContent=state.online?"OFFLINE":"ONLINE";$("roomCode").textContent=state.room;
 const friends=[["Luna","🧝",state.online?"Online":"Offline"],["Rex","🥷",state.online?"Online":"Bot"],["Mira","🧚",state.online?"Online":"Bot"],["Drake","🧙",state.online?"Online":"Bot"]];
 $("friendList").innerHTML=friends.map(f=>`<div class="friend"><span class="favatar">${f[1]}</span><div><b>${f[0]}</b><small>${f[2]}</small></div><button data-friend="${f[0]}">INVITE</button></div>`).join("");
 all("#friendList button").forEach(b=>b.onclick=()=>toast(`Invite sent to ${b.dataset.friend}`));
}
function renderSettings(){
 $("soundToggle").querySelector("span").textContent=state.sound?"ON":"OFF";$("vibrateToggle").querySelector("span").textContent=state.vibrate?"ON":"OFF";$("languageToggle").querySelector("span").textContent=state.language;
}
function reset(){if(confirm("Reset all Wizard Dash progress?")){localStorage.removeItem(SAVE_KEY);state=load();renderHome();showScreen("home");toast("Progress reset.");}}
function bind(){
 all("[data-screen]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.screen)));
 all("[data-action]").forEach(b=>b.addEventListener("click",()=>handleAction(b.dataset.action)));
 all("[data-combat]").forEach(b=>b.addEventListener("click",()=>combat(b.dataset.combat)));
 $("spinButton").onclick=spinWheel;
 $("onlineToggle").onclick=()=>{state.online=!state.online;save();renderFriends();toast(state.online?"Online mode enabled.":"Offline mode enabled.");};
 $("soundToggle").onclick=()=>{state.sound=!state.sound;save();renderSettings();};
 $("vibrateToggle").onclick=()=>{state.vibrate=!state.vibrate;save();renderSettings();};
 $("languageToggle").onclick=()=>{state.language=state.language==="EN"?"RU":"EN";save();renderSettings();toast("Language setting saved.");};
}
function handleAction(a){
 if(a==="continue")startBattle(state.currentWorld,state.currentMission);
 if(a==="quit-battle"){stopBattle();showScreen("home");}
 if(a==="save"){save();toast("Game saved on this device.");}
 if(a==="reset")reset();
 if(a==="copy-room"){navigator.clipboard?.writeText(state.room).then(()=>toast("Room code copied")).catch(()=>toast(state.room));}
 if(a==="duel"){toast(state.online?"Online duel room opened.":"Offline friend duel started.");startBattle(state.currentWorld,Math.max(1,state.currentMission));}
}
bind();renderHome();
})();
