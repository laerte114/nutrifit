import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView = ({ dark, viewDate, setViewDate, dataSelecionada, setDataSelecionada, setStep, setProfileFlow, hojeStr }) => {
  
  // Função para descobrir em qual dia da semana o mês começa (0 = Domingo, 1 = Segunda...)
  const primeiroDiaDoMes = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  // Ajuste para começar na Segunda (S=0, T=1, Q=2, Q=3, S=4, S=5, D=6)
  const shiftSemana = primeiroDiaDoMes === 0 ? 6 : primeiroDiaDoMes - 1;

  const diasNoMes = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  return (
    <div className="space-y-4">
      <button onClick={() => setProfileFlow('menu')} className="flex items-center gap-2 font-black uppercase text-[10px] opacity-40">
        <ChevronLeft size={16} /> Voltar
      </button>

      <div className={`p-8 rounded-[3.5rem] border-2 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
        <div className="flex justify-between mb-8 items-center font-black uppercase italic">
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2 hover:text-indigo-500 transition-colors">
            <ChevronLeft />
          </button>
          <span className="text-xs tracking-widest">
            {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-2 hover:text-indigo-500 transition-colors">
            <ChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, idx) => (
            <span key={idx} className="text-[8px] font-black opacity-20 text-center">{d}</span>
          ))}

          {/* Espaços vazios para alinhar o início do mês */}
          {[...Array(shiftSemana)].map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {/* O MAP DEVE FICAR DENTRO DE CHAVES { } */}
          {[...Array(diasNoMes)].map((_, i) => {
            const diaNum = i + 1;
            const dLoop = new Date(viewDate.getFullYear(), viewDate.getMonth(), diaNum);
            const dataLoopStr = dLoop.toLocaleDateString('en-CA');
            
            const isHoje = dataLoopStr === hojeStr;
            const isSelecionado = dataLoopStr === dataSelecionada;
            const isFuturo = dLoop > new Date().setHours(23, 59, 59, 999);

            return (
              <button 
                key={i} 
                disabled={isFuturo} 
                onClick={() => { 
                  setDataSelecionada(dataLoopStr); 
                  setStep('resultado'); 
                  setProfileFlow('menu'); 
                }} 
                className={`relative h-11 w-11 mx-auto flex flex-col items-center justify-center text-[10px] font-black rounded-full transition-all
                  ${isFuturo ? 'opacity-5 cursor-not-allowed' : 'hover:bg-indigo-500/10 active:scale-90'} 
                  
                  /* BOLINHA AZUL PARA O DIA ATUAL */
                  ${isHoje && !isSelecionado ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : ''} 
                  
                  /* ESTILO PARA O DIA SELECIONADO (ROXO) */
                  ${isSelecionado ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/20' : ''}
                `}
              >
                {diaNum}
                
                {/* Indicador pequeno se hoje estiver selecionado */}
                {isHoje && isSelecionado && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-300 rounded-full border-2 border-indigo-600"></div>
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-8 text-[8px] font-black uppercase opacity-20 text-center italic">
          Toque em um dia para ver o histórico
        </p>
      </div>
    </div>
  );
};

export default CalendarView;