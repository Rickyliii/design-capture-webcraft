import React,{useState,useEffect,useRef} from 'react';
import {Sparkles,Mic,Music2,Trophy,Lock,ArrowUpRight,X,ArrowLeft} from 'lucide-react';
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ParticipationQR } from "@/components/ParticipationQR";
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
 useEffect(()=>{if(!gateScanned&&activity!=='awakening')close()},[gateScanned]);
 function update(kind){try{const next=kind==='awaken'?awakenStar(current):sendLight(current);persistProfile(localStorage,next);setLocal(next);onProfileChange?.(next);setError('');return true}catch{setError('Could not save your star. Allow browser storage and try again.');return false}}
 const locked=!gateScanned;
 return <section className="fd-live-features" aria-label="Tonight’s live experiences"><h2 className="fd-live-heading">Tonight’s exclusives</h2><div className="fd-live-drops">
 {[{id:'trivia',title:'Opening Trivia',sub:'Play as the show starts. Top scorer gets a call from the artist.',Icon:Trophy,button:'Play trivia'},
  {id:'awakening',title:'The Awakening',sub:'Join the music-synced concert lights.',Icon:Sparkles,button:current?.awakening?.lightSent?'Revisit your sky':'Awaken your star'},
 {id:'ask',title:`Ask ${event.artist}`,sub:'Your questions. A little closer to the artist.',Icon:Mic,button:'Ask a question'},
 {id:'encore',title:'The Hidden Encore',sub:'One rare song. Chosen by tonight’s fans.',Icon:Music2,button:'Vote for the encore'}].map((drop,i)=><article className={`fd-live-drop fd-drop-${drop.id} ${locked?'fd-locked':''}`} key={drop.id}><div className="fd-drop-icon">{locked?<Lock size={24}/>:<drop.Icon size={26}/>}</div><div className="fd-drop-copy"><small>DROP {String(i+1).padStart(2,'0')} · {locked?'LOCKED':'OPEN'}</small><h3>{drop.title}</h3><p>{locked?'Locked until the gate scan':drop.sub}</p>{drop.id==='awakening'?<Button onClick={()=>setActivity("awakening")}>ENTER THE AWAKENING <ArrowUpRight size={15}/></Button>:<button onClick={()=>locked?onScan?.():setActivity(drop.id)}>{locked?'Tap to scan & unlock':drop.button}{!locked&&<ArrowUpRight size={15}/>}</button>}</div></article>)}
 </div>
 {activity&&<dialog ref={dialog} className={`fd-live-dialog ${activity==='awakening'?'fd-live-immersive':''}`} onCancel={e=>{e.preventDefault();close()}} aria-label={activity==='awakening'?'The Awakening':activity==='ask'?`Ask ${event.artist}`:activity==='trivia'?'Opening Trivia':'The Hidden Encore'}>
 {activity==='awakening'?<div className="bg-foreground p-6 text-background"><Button variant="secondary" onClick={close}><ArrowLeft size={16}/>Back to Live</Button><h2 className="mt-6 font-display text-3xl font-bold">The Awakening</h2><ParticipationQR /><Button className="mt-5 min-h-14 w-full" asChild><Link to="/stage" target="_blank">OPEN STAGE SCREEN</Link></Button><Button variant="secondary" className="mt-3 min-h-12 w-full" asChild><Link to="/light" search={{concert:true}}>REVISIT MY STAR <ArrowUpRight size={15}/></Link></Button></div>:activity==='ask'?<AskLive artist={event.artist} nickname={profile?.nickname} onClose={close}/>:activity==='encore'?<EncoreVote onClose={close}/>:activity==='trivia'?<TriviaGame nickname={profile?.nickname} onClose={close}/>:null}
 </dialog>}
 </section>;
}
