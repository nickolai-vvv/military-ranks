'use client';
import {useState,useRef,useEffect} from 'react';
import Globe from './Globe';
import Quiz from './Quiz';

const branches=[
  {id:'army',title:'Сухопутные войска'},
  {id:'navy',title:'Военно-морской флот'}
];
const previous={branches:'world',army:'branches',navy:'branches'};

export default function Home(){
 const [screen,setScreen]=useState('world'),[leaving,setLeaving]=useState(null);
 const heading=useRef(null),timer=useRef(null);
 const lastBranch=useRef('army');
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{heading.current?.focus({preventScroll:true})},[screen]);
 function go(target){
   if(timer.current || target===screen)return;
   if(target==='army' || target==='navy')lastBranch.current=target;
   setLeaving(target);
   timer.current=setTimeout(()=>{
     timer.current=null;setScreen(target);setLeaving(null);window.scrollTo(0,0);
   },matchMedia('(prefers-reduced-motion: reduce)').matches?0:screen==='world'?820:400);
 }
 const index=screen==='world'?1:screen==='branches'?2:3;
 return <div className={'shell '+(screen==='world'?'map':'inner')}>
 <header><a className="author" href="https://github.com/nickolai-vvv" aria-label="N-VVV на GitHub">N-VVV</a><span className="descriptor">СПРАВОЧНИК ВОИНСКИХ ЗВАНИЙ</span></header>
 <main key={screen} className={leaving?'leaving':''}>
 {screen==='world'?<div className="world">
   <Globe active={!!leaving} onSelect={()=>go('branches')}/>
   <div className="intro"><h1 tabIndex="-1" ref={heading}>Выбор <br/>страны</h1><p>Учитесь узнавать воинские звания по погонам. В каждом раунде — один погон и четыре варианта ответа.</p></div>
 </div>:<div className="content"><button className="back" onClick={()=>go(previous[screen])}>←　 Назад</button>
 {screen==='branches'?<>
 <h1 ref={heading} tabIndex="-1" className="country-title"><span aria-hidden="true" className="flag"/>Россия</h1>
 <div className="branches">{branches.map(branch=><button key={branch.id} className={'branch '+(leaving===branch.id?'selected':'')} onClick={()=>go(branch.id)}>
 <img alt="" src={'/atlas/'+branch.id+'.webp'}/><div className="caption"><h2>{branch.title}</h2><span className="select">Выбрать　→</span></div></button>)}</div></>:screen==='army'?<><h1 className="sr" tabIndex="-1" ref={heading}>Тренировка</h1><Quiz/></>:<><div className="eyebrow">РОССИЯ / ВОЕННО-МОРСКОЙ ФЛОТ</div><h1 ref={heading} tabIndex="-1">Корабельные звания</h1><p>Раздел в разработке.</p></>}
 </div>}
 </main>
 <footer><nav className="steps" aria-label="Этапы тренировки">
   {[
     ['world','Выбор страны'],
     ['branches','Выбор войск'],
     [lastBranch.current,lastBranch.current==='navy'?'Военно-морской флот':'Тренировка по погонам']
   ].map(([target,label],i)=><button key={i} type="button" onClick={()=>go(target)}
     aria-label={label} title={label} aria-current={i+1===index?'step':undefined}/>)}
 </nav></footer>
 </div>
}


