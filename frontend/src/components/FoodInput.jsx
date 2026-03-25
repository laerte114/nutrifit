import React from 'react';
import { Plus } from 'lucide-react';

const FoodInput = ({ alInput, setAlInput, sugestoes, setSugestoes, dbTotal, handleAddAlimento, dark, inputClass }) => {
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
            } else {
              setSugestoes([]);
            }
          }} 
          className={inputClass} 
        />
        {sugestoes.length > 0 && (
          <div className={`absolute z-50 w-full mt-2 rounded-2xl border-2 shadow-2xl overflow-hidden ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
            {sugestoes.slice(0, 5).map(s => (
              <button 
                key={s} 
                onClick={() => { setAlInput({ ...alInput, nome: s.toUpperCase() }); setSugestoes([]); }} 
                className="w-full p-4 text-left text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <input 
        placeholder="G" 
        type="number" 
        value={alInput.gramas} 
        onChange={e => setAlInput({ ...alInput, gramas: e.target.value })} 
        className={inputClass} 
        style={{ flex: 1 }} 
      />
      <button onClick={handleAddAlimento} className="p-5 rounded-3xl bg-indigo-600 text-white shadow-lg active:scale-90">
        <Plus />
      </button>
    </div>
  );
};

export default FoodInput;