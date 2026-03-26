import React from 'react';
import { History, AlertTriangle } from 'lucide-react';

const MacroDashboard = ({ dark, isDiaAnterior, totais, metas, incompleto }) => {
  return (
    <>
      {isDiaAnterior && (
        <div className={`flex items-center gap-3 p-4 rounded-3xl border-2 ${dark ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
          <History size={18} className="shrink-0" />
          <p className="text-[10px] font-black uppercase italic leading-tight">
            Dias anteriores são apenas para visualização
          </p>
        </div>
      )}
      
      <div className={`p-10 rounded-[4rem] text-center border-4 transition-all duration-500 ${totais.kcal > metas.kcal ? 'border-rose-500 bg-rose-500/5' : 'border-emerald-500 bg-emerald-500/5'}`}>
        <div className="flex items-baseline justify-center gap-2">
          <span className={`text-[100px] leading-none font-black italic tracking-tighter ${totais.kcal > metas.kcal ? 'text-rose-500' : 'text-emerald-500'}`}>{Math.round(totais.kcal)}</span>
          <span className="text-2xl font-black italic opacity-20">/ {metas.kcal}</span>
        </div>
        <div className="mt-8 pt-8 border-t border-dashed border-slate-700/20 space-y-4 text-left">
          {incompleto && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-2">
              <AlertTriangle size={12} className="text-amber-500" />
              <p className="text-[8px] font-black text-amber-500 uppercase italic">⚠️ Alimentos sem macros no log</p>
            </div>
          )}
          {[
            { label: 'Prot', atual: totais.p, meta: metas.p, cor: 'bg-orange-500', texto: 'text-orange-500' },
            { label: 'Carb', atual: totais.cho, meta: metas.cho, cor: 'bg-cyan-500', texto: 'text-cyan-500' },
            { label: 'Gord', atual: totais.g, meta: metas.g, cor: 'bg-amber-300', texto: 'text-amber-300' }
          ].map(m => (
            <div key={m.label} className="space-y-1">
              <div className="flex justify-between items-end">
                <span className={`text-[10px] font-black uppercase ${m.texto}`}>{m.label}</span>
                <span className="text-[9px] opacity-40 font-bold uppercase">{Math.round(m.atual)}g / {m.meta}g</span>
              </div>
              <div className={`h-2 w-full rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className={`h-full transition-all duration-1000 ${m.cor}`} style={{ width: `${Math.min((m.atual / m.meta) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MacroDashboard;