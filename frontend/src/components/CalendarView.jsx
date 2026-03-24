import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView = ({ viewDate, setViewDate, dataSelecionada, setDataSelecionada, hojeStr, setStep, setProfileFlow, dark }) => {
  const diasNoMes = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  return (
    <div className="space-y-4">
      <button onClick={() => setProfileFlow('menu')} className="flex items-center gap-2 font-black uppercase text-[10px] opacity-40 px-4">
        <ChevronLeft size={16} /> Voltar
      </button>
      <div className={`p-8 rounded-[3.5rem] border-2 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
        <div className="flex justify-between mb-8 items-center font-black uppercase italic">
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}><ChevronLeft /></button>
          <span className="text-xs tracking-widest">{viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}><ChevronRight /></button>
        </div>
        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, idx) => (<span key={idx} className="text-[8px] font-black opacity-20 text-center">{d}</span>))}
          {[...Array(diasNoMes)].map((_, i) => {
            const diaNum = i + 1;
            const dLoop = new Date(viewDate.getFullYear(), viewDate.getMonth(), diaNum);
            const dataLoopStr = dLoop.toISOString().split('T')[0];
            const isHoje = dataLoopStr === hojeStr;
            const isSelecionado = dataLoopStr === dataSelecionada;
            
            return (
              <button 
                key={i} 
                onClick={() => { setDataSelecionada(dataLoopStr); setStep('resultado'); setProfileFlow('menu'); }}
                className={`h-11 flex flex-col items-center justify-center text-[10px] font-black rounded-2xl transition-all ${isHoje ? 'border-2 border-indigo-500 text-indigo-500' : ''} ${isSelecionado ? 'bg-indigo-600 text-white shadow-lg' : ''}`}
              >
                {diaNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;