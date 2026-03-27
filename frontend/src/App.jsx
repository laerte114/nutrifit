import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Crown, BarChart3, Sun, Moon, Plus, LogOut } from 'lucide-react';

// Importando os componentes isolados
import BottomNav from './components/BottomNav';
import CalendarView from './components/CalendarView';
import FoodInput from './components/FoodInput';
import MacroDashboard from './components/MacroDashboard';
import MyFoods from './components/MyFoods';
import ProfileMenu from './components/ProfileMenu';
import Auth from './components/Auth'; // <-- Seu novo componente de Login!

const API_URL = "https://nutrifit-1jhv.onrender.com"; 

const formatarDataParaBR = (dataStr) => {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
};

const App = () => {
  // --- SISTEMA DE AUTENTICAÇÃO REAL ---
  const tokenSalvo = localStorage.getItem('token');
  const [isAuthenticated, setIsAuthenticated] = useState(!!tokenSalvo);
  
  const [currentUser, setCurrentUser] = useState({
    email: localStorage.getItem('email') || '',
    nome: localStorage.getItem('nome') || ''
  });

  const handleLoginSuccess = () => {
    setCurrentUser({
      email: localStorage.getItem('email'),
      nome: localStorage.getItem('nome')
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('nome');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };
  // ------------------------------------

  const [dark, setDark] = useState(localStorage.getItem('nf:theme') === 'dark');
  const [step, setStep] = useState('resultado'); 
  const [profileFlow, setProfileFlow] = useState('menu');
  
  const hojeStr = new Date().toISOString().split('T')[0];
  const [dataSelecionada, setDataSelecionada] = useState(hojeStr);
  const [viewDate, setViewDate] = useState(new Date());

  const [historico, setHistorico] = useState({}); 
  const [meusAlimentos, setMeusAlimentos] = useState({});
  
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [dadosSemana, setDadosSemana] = useState(null);

  const savedStats = currentUser ? localStorage.getItem(`nf:stats:${currentUser.email}`) : null;
  const [userStats, setUserStats] = useState(savedStats ? JSON.parse(savedStats) : {
    peso: '70', altura: '170', idade: '25', genero: 'masculino', intensidade: '1.2', objetivo: 'manter'
  });

  const isDiaAnterior = dataSelecionada !== hojeStr;
  const [dbFixa, setDbFixa] = useState({});

  // 1. BUSCA DA BASE DE ALIMENTOS (COM TOKEN)
  useEffect(() => {
    const carregarBaseAlimentos = async () => {
      if (!isAuthenticated || !currentUser?.email) return;
      
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/alimentos-base/${currentUser.email}`, {
          headers: { 'Authorization': `Bearer ${token}` } // <-- Crachá enviado!
        });

        if (res.status === 401) return handleLogout(); // Se o token expirou, desloga

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
        }
      } catch (err) {
        console.error("❌ Erro na base de dados:", err);
      }
    };
    carregarBaseAlimentos();
  }, [currentUser?.email, isAuthenticated]);

  // 2. BUSCA DO DIÁRIO E STATS (COM TOKEN)
  useEffect(() => {
    const carregarDadosDinamicos = async () => {
      if (!isAuthenticated || !currentUser?.email) return;
      
      const token = localStorage.getItem('token');
      const dataBR = formatarDataParaBR(dataSelecionada);
      
      try {
        const resRef = await fetch(`${API_URL}/refeicoes/${currentUser.email}/${encodeURIComponent(dataBR)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resRef.status === 401) return handleLogout();

        if (resRef.ok) {
          const dados = await resRef.json();
          setHistorico(prev => ({ ...prev, [dataSelecionada]: dados }));
        }

        const resStats = await fetch(`${API_URL}/stats/${currentUser.email}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resStats.ok) {
          const statsNuvem = await resStats.json();
          if (statsNuvem && statsNuvem.peso) setUserStats(statsNuvem);
        }
      } catch (err) {
        console.error("❌ Erro nos dados dinâmicos:", err);
      }
    };
    carregarDadosDinamicos();
  }, [dataSelecionada, currentUser?.email, isAuthenticated]);

  const dbTotal = useMemo(() => ({ ...dbFixa, ...meusAlimentos }), [dbFixa, meusAlimentos]);

  const metas = useMemo(() => {
    const p = parseFloat(userStats.peso) || 70;
    const a = parseFloat(userStats.altura) || 170;
    const i = parseFloat(userStats.idade) || 25;
    const gen = userStats.genero || 'masculino';
    const obj = userStats.objetivo || 'manter';
    
    let tmb = (10 * p) + (6.25 * a) - (5 * i);
    tmb += gen === 'masculino' ? 5 : -161;
    
    let kcal = tmb * 1.2; 
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
    const m = { kcal: Math.round(sK/div), p: Math.round(sP/div), cho: Math.round(sC/div), g: Math.round(sG/div), dias: diasA };
    let insight = m.dias >= 5 ? "Consistência positiva!" : m.kcal > metas.kcal + 200 ? "Atenção ao excesso calórico." : "Semana equilibrada.";
    setDadosSemana({ ...m, insight });
    setShowRelatorio(true);
  }, [historico, metas]);

  const btnPrimary = `w-full p-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase italic shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2`;

  // --- SE NÃO ESTIVER LOGADO, MOSTRA A TELA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${dark ? 'bg-slate-950' : 'bg-slate-50'}`}>
         {/* Passamos a função handleLoginSuccess para o Auth avisar o App que deu certo */}
         <Auth onLoginSuccess={handleLoginSuccess} /> 
      </div>
    );
  }

  const pesoNum = parseFloat(userStats?.peso || 0);
  const alturaNum = parseFloat(userStats?.altura || 0);
  const imcCalculado = (pesoNum > 0 && alturaNum > 0) ? (pesoNum / ((alturaNum / 100) ** 2)).toFixed(1) : "0.0";

  const getImcStatus = (valor) => {
    const v = parseFloat(valor) || 0;
    if (v === 0) return { label: "Dados pendentes", color: "text-slate-400", bg: "bg-slate-400", bgLight: "bg-slate-100", pct: "0%" };
    if (v < 18.5) return { label: "Abaixo do Peso", color: "text-blue-500", bg: "bg-blue-500", bgLight: "bg-blue-500/10", pct: "25%" };
    if (v < 25) return { label: "Peso Ideal", color: "text-emerald-500", bg: "bg-emerald-500", bgLight: "bg-emerald-500/10", pct: "50%" };
    if (v < 30) return { label: "Sobrepeso", color: "text-orange-500", bg: "bg-orange-500", bgLight: "bg-orange-500/10", pct: "75%" };
    return { label: "Obesidade", color: "text-red-500", bg: "bg-red-500", bgLight: "bg-red-500/10", pct: "100%" };
  };
  const status = getImcStatus(imcCalculado);

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-500 ${dark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Relatorio Modal Omitido por brevidade visual, está mantido como o original */}
      {showRelatorio && dadosSemana && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
          <div className={`relative w-full max-w-sm p-8 rounded-[3.5rem] border-2 shadow-2xl ${dark ? 'bg-slate-900 border-indigo-500/30 text-white' : 'bg-white border-slate-100'}`}>
            <button onClick={() => setShowRelatorio(false)} className="absolute top-6 right-6 p-2 opacity-30 hover:opacity-100 transition-opacity"><Plus size={24} className="rotate-45" /></button>
            <div className="text-center space-y-6">
              <div className="space-y-1"><Crown className="text-amber-500 mx-auto"/><h2 className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Relatório Semanal</h2></div>
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
        <div>
          <p className="text-[10px] font-black opacity-40 uppercase mb-1">{formatarDataParaBR(dataSelecionada)}</p>
          <div className="flex items-center gap-2 font-black text-2xl uppercase italic tracking-tighter">
            {currentUser?.nome} <Crown size={18} className="text-amber-500 fill-amber-500" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={gerarRelatorioSemanal} className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 active:scale-90"><BarChart3 size={20}/></button>
          <button onClick={() => {
            const newDark = !dark;
            setDark(newDark);
            localStorage.setItem('nf:theme', newDark ? 'dark' : 'light');
          }} className="p-4 rounded-2xl bg-indigo-600/10 text-indigo-600 active:scale-90">{dark ? <Sun size={20}/> : <Moon size={20}/>}</button>
          {/* BOTÃO DE LOGOUT ADICIONADO AQUI */}
          <button onClick={handleLogout} className="p-4 rounded-2xl bg-red-500/10 text-red-600 active:scale-90"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 mt-10">
        {step === 'resultado' ? (
          <div className="space-y-6">
            <MacroDashboard 
              dark={dark} 
              isDiaAnterior={isDiaAnterior} 
              totais={totais} 
              metas={metas} 
              incompleto={incompleto} 
            />
            <FoodInput 
              dark={dark} 
              isDiaAnterior={isDiaAnterior} 
              dbTotal={dbTotal} 
              historico={historico} 
              dataSelecionada={dataSelecionada} 
              setHistorico={setHistorico} 
              currentUser={currentUser} 
              API_URL={API_URL} 
            />
          </div>
        ) : (
          <div className="space-y-6 pb-24">
            {(profileFlow === 'menu' || profileFlow === 'setup') && (
              <ProfileMenu 
                dark={dark} 
                profileFlow={profileFlow} 
                setProfileFlow={setProfileFlow} 
                imcCalculado={imcCalculado} 
                status={status} 
                userStats={userStats} 
                setUserStats={setUserStats} 
                currentUser={currentUser} 
                API_URL={API_URL} 
              />
            )}

            {profileFlow === 'calendario' && (
              <CalendarView 
                dark={dark} 
                viewDate={viewDate} 
                setViewDate={setViewDate} 
                dataSelecionada={dataSelecionada} 
                setDataSelecionada={setDataSelecionada} 
                setStep={setStep} 
                setProfileFlow={setProfileFlow} 
                hojeStr={hojeStr} 
              />
            )}

            {profileFlow === 'alimentos' && (
              <MyFoods 
                dark={dark} 
                setProfileFlow={setProfileFlow} 
                meusAlimentos={meusAlimentos} 
                setMeusAlimentos={setMeusAlimentos} 
                currentUser={currentUser} 
                API_URL={API_URL} 
              />
            )}
          </div>
        )}
      </main>

      <BottomNav 
        dark={dark} 
        step={step} 
        setStep={setStep} 
        setProfileFlow={setProfileFlow} 
      />
    </div>
  );
};

export default App;