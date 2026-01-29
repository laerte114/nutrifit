import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TrendingUp, User, Plus, Trash2, ChevronRight, Settings2, 
  ChevronLeft, History, Sun, Moon, UtensilsCrossed, 
  Flame, Dumbbell, Crown, AlertTriangle, PlusCircle, CheckCircle2,
  Calendar, BarChart3, Target, Award, Scale, Zap, Heart, Trophy, Clock
} from 'lucide-react';

// --- CONFIGURAÇÃO GLOBAL ---
const API_URL = "https://nutrifit-1jhv.onrender.com"; 

// --- UTILS ---
const formatarDataParaBR = (dataStr) => {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
};

const App = () => {
  // --- STATES ---
  const session = localStorage.getItem('nf:session');
  const userObj = session ? JSON.parse(session) : null;
  const [currentUser, setCurrentUser] = useState(userObj);
  const [authMode, setAuthMode] = useState(userObj ? 'app' : 'login'); 
  const [dark, setDark] = useState(localStorage.getItem('nf:theme') === 'dark');
  const [step, setStep] = useState('resultado'); 
  const [profileFlow, setProfileFlow] = useState('menu');
  const hojeStr = new Date().toISOString().split('T')[0];
  const [dataSelecionada, setDataSelecionada] = useState(hojeStr);
  const [viewDate, setViewDate] = useState(new Date());

  const [historico, setHistorico] = useState({}); 
  const [meusAlimentos, setMeusAlimentos] = useState({});
  const [alInput, setAlInput] = useState({ nome: '', gramas: '' });
  const [novoAlimento, setNovoAlimento] = useState({ nome: '', c: '', p: '', cho: '', g: '' });
  const [dbFixa, setDbFixa] = useState({});

  // --- PERSISTENCE & FETCH ---
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const resBase = await fetch(`${API_URL}/alimentos-base`);
        if (resBase.ok) {
          const lista = await resBase.json();
          const dicionario = lista.reduce((acc, item) => {
            if (item.nome) acc[item.nome.toLowerCase().trim()] = { c: item.c, p: item.p, cho: item.cho, g: item.g };
            return acc;
          }, {});
          setDbFixa(dicionario);
        }
        
        if (currentUser?.email) {
          const resMeus = await fetch(`${API_URL}/meus-alimentos/${currentUser.email}`);
          if (resMeus.ok) {
            const listaMeus = await resMeus.json();
            const formatadoMeus = listaMeus.reduce((acc, obj) => {
              acc[obj.nome.toLowerCase().trim()] = { c: obj.c, p: obj.p, cho: obj.cho, g: obj.g };
              return acc;
            }, {});
            setMeusAlimentos(formatadoMeus);
          }
        }
      } catch (err) { console.error("Erro na carga inicial"); }
    };
    carregarDadosIniciais();
  }, [currentUser]);

  const dbTotal = useMemo(() => ({ ...dbFixa, ...meusAlimentos }), [dbFixa, meusAlimentos]);

  const carregarDadosDiarios = useCallback(async () => {
    if (authMode === 'app' && currentUser) {
      const dataBR = formatarDataParaBR(dataSelecionada);
      try {
        const res = await fetch(`${API_URL}/refeicoes/${currentUser.email}/${encodeURIComponent(dataBR)}`);
        if (res.ok) {
          const dados = await res.json();
          setHistorico(prev => ({ ...prev, [dataSelecionada]: dados }));
        }
      } catch (err) { console.error("Erro ao sincronizar diário"); }
    }
  }, [dataSelecionada, currentUser, authMode]);

  useEffect(() => { carregarDadosDiarios(); }, [carregarDadosDiarios]);

  // --- ACTIONS ---
  const handleAddAlimento = async () => {
  const nomeBusca = alInput.nome.toLowerCase().trim();
  const alimentoInfo = dbTotal[nomeBusca];
  const gramas = parseFloat(alInput.gramas);

  if (alimentoInfo && gramas > 0) {
    const novaRef = {
      email: currentUser?.email || "usuario@teste.com",
      data: formatarDataParaBR(dataSelecionada),
      alimento: {
        nome: alInput.nome.toUpperCase(),
        gramas: gramas,
        cal: (alimentoInfo.c * gramas) / 100,
        p: (alimentoInfo.p * gramas) / 100 || 0,
        cho: (alimentoInfo.cho * gramas) / 100 || 0,
        g: (alimentoInfo.g * gramas) / 100 || 0
      }
    };

    try {
      const res = await fetch(`${API_URL}/refeicoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaRef)
      });

      if (res.ok) {
        const salvo = await res.json();
        
        // Atualiza a tela localmente
        setHistorico(prev => ({
          ...prev,
          [dataSelecionada]: [salvo, ...(prev[dataSelecionada] || [])]
        }));

        setAlInput({ nome: '', gramas: '' });
        console.log("✅ Adicionado com sucesso!");
      } else {
        const erroMsg = await res.text();
        console.error("❌ Erro no servidor:", erroMsg);
      }
    } catch (err) {
      console.error("❌ Erro de conexão:", err);
    }
  } else {
    alert("Selecione um alimento válido.");
  }
};

  const handleDelete = async (id, dataRef) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/refeicoes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistorico(prev => ({
          ...prev,
          [dataRef]: prev[dataRef].filter(item => (item._id || item.id) !== id)
        }));
      }
    } catch (err) { console.error("Erro ao deletar"); }
  };

  // --- CÁLCULOS METAS & TOTAIS ---
  const savedStats = userObj ? localStorage.getItem(`nf:stats:${userObj.email}`) : null;
  const [userStats, setUserStats] = useState(savedStats ? JSON.parse(savedStats) : {
    peso: '75', altura: '175', idade: '28', genero: 'masculino', intensidade: '1.375', objetivo: 'manter'
  });

  const metas = useMemo(() => {
    const p = parseFloat(userStats.peso) || 70;
    const h = parseFloat(userStats.altura) || 170;
    const i = parseFloat(userStats.idade) || 25;
    const mult = parseFloat(userStats.intensidade);
    let tmb = (10 * p) + (6.25 * h) - (5 * i);
    tmb = userStats.genero === 'feminino' ? tmb - 161 : tmb + 5;
    const tdee = tmb * mult;
    let kcalFinal = Math.round(tdee);
    if (userStats.objetivo === 'ganhar') kcalFinal += 500;
    if (userStats.objetivo === 'perder') kcalFinal -= 500;
    const gProt = p * (userStats.objetivo === 'perder' ? 2.2 : 1.8);
    const gGord = p * 0.9;
    const gCho = (kcalFinal - (gProt * 4) - (gGord * 9)) / 4;
    return { kcal: kcalFinal, p: Math.round(gProt), cho: Math.round(gCho), g: Math.round(gGord) };
  }, [userStats]);

  const totais = useMemo(() => {
    const lista = historico[dataSelecionada] || [];
    return lista.reduce((acc, item) => {
      const p = Number(item.alimento?.p || item.p || 0);
      const cho = Number(item.alimento?.cho || item.cho || 0);
      const g = Number(item.alimento?.g || item.g || 0);
      const cal = Number(item.alimento?.cal || item.cal || 0);
      return {
        kcal: acc.kcal + cal,
        p: acc.p + p,
        cho: acc.cho + cho,
        g: acc.g + g,
        temIncompleto: acc.temIncompleto || (cal > 0 && p === 0 && cho === 0 && g === 0)
      };
    }, { kcal: 0, p: 0, cho: 0, g: 0, temIncompleto: false });
  }, [historico, dataSelecionada]);

  const sugestoes = useMemo(() => {
    const termo = alInput.nome.toLowerCase().trim();
    if (!termo) return [];
    return Object.keys(dbTotal).filter(nome => nome.toLowerCase().includes(termo)).slice(0, 5);
  }, [dbTotal, alInput.nome]);

  // --- UI HELPERS ---
  const inputClass = `w-full p-5 rounded-[1.8rem] border-2 transition-all duration-300 outline-none font-bold text-sm ${dark ? 'bg-slate-900 border-slate-800 text-white focus:border-indigo-500' : 'bg-white border-slate-100 text-slate-800 focus:border-indigo-500 shadow-sm'}`;
  const btnPrimary = `w-full p-6 bg-indigo-600 text-white rounded-[2.2rem] font-black uppercase italic shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3`;

  // --- RENDERS ---
  const renderBioMedidas = () => (
    <div className={`p-10 rounded-[4rem] border-2 mt-4 space-y-6 ${dark ? 'bg-slate-900 border-indigo-500/10' : 'bg-white shadow-2xl'}`}>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2"><label className="text-[10px] font-black opacity-40 ml-4 uppercase">Peso (kg)</label><input type="number" value={userStats.peso} onChange={e => setUserStats({...userStats, peso: e.target.value})} className={inputClass} /></div>
        <div className="space-y-2"><label className="text-[10px] font-black opacity-40 ml-4 uppercase">Altura (cm)</label><input type="number" value={userStats.altura} onChange={e => setUserStats({...userStats, altura: e.target.value})} className={inputClass} /></div>
        <div className="space-y-2"><label className="text-[10px] font-black opacity-40 ml-4 uppercase">Idade</label><input type="number" value={userStats.idade} onChange={e => setUserStats({...userStats, idade: e.target.value})} className={inputClass} /></div>
        <div className="space-y-2"><label className="text-[10px] font-black opacity-40 ml-4 uppercase">Gênero</label>
          <select value={userStats.genero} onChange={e => setUserStats({...userStats, genero: e.target.value})} className={inputClass}>
            <option value="masculino">HOMEM</option><option value="feminino">MULHER</option>
          </select>
        </div>
      </div>
      <select value={userStats.intensidade} onChange={e => setUserStats({...userStats, intensidade: e.target.value})} className={inputClass}>
          <option value="1.2">SEDENTÁRIO</option><option value="1.375">LEVE (1-3 DIAS)</option><option value="1.55">MODERADO (3-5 DIAS)</option><option value="1.725">INTENSO (6-7 DIAS)</option>
      </select>
      <select value={userStats.objetivo} onChange={e => setUserStats({...userStats, objetivo: e.target.value})} className={inputClass}>
          <option value="manter">MANTER PERFORMANCE</option><option value="perder">CUTTING</option><option value="ganhar">BULKING</option>
      </select>
      <button onClick={() => { localStorage.setItem(`nf:stats:${currentUser.email}`, JSON.stringify(userStats)); setProfileFlow('menu'); }} className={btnPrimary}>RECALCULAR METAS</button>
    </div>
  );

  const renderCalendario = () => {
    const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const ano = viewDate.getFullYear();
    const mes = viewDate.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const dias = [];
    for (let i = 0; i < primeiroDia; i++) dias.push(null);
    for (let i = 1; i <= diasNoMes; i++) dias.push(i);

    return (
      <div className={`p-8 rounded-[3.5rem] border-2 mt-4 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-2xl'}`}>
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setViewDate(new Date(ano, mes - 1))}><ChevronLeft/></button>
          <span className="text-[12px] font-black uppercase italic">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(viewDate)}</span>
          <button onClick={() => setViewDate(new Date(ano, mes + 1))}><ChevronRight/></button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dias.map((dia, idx) => {
            if (!dia) return <div key={idx} />;
            const dStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
            const isSel = dataSelecionada === dStr;
            return (
              <button key={idx} onClick={() => { setDataSelecionada(dStr); setStep('resultado'); }} className={`aspect-square rounded-2xl text-[11px] font-black ${isSel ? 'bg-indigo-600 text-white' : 'opacity-50'}`}>{dia}</button>
            );
          })}
        </div>
      </div>
    );
  };

  // --- RENDER PRINCIPAL ---
  if (authMode !== 'app') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${dark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <Crown size={80} className="text-indigo-600 mb-6" />
        <h1 className="text-5xl font-black italic mb-12">NUTRIFIT CLOUD</h1>
        <button onClick={() => { localStorage.setItem('nf:session', JSON.stringify({nome: 'RODRIGO', email: 'rod@nutrifit.com'})); window.location.reload(); }} className={btnPrimary}>ENTRAR</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-40 ${dark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <main className="max-w-md mx-auto px-6 pt-12">
        {step === 'resultado' ? (
          <div className="space-y-10">
            {totais.temIncompleto && (
              <div className="flex items-center gap-4 p-5 rounded-[2.5rem] bg-amber-500/10 border-2 border-amber-500/20">
                <AlertTriangle size={20} className="text-amber-500" />
                <p className="text-[10px] font-black text-amber-500 uppercase italic">Macros ausentes detectados!</p>
              </div>
            )}

            <div className={`p-12 rounded-[5rem] text-center border-4 ${totais.kcal > metas.kcal ? 'border-rose-500 bg-rose-500/5' : 'border-emerald-500 bg-emerald-500/5'}`}>
               <div className="flex items-baseline justify-center gap-3">
                 <span className={`text-[120px] leading-none font-black italic tracking-tighter ${totais.kcal > metas.kcal ? 'text-rose-500' : 'text-emerald-500'}`}>{Math.round(totais.kcal)}</span>
                 <span className="text-2xl font-black opacity-20">/ {metas.kcal}</span>
               </div>
               <div className="mt-12 pt-12 border-t border-dashed border-slate-700/20 space-y-8 text-left">
                  {[
                    { label: 'Proteína', atual: totais.p, meta: metas.p, cor: 'bg-orange-500' },
                    { label: 'Carbo', atual: totais.cho, meta: metas.cho, cor: 'bg-cyan-500' },
                    { label: 'Gordura', atual: totais.g, meta: metas.g, cor: 'bg-amber-300' }
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between mb-2"><span className="text-[18px] font-black uppercase italic">{m.label}</span><span className="text-[12px] opacity-40">{Math.round(m.atual)}g/{m.meta}g</span></div>
                      <div className={`h-4 w-full rounded-full ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}><div className={`h-full rounded-full ${m.cor}`} style={{ width: `${Math.min((m.atual/m.meta)*100, 100)}%` }} /></div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="relative flex-[3]">
                <input placeholder="ALIMENTO?" value={alInput.nome} onChange={e => setAlInput({...alInput, nome: e.target.value})} className={inputClass} />
                {sugestoes.length > 0 && (
                  <div className={`absolute z-50 w-full mt-2 rounded-[2.5rem] border-2 shadow-2xl ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    {sugestoes.map(s => <button key={s} onClick={() => setAlInput({...alInput, nome: s.toUpperCase()})} className="w-full p-6 text-left text-[12px] font-black uppercase border-b last:border-0 hover:bg-indigo-600 hover:text-white">{s}</button>)}
                  </div>
                )}
              </div>
              <input placeholder="G" type="number" value={alInput.gramas} onChange={e=>setAlInput({...alInput, gramas:e.target.value})} className={`${inputClass} flex-[1.2]`} />
              <button onClick={handleAddAlimento} className="h-[68px] w-[68px] rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center"><Plus size={32}/></button>
            </div>

            <div className="space-y-4">
               <h2 className="text-[12px] font-black uppercase italic text-center opacity-30">Diário {formatarDataParaBR(dataSelecionada)}</h2>
               {(historico[dataSelecionada] || []).map((item, idx) => (
               <div key={item._id || idx} className={`flex justify-between items-center p-6 rounded-[2.5rem] border-2 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}>
                  <div><p className="font-black uppercase italic">{item.alimento?.nome || item.nome}</p><p className="text-[11px] opacity-30">{item.alimento?.gramas || item.gramas}g • {Math.round(item.alimento?.cal || item.cal)} Kcal</p></div>
                  <button onClick={() => handleDelete(item._id, dataSelecionada)} className="text-rose-500/40 hover:text-rose-500"><Trash2 size={20}/></button>
               </div>
               ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-8 items-center p-4">
              <div className="w-24 h-24 rounded-[3rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl"><User size={40} /></div>
              <div><h2 className="text-4xl font-black italic uppercase tracking-tighter">{currentUser?.nome}</h2><p className="text-amber-500 font-black text-[10px] uppercase italic">Cloud Member</p></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => setProfileFlow(profileFlow === 'stats' ? 'menu' : 'stats')} className={btnPrimary}><Scale size={24}/> BIO-MEDIDAS</button>
              {profileFlow === 'stats' && renderBioMedidas()}
              <button onClick={() => setProfileFlow(profileFlow === 'calendario' ? 'menu' : 'calendario')} className={btnPrimary}><Calendar size={24}/> CALENDÁRIO</button>
              {profileFlow === 'calendario' && renderCalendario()}
              <button onClick={() => setProfileFlow(profileFlow === 'alimentos' ? 'menu' : 'alimentos')} className={btnPrimary}><PlusCircle size={24}/> MEUS ALIMENTOS CLOUD</button>
              {profileFlow === 'alimentos' && (
                <div className={`p-10 rounded-[4rem] border-2 space-y-6 ${dark ? 'bg-slate-900 border-indigo-500/10' : 'bg-white shadow-2xl'}`}>
                    <input placeholder="NOME DO NOVO ALIMENTO" value={novoAlimento.nome} onChange={e => setNovoAlimento({...novoAlimento, nome: e.target.value})} className={inputClass} />
                    <div className="grid grid-cols-2 gap-4">
                       <input type="number" placeholder="KCAL/100G" value={novoAlimento.c} onChange={e=>setNovoAlimento({...novoAlimento, c:e.target.value})} className={inputClass} />
                       <input type="number" placeholder="PROT (G)" value={novoAlimento.p} onChange={e=>setNovoAlimento({...novoAlimento, p:e.target.value})} className={inputClass} />
                       <input type="number" placeholder="CARB (G)" value={novoAlimento.cho} onChange={e=>setNovoAlimento({...novoAlimento, cho:e.target.value})} className={inputClass} />
                       <input type="number" placeholder="GORD (G)" value={novoAlimento.g} onChange={e=>setNovoAlimento({...novoAlimento, g:e.target.value})} className={inputClass} />
                    </div>
                    <button onClick={async () => {
                       const obj = { email: currentUser.email, nome: novoAlimento.nome.toLowerCase(), c: Number(novoAlimento.c), p: Number(novoAlimento.p||0), cho: Number(novoAlimento.cho||0), g: Number(novoAlimento.g||0) };
                       const res = await fetch(`${API_URL}/meus-alimentos`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(obj)});
                       if(res.ok) { 
                         const salvo = await res.json();
                         setMeusAlimentos(prev => ({...prev, [salvo.nome]: {c:salvo.c, p:salvo.p, cho:salvo.cho, g:salvo.g}}));
                         setNovoAlimento({nome:'', c:'', p:'', cho:'', g:''});
                         alert("Sincronizado!");
                       }
                    }} className={btnPrimary}>CADASTRAR NO BANCO</button>
                </div>
              )}
              <button onClick={() => setDark(!dark)} className={btnPrimary}>{dark ? <Sun size={24}/> : <Moon size={24}/>} MODO {dark ? 'CLARO' : 'ESCURO'}</button>
              <button onClick={() => { localStorage.removeItem('nf:session'); window.location.reload(); }} className="w-full p-8 rounded-[3rem] border-2 border-rose-500/20 text-rose-500 font-black text-[12px] mt-10 uppercase italic">Encerrar Sessão</button>
            </div>
          </div>
        )}
      </main>

      <nav className={`fixed bottom-12 left-1/2 -translate-x-1/2 w-80 p-4 flex justify-around backdrop-blur-3xl rounded-[4rem] border-2 shadow-2xl ${dark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <button onClick={()=>{setStep('perfil'); setProfileFlow('menu');}} className={`p-6 rounded-[2.5rem] ${step === 'perfil' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><User size={30}/></button>
        <button onClick={()=>setStep('resultado')} className={`p-6 rounded-[2.5rem] ${step === 'resultado' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><TrendingUp size={30}/></button>
      </nav>
    </div>
  );
};

export default App;