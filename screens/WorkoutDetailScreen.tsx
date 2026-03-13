import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft, Play, CheckCircle2, Camera,
  ChevronRight, Trash2, Sparkles, Edit3, Lock,
  Pause, FastForward, Plus, Dumbbell,
} from 'lucide-react';
import { CategoryType, WorkoutCard, Post, UserProfile, ScreenName } from '../types';
import { getWorkoutImage } from '../lib/workoutImages';

// ─── Original WORKOUTS_DATABASE_DEFAULT from WorkoutDetailScreen.tsx is
// preserved here unchanged. Only the visual shell is replaced.
// Import or paste the full WORKOUTS_DATABASE_DEFAULT array from the
// original file here — it is intentionally omitted to avoid duplication.
import { WORKOUTS_DATABASE_DEFAULT } from './WorkoutDetailScreen.data'; // adjust if needed

interface WorkoutDetailScreenProps {
  onBack: () => void;
  customWorkouts?: WorkoutCard[];
  onWorkoutComplete?: (d: number, e: number, img: string | null, w: WorkoutCard, ns?: ScreenName) => void;
  initialWorkoutId?: string | null;
  isDarkMode: boolean;
  userProfile?: UserProfile;
  onShareToCommunity?: (post: Post) => void;
  onCreateWorkout?: () => void;
  onEditWorkout?: (workout: WorkoutCard) => void;
  onDeleteCustomWorkout?: (workoutId: string) => void;
}

const T = {
  bg:'#07070A',bg2:'#0F0F14',bg3:'#16161D',bg4:'#1E1E27',
  border:'rgba(255,255,255,0.07)',border2:'rgba(255,255,255,0.12)',
  lime:'#C8FF00',coral:'#FF5D3B',amber:'#FFB347',sky:'#38BDF8',violet:'#A78BFA',
  muted:'#6B6B80',muted2:'#8E8EA0',text:'#F0F0F5',
  display:"'Bebas Neue', sans-serif",body:"'DM Sans', sans-serif",mono:"'DM Mono', monospace",
};

const CAT_META: Record<string, { sub:string; rest:number; imgM:string; imgF:string }> = {
  'Massa':        {sub:'Ipertrofia & Forza',     rest:120, imgM:'https://images.unsplash.com/photo-1534368786749-b63e05c90863?q=80&w=800&auto=format&fit=crop', imgF:'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop'},
  'Definizione':  {sub:'Tono & Densità',          rest:60,  imgM:'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop', imgF:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop'},
  'Perdita Peso': {sub:'HIIT & Cardio',           rest:45,  imgM:'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800&auto=format&fit=crop', imgF:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop'},
  'Resistenza':   {sub:'Stamina & Endurance',     rest:30,  imgM:'https://images.unsplash.com/photo-1530822847156-5df684ec5933?q=80&w=800&auto=format&fit=crop', imgF:'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800&auto=format&fit=crop'},
  'Custom':       {sub:'Scheda personalizzata',   rest:90,  imgM:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop', imgF:'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop'},
};

const CAT_COLORS: Record<string,string> = {
  'Massa':'#C8FF00','Definizione':'#A78BFA','Perdita Peso':'#FF5D3B','Resistenza':'#38BDF8','Custom':'#A855F7',
};

const WorkoutDetailScreen: React.FC<WorkoutDetailScreenProps> = ({
  onBack,customWorkouts,onWorkoutComplete,initialWorkoutId,isDarkMode,userProfile,
  onShareToCommunity,onCreateWorkout,onEditWorkout,onDeleteCustomWorkout,
}) => {
  const accent = userProfile?.gender === 'Donna' ? T.coral : T.lime;

  const db = useMemo(() => {
    const defs = [...(WORKOUTS_DATABASE_DEFAULT||[])];
    if (!customWorkouts?.length) return defs;
    const extra = customWorkouts.filter(cw => (cw.isCustom||cw.category==='Custom') || !defs.some(d=>d.id===cw.id));
    return [...defs,...extra];
  }, [customWorkouts]);

  const [selCat,   setSelCat]   = useState<CategoryType>('Massa');
  const [workout,  setWorkout]  = useState<WorkoutCard|null>(null);
  const [active,   setActive]   = useState(false);
  const [elapsed,  setElapsed]  = useState(0);
  const [doneSets, setDoneSets] = useState<Set<string>>(new Set());
  const [failSets, setFailSets] = useState<Set<string>>(new Set());
  const [dropSets, setDropSets] = useState<Set<string>>(new Set());
  const [resting,  setResting]  = useState(false);
  const [restPaused,setRestPaused]=useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [restTotal,setRestTotal]= useState(0);
  const [recap,    setRecap]    = useState(false);
  const [photo,    setPhoto]    = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    if(!initialWorkoutId) return;
    const all=[...db,...(customWorkouts||[])];
    let found=all.find(w=>w.id===initialWorkoutId);
    if(!found&&initialWorkoutId.startsWith('sched_')){
      const oid=initialWorkoutId.split('_').slice(2).join('_');
      found=all.find(w=>w.id===oid);
    }
    if(found){setWorkout(found);setSelCat(found.category);if(initialWorkoutId.startsWith('sched_'))setActive(true);}
  },[initialWorkoutId,db,customWorkouts]);

  useEffect(()=>{if(!active||resting)return;const t=setInterval(()=>setElapsed(p=>p+1),1000);return()=>clearInterval(t);},[active,resting]);
  useEffect(()=>{if(!resting||restPaused)return;const t=setInterval(()=>setRestLeft(p=>{if(p<=1){setResting(false);return 0;}return p-1;}),1000);return()=>clearInterval(t);},[resting,restPaused]);

  const handleSet=(ei:number,si:number)=>{
    const k=`${ei}-${si}`;const was=doneSets.has(k);
    setDoneSets(p=>{const n=new Set(p);was?n.delete(k):n.add(k);return n;});
    if(!was&&workout){const r=(CAT_META[workout.category]??CAT_META['Massa']).rest;setRestTotal(r);setRestLeft(r);setResting(true);setRestPaused(false);}
  };

  const finish=()=>{
    if(!workout)return;
    if(onShareToCommunity&&photo) onShareToCommunity({id:`p_${Date.now()}`,userId:userProfile?.id||'',user:userProfile?.name||'',userImage:userProfile?.image,time:'Adesso',content:`Ho completato ${workout.title} in ${Math.floor(elapsed/60)} minuti! 🔥`,image:photo,tag:'Allenamento',likes:0,comments:0,liked:false});
    onWorkoutComplete?.(elapsed,5,photo,workout,onShareToCommunity&&photo?'community':'home');
    setRecap(false);setWorkout(null);setElapsed(0);setDoneSets(new Set());setFailSets(new Set());setDropSets(new Set());
  };

  const {display,customs}=useMemo(()=>{
    const c=db.filter(w=>w.isCustom||w.category==='Custom');
    const f=selCat==='Custom'?c:db.filter(w=>w.category===selCat);
    return{display:f.length>0?f:db.filter(w=>!w.isCustom&&w.category!=='Custom'),customs:c};
  },[db,selCat]);

  const meta=CAT_META[selCat]??CAT_META['Massa'];
  const heroImg=userProfile?.gender==='Donna'?meta.imgF:meta.imgM;
  const fmt=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const card:React.CSSProperties={background:T.bg2,border:`1px solid ${T.border}`,borderRadius:22};

  /* ── REST TIMER ─────────────────────────────────────────────────────── */
  if(active&&workout&&resting){
    const pct=restTotal>0?(restTotal-restLeft)/restTotal:0;const c=2*Math.PI*120;
    return(
      <div style={{position:'fixed',inset:0,zIndex:100,background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'52px 24px 48px',fontFamily:T.body,color:T.text}}>
        <div style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:T.amber,animation:'pulse 1.5s ease-in-out infinite'}}/>
            <span style={{fontSize:11,fontWeight:800,letterSpacing:'0.12em',textTransform:'uppercase',color:T.amber}}>RECUPERO</span>
          </div>
          <button onClick={()=>setResting(false)} style={{fontSize:12,fontWeight:700,color:T.muted,background:'none',border:'none',cursor:'pointer'}}>Chiudi</button>
        </div>
        <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="300" height="300" style={{transform:'rotate(-90deg)'}}>
            <circle cx="150" cy="150" r="120" fill="none" stroke={T.bg3} strokeWidth="10"/>
            <circle cx="150" cy="150" r="120" fill="none" stroke={T.amber} strokeWidth="10"
              strokeDasharray={c} strokeDashoffset={c*(1-pct)} strokeLinecap="round"
              style={{transition:'stroke-dashoffset 1s linear',filter:`drop-shadow(0 0 12px ${T.amber}80)`}}/>
          </svg>
          <div style={{position:'absolute',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <span style={{fontFamily:T.mono,fontSize:72,fontWeight:700,color:T.text,letterSpacing:'-0.02em'}}>{fmt(restLeft)}</span>
            <span style={{fontSize:11,color:T.muted,marginTop:-4}}>{workout.title}</span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:24,marginBottom:24}}>
          <button onClick={()=>setRestLeft(p=>p+30)} style={{width:64,height:64,borderRadius:'50%',background:T.bg2,border:`1px solid ${T.border}`,color:T.text,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:T.body}}>
            <span style={{fontSize:13,fontWeight:800}}>+30</span><span style={{fontSize:9,color:T.muted}}>sec</span>
          </button>
          <button onClick={()=>setRestPaused(p=>!p)} style={{width:88,height:88,borderRadius:'50%',background:T.amber,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 32px rgba(255,179,71,0.4)`}}>
            {restPaused?<Play fill="black" size={32} style={{color:'#000',marginLeft:4}}/>:<Pause fill="black" size={32} style={{color:'#000'}}/>}
          </button>
          <button onClick={()=>setResting(false)} style={{width:64,height:64,borderRadius:'50%',background:T.bg2,border:`1px solid ${T.border}`,color:T.text,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <FastForward size={22} fill="currentColor" style={{marginLeft:2}}/><span style={{fontSize:9,color:T.muted,marginTop:2}}>Salta</span>
          </button>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.7)}}`}</style>
      </div>
    );
  }

  /* ── ACTIVE SESSION ─────────────────────────────────────────────────── */
  if(active&&workout){return(
    <div style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:T.body}}>
      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:20,padding:'52px 20px 14px',background:'rgba(7,7,10,0.92)',backdropFilter:'blur(20px)',borderBottom:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{workout.title}</div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:accent,animation:'pulse 1.5s ease-in-out infinite'}}/>
            <span style={{fontFamily:T.mono,fontSize:14,color:accent}}>{fmt(elapsed)}</span>
          </div>
        </div>
        <button onClick={()=>{setActive(false);setRecap(true);}} style={{background:'rgba(255,93,59,0.08)',border:'1px solid rgba(255,93,59,0.2)',color:T.coral,padding:'8px 16px',borderRadius:100,fontSize:11,fontWeight:800,letterSpacing:'0.08em',textTransform:'uppercase',cursor:'pointer',fontFamily:T.body}}>
          Termina
        </button>
      </div>
      <div style={{paddingTop:110,paddingBottom:80,padding:'110px 20px 80px',display:'flex',flexDirection:'column',gap:12}}>
        {workout.exercises.map((ex,ei)=>{
          const m=(ex.reps??'').match(/^(\d+)\s*[x×X]/i);const sets=m?Math.max(1,Math.min(6,parseInt(m[1]))):3;
          const done=Array.from({length:sets}).filter((_,si)=>doneSets.has(`${ei}-${si}`)).length;
          const full=done===sets;
          return(
            <div key={ei} style={{...card,overflow:'hidden',opacity:full?0.6:1,border:`1px solid ${full?accent+'30':T.border}`,transition:'all 0.3s'}}>
              <div style={{padding:'16px 18px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                  <div>
                    <div style={{fontSize:17,fontWeight:800,color:full?T.muted:T.text}}>{ex.name}</div>
                    <div style={{fontSize:11,color:T.muted,marginTop:2,fontFamily:T.mono}}>{ex.reps}</div>
                  </div>
                  {full&&<CheckCircle2 size={20} style={{color:accent}}/>}
                </div>
                <div style={{display:'flex',gap:8}}>
                  {Array.from({length:sets}).map((_,si)=>{
                    const k=`${ei}-${si}`;const d=doneSets.has(k);const f=failSets.has(k);const dr=dropSets.has(k);
                    return(
                      <div key={si} style={{flex:1,display:'flex',flexDirection:'column',gap:5}}>
                        <button onClick={()=>handleSet(ei,si)} style={{height:48,borderRadius:14,fontWeight:800,fontSize:13,border:'none',background:d?(f?T.amber:dr?T.violet:accent):T.bg3,color:d?'#000':T.muted,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:d?`0 0 14px ${f?T.amber:dr?T.violet:accent}50`:'none',transition:'all 0.2s'}}>
                          {d?(f?'⚡':dr?'↓':<CheckCircle2 size={18}/>):<span style={{fontSize:11}}>{si+1}</span>}
                        </button>
                        {d&&(
                          <div style={{display:'flex',gap:3}}>
                            <button onClick={()=>setFailSets(p=>{const n=new Set(p);n.has(k)?n.delete(k):n.add(k);return n;})} style={{flex:1,height:22,borderRadius:7,background:f?'rgba(255,179,71,0.2)':T.bg4,border:`1px solid ${f?T.amber+'50':T.border}`,color:f?T.amber:T.muted,fontSize:9,cursor:'pointer'}}>⚡</button>
                            <button onClick={()=>setDropSets(p=>{const n=new Set(p);n.has(k)?n.delete(k):n.add(k);return n;})} style={{flex:1,height:22,borderRadius:7,background:dr?'rgba(167,139,250,0.2)':T.bg4,border:`1px solid ${dr?T.violet+'50':T.border}`,color:dr?T.violet:T.muted,fontSize:10,cursor:'pointer'}}>↓</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:14,padding:'12px 16px'}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:T.muted,marginBottom:8}}>TECNICHE AVANZATE</div>
          <div style={{display:'flex',gap:16,fontSize:11,color:T.muted,flexWrap:'wrap'}}>
            <span>⚡ <span style={{color:T.amber}}>Cedimento</span> — massimo sforzo</span>
            <span>↓ <span style={{color:T.violet}}>Drop Set</span> — riduci e continua</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.7)}}`}</style>
    </div>
  );}

  /* ── RECAP ──────────────────────────────────────────────────────────── */
  if(recap){return(
    <div style={{position:'fixed',inset:0,zIndex:100,background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:T.body,color:T.text}}>
      <div style={{fontSize:64,marginBottom:8}}>🏆</div>
      <div style={{fontFamily:T.display,fontSize:46,color:T.text,lineHeight:0.9,textAlign:'center',marginBottom:8}}>ALLENAMENTO<br/><span style={{color:accent}}>COMPLETATO!</span></div>
      <div style={{fontSize:13,color:T.muted,marginBottom:28}}>Tempo totale: {Math.floor(elapsed/60)} minuti</div>
      <div onClick={()=>fileRef.current?.click()} style={{width:'100%',maxWidth:300,aspectRatio:'4/5',background:photo?'transparent':T.bg2,border:`1px solid ${T.border}`,borderRadius:24,overflow:'hidden',position:'relative',cursor:'pointer',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {photo
          ?<><img src={photo} style={{width:'100%',height:'100%',objectFit:'cover'}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(7,7,10,0.8) 0%, transparent 50%)'}}/>
            <div style={{position:'absolute',bottom:14,left:16}}><div style={{fontFamily:T.display,fontSize:22,color:T.text}}>{workout?.title}</div></div></>
          :<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,color:T.muted}}>
            <Camera size={40}/><span style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em'}}>Scatta foto</span>
          </div>
        }
        <button onClick={e=>{e.stopPropagation();fileRef.current?.click();}} style={{position:'absolute',top:12,right:12,width:40,height:40,borderRadius:12,background:'rgba(7,7,10,0.7)',border:`1px solid ${T.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:T.text}}>
          <Camera size={18}/>
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:'none'}}
          onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=()=>setPhoto(r.result as string);r.readAsDataURL(f);}}}/>
      </div>
      <button onClick={finish} style={{width:'100%',maxWidth:300,padding:'17px',background:accent,color:'#000',border:'none',borderRadius:16,fontSize:14,fontWeight:800,letterSpacing:'0.08em',cursor:'pointer',fontFamily:T.body,boxShadow:`0 4px 24px ${accent}30`}}>
        {photo?'CONDIVIDI E SALVA':'SALVA SENZA FOTO'}
      </button>
    </div>
  );}

  /* ── WORKOUT DETAIL (pre-session) ───────────────────────────────────── */
  if(workout){return(
    <div style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:T.body,paddingBottom:100}}>
      <div style={{position:'relative',height:280,overflow:'hidden'}}>
        <img src={getWorkoutImage(workout)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(7,7,10,0.3) 0%, rgba(7,7,10,0.98) 100%)'}}/>
        <button onClick={()=>setWorkout(null)} style={{position:'absolute',top:52,left:16,width:40,height:40,background:'rgba(7,7,10,0.7)',border:`1px solid ${T.border}`,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:T.text}}>
          <ChevronLeft size={20}/>
        </button>
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 20px 20px'}}>
          <div style={{display:'inline-flex',padding:'3px 10px',background:`${CAT_COLORS[workout.category]||accent}15`,border:`1px solid ${CAT_COLORS[workout.category]||accent}30`,borderRadius:100,fontSize:10,fontWeight:700,color:CAT_COLORS[workout.category]||accent,marginBottom:8}}>{workout.category}</div>
          <div style={{fontFamily:T.display,fontSize:38,color:T.text,lineHeight:0.95}}>{workout.title.toUpperCase()}</div>
          <div style={{display:'flex',gap:12,marginTop:8,fontSize:11,color:T.muted}}>
            <span>⏱ ~60 min</span><span>🏋️ {workout.exercises.length} esercizi</span>
          </div>
        </div>
      </div>
      <div style={{padding:'20px 20px'}}>
        {workout.isCompleted?(
          <div style={{background:'rgba(200,255,0,0.04)',border:'1px solid rgba(200,255,0,0.2)',borderRadius:16,padding:'16px',display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <CheckCircle2 size={22} style={{color:accent,flexShrink:0}}/>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:accent}}>Sessione Completata</div>
              {workout.completedDuration&&<div style={{fontSize:11,color:T.muted,marginTop:2}}>{Math.floor(workout.completedDuration/60)} min · <Lock size={9} style={{display:'inline',verticalAlign:'middle'}}/> Non modificabile</div>}
            </div>
          </div>
        ):(
          <div style={{display:'flex',gap:10,marginBottom:20}}>
            <button onClick={()=>setActive(true)} style={{flex:1,background:accent,color:'#000',border:'none',borderRadius:16,padding:'17px',fontSize:14,fontWeight:800,letterSpacing:'0.08em',cursor:'pointer',fontFamily:T.body,display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 4px 24px ${accent}30`}}>
              <Play fill="black" size={20}/> INIZIA ALLENAMENTO
            </button>
            {workout.isCustom&&onEditWorkout&&(
              <button onClick={()=>onEditWorkout(workout)} style={{width:52,height:52,borderRadius:16,background:T.bg2,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:T.muted}}>
                <Edit3 size={18}/>
              </button>
            )}
          </div>
        )}
        <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:T.muted,marginBottom:12}}>ESERCIZI</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {workout.exercises.map((ex,i)=>(
            <div key={i} style={{...card,padding:'14px 16px',display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:28,height:28,borderRadius:9,background:T.bg3,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{fontFamily:T.mono,fontSize:10,color:T.muted}}>{String(i+1).padStart(2,'0')}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:T.text}}>{ex.name}</div>
                <div style={{fontSize:11,color:accent,marginTop:2,fontFamily:T.mono}}>{ex.reps}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );}

  /* ── LIBRARY (no workout selected) ─────────────────────────────────── */
  return(
    <div style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:T.body,paddingBottom:112}}>
      <div style={{padding:'52px 20px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={onBack} style={{width:40,height:40,borderRadius:14,background:T.bg2,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:T.text}}>
          <ChevronLeft size={20}/>
        </button>
        <div style={{fontFamily:T.display,fontSize:24,color:T.text}}>LIBRERIA</div>
        <div style={{width:40}}/>
      </div>

      {/* Hero image */}
      <div style={{margin:'0 20px',borderRadius:24,overflow:'hidden',height:200,position:'relative',cursor:'pointer',marginBottom:16}} onClick={()=>{if(display[0])setWorkout(display[0]);}}>
        <img src={heroImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(7,7,10,0.9) 0%, rgba(7,7,10,0.1) 70%)'}}/>
        <div style={{position:'absolute',bottom:16,left:18}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:accent,marginBottom:4}}>IN EVIDENZA</div>
          <div style={{fontFamily:T.display,fontSize:32,color:T.text,lineHeight:0.9}}>{selCat.toUpperCase()}</div>
          <div style={{fontSize:12,color:T.muted2,marginTop:4}}>{meta.sub}</div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{display:'flex',gap:8,overflowX:'auto',padding:'0 20px 16px',scrollbarWidth:'none'}}>
        {(Object.keys(CAT_META) as CategoryType[]).filter(c=>c!=='Custom'||customs.length>0).map(c=>(
          <button key={c} onClick={()=>setSelCat(c)} style={{flexShrink:0,padding:'8px 18px',borderRadius:100,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:T.body,border:`1px solid ${selCat===c?accent:T.border}`,background:selCat===c?`${accent}12`:T.bg2,color:selCat===c?accent:T.muted,transition:'all 0.2s'}}>
            {c}
          </button>
        ))}
      </div>

      {/* Custom workouts strip */}
      {customs.length>0&&selCat!=='Custom'&&(
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px 10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <Sparkles size={14} style={{color:T.violet}}/><span style={{fontSize:13,fontWeight:800,color:T.text}}>Le Mie Schede</span>
            </div>
            <button onClick={()=>setSelCat('Custom')} style={{fontSize:11,fontWeight:700,color:T.violet,background:'none',border:'none',cursor:'pointer'}}>Vedi tutte</button>
          </div>
          <div style={{display:'flex',gap:10,overflowX:'auto',padding:'0 20px',scrollbarWidth:'none'}}>
            {customs.slice(0,5).map(w=>(
              <div key={w.id} style={{flexShrink:0,width:160,background:'rgba(167,139,250,0.05)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:18,overflow:'hidden'}}>
                <div onClick={()=>setWorkout(w)} style={{padding:'14px',cursor:'pointer'}}>
                  <div style={{width:36,height:36,borderRadius:11,background:'rgba(167,139,250,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}><Sparkles size={16} style={{color:T.violet}}/></div>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.title}</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:2}}>{w.exercises.length} esercizi</div>
                </div>
                {(onEditWorkout||onDeleteCustomWorkout)&&(
                  <div style={{display:'flex',borderTop:'1px solid rgba(167,139,250,0.15)'}}>
                    {onEditWorkout&&<button onClick={e=>{e.stopPropagation();onEditWorkout(w);}} style={{flex:1,padding:'8px',background:'none',border:'none',cursor:'pointer',fontSize:10,fontWeight:700,color:T.violet}}>✏️ Modifica</button>}
                    {onEditWorkout&&onDeleteCustomWorkout&&<div style={{width:1,background:'rgba(167,139,250,0.15)'}}/>}
                    {onDeleteCustomWorkout&&<button onClick={e=>{e.stopPropagation();onDeleteCustomWorkout(w.id);}} style={{flex:1,padding:'8px',background:'none',border:'none',cursor:'pointer',fontSize:10,fontWeight:700,color:T.coral}}>🗑 Elimina</button>}
                  </div>
                )}
              </div>
            ))}
            {onCreateWorkout&&(
              <div onClick={onCreateWorkout} style={{flexShrink:0,width:120,background:'none',border:`1.5px dashed ${T.border2}`,borderRadius:18,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',padding:'20px 0',color:T.muted}}>
                <Plus size={22}/><span style={{fontSize:11,fontWeight:700}}>Crea Nuova</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main list */}
      <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:10}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <div style={{fontSize:13,fontWeight:800,color:T.text}}>Tutti i piani</div>
          {onCreateWorkout&&<button onClick={onCreateWorkout} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:100,background:`${accent}10`,border:`1px solid ${accent}25`,color:accent,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:T.body}}><Plus size={12}/>Crea</button>}
        </div>
        {display.map(w=>(
          <div key={w.id} onClick={()=>setWorkout(w)} style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:20,display:'flex',alignItems:'center',gap:14,padding:'12px 16px',cursor:'pointer',transition:'transform 0.15s'}}>
            <div style={{width:60,height:60,borderRadius:16,overflow:'hidden',flexShrink:0}}>
              <img src={getWorkoutImage(w)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:CAT_COLORS[w.category]||accent,marginBottom:2}}>{w.category}</div>
              <div style={{fontSize:14,fontWeight:700,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.title}</div>
              <div style={{fontSize:11,color:T.muted,marginTop:1}}>{w.exercises.length} esercizi · ~45 min</div>
            </div>
            <ChevronRight size={16} style={{color:T.muted,flexShrink:0}}/>
          </div>
        ))}
        {display.length===0&&(
          <div style={{background:T.bg2,border:`1px dashed ${T.border2}`,borderRadius:20,padding:'40px 20px',textAlign:'center'}}>
            <Dumbbell size={32} style={{color:T.muted,marginBottom:10}}/>
            <div style={{fontSize:13,color:T.muted}}>Nessun piano disponibile.</div>
            {selCat==='Custom'&&onCreateWorkout&&(
              <button onClick={onCreateWorkout} style={{marginTop:14,padding:'10px 20px',background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:14,color:T.violet,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:T.body}}>+ Crea la prima scheda</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDetailScreen;
