import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, User, Plus, Trash2, ChevronRight, Settings2,
  ChevronLeft, History, Sun, Moon, UtensilsCrossed,
  Flame, Dumbbell, Crown, AlertTriangle, CheckCircle2,
  BarChart3, Activity
} from 'lucide-react';

const API_URL = "https://nutrifit-1jhv.onrender.com";

const formatarDataParaBR = (dataStr) => {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
};

const App = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authData, setAuthData] = useState({ nome: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

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
  const [sugestoes, setSugestoes] = useState([]);
  const [novoAlimento, setNovoAlimento] = useState({ nome: '', c: '', p: '', cho: '', g: '', editing: null });

  const [showRelatorio, setShowRelatorio] = useState(false);
  const [dadosSemana, setDadosSemana] = useState(null);

  const savedStats = userObj ? localStorage.getItem(`nf:stats:${userObj.email}`) : null;
  const [userStats, setUserStats] = useState(savedStats ? JSON.parse(savedStats) : {
    peso: '70', altura: '170', idade: '25', genero: 'masculino', intensidade: '1.2', objetivo: 'manter'
  });

  const isDiaAnterior = dataSelecionada !== hojeStr;
  const [dbFixa, setDbFixa] = useState({});

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    const endpoint = authMode === 'login' ? '/login' : '/register';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro na autenticação');
      }

      if (authMode === 'login') {
        // Salva o token de segurança e os dados do usuário
        localStorage.setItem('nf:token', data.token);
        setCurrentUser({ nome: data.nome, email: data.email });
        setIsLoggedIn(true);
      } else {
        // Se cadastrou com sucesso, muda para a tela de login
        alert('Cadastro realizado com sucesso! Faça seu login.');
        setAuthMode('login');
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // 1. BUSCA DA BASE DE ALIMENTOS
  useEffect(() => {
    const carregarBaseAlimentos = async () => {
      if (!currentUser?.email) return;
      try {
        const res = await fetch(`${API_URL}/alimentos-base/${currentUser.email}`);
        if (res.ok) {
          const todosOsAlimentos = await res.json();
          const mapaGeral = {};
          const mapaUsuario = {};

          todosOsAlimentos.forEach(item => {
            const nomeChave = (item.nome || "").toLowerCase().trim();
            if (!nomeChave) return;

            const formatado = {
              c: Number(item.c) || 0,
              p: Number(item.p) || 0,
              cho: Number(item.cho) || 0,
              g: Number(item.g) || 0,
              id: item._id
            };

            mapaGeral[nomeChave] = formatado;
            if (item.userEmail !== "sistema@nutrifit.com") {
              mapaUsuario[nomeChave] = formatado;
            }
          });

          setDbFixa(mapaGeral);
          setMeusAlimentos(mapaUsuario);
          localStorage.setItem(`nf:meus:${currentUser.email}`, JSON.stringify(mapaUsuario));
        }
      } catch (err) {
        console.error("❌ Erro na base de dados:", err);
      }
    };
    carregarBaseAlimentos();
  }, [currentUser?.email]);

  // 2. BUSCA DO DIÁRIO E STATS
  useEffect(() => {
    const carregarDadosDinamicos = async () => {
      if (!currentUser?.email) return;
      const dataBR = formatarDataParaBR(dataSelecionada);
      try {
        const resRef = await fetch(`${API_URL}/refeicoes/${currentUser.email}/${encodeURIComponent(dataBR)}`);
        if (resRef.ok) {
          const dados = await resRef.json();
          setHistorico(prev => ({ ...prev, [dataSelecionada]: dados }));
        }
        const resStats = await fetch(`${API_URL}/stats/${currentUser.email}`);
        if (resStats.ok) {
          const statsNuvem = await resStats.json();
          if (statsNuvem && statsNuvem.peso) setUserStats(statsNuvem);
        }
      } catch (err) {
        console.error("❌ Erro nos dados dinâmicos:", err);
      }
    };
    carregarDadosDinamicos();
  }, [dataSelecionada, currentUser?.email]);

  const dbTotal = useMemo(() => ({ ...dbFixa, ...meusAlimentos }), [dbFixa, meusAlimentos]);

  // CORREÇÃO: Criação das "Metas" baseada no perfil do usuário
  const metas = useMemo(() => {
    const p = parseFloat(userStats.peso) || 70;
    const a = parseFloat(userStats.altura) || 170;
    const i = parseFloat(userStats.idade) || 25;
    const gen = userStats.genero || 'masculino';
    const obj = userStats.objetivo || 'manter';

    let tmb = (10 * p) + (6.25 * a) - (5 * i);
    tmb += gen === 'masculino' ? 5 : -161;

    let kcal = tmb * 1.2; // Intensidade leve padrão
    if (obj === 'perder') kcal -= 500;
    if (obj === 'ganhar') kcal += 500;

    const prot = p * 2.0;
    const gord = p * 0.8;
    const carb = (kcal - (prot * 4) - (gord * 9)) / 4;

    return {
      kcal: Math.round(kcal > 1200 ? kcal : 1200),
      p: Math.round(prot),
      cho: Math.round(carb > 0 ? carb : 0),
      g: Math.round(gord)
    };
  }, [userStats]);

  const { totais, incompleto } = useMemo(() => {
    const lista = historico[dataSelecionada] || [];
    let flag = false;

    const res = lista.reduce((acc, item) => {
      const c = Number(item.cal) || Number(item.calorias) || Number(item.kcal) || Number(item.c) || Number(item.alimento?.cal) || 0;
      const p = Number(item.p) || Number(item.proteina) || Number(item.alimento?.p) || 0;
      const cho = Number(item.cho) || Number(item.carboidrato) || Number(item.alimento?.cho) || 0;
      const g = Number(item.g) || Number(item.gordura) || Number(item.alimento?.g) || 0;

      if (c > 0 && p === 0 && cho === 0 && g === 0) flag = true;

      return { kcal: acc.kcal + c, p: acc.p + p, cho: acc.cho + cho, g: acc.g + g };
    }, { kcal: 0, p: 0, cho: 0, g: 0 });

    return { totais: res, incompleto: flag && lista.length > 0 };
  }, [historico, dataSelecionada]);

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

  const gerarRelatorioSemanal = useCallback(() => {
    const ultimos7Dias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      ultimos7Dias.push(d.toISOString().split('T')[0]);
    }
    let sK = 0, sP = 0, sC = 0, sG = 0, diasA = 0;
    ultimos7Dias.forEach(dt => {
      const dia = historico[dt] || [];
      if (dia.length > 0) {
        diasA++;
        dia.forEach(it => {
          sK += (Number(it.cal) || 0); sP += (Number(it.p) || 0);
          sC += (Number(it.cho) || 0); sG += (Number(it.g) || 0);
        });
      }
    });
    const div = diasA || 1;
    const m = { kcal: Math.round(sK / div), p: Math.round(sP / div), cho: Math.round(sC / div), g: Math.round(sG / div), dias: diasA };
    let insight = m.dias >= 5 ? "Consistência positiva!" : m.kcal > metas.kcal + 200 ? "Atenção ao excesso calórico." : "Semana equilibrada.";
    setDadosSemana({ ...m, insight });
    setShowRelatorio(true);
  }, [historico, metas]);

  const inputClass = `w-full p-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm ${dark ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500'}`;
  const btnPrimary = `w-full p-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase italic shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2`;

  // --- LÓGICA DE CÁLCULO (ANTES DO RETURN) ---
  const pesoNum = parseFloat(userStats?.peso || 0);
  const alturaNum = parseFloat(userStats?.altura || 0);
  const imcCalculado = (pesoNum > 0 && alturaNum > 0)
    ? (pesoNum / ((alturaNum / 100) ** 2)).toFixed(1)
    : "0.0";

  const getImcStatus = (valor) => {
    const v = parseFloat(valor) || 0;
    if (v === 0) return { label: "Dados pendentes", color: "text-slate-400", bg: "bg-slate-400", badge: "bg-slate-400/10", pct: "0%" };
    if (v < 18.5) return { label: "Abaixo do Peso", color: "text-blue-500", bg: "bg-blue-500", badge: "bg-blue-500/10", pct: "25%" };
    if (v < 25) return { label: "Peso Ideal", color: "text-emerald-500", bg: "bg-emerald-500", badge: "bg-emerald-500/10", pct: "50%" };
    if (v < 30) return { label: "Sobrepeso", color: "text-orange-500", bg: "bg-orange-500", badge: "bg-orange-500/10", pct: "75%" };
    return { label: "Obesidade", color: "text-red-500", bg: "bg-red-500", badge: "bg-red-500/10", pct: "100%" };
  };

  const status = getImcStatus(imcCalculado);

  // --- RENDERIZAÇÃO ---
  return (
    <div className={`min-h-screen pb-32 transition-colors duration-500 ${dark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>

      {!isLoggedIn ? (
        <div className="min-h-screen flex items-center justify-center p-6">
          <form onSubmit={handleAuth} className={`w-full max-w-sm p-8 rounded-[3rem] border-2 space-y-6 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-2xl'}`}>
            <h2 className="text-2xl font-black uppercase italic text-center text-indigo-500">
              {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
            </h2>

            {authError && <p className="text-rose-500 text-xs text-center font-bold uppercase">{authError}</p>}

            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Seu Nome"
                value={authData.nome}
                onChange={(e) => setAuthData({ ...authData, nome: e.target.value })}
                className={inputClass}
                required
              />
            )}

            <input
              type="email"
              placeholder="Seu E-mail"
              value={authData.email}
              onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
              className={inputClass}
              required
            />

            <input
              type="password"
              placeholder="Sua Senha"
              value={authData.password}
              onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
              className={inputClass}
              required
            />

            <button type="submit" className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic text-sm shadow-lg">
              {authMode === 'login' ? 'Acessar NutriFit' : 'Cadastrar'}
            </button>

            <p className="text-center text-xs opacity-50 cursor-pointer" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </p>
          </form>
        </div>
      ) : (
        <>
          {showRelatorio && dadosSemana && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
              <div className={`relative w-full max-w-sm p-8 rounded-[3.5rem] border-2 shadow-2xl ${dark ? 'bg-slate-900 border-indigo-500/30 text-white' : 'bg-white border-slate-100'}`}>
                <button onClick={() => setShowRelatorio(false)} className="absolute top-6 right-6 p-2 opacity-30 hover:opacity-100 transition-opacity"><Plus size={24} className="rotate-45" /></button>
                <div className="text-center space-y-6">
                  <div className="space-y-1"><Crown className="text-amber-500 mx-auto" /><h2 className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Relatório Semanal</h2></div>
                  <div><p className="text-[10px] font-black uppercase text-indigo-500 mb-1">Média Calórica</p><div className="flex items-baseline justify-center gap-2"><span className="text-7xl font-black italic tracking-tighter">{dadosSemana.kcal}</span><span className="text-lg font-black opacity-20 uppercase">kcal</span></div></div>
                  <div className="grid grid-cols-3 gap-4 py-6 border-y border-dashed border-slate-700/20">
                    <div><p className="text-[8px] font-black uppercase text-orange-500">Prot</p><p className="text-xl font-black italic">{dadosSemana.p}g</p></div>
                    <div><p className="text-[8px] font-black uppercase text-cyan-500">Carb</p><p className="text-xl font-black italic">{dadosSemana.cho}g</p></div>
                    <div><p className="text-[8px] font-black uppercase text-amber-300">Gord</p><p className="text-xl font-black italic">{dadosSemana.g}g</p></div>
                  </div>
                  <div className="p-5 rounded-3xl bg-indigo-600/5 border border-indigo-600/10"><p className="text-[11px] font-bold italic leading-relaxed opacity-80 text-center">"{dadosSemana.insight}"</p></div>
                  <button onClick={() => setShowRelatorio(false)} className={btnPrimary}>Fechar</button>
                </div>
              </div>
            </div>
          )}

          <header className="max-w-md mx-auto px-6 pt-12 flex justify-between items-center">
            <div><p className="text-[10px] font-black opacity-40 uppercase mb-1">{formatarDataParaBR(dataSelecionada)}</p><div className="flex items-center gap-2 font-black text-2xl uppercase italic tracking-tighter">{currentUser?.nome} <Crown size={18} className="text-amber-500 fill-amber-500" /></div></div>
            <div className="flex gap-3">
              <button onClick={gerarRelatorioSemanal} className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 active:scale-90"><BarChart3 size={20} /></button>
              <button onClick={() => {
                const newDark = !dark;
                setDark(newDark);
                localStorage.setItem('nf:theme', newDark ? 'dark' : 'light');
              }} className="p-4 rounded-2xl bg-indigo-600/10 text-indigo-600 active:scale-90">{dark ? <Sun size={20} /> : <Moon size={20} />}</button>
            </div>
          </header>

          <main className="max-w-md mx-auto px-6 mt-10">
            {step === 'resultado' ? (
              <div className="space-y-6">
                {isDiaAnterior && (
                  <div className={`flex items-center gap-3 p-4 rounded-3xl border-2 ${dark ? 'bg-indigo-50/5 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                    <History size={18} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase italic leading-tight">Dias anteriores são apenas para visualização</p>
                  </div>
                )}

                <div className={`p-10 rounded-[4rem] text-center border-4 transition-all duration-500 ${totais.kcal > metas.kcal ? 'border-rose-500 bg-rose-500/5' : 'border-emerald-500 bg-emerald-500/5'}`}>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className={`text-[100px] leading-none font-black italic tracking-tighter ${totais.kcal > metas.kcal ? 'text-rose-500' : 'text-emerald-500'}`}>{Math.round(totais.kcal)}</span>
                    <span className="text-2xl font-black italic opacity-20">/ {metas.kcal}</span>
                  </div>
                  <div className="mt-8 pt-8 border-t border-dashed border-slate-700/20 space-y-4 text-left">
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

                {!isDiaAnterior && (
                  <div className="flex gap-3 items-start">
                    <div className="relative" style={{ flex: 2 }}>
                      <input placeholder="ALIMENTO..." value={alInput.nome} onChange={e => {
                        const v = e.target.value; setAlInput({ ...alInput, nome: v });
                        if (v.length > 1) setSugestoes(Object.keys(dbTotal).filter(n => n.toLowerCase().includes(v.toLowerCase())));
                        else setSugestoes([]);
                      }} className={inputClass} />
                    </div>
                    <input placeholder="G" type="number" value={alInput.gramas} onChange={e => setAlInput({ ...alInput, gramas: e.target.value })} className={inputClass} style={{ flex: 1 }} />
                    <button onClick={handleAddAlimento} className="p-5 rounded-3xl bg-indigo-600 text-white shadow-lg active:scale-90"><Plus /></button>
                  </div>
                )}
              </div>
            ) : (
              /* --- INÍCIO DO PERFIL FLOW --- */
              <div className="space-y-6 pb-24">
                {profileFlow === 'menu' ? (
                  <div className="space-y-4">
                    <button onClick={() => setProfileFlow('calendario')} className={`w-full p-8 rounded-[2.5rem] border-2 flex justify-between items-center transition-all active:scale-95 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
                      <span className="flex items-center gap-4 text-indigo-500 font-black uppercase italic"><History /> Calendário</span>
                      <ChevronRight />
                    </button>

                    <button onClick={() => setProfileFlow('alimentos')} className={`w-full p-8 rounded-[2.5rem] border-2 flex justify-between items-center transition-all active:scale-95 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
                      <span className="flex items-center gap-4 text-amber-500 font-black uppercase italic"><UtensilsCrossed /> Meus Alimentos</span>
                      <ChevronRight />
                    </button>

                    {/* Bio Status Card */}
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
                        <div className="text-right">
                          <span className={`inline-block text-[10px] font-black uppercase px-3 py-2 rounded-xl shadow-sm ${status.badge} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${status.bg}`} style={{ width: status.pct, minWidth: '8%' }} />
                      </div>
                    </div>

                    <button onClick={() => setProfileFlow('setup')} className="w-full p-8 rounded-[2.5rem] bg-indigo-600 text-white font-black flex justify-between items-center italic uppercase shadow-xl hover:bg-indigo-700 transition-all">
                      <span className="flex items-center gap-4"><Settings2 /> Bio-Medidas</span>
                      <ChevronRight />
                    </button>

                    <button onClick={() => { localStorage.removeItem('nf:session'); window.location.reload(); }} className="w-full p-4 font-black opacity-40 uppercase text-[10px] text-center italic underline hover:opacity-100 mt-4">
                      Sair da Conta
                    </button>
                  </div>
                ) : profileFlow === 'calendario' ? (
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
                        {[...Array(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate())].map((_, i) => {
                          const diaNum = i + 1;
                          const dLoop = new Date(viewDate.getFullYear(), viewDate.getMonth(), diaNum);
                          const dataLoopStr = dLoop.toISOString().split('T')[0];
                          const isHoje = dataLoopStr === hojeStr;
                          const isSelecionado = dataLoopStr === dataSelecionada;
                          return (
                            <button key={i} onClick={() => { setDataSelecionada(dataLoopStr); setStep('resultado'); setProfileFlow('menu'); }}
                              className={`h-11 flex flex-col items-center justify-center text-[10px] font-black rounded-2xl transition-all ${isHoje ? 'border-2 border-indigo-500 text-indigo-500' : ''} ${isSelecionado ? 'bg-indigo-600 text-white shadow-lg' : ''}`}>
                              {diaNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : profileFlow === 'alimentos' ? (
                  <div className="space-y-6">
                    <button onClick={() => setProfileFlow('menu')} className="flex items-center gap-2 font-black uppercase text-[10px] opacity-40 px-4">
                      <ChevronLeft size={16} /> Voltar
                    </button>
                    {/* Lista de Alimentos - MAP COMPLETO AQUI */}
                    <div className="grid gap-4">
                      {Object.entries(meusAlimentos).map(([nome, m]) => (
                        <div key={nome} className={`p-6 rounded-[2.5rem] border-2 transition-all ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-sm'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-black text-sm uppercase italic">{nome}</p>
                              <p className="text-[9px] opacity-40 font-bold uppercase">{m.c} KCAL | P: {m.p}g C: {m.cho}g G: {m.g}g</p>
                            </div>
                            <button onClick={async () => {
                              const n = { ...meusAlimentos }; delete n[nome]; setMeusAlimentos(n);
                              localStorage.setItem(`nf:meus:${currentUser.email}`, JSON.stringify(n));
                            }} className="text-rose-500/20 hover:text-rose-500"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* SETUP / BIO-MEDIDAS */
                  <div className="space-y-4">
                    <button onClick={() => setProfileFlow('menu')} className="flex items-center gap-2 font-black uppercase text-[10px] opacity-40 px-4">
                      <ChevronLeft size={16} /> Voltar
                    </button>
                    <div className={`p-8 rounded-[3.5rem] border-2 space-y-6 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-xl'}`}>
                       {/* Aqui você pode colar os inputs de Peso, Altura, Idade que estavam no seu código de setup */}
                       <p className="text-center font-black uppercase italic opacity-20">Configurações de Perfil</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Navegação Fixa Inferior */}
          <nav className={`fixed bottom-10 left-1/2 -translate-x-1/2 w-80 p-2 flex justify-around backdrop-blur-2xl rounded-[3rem] border-2 z-50 ${dark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200 shadow-2xl'}`}>
            <button onClick={() => { setStep('perfil'); setProfileFlow('menu'); }} className={`p-5 rounded-[2rem] transition-all ${step === 'perfil' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <User size={26} />
            </button>
            <button onClick={() => setStep('resultado')} className={`p-5 rounded-[2rem] transition-all ${step === 'resultado' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <TrendingUp size={26} />
            </button>
          </nav>
        </>
      )}
    </div>
  );
};

export default App;