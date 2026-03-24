import React from 'react';
import { Plus } from 'lucide-react';

const FoodInput = ({ alInput, setAlInput, setSugestoes, dbTotal, handleAdd, dark }) => {
  const inputClass = `w-full p-5 rounded-3xl font-bold border-2 transition-all outline-none ${
    dark ? 'bg-slate-900 border-slate-800 focus:border-indigo-500' : 'bg-white border-slate-100 focus:border-indigo-500 shadow-sm'
  }`;

  return (
    <div className="flex gap-3 items-start">
      <div className="relative" style={{ flex: 2 }}>
        <input 
          placeholder="ALIMENTO..." 
          value={alInput.nome} 
          onChange={e => {
            const v = e.target.value; 
            setAlInput({ ...alInput, nome: v });
            if (v.length > 1) {
              setSugestoes(Object.keys(dbTotal).filter(n => n.toLowerCase().includes(v.toLowerCase())));
            } else setSugestoes([]);
          }} 
          className={inputClass} 
        />
      </div>
      <input 
        placeholder="G" 
        type="number" 
        value={alInput.gramas} 
        onChange={e => setAlInput({ ...alInput, gramas: e.target.value })} 
        className={inputClass} 
        style={{ flex: 1 }} 
      />
      <button 
        onClick={handleAdd} 
        className="p-5 rounded-3xl bg-indigo-600 text-white shadow-lg active:scale-90"
      >
        <Plus />
      </button>
    </div>
  );
};

export default FoodInput;