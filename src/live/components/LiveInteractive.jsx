import React, { useState } from 'react';
import { ArrowUp, Check, Mic, Music2, Send, X, Trophy, Phone } from 'lucide-react';
import { markAction } from '@/lib/afterlight';

// Demo-only: questions and votes live in memory; crowd numbers are simulated.
const seedQuestions = [
  { id: 1, who: 'Maya', text: 'What song do you warm up with before every show?', votes: 214 },
  { id: 2, who: 'Jay', text: 'Which Toronto spot do you always visit when you come home?', votes: 168 },
  { id: 3, who: 'Priya', text: 'What was going through your head the first time you heard a crowd sing your song back?', votes: 97 },
];

export function AskLive({ artist, nickname, onClose }) {
  const [qs, setQs] = useState(seedQuestions);
  const [mine, setMine] = useState(new Set());
  const [text, setText] = useState('');
  const sorted = [...qs].sort((a, b) => b.votes - a.votes);
  function vote(id) {
    const had = mine.has(id);
    setMine((s) => { const n = new Set(s); had ? n.delete(id) : n.add(id); return n; });
    if (!had) markAction('qa');
    setQs((q) => q.map((x) => (x.id === id ? { ...x, votes: x.votes + (had ? -1 : 1) } : x)));
  }
  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const id = Date.now();
    setQs((q) => [...q, { id, who: nickname || 'You', text: text.trim(), votes: 1 }]);
    setMine((s) => new Set(s).add(id));
    markAction('qa');
    setText('');
  }
  return (
    <div className="relative p-6">
      <button className="fd-close" onClick={onClose} aria-label="Close"><X /></button>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground"><Mic className="h-6 w-6" /></span>
      <p className="sticker mt-4 text-accent">Live Q&amp;A · top question gets asked on stage</p>
      <h2 className="mt-1 font-display text-3xl font-extrabold leading-none">Ask {artist}</h2>
      <form onSubmit={submit} className="mt-5 flex gap-2">
        <input value={text} maxLength={140} onChange={(e) => setText(e.target.value)} placeholder={`Your question for ${artist.split(' ')[0]}…`} className="flex-1 rounded-full border-2 bg-card px-4 py-3 outline-none focus:border-accent" />
        <button aria-label="Send question" className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground pop-sm press"><Send className="h-5 w-5" /></button>
      </form>
      <ul className="mt-5 space-y-3">
        {sorted.map((q, i) => (
          <li key={q.id} className="flex items-start gap-3 rounded-2xl border-2 bg-card p-3 pop-sm">
            <button onClick={() => vote(q.id)} aria-pressed={mine.has(q.id)} aria-label="Upvote" className={`flex w-12 flex-col items-center rounded-xl border-2 py-1 font-mono text-xs font-bold ${mine.has(q.id) ? 'bg-primary text-primary-foreground' : ''}`}>
              <ArrowUp className="h-4 w-4" />{q.votes}
            </button>
            <div className="flex-1">
              <p className="font-bold leading-snug">{q.text}</p>
              <p className="mt-1 text-xs text-muted-foreground">{i === 0 ? '★ Top question · ' : ''}from {q.who}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const songs = [
  { id: 'ghost', title: 'Ghost', base: 412 },
  { id: 'offmyface', title: 'Off My Face', base: 356 },
  { id: 'lonely', title: 'Lonely', base: 289 },
  { id: 'purpose', title: 'Purpose', base: 227 },
];

export function EncoreVote({ onClose }) {
  const [pick, setPick] = useState(null);
  const total = songs.reduce((t, s) => t + s.base, 0) + (pick ? 1 : 0);
  const count = (s) => s.base + (pick === s.id ? 1 : 0);
  const leader = [...songs].sort((a, b) => count(b) - count(a))[0];
  return (
    <div className="relative p-6">
      <button className="fd-close" onClick={onClose} aria-label="Close"><X /></button>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"><Music2 className="h-6 w-6" /></span>
      <p className="sticker mt-4 text-accent">Hidden encore · voting closes before the encore</p>
      <h2 className="mt-1 font-display text-3xl font-extrabold leading-none">Pick tonight's rare song</h2>
      <p className="mt-2 text-sm text-muted-foreground">One vote per fan. The winner gets played once — only for this crowd.</p>
      <div className="mt-5 space-y-3">
        {songs.map((s) => {
          const pct = Math.round((count(s) / total) * 100);
          const chosen = pick === s.id;
          return (
            <button key={s.id} disabled={!!pick} onClick={() => { setPick(s.id); markAction('encore'); }} className={`relative w-full overflow-hidden rounded-2xl border-2 bg-card p-4 text-left ${chosen ? 'pop-sm' : ''} ${!pick ? 'press' : ''}`}>
              {pick && <span className="absolute inset-y-0 left-0 bg-primary/60 transition-all duration-700" style={{ width: `${pct}%` }} />}
              <span className="relative flex items-center justify-between font-bold">
                <span className="flex items-center gap-2">{chosen && <Check className="h-4 w-4" />}{s.title}</span>
                {pick && <span className="font-mono text-sm">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
        {pick ? `Vote locked ✦ ${leader.title} is leading · ${total.toLocaleString()} fans voted` : 'Tap a song to cast your vote'}
      </p>
    </div>
  );
}

// Demo trivia: questions are public facts; leaderboard rivals are simulated.
const trivia = [
  { q: 'In which Canadian city was Justin Bieber born?', a: ['Toronto', 'London, Ontario', 'Vancouver', 'Ottawa'], c: 1 },
  { q: 'Where was Justin first discovered?', a: ['A talent show on TV', 'YouTube', 'A mall concert', 'Instagram'], c: 1 },
  { q: 'What was his debut single in 2009?', a: ['Baby', 'One Time', 'Sorry', 'Peaches'], c: 1 },
  { q: 'What are his fans called?', a: ['Bieberettes', 'Beliebers', 'Justinians', 'Purpose Crew'], c: 1 },
  { q: 'Which album came out in 2015?', a: ['Justice', 'Changes', 'Purpose', 'Believe'], c: 2 },
];
const rivals = [{ who: 'Maya', s: 400 }, { who: 'Jay', s: 300 }, { who: 'Priya', s: 300 }, { who: 'Leo', s: 200 }];

export function TriviaGame({ nickname, onClose }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const done = i >= trivia.length;
  function choose(k) {
    if (picked !== null) return;
    setPicked(k);
    if (k === trivia[i].c) setScore((s) => s + 100);
    setTimeout(() => { setPicked(null); setI((n) => n + 1); }, 900);
  }
  const me = nickname || 'You';
  const board = [...rivals, { who: me, s: score, me: true }].sort((a, b) => b.s - a.s || (b.me ? 1 : -1));
  const won = board[0].me;
  return (
    <div className="relative p-6">
      <button className="fd-close" onClick={onClose} aria-label="Close"><X /></button>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"><Trophy className="h-6 w-6" /></span>
      <p className="sticker mt-4 text-accent">Opening trivia · top scorer gets a call from the artist near the end of the show</p>
      {!done ? (
        <>
          <p className="mt-3 font-mono text-xs text-muted-foreground">Question {i + 1}/{trivia.length} · {score} pts</p>
          <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">{trivia[i].q}</h2>
          <div className="mt-4 space-y-2">
            {trivia[i].a.map((opt, k) => {
              const show = picked !== null && (k === trivia[i].c || k === picked);
              const right = k === trivia[i].c;
              return (
                <button key={opt} onClick={() => choose(k)} className={`w-full rounded-2xl border-2 p-3 text-left font-bold ${show ? (right ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground') : 'bg-card press'}`}>{opt}</button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <h2 className="mt-2 font-display text-3xl font-extrabold leading-none">{score} pts</h2>
          <p className="mt-2 text-sm">{won ? "You're #1 ✦ If you stay on top, the artist calls you near the end of the show. Keep your phone close!" : 'So close! The top scorer gets the call near the end of the show.'}</p>
          <ol className="mt-4 space-y-2">
            {board.map((r, k) => (
              <li key={r.who + k} className={`flex items-center justify-between rounded-2xl border-2 p-3 font-bold ${r.me ? 'bg-primary text-primary-foreground pop-sm' : 'bg-card'}`}>
                <span>{k === 0 ? <Phone className="mr-2 inline h-4 w-4" /> : `#${k + 1} `}{r.who}{r.me ? ' (you)' : ''}</span>
                <span className="font-mono text-sm">{r.s}</span>
              </li>
            ))}
          </ol>
          <button onClick={() => { setI(0); setScore(0); }} className="mt-4 w-full rounded-full border-2 py-2.5 font-bold press">Play again (demo)</button>
          <p className="mt-2 text-center font-mono text-[11px] text-muted-foreground">Demo · other scores are simulated, no real call is placed</p>
        </>
      )}
    </div>
  );
}
