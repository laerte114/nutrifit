import React, { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';



const formatarDataParaBR = (dataStr) => {

  if (!dataStr) return '';

  const [ano, mes, dia] = dataStr.split('-');

  return `${dia}/${mes}/${ano}`;

};



const FoodInput = ({ dark, isDiaAnterior, dbTotal, historico, dataSelecionada, setHistorico, currentUser, API_URL }) => {

  const [alInput, setAlInput] = useState({ nome: '', gramas: '' });

  const [sugestoes, setSugestoes] = useState([]);



  const inputClass = `w-full p-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${dark ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500'}`;



  const handleAddAlimento = async () => {

    const nomeBusca = alInput.nome.toLowerCase().trim();

    const alimentoEncontrado = dbTotal[nomeBusca];

    const gramas = parseFloat(alInput.gramas);



    if (!alimentoEncontrado) {

      alert("Alimento não encontrado. Selecione da lista ou cadastre em 'Meus Alimentos'.");

      return;

    }

    if (!gramas || gramas <= 0) {

      alert("Digite uma quantidade válida em gramas.");

      return;

    }



    const novaRef = {

      email: currentUser.email, 

      data: formatarDataParaBR(dataSelecionada),

      alimento: { 

        nome: alInput.nome.toUpperCase(), 

        gramas: gramas, 

        cal: (Number(alimentoEncontrado.c || 0) * gramas) / 100,

        p: (Number(alimentoEncontrado.p || 0) * gramas) / 100,

        cho: (Number(alimentoEncontrado.cho || 0) * gramas) / 100,

        g: (Number(alimentoEncontrado.g || 0) * gramas) / 100

      }

    };

    

    try {

      const res = await fetch(`${API_URL}/refeicoes`, {

        method: 'POST', 

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify(novaRef)

      });



      if (res.ok) {

        const saved = await res.json();

        setHistorico(prev => ({ 

          ...prev, 

          [dataSelecionada]: [saved, ...(prev[dataSelecionada] || [])] 

        }));

        setAlInput({ nome: '', gramas: '' }); 

        setSugestoes([]);

      }

    } catch (err) { 

      console.error("Erro de conexão ao salvar alimento"); 

    }

  };



  return (

    <>

      {!isDiaAnterior && (

        <div className="flex gap-3 items-start">

          <div className="relative" style={{ flex: 2 }}>

            <input placeholder="ALIMENTO..." value={alInput.nome} onChange={e => {

              const v = e.target.value; setAlInput({ ...alInput, nome: v });

              if (v.length > 1) setSugestoes(Object.keys(dbTotal).filter(n => n.toLowerCase().includes(v.toLowerCase())));

              else setSugestoes([]);

            }} className={inputClass} />

            {sugestoes.length > 0 && (

              <div className={`absolute z-50 w-full mt-2 rounded-2xl border-2 shadow-2xl overflow-hidden ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>

                {sugestoes.slice(0, 5).map(s => (

                  <button key={s} onClick={() => { setAlInput({ ...alInput, nome: s.toUpperCase() }); setSugestoes([]); }} className="w-full p-4 text-left text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white">{s}</button>

                ))}

              </div>

            )}

          </div>

          <input placeholder="G" type="number" value={alInput.gramas} onChange={e => setAlInput({ ...alInput, gramas: e.target.value })} className={inputClass} style={{ flex: 1 }} />

          <button onClick={handleAddAlimento} className="p-5 rounded-3xl bg-indigo-600 text-white shadow-lg active:scale-90"><Plus /></button>

        </div>

      )}



      <div className="space-y-4 pb-20">

        {(historico[dataSelecionada] || []).map(item => {

          const cV = Number(item.cal) || 0;

          const pV = Number(item.p) || 0;

          const choV = Number(item.cho) || 0;

          const gV = Number(item.g) || 0;

          return (

            <div key={item._id} className={`p-6 rounded-[2.5rem] border-2 flex justify-between items-center ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-sm'}`}>

              <div className="flex-1">

                <p className="font-black text-sm uppercase italic">{item.nome}</p>

                <div className="flex gap-2 items-center mt-1">

                  <span className="text-[9px] opacity-40 font-bold uppercase">{item.gramas}G • {Math.round(cV)} KCAL</span>

                  {(pV > 0 || choV > 0 || gV > 0) && (

                    <div className="flex gap-2 border-l pl-2 border-slate-700/20">

                      <span className="text-[9px] font-black text-orange-500">P:{Math.round(pV)}g</span>

                      <span className="text-[9px] font-black text-cyan-500">C:{Math.round(choV)}g</span>

                      <span className="text-[9px] font-black text-amber-300">G:{Math.round(gV)}g</span>

                    </div>

                  )}

                </div>

              </div>

              {!isDiaAnterior && (

                <button onClick={async () => {

                  await fetch(`${API_URL}/refeicoes/${item._id}`, { method: 'DELETE' });

                  setHistorico(prev => ({ ...prev, [dataSelecionada]: (prev[dataSelecionada] || []).filter(x => x._id !== item._id) }));

                }} className="text-rose-500/20 hover:text-rose-500 p-2"><Trash2 size={20} /></button>

              )}

            </div>

          )

        })}

      </div>

    </>

  );

};



export default FoodInput;