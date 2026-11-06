'use client';
import {useEffect,useRef,useState} from 'react';
import catalog from '../public/ranks/catalog.json';

const rankNames = [...new Set(catalog.map(entry => entry.rank))];

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function question(previousRank) {
  const candidates = catalog.filter(entry => entry.rank !== previousRank);
  const entry = candidates[Math.floor(Math.random() * candidates.length)];
  const alternatives = shuffled(rankNames.filter(rank => rank !== entry.rank)).slice(0, 3);
  return {
    photo: '/ranks/' + entry.photo,
    correct: entry.rank,
    options: shuffled([entry.rank, ...alternatives])
  };
}
export default function Quiz(){
 const [q,setQ]=useState(()=>question());
 const [answer,setAnswer]=useState(null);
 const [leaving,setLeaving]=useState(false);
 const pending=useRef(null);
 const first=useRef(null);
 const restoreFocus=useRef(false);
 useEffect(()=>()=>clearTimeout(pending.current),[]);
 useEffect(()=>{
   if(restoreFocus.current)first.current?.focus({preventScroll:true});
 },[q]);
 function next(){
   if(pending.current!==null)return;
   const upcoming=question(q.correct);
   const preload=new Image();
   preload.src=upcoming.photo;
   setLeaving(true);
   pending.current=setTimeout(()=>{
     pending.current=null;
     restoreFocus.current=true;
     setQ(upcoming);
     setAnswer(null);
     setLeaving(false);
   },matchMedia('(prefers-reduced-motion: reduce)').matches?0:360);
 }
 return <div key={q.photo} className={'quiz '+(leaving?'quiz-out':'quiz-in')}>
   <div className="quizart"><img src={q.photo} alt="Погон для определения звания"/></div>
   <div className="options">{q.options.map((name,i)=><button key={name} ref={i===0?first:null}
     disabled={answer!==null} onClick={()=>setAnswer(name)}
     className={answer!==null && name===q.correct?'correct':answer===name?'wrong':''}>{name}</button>)}</div>
   {answer!==null&&<div className="result">
     <span className="sr" role="status">{answer===q.correct?'Верно':'Верный вариант: '+q.correct}</span>
     <button disabled={leaving} onClick={next}>Следующий погон →</button>
   </div>}
 </div>
}
