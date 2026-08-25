import {state,persist} from "./state.js";import {showScreen,attachGlobal,renderMap,toast} from "./ui.js";import "./combat.js";
const loading=document.querySelector("#loading-bar"),lt=document.querySelector("#loading-text");
function splash(){let n=0;const timer=setInterval(()=>{n=Math.min(100,n+Math.floor(Math.random()*8)+4);loading.style.width=n+"%";lt.textContent=`LOADING ${n}%`;if(n>=100){clearInterval(timer);setTimeout(()=>showScreen("login"),500)}},130)}
document.querySelectorAll(".auth-btn").forEach(b=>b.addEventListener("click",()=>{
  const kind=b.dataset.auth;
  const input=document.querySelector("#player-name");
  const name=(input?.value||"").trim().replace(/[^\p{L}\p{N}_ -]/gu,"").slice(0,18);
  state.save.name=name||"ArcaneX";
  state.save.onlineMode=kind!=="Guest";
  state.save.authProvider=kind;
  persist();
  showScreen("home");
  toast(`${state.save.name} • ${kind} account ready`);
}));
document.querySelector("#map-selector").addEventListener("dblclick",()=>showScreen("map"));
document.querySelectorAll("[data-back-home]").forEach(b=>b.addEventListener("click",()=>showScreen("home")));
document.addEventListener("visibilitychange",()=>{if(document.hidden)persist()});
if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
attachGlobal();renderMap();
document.querySelector("#quick-emotes")?.addEventListener("click",()=>openQuickEmotes());
function openQuickEmotes(){
  let wheel=document.querySelector(".emote-wheel");
  if(!wheel){
    wheel=document.createElement("div");
    wheel.className="emote-wheel open";
    ["🕺","🫡","💪","😂","😈","🖐️"].forEach((icon,i)=>{
      const b=document.createElement("button");
      b.textContent=icon;
      b.title="Emote "+(i+1);
      b.addEventListener("click",()=>{wheel.classList.remove("open");toast(`Emote ${icon}`)});
      wheel.appendChild(b);
    });
    document.querySelector("#home .start-zone").appendChild(wheel);
  }else wheel.classList.toggle("open");
}
splash();
