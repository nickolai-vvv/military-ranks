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
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{heading.current?.focus({preventScroll:true})},[screen]);
 function go(target){
   if(timer.current)return;
   setLeaving(target);
   timer.current=setTimeout(()=>{
     timer.current=null;setScreen(target);setLeaving(null);window.scrollTo(0,0);
   },matchMedia('(prefers-reduced-motion: reduce)').matches?0:screen==='world'?820:300);
 }
 const index=screen==='world'?1:screen==='branches'?2:3;
 return <div className={'shell '+(screen==='world'?'map':'inner')}>
 <header><a className="author" href="https://github.com/nickolai-vvv" aria-label="N-VVV на GitHub">N-VVV</a><span className="descriptor">СПРАВОЧНИК ВОИНСКИХ ЗВАНИЙ</span></header>
 <main key={screen} className={leaving?'leaving':''}>
 {screen==='world'?<div className="world">
   <Globe active={!!leaving} onSelect={()=>go('branches')}/>
   <div className="intro"><h1 tabIndex="-1" ref={heading}>Выбор <br/>страны</h1><p>Выберите страну на глобусе, чтобы<br className="desktop"/> изучить воинские звания и знаки различия.</p></div>
 </div>:<div className="content"><button className="back" onClick={()=>go(previous[screen])}>←　 Назад</button>
 {screen==='branches'?<>
 <div className="eyebrow"><b/> РОССИЯ / ВЫБОР ВИДА ВООРУЖЁННЫХ СИЛ</div>
 <h1 ref={heading} tabIndex="-1">Виды вооружённых сил</h1>
 <div className="branches">{branches.map(branch=><button key={branch.id} className={'branch '+(leaving===branch.id?'selected':'')} onClick={()=>go(branch.id)}>
 <img alt="" src={'/atlas/'+branch.id+'.webp'}/><div className="caption"><h2>{branch.title}</h2><span className="select">Выбрать　→</span></div></button>)}</div></>:screen==='army'?<><h1 className="sr" tabIndex="-1" ref={heading}>Тренировка</h1><Quiz/></>:<><div className="eyebrow">РОССИЯ / ВОЕННО-МОРСКОЙ ФЛОТ</div><h1 ref={heading} tabIndex="-1">Корабельные звания</h1><p>Раздел в разработке.</p></>}
 </div>}
 </main>
 <footer><div className="steps" aria-label={'Этап '+index+' из 3'}>{[1,2,3].map(i=><b key={i} className={i===index?'active':''}/>)}<span>0{index} / 03</span></div><span>{['Выбор страны','Выбор вида войск','Раздел званий'][index-1]}</span></footer>
 </div>
}


