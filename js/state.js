import {load,save} from "./storage.js";
export const state={save:load(),screen:"splash",panel:null,combat:null};
export function persist(){save(state.save)}
export function addGold(n){state.save.gold=Math.max(0,state.save.gold+n);persist()}
export function addDiamonds(n){state.save.diamonds=Math.max(0,state.save.diamonds+n);persist()}
export function spendGold(n){if(state.save.gold<n)return false;state.save.gold-=n;persist();return true}
export function spendDiamonds(n){if(state.save.diamonds<n)return false;state.save.diamonds-=n;persist();return true}
export function addXp(n){state.save.xp+=n;while(state.save.xp>=state.save.nextXp){state.save.xp-=state.save.nextXp;state.save.level++;state.save.nextXp=Math.floor(state.save.nextXp*1.18)}persist()}
export function useEnergy(n){if(state.save.energy<n)return false;state.save.energy-=n;persist();return true}
