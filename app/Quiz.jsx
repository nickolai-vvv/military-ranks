'use client';
import {useState} from 'react';
const names = ['Рядовой','Ефрейтор','Младший сержант','Сержант','Старший сержант','Старшина','Прапорщик','Старший прапорщик','Младший лейтенант','Лейтенант','Старший лейтенант','Капитан','Майор','Подполковник','Полковник','Генерал-майор','Генерал-лейтенант','Генерал-полковник','Генерал армии','Генерал армии','Маршал Российской Федерации'];
const codes='OR-1 OR-2 OR-4 OR-5 OR-7 OR-8 OR-9a OR-9b OF-1c OF-1b OF-1a OF-2 OF-3 OF-4 OF-5 OF-6 OF-7 OF-8 OF-9 OF-9 OF-10'.split(' ');
const src=i=>'/ranks/Russia-Army-'+codes[i]+'-'+(i===19?'2013':'2010')+'.svg.webp';
function shuffle(items){const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]}return a}
function question(previous){const index=shuffle(codes.map((_,i)=>i).filter(i=>names[i]!==names[previous]))[0]; const correct=names[index];return {index,correct,options:shuffle([correct,...shuffle([...new Set(names)].filter(n=>n!==correct)).slice(0,3)])}}
export default function Quiz(){
 const [q,setQ]=useState(()=>question()),[answer,setAnswer]=useState(null),[num,setNum]=useState(1);
 function next(){setQ(question(q.index));setAnswer(null);setNum(num+1)}
 return <div className="quiz"><small>СУХОПУТНЫЕ ВОЙСКА · ВОПРОС {num}</small><h1>Какое это звание?</h1><div className="quizart art"><img src={src(q.index)} alt="Погон для определения звания"/></div><div className="options">{q.options.map(n=><button disabled={answer!==null} key={n} onClick={()=>setAnswer(n)} className={answer!==null && n===q.correct?'correct':answer===n?'wrong':''}>{n}</button>)}</div>{answer!==null&&<div className="result"><span role="status">{answer===q.correct?'Верно!':'Правильный ответ — '+q.correct}</span><button onClick={next}>Следующий погон →</button></div>}</div>}
