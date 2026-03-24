import React from 'react';
import { History, UtensilsCrossed, Settings2, Activity, ChevronRight } from 'lucide-react';

const ProfileMenu = ({ setProfileFlow, imcCalculado, status, dark }) => {
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
          <span className={`inline-block text-[10px] font-black uppercase px-3 py-2 rounded-xl shadow-sm ${status.badge} ${status.color}`}>
            {status.label}
          </span>
        </div>
        <div className="relative h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${status.bg}`} style={{ width: status.pct, minWidth: '8%' }} />
        </div>
      </div>

      <button onClick={() => setProfileFlow('setup')} className="w-full p-8 rounded-[2.5rem] bg-indigo-600 text-white font-black flex justify-between items-center italic uppercase shadow-xl hover:bg-indigo-700 transition-all">
        <span className="flex items-center gap-4"><Settings2 /> Bio-Medidas</span>
        <ChevronRight />
      </button>
    </div>
  );
};

export default ProfileMenu;