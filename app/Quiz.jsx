'use client';
import {useEffect,useRef,useState} from 'react';
const names = ['Рядовой','Ефрейтор','Младший сержант','Сержант','Старший сержант','Старшина','Прапорщик','Старший прапорщик','Младший лейтенант','Лейтенант','Старший лейтенант','Капитан','Майор','Подполковник','Полковник','Генерал-майор','Генерал-лейтенант','Генерал-полковник','Генерал армии','Генерал армии','Маршал Российской Федерации'];
const codes='OR-1 OR-2 OR-4 OR-5 OR-7 OR-8 OR-9a OR-9b OF-1c OF-1b OF-1a OF-2 OF-3 OF-4 OF-5 OF-6 OF-7 OF-8 OF-9 OF-9 OF-10'.split(' ');
const src=i=>'/ranks/Russia-Army-'+codes[i]+'-'+(i===19?'2013':'2010')+'.svg.webp';
function shuffle(items){const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]}return a}
function question(previous){const index=shuffle(codes.map((_,i)=>i).filter(i=>names[i]!==names[previous]))[0]; const correct=names[index];return {index,correct,options:shuffle([correct,...shuffle([...new Set(names)].filter(n=>n!==correct)).slice(0,3)])}}
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
   const upcoming=question(q.index);
   const preload=new Image();
   preload.src=src(upcoming.index);
   setLeaving(true);
   pending.current=setTimeout(()=>{
     pending.current=null;
     restoreFocus.current=true;
     setQ(upcoming);
     setAnswer(null);
     setLeaving(false);
   },matchMedia('(prefers-reduced-motion: reduce)').matches?0:360);
 }
 return <div key={q.index} className={'quiz '+(leaving?'quiz-out':'quiz-in')}>
   <div className="quizart"><img src={src(q.index)} alt="Погон для определения звания"/></div>
   <div className="options">{q.options.map((name,i)=><button key={name} ref={i===0?first:null}
     disabled={answer!==null} onClick={()=>setAnswer(name)}
     className={answer!==null && name===q.correct?'correct':answer===name?'wrong':''}>{name}</button>)}</div>
   {answer!==null&&<div className="result">
     <span className="sr" role="status">{answer===q.correct?'Верно':'Верный вариант: '+q.correct}</span>
     <button disabled={leaving} onClick={next}>Следующий погон →</button>
   </div>}
 </div>
}
