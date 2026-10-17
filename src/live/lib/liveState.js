export function stateKey(eventId,fanId){return `fandrop.live.v1:${encodeURIComponent(eventId)}:${encodeURIComponent(fanId)}`;}
export function restoreProfile(storage,profile){
 try{const saved=JSON.parse(storage.getItem(stateKey(profile.eventId,profile.fanId)));if(saved?.starAwakened===true)return {...profile,awakening:{starAwakened:true,lightSent:saved.lightSent===true,starColor:saved.starColor,sentAt:saved.sentAt}};}catch{}
 return profile;
}
export function persistProfile(storage,profile){storage.setItem(stateKey(profile.eventId,profile.fanId),JSON.stringify(profile.awakening));}
