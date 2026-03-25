import React, { useState, useEffect } from 'react';
import { History, CheckCircle2 } from 'lucide-react';

// Importação dos seus componentes
import MacroDashboard from './components/MacroDashboard.jsx';
import FoodInput from './components/FoodInput.jsx';
import ProfileMenu from './components/ProfileMenu.jsx';
import CalendarView from './components/CalendarView.jsx';
import BottomNav from './components/BottomNav.jsx';
import MyFoods from './components/MyFoods.jsx';

const App = () => {
  // --- ESTADOS GLOBAIS ---
  const [dark, setDark] = useState(true);
  const [step, setStep] = useState('resultado'); 
  const [profileFlow, setProfileFlow] = useState('menu'); 
  
  // Ajuste sua URL e Auth aqui
  const API_URL = "http://localhost:5000"; 
  const currentUser = { email: "usuario@teste.com" };

  const [totais, setTotais] = useState({ kcal: 1250, p: 120, cho: 150, g: 45 });
  const [metas, setMetas] = useState({ kcal: 2000, p: 160, cho: 200, g: 60 });
  const [alInput, setAlInput] = useState({ nome: '', gramas: '' });
  const [sugestoes, setSugestoes] = useState([]);
  
  const hojeStr = new Date().toISOString().split('T')[0];
  const [dataSelecionada, setDataSelecionada] = useState(hojeStr);
  const [viewDate, setViewDate] = useState(new Date());
  
  const [meusAlimentos, setMeusAlimentos] = useState({}); 
  const [novoAlimento, setNovoAlimento] = useState({ nome: '', c: '', p: '', cho: '', g: '', editing: null });

  // --- SINCRONIZAÇÃO COM O BACKEND ---
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      if (!currentUser?.email) return;

      try {
        // 1. Busca os alimentos personalizados do usuário no banco
        const response = await fetch(`${API_URL}/meus-alimentos/${currentUser.email}`);
        
        if (response.ok) {
          const dadosArray = await response.json();
          
          // 2. Transforma o Array do MongoDB em Objeto para o seu sistema de busca rápida
          // Ex: [{nome: 'OVO', ...}] vira {'ovo': {nome: 'OVO', ...}}
          const dadosFormatados = dadosArray.reduce((acc, item) => {
            const chave = item.nome.toLowerCase().trim();
            acc[chave] = item;
            return acc;
          }, {});

          // 3. Atualiza o estado e o cache local
          setMeusAlimentos(dadosFormatados);
          localStorage.setItem(`nf:meus:${currentUser.email}`, JSON.stringify(dadosFormatados));
          console.log("✅ Biblioteca sincronizada com a nuvem!");
        }
      } catch (err) {
        console.error("❌ Erro ao carregar dados do servidor:", err);
        
        // Fallback: Se o servidor falhar, tenta usar o que está no localStorage
        const local = localStorage.getItem(`nf:meus:${currentUser.email}`);
        if (local) setMeusAlimentos(JSON.parse(local));
      }
    };

    carregarDadosIniciais();
  }, [currentUser.email, API_URL]);

  const isDiaAnterior = dataSelecionada !== hojeStr;
  const imcCalculado = "24.2";
  const status = { label: 'Peso Ideal', color: 'text-emerald-500', bgLight: 'bg-emerald-500/10', bg: 'bg-emerald-500', pct: '50%' };


  // Estilos padronizados
  const inputClass = `w-full p-4 rounded-2xl font-black text-[10px] uppercase outline-none transition-all ${dark ? 'bg-black border-2 border-slate-800 focus:border-indigo-500' : 'bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white'}`;
  const btnPrimary = "w-full p-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black uppercase italic text-xs shadow-xl transition-all flex items-center justify-center";

  // --- FUNÇÕES ---
  const handleAddAlimento = () => {
    if(!alInput.nome || !alInput.gramas) return;
    console.log("Adicionando ao diário:", alInput);
    // Aqui viria a sua lógica de POST para o log diário
    setAlInput({ nome: '', gramas: '' });
  };

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-500 ${dark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <header className="p-6 flex justify-between items-center">
        <h1 className="font-black italic text-xl tracking-tighter">NUTRIFIT<span className="text-indigo-600">.2</span></h1>
        <button onClick={() => setDark(!dark)} className="text-[10px] font-bold uppercase opacity-40">
          {dark ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </header>

      <main className="max-w-md mx-auto px-6 mt-4">
        {step === 'resultado' ? (
          <div className="space-y-6">
            {isDiaAnterior && (
              <div className={`flex items-center gap-3 p-4 rounded-3xl border-2 ${dark ? 'bg-indigo-50/5 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                <History size={18} />
                <p className="text-[10px] font-black uppercase italic">Visualizando: {dataSelecionada}</p>
              </div>
            )}

            <MacroDashboard totais={totais} metas={metas} dark={dark} />
            
            {!isDiaAnterior && (
              <FoodInput 
                alInput={alInput} 
                setAlInput={setAlInput} 
                sugestoes={sugestoes}
                setSugestoes={setSugestoes} 
                dbTotal={meusAlimentos} // Alterado de {} para meusAlimentos para a busca funcionar
                handleAddAlimento={handleAddAlimento} // Nome da prop corrigido para bater com o componente
                dark={dark}
                inputClass={inputClass}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {profileFlow === 'menu' && (
              <ProfileMenu setProfileFlow={setProfileFlow} imcCalculado={imcCalculado} status={status} dark={dark} />
            )}

            {profileFlow === 'calendario' && (
              <CalendarView viewDate={viewDate} setViewDate={setViewDate} dataSelecionada={dataSelecionada} setDataSelecionada={setDataSelecionada} hojeStr={hojeStr} setStep={setStep} setProfileFlow={setProfileFlow} dark={dark} />
            )}

            {profileFlow === 'alimentos' && (
              <MyFoods 
                meusAlimentos={meusAlimentos}
                setMeusAlimentos={setMeusAlimentos}
                novoAlimento={novoAlimento}
                setNovoAlimento={setNovoAlimento}
                setProfileFlow={setProfileFlow}
                currentUser={currentUser}
                API_URL={API_URL}
                dark={dark}
                inputClass={inputClass}
                btnPrimary={btnPrimary}
              />
            )}

            {profileFlow === 'setup' && (
              <div className="space-y-6 pb-20">
                <div className="flex justify-between items-center px-2">
                  <h2 className="font-black italic text-xl">Bio-Medidas</h2>
                  <button onClick={() => setProfileFlow('menu')} className="text-[10px] font-bold uppercase opacity-40">Cancelar</button>
                </div>
                
                <div className={`p-6 rounded-[2.5rem] border-2 space-y-4 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-sm'}`}>
                    <p className="text-[10px] font-black uppercase opacity-30 italic text-center">Atualize seus dados corporais</p>
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="PESO (KG)" type="number" className={inputClass} />
                        <input placeholder="ALTURA (CM)" type="number" className={inputClass} />