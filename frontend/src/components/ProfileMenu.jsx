import React from 'react';
import { History, UtensilsCrossed, Settings2, ChevronRight, ChevronLeft, Activity, Dumbbell, Flame, CheckCircle2 } from 'lucide-react';

const ProfileMenu = ({ dark, profileFlow, setProfileFlow, imcCalculado, status, userStats, setUserStats, currentUser, API_URL }) => {
  const inputClass = `w-full p-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${dark ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500'}`;
  const btnPrimary = `w-full p-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase italic shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2`;

  if (profileFlow === 'setup') {
    return (
      <div className="space-y-4">
        <button onClick={() => setProfileFlow('menu')} className="flex items-center gap-2 font-black uppercase text-[10px] opacity-40">
          <ChevronLeft size={16} /> Voltar
        </button>
        
        <div className={`p-8 rounded-[3.5rem] border-2 space-y-6 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setUserStats({ ...userStats, objetivo: 'perder' })} 
              className={`p-6 rounded-[2.5rem] border-4 flex flex-col items-center gap-2 transition-all ${userStats.objetivo === 'perder' ? 'border-emerald-500 bg-emerald-500/10' : 'opacity-30 border-transparent'}`}>
              <Flame size={28} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase">Cutting</span>
            </button>
            <button onClick={() => setUserStats({ ...userStats, objetivo: 'ganhar' })} 
              className={`p-6 rounded-[2.5rem] border-4 flex flex-col items-center gap-2 transition-all ${userStats.objetivo === 'ganhar' ? 'border-orange-500 bg-orange-500/10' : 'opacity-30 border-transparent'}`}>
              <Dumbbell size={28} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase">Bulking</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black opacity-30 ml-2 uppercase">Peso (kg)</label>
              <input type="number" value={userStats.peso} onChange={e => setUserStats({ ...userStats, peso: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black opacity-30 ml-2 uppercase">Altura (cm)</label>
              <input type="number" value={userStats.altura} onChange={e => setUserStats({ ...userStats, altura: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black opacity-30 ml-2 uppercase">Idade</label>
              <input type="number" value={userStats.idade} onChange={e => setUserStats({ ...userStats, idade: e.target.value })} className={inputClass} />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-black opacity-30 ml-2 uppercase">Gênero</label>
              <div className={`grid grid-cols-2 gap-1 p-1 rounded-2xl border-2 ${dark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                <button 
                  onClick={() => setUserStats({ ...userStats, genero: 'masculino' })}
                  className={`py-3 rounded-xl text-[8px] font-black uppercase transition-all ${userStats.genero === 'masculino' ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40'}`}
                >
                  Masc
                </button>
                <button 
                  onClick={() => setUserStats({ ...userStats, genero: 'feminino' })}
                  className={`py-3 rounded-xl text-[8px] font-black uppercase transition-all ${userStats.genero === 'feminino' ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40'}`}
                >
                  Fem
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={async () => { 
              try {
                const res = await fetch(`${API_URL}/stats`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: currentUser.email,
                    ...userStats
                  })
                });

                if (res.ok) {
                  localStorage.setItem(`nf:stats:${currentUser.email}`, JSON.stringify(userStats));
                  alert("Bio-Medidas sincronizadas na nuvem! ☁️🚀");
                  setProfileFlow('menu');
                } else {
                  alert("Erro ao salvar no servidor. Verifique sua conexão.");
                }
              } catch (err) {
                console.error("Erro na sincronização:", err);
                localStorage.setItem(`nf:stats:${currentUser.email}`, JSON.stringify(userStats));
                setProfileFlow('menu');
              }
            }} 
            className={btnPrimary}
          >
            <CheckCircle2 size={18} className="mr-2" /> Salvar Bio-Medidas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setProfileFlow('calendario')} className={`w-full p-8 rounded-[2.5rem] border-2 flex justify-between items-center transition-all active:scale-95 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
        <span className="flex items-center gap-4 text-indigo-500 font-black uppercase italic"><History /> Calendário</span>
        <ChevronRight />
      </button>

      <button onClick={() => setProfileFlow('alimentos')} className={`w-full p-8 rounded-[2.5rem] border-2 flex justify-between items-center transition-all active:scale-95 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
        <span className="flex items-center gap-4 text-amber-500 font-black uppercase italic"><UtensilsCrossed /> Meus Alimentos</span>
        <ChevronRight />
      </button>

      <div className={`p-6 rounded-[2.5rem] border-2 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-sm'}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className={dark ? 'text-indigo-400' : 'text-indigo-600'} />
              <span className="text-[10px] font-black uppercase opacity-40">Bio-Status</span>
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter flex items-baseline gap-1">
              {imcCalculado} <span className="text-xs font-medium not-italic opacity-30 uppercase">IMC</span>
            </h2>
          </div>
          
          <div className="text-right">
            <span className={`inline-block text-[10px] font-black uppercase px-3 py-2 rounded-xl shadow-sm ${status.badge} ${status.text}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="relative h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${status.bg}`}
            style={{ width: status.pct, minWidth: '8%' }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-[7px] font-black uppercase opacity-20 tracking-widest px-1">
          <span>Magreza</span>
          <span>Ideal</span>
          <span>Sobrepeso</span>
          <span>Obesidade</span>
        </div>
      </div>

      <button onClick={() => setProfileFlow('setup')} className="w-full p-8 rounded-[2.5rem] bg-indigo-600 text-white font-black flex justify-between items-center italic uppercase shadow-xl hover:bg-indigo-700 transition-all">
        <span className="flex items-center gap-4"><Settings2 /> Bio-Medidas</span>
        <ChevronRight />
      </button>

      <button onClick={() => { localStorage.removeItem('nf:session'); window.location.reload(); }} className="w-full p-4 font-black opacity-40 uppercase text-[10px] text-center italic underline hover:opacity-100">
        Sair da Conta
      </button>
    </div> 
  );
};

export default ProfileMenu;