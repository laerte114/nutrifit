import React from 'react';
import { User, TrendingUp } from 'lucide-react';

const BottomNav = ({ step, setStep, setProfileFlow, dark }) => {
  return (
    <nav className={`fixed bottom-10 left-1/2 -translate-x-1/2 w-80 p-2 flex justify-around backdrop-blur-2xl rounded-[3rem] border-2 ${dark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200 shadow-2xl'}`}>
      <button 
        onClick={() => { setStep('perfil'); setProfileFlow('menu'); }} 
        className={`p-5 rounded-[2rem] transition-all ${step === 'perfil' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
      >
        <User size={26} />
      </button>
      <button 
        onClick={() => setStep('resultado')} 
        className={`p-5 rounded-[2rem] transition-all ${step === 'resultado' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
      >
        <TrendingUp size={26} />
      </button>
    </nav>
  );
};

export default BottomNav;