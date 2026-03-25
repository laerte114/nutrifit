import React from 'react';
import { ChevronLeft, Settings2, Trash2, Plus } from 'lucide-react';

const MyFoods = ({ meusAlimentos, setMeusAlimentos, novoAlimento, setNovoAlimento, API_URL, currentUser, dark, inputClass, btnPrimary, setProfileFlow }) => {
  
  const handleEdit = (nome, data) => {
    setNovoAlimento({ nome, c: data.c, p: data.p, cho: data.cho, g: data.g, editing: nome });
  };

  const saveEdit = async (nome) => {
    const original = meusAlimentos[nome];
    const id = original?.id || original?._id;
    const payload = { 
      c: Number(novoAlimento.c), 
      p: Number(novoAlimento.p || 0), 
      cho: Number(novoAlimento.cho || 0), 
      g: Number(novoAlimento.g || 0) 
    };

    const atualizados = { ...meusAlimentos, [nome]: { ...original, ...payload } };
    setMeusAlimentos(atualizados);
    localStorage.setItem(`nf:meus:${currentUser.email}`, JSON.stringify(atualizados));
    setNovoAlimento({ nome: '', c: '', p: '', cho: '', g: '', editing: null });

    if (id) {
      try {
        await fetch(`${API_URL}/meus-alimentos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) { console.error("Erro ao sincronizar:", err); }
    }
  };

  const deleteFood = async (nome) => {
    const original = meusAlimentos[nome];
    const id = original?.id || original?._id;
    const n = { ...meusAlimentos };
    delete n[nome];
    setMeusAlimentos(n);
    localStorage.setItem(`nf:meus:${currentUser.email}`, JSON.stringify(n));

    if (id) {
      try {
        await fetch(`${API_URL}/meus-alimentos/${id}`, { method: 'DELETE' });
      } catch (err) { console.error("Erro ao deletar:", err); }
    }
  };

  const createFood = async () => {
    if (novoAlimento.nome && novoAlimento.c) {
      const payload = {
        nome: novoAlimento.nome.toUpperCase(),
        c: Number(novoAlimento.c),
        p: Number(novoAlimento.p || 0),
        cho: Number(novoAlimento.cho || 0),
        g: Number(novoAlimento.g || 0),
        email: currentUser.email
      };
      const chave = novoAlimento.nome.toLowerCase().trim();
      setMeusAlimentos({ ...meusAlimentos, [chave]: payload });
      setNovoAlimento({ nome: '', c: '', p: '', cho: '', g: '', editing: null });

      try {
        await fetch(`${API_URL}/meus-alimentos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) { console.error("Erro de conexão:", err); }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <button onClick={() => setProfileFlow('menu')} className="flex items-center gap-2 font-black uppercase text-[10px] opacity-40">
        <ChevronLeft size={16} /> Voltar
      </button>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase opacity-30 ml-4 italic">Sua Biblioteca Cloud</h3>
        {Object.entries(meusAlimentos).map(([nome, m]) => (
          <div key={nome} className={`p-6 rounded-[2.5rem] border-2 transition-all ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-sm'} ${novoAlimento.editing === nome ? 'border-indigo-500 ring-4 ring-indigo-500/10' : ''}`}>
            {novoAlimento.editing === nome ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black uppercase text-indigo-500 italic">Editando: {nome}</p>
                  <button onClick={() => setNovoAlimento({ nome: '', c: '', p: '', cho: '', g: '', editing: null })} className="text-[9px] font-black uppercase opacity-40">Cancelar</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="KCAL" value={novoAlimento.c} onChange={e => setNovoAlimento({...novoAlimento, c: e.target.value})} className={inputClass} />
                  <input type="number" placeholder="PROT" value={novoAlimento.p} onChange={e => setNovoAlimento({...novoAlimento, p: e.target.value})} className={inputClass} />
                  <input type="number" placeholder="CARB" value={novoAlimento.cho} onChange={e => setNovoAlimento({...novoAlimento, cho: e.target.value})} className={inputClass} />
                  <input type="number" placeholder="GORD" value={novoAlimento.g} onChange={e => setNovoAlimento({...novoAlimento, g: e.target.value})} className={inputClass} />
                </div>
                <button onClick={() => saveEdit(nome)} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic text-xs shadow-lg">Salvar Alterações</button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div onClick={() => handleEdit(nome, m)} className="flex-1 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm uppercase italic group-hover:text-indigo-500 transition-colors">{nome}</p>
                    <Settings2 size={12} className="opacity-0 group-hover:opacity-100 transition-all text-indigo-500" />
                  </div>
                  <p className="text-[9px] opacity-40 font-bold uppercase">{m.c} KCAL | P: {m.p || 0}g C: {m.cho || 0}g G: {m.g || 0}g</p>
                </div>
                <button onClick={() => deleteFood(nome)} className="text-rose-500/20 hover:text-rose-500 p-2 transition-colors"><Trash2 size={18} /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!novoAlimento.editing && (
        <div className={`p-8 rounded-[3.5rem] border-2 mt-6 space-y-4 ${dark ? 'bg-slate-900 border-indigo-500/10' : 'bg-white shadow-xl'}`}>
          <p className="text-[10px] font-black uppercase opacity-30 italic text-center">Cadastrar Novo Alimento</p>
          <input placeholder="NOME DO ALIMENTO" value={novoAlimento.nome} onChange={e => setNovoAlimento({ ...novoAlimento, nome: e.target.value.toUpperCase() })} className={inputClass} />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="KCAL (100G)" type="number" value={novoAlimento.c} onChange={e => setNovoAlimento({ ...novoAlimento, c: e.target.value })} className={inputClass} />
            <input placeholder="PROT" type="number" value={novoAlimento.p} onChange={e => setNovoAlimento({ ...novoAlimento, p: e.target.value })} className={inputClass} />
            <input placeholder="CARB" type="number" value={novoAlimento.cho} onChange={e => setNovoAlimento({ ...novoAlimento, cho: e.target.value })} className={inputClass} />
            <input placeholder="GORD" type="number" value={novoAlimento.g} onChange={e => setNovoAlimento({ ...novoAlimento, g: e.target.value })} className={inputClass} />
          </div>
          <button onClick={createFood} className={btnPrimary}>Cadastrar</button>
        </div>
      )}
    </div>
  );
};

export default MyFoods;