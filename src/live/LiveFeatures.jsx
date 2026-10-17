import React,{useState,useEffect,useRef} from 'react';
import {Sparkles,Mic,Music2,Trophy,Lock,ArrowUpRight,X,ArrowLeft} from 'lucide-react';
import Awakening from './pages/Awakening';
import {awakenStar,sendLight,starThemes} from './lib/awakening';
import {restoreProfile,persistProfile} from './lib/liveState';
import './live.css';
import {AskLive,EncoreVote,TriviaGame} from './components/LiveInteractive';
/** Mount in the existing Live route. Pass the existing gate state and a stable event/fan identity. */
export default function LiveFeatures({gateScanned=false,profile,event={id:'demo-toronto',artist:'Justin Bieber',tour:'Live experience'},onProfileChange,onNavigatePass,onScan}){
 const [activity,setActivity]=useState(null),[stage,setStage]=useState(false),[error,setError]=useState('');
 const valid=!!profile?.fanId&&!!profile?.nickname&&!!event.id;
 const identity=`${event.id}:${profile?.fanId||''}`;
 const [local,setLocal]=useState(null);
 const dialog=useRef(),previous=useRef();
 useEffect(()=>{setActivity(null);setStage(false);setError('');if(valid){const p={...profile,eventId:event.id,mood:starThemes[profile.mood]?profile.mood:'Nostalgic'};try{setLocal(restoreProfile(window.localStorage,p))}catch{setLocal(p)}}else setLocal(null)},[identity,valid,profile?.mood,profile?.nickname]);
 const current=local?.eventId===event.id&&local?.fanId===profile?.fanId?local:null;
 function close(){setActivity(null);setStage(false)}
 useEffect(()=>{if(!activity)return;previous.current=document.activeElement;dialog.current?.showModal();return()=>{dialog.current?.close();previous.current?.focus()}},[activity]);
 useEffect(()=>{if(!gateScanned)close()},[gateScanned]);
 function update(kind){try{const next=kind==='awaken'?awakenStar(current):sendLight(current);persistProfile(localStorage,next);setLocal(next);onProfileChange?.(next);setError('');return true}catch{setError('Could not save your star. Allow browser storage and try again.');return false}}
 const locked=!gateScanned;
 return <section className="fd-live-features" aria-label="Tonight’s live experiences"><h2 className="fd-live-heading">Tonight’s exclusives</h2><div className="fd-live-drops">
 {[{id:'trivia',title:'Opening Trivia',sub:'Play as the show starts. Top scorer gets a call from the artist.',Icon:Trophy,button:'Play trivia'},
  {id:'awakening',title:'The Awakening',sub:'Awaken your star. Join the collective sky.',Icon:Sparkles,button:current?.awakening?.lightSent?'Revisit your sky':'Awaken your star'},
 {id:'ask',title:`Ask ${event.artist}`,sub:'Your questions. A little closer to the artist.',Icon:Mic,button:'Ask a question'},
 {id:'encore',title:'The Hidden Encore',sub:'One rare song. Chosen by tonight’s fans.',Icon:Music2,button:'Vote for the encore'}].map((drop,i)=><article className={`fd-live-drop fd-drop-${drop.id} ${locked?'fd-locked':''}`} key={drop.id}><div className="fd-drop-icon">{locked?<Lock size={24}/>:<drop.Icon size={26}/>}</div><div className="fd-drop-copy"><small>DROP {String(i+1).padStart(2,'0')} · {locked?'LOCKED':'OPEN'}</small><h3>{drop.title}</h3><p>{locked?'Locked until the gate scan':drop.sub}</p><button disabled={!locked&&drop.id==='awakening'&&!current} onClick={()=>locked?onScan?.():setActivity(drop.id)}>{locked?'Tap to scan & unlock':drop.id==='awakening'&&!current?'Make your fan card first':drop.button}{!locked&&<ArrowUpRight size={15}/>}</button></div></article>)}
 </div>{!locked&&!valid&&<p className="fd-hint">The Awakening needs your fan card. <button style={{textDecoration:"underline",background:"none",border:0,font:"inherit",cursor:"pointer"}} onClick={()=>onNavigatePass?.()}>Make it on the Profile tab →</button></p>}
 {activity&&<dialog ref={dialog} className={`fd-live-dialog ${activity==='awakening'?'fd-live-immersive':''}`} onCancel={e=>{e.preventDefault();close()}} aria-label={activity==='awakening'?'The Awakening':activity==='ask'?`Ask ${event.artist}`:activity==='trivia'?'Opening Trivia':'The Hidden Encore'}>
 {activity==='awakening'&&current?<div className="fd-live-portal"><div className="fd-portal-back"><button onClick={close}><ArrowLeft size={16}/> Back to Live</button></div>{error&&<p role="alert">{error}</p>}<Awakening profile={current} artist={event.artist} tour={event.tour||'Live experience'} onAwaken={()=>update('awaken')} onSend={()=>update('send')} navigate={where=>{close();if(where==='pass')onNavigatePass?.()}} stage={stage} setStage={setStage}/></div>:activity==='ask'?<AskLive artist={event.artist} nickname={profile?.nickname} onClose={close}/>:activity==='encore'?<EncoreVote onClose={close}/>:activity==='trivia'?<TriviaGame nickname={profile?.nickname} onClose={close}/>:null}
 </dialog>}
 </section>;
}
