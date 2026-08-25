import {AVATARS} from "./data.js";
const KEY="wizardDashSaveV3";
export function fresh(){return {name:"ArcaneX",gold:12560,diamonds:1250,energy:120,maxEnergy:120,level:25,xp:1250,nextXp:2500,world:0,mission:0,completed:0,bossWins:0,potions:0,selectedAvatar:0,selectedWeapon:"Moonblade",selectedArmor:"Starter Mantle",owned:["Moonblade","Starter Mantle"],ownedEmotes:[],skills:["Dash"],dailyClaim:null,stats:{kills:0,deaths:0,combos:0},onlineMode:false,authProvider:null,created:Date.now()}}
export function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s?{...fresh(),...s,stats:{...fresh().stats,...(s.stats||{})}}:fresh()}catch{return fresh()}}
export function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
export function reset(){const s=fresh();save(s);return s}
export function hasItem(s,name){return s.owned.includes(name)}
export function addItem(s,name){if(!hasItem(s,name))s.owned.push(name)}
export function avatarName(s){return AVATARS[s.selectedAvatar]||AVATARS[0]}
