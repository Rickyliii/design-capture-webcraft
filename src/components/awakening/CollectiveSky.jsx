import React, {useEffect, useRef, useState} from 'react';
import SkyFallback from './SkyFallback';

export default function CollectiveSky({phase='sky',seconds=null,reduced=false,color='#e4c08a'}) {
  const host=useRef();
  const sceneState=useRef({phase,seconds,reduced,color});
  sceneState.current={phase,seconds,reduced,color};
  const [fallback,setFallback]=useState(false);
  useEffect(()=>{
    let cancelled=false,dispose;
    import('./lib/galaxyScene').then(({createGalaxy})=>{
      if(cancelled)return;
      try{dispose=createGalaxy(host.current,()=>sceneState.current,()=>{if(!cancelled)setFallback(true)});}
      catch{setFallback(true);}
    }).catch(()=>{if(!cancelled)setFallback(true)});
    return()=>{cancelled=true;dispose?.();};
  },[]);
  return <div className="universe-scene" role="img" aria-label={`The Awakening: a three-dimensional universe of gold, rose, violet and blue fan stars. ${phase}.`}>
    <div ref={host} className="webgl-sky" style={{visibility:fallback?'hidden':'visible'}}/>
    {fallback&&<SkyFallback phase={phase==='supernova'?'convergence':phase} reduced={reduced} color={color}/>}
    {phase==='sky'&&<span className="personal-light-label" style={{color}}>✦ YOUR LIGHT</span>}
  </div>;
}
