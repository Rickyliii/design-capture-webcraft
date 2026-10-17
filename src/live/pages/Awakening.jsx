import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Maximize2, Minimize2, Play, SkipForward, Sparkles } from 'lucide-react';
import CollectiveSky from '../components/CollectiveSky';
import { starThemes, DEMO_STARS, ceremonyPhase } from '../lib/awakening';
import './awakening.css';
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const query = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(query.matches); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  return reduced;
}
export function PersonalStar({ color, active, sending, reduced }) {
  const ref = useRef();
  function tilt(e) { if (reduced) return; const r = e.currentTarget.getBoundingClientRect(); ref.current.style.setProperty('--tilt-x', `${(e.clientY - r.top - r.height / 2) / 25}deg`); ref.current.style.setProperty('--tilt-y', `${(e.clientX - r.left - r.width / 2) / 25}deg`); }
  return <div ref={ref} className={`personal-star ${active ? 'is-awake' : ''} ${sending ? 'is-sending' : ''}`} style={{ '--star-color': color }} onPointerMove={tilt} onPointerLeave={() => { ref.current.style.setProperty('--tilt-x', '0deg'); ref.current.style.setProperty('--tilt-y', '0deg'); }} role="img" aria-label={`${active ? 'Awakened' : 'Waiting'} personal celestial star`}>
    <div className="star-halo"/><div className="star-orbit"/><div className="star-orbit second"/>
    <div className="star-float"><svg viewBox="0 0 240 240" aria-hidden="true"><path d="M120 7L142 94L216 42L160 111L233 120L151 142L198 212L128 160L120 233L99 148L30 199L80 131L7 120L91 99L42 31L110 80Z" fill="currentColor" opacity=".35"/><path d="M120 7L142 98L233 120L142 142L120 233L98 142L7 120L98 98Z" fill="currentColor"/><path d="M120 7L120 120L142 98Z M233 120L120 120L142 142Z M120 233L120 120L98 142Z M7 120L120 120L98 98Z" fill="#fff7e9" opacity=".65"/><path d="M120 7L120 120L98 98Z M233 120L120 120L142 98Z M120 233L120 120L142 142Z M7 120L120 120L98 142Z" fill="#292237" opacity=".4"/><circle cx="120" cy="120" r="4" fill="#fff9f0"/></svg></div>
    <span className="star-coordinates">43°38′ N &nbsp; · &nbsp; 79°23′ W</span>
  </div>;
}
const phaseCopy = { darkness: ['I / FIRST LIGHT', 'Before the first note.'], awakening: ['II / GALAXY AWAKENS', 'A thousand lights. One heartbeat.'], convergence: ['III / CONVERGENCE', 'Together, we become something more.'], supernova: ['IV / SUPERNOVA', 'Every light. One extraordinary moment.'], reveal: ['V / AFTERLIGHT', 'YOU ARE THE AFTERLIGHT.'] };
export default function Awakening({ profile, onAwaken, onSend, navigate, stage, setStage, artist = 'NOVA', tour = 'LIVE EXPERIENCE' }) {
  const systemReduced = useReducedMotion();
  const [quiet, setQuiet] = useState(false);
  const reduced = systemReduced || quiet;
  const [busy, setBusy] = useState('');
  const [seconds, setSeconds] = useState(null);
  const [finished, setFinished] = useState(false);
  const timer = useRef();
  const actionLock = useRef(false);
  const stageButton = useRef();
  const exitButton = useRef();
  const theme = starThemes[profile.mood];
  const sent = !!profile.awakening?.lightSent;
  const awake = !!profile.awakening?.starAwakened;
  const running = seconds !== null;
  const phase = running ? ceremonyPhase(seconds) : finished ? 'reveal' : 'sky';
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!running) return;
    if (reduced) { setSeconds(null); setFinished(true); return; }
    const start = performance.now();
    const interval = setInterval(() => { const t = (performance.now() - start) / 1000; if (t >= 27) { setSeconds(null); setFinished(true); } else setSeconds(t); }, 100);
    return () => clearInterval(interval);
  }, [running, reduced]);
  useEffect(() => {
    if (stage) exitButton.current?.focus();
    function escape(e) { if (e.key === 'Escape' && stage) setStage(false); }
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [stage, setStage]);
  function action(kind) {
    if (actionLock.current) return;
    actionLock.current = true;
    const success = kind === 'awaken' ? onAwaken() : onSend();
    if (!success) { actionLock.current = false; return; }
    setBusy(kind);
    timer.current = setTimeout(() => { setBusy(''); actionLock.current = false; }, reduced ? 0 : kind === 'awaken' ? 1100 : 1300);
  }
  function start() { setFinished(false); if (reduced) setFinished(true); else setSeconds(0); }
  function skip() { setSeconds(null); setFinished(true); }
  function exitStage() { setStage(false); setTimeout(() => stageButton.current?.focus(), 0); }
  const inSky = sent && busy !== 'send';
  return <main className={`awakening-page ${stage ? 'stage-view' : ''} ${reduced ? 'motion-reduced' : ''}`} style={{ '--star-color': theme.color }}>
    {!stage && <div className="awakening-nav"><button onClick={() => navigate('hub')}><ArrowLeft size={16}/> Concert Hub</button><span>01 / THE OPENING CEREMONY</span><button onClick={() => navigate('pass')}>My Fan Pass <ArrowUpRight size={15}/></button></div>}
    {!inSky ? <section className="personal-experience">
      <div className="eyebrow gold">{artist.toUpperCase()} PRESENTS · THE AWAKENING</div>
      <h1>{awake && busy !== 'awaken' ? <>Your star has <em>awakened.</em></> : <>Every night begins<br/>with <em>a spark.</em></>}</h1>
      <p aria-live="polite">{awake ? 'Now let it become part of something bigger.' : 'Tonight, that spark comes from you.'}</p>
      <PersonalStar color={theme.color} active={awake} sending={busy === 'send'} reduced={reduced}/>
      <div className="personal-caption"><span>{profile.nickname}, {awake ? 'this is your afterlight.' : 'your light is waiting.'}</span><small>{theme.name} · {profile.mood}</small></div>
      <button className="primary ritual-button" disabled={!!busy} onClick={() => action(awake ? 'send' : 'awaken')}><Sparkles size={17}/>{busy === 'awaken' ? 'YOUR STAR IS AWAKENING…' : busy === 'send' ? 'JOINING TORONTO’S SKY…' : awake ? 'SEND MY LIGHT' : 'AWAKEN MY STAR'}<ArrowUpRight size={17}/></button>
      <p className="ritual-footnote">One Star. One Crowd. One Unforgettable Opening.</p>
    </section> : <section className="collective-experience">
      {!stage && <div className="sky-heading"><span className="eyebrow gold">THE COLLECTIVE SKY / TORONTO</span><h1>Your light is now part<br/>of <em>Toronto's sky.</em></h1><p>Thousands of individual moments. One unforgettable night.</p></div>}
      <div className={`stage-frame ${running || finished ? 'ceremony-active' : ''}`}>
        <CollectiveSky seconds={seconds} phase={phase} reduced={reduced} color={theme.color}/>
        <div className="stage-top"><span>{artist.toUpperCase()} <i>/</i> {tour.toUpperCase()}</span><span>TORONTO · SIMULATED STAGE</span></div>
        {stage && <button ref={exitButton} className="stage-exit" onClick={exitStage}><Minimize2 size={16}/> Exit stage</button>}
        <div className={`ceremony-title ${phase === 'reveal' ? 'revealed' : ''} ${running ? 'sequence-titles' : ''}`}  aria-live="polite">{phase === 'reveal' ? <><span className="eyebrow">FROM YOUR LIGHT, A NEW WORLD</span><h2 className="artist-reveal">{artist.toUpperCase()}</h2><span className="reveal-tour">{tour.toUpperCase()}</span><p>YOU ARE THE AFTERLIGHT.</p></> : running ? <><span className="eyebrow gold">{phaseCopy[phase][0]}</span><h2 className="phase-line">{phaseCopy[phase][1]}</h2></> : <><span className="eyebrow gold">A UNIVERSE OF FANS</span><h2 className="sky-wordmark">The Awakening</h2></>}</div>
        <div className="stage-bottom"><span>{running ? `${Math.min(27, Math.floor(seconds)).toString().padStart(2, '0')} / 27 SECONDS` : 'ONE NIGHT. ALWAYS YOURS.'}</span><span>43°38′ N · 79°23′ W</span></div>
      </div>
      <div className="collective-details"><div className="crowd-count"><strong>{(DEMO_STARS + 1).toLocaleString('en-CA')} <span>/ 3,000</span></strong><small>STARS AWAKENED</small><p>Simulated crowd + your saved star. This browser only.</p></div><div className="participation"><Check size={16}/><span>{profile.nickname}, your light is here.<small>Participation saved · One star per local Fan Pass</small></span></div></div>
      <div className="ceremony-controls">{running ? <button className="primary" onClick={skip}><SkipForward size={16}/> Skip Animation</button> : <button className="primary" onClick={start}><Play size={15}/>{finished ? 'DEMO: REPLAY OPENING CEREMONY' : 'DEMO: START OPENING CEREMONY'}</button>}{!stage && <button ref={stageButton} className="secondary" onClick={() => setStage(true)}><Maximize2 size={16}/> VIEW STAGE EXPERIENCE</button>}{finished && <button className="text-button" onClick={() => { setFinished(false); }}>Return to Collective Sky</button>}</div>
      <label className="motion-control"><input type="checkbox" checked={reduced} disabled={systemReduced} onChange={e => setQuiet(e.target.checked)}/> Reduce motion</label>
      {reduced && <p className="motion-note">Reduced motion enabled · The ceremony shows its final reveal without movement.</p>}
      {!stage && <button className="text-button" onClick={() => navigate('hub')}><ArrowLeft size={15}/> Return to Concert Hub</button>}
    </section>}
  </main>;
}
