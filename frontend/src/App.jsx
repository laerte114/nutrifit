import React, { useState, useEffect } from 'react';
import { History, Trash2, ChevronLeft } from 'lucide-react';

// Importação dos seus novos componentes
import MacroDashboard from './components/MacroDashboard.jsx';
import FoodInput from './components/FoodInput.jsx';
import ProfileMenu from './components/ProfileMenu.jsx';
import CalendarView from './components/CalendarView.jsx';
import BottomNav from './components/BottomNav.jsx';

const App = () => {
  // --- ESTADOS GLOBAIS ---
  const [dark, setDark] = useState(true);
  const [step, setStep] = useState('resultado'); // 'resultado' ou 'perfil'
  const [profileFlow, setProfileFlow] = useState('menu'); // 'menu', 'calendario', 'alimentos', 'setup'
  
  // Dados de exemplo (substitua pela sua lógica de carregamento/API)
  const [totais, setTotais] = useState({ kcal: 1250, p: 120, cho: 150, g: 45 });
  const [metas, setMetas] = useState({ kcal: 2000, p: 160, cho: 200, g: 60 });
  const [alInput, setAlInput] = useState({ nome: '', gramas: '' });
  const [sugestoes, setSugestoes] = useState([]);
  
  const hojeStr = new Date().toISOString().split('T')[0];
  const [dataSelecionada, setDataSelecionada] = useState(hojeStr);
  const [viewDate, setViewDate] = useState(new Date());
  
  const [meusAlimentos, setMeusAlimentos] = useState({}); // Seus alimentos salvos
  const isDiaAnterior = dataSelecionada !== hojeStr;

  // Mock de dados de Bio-Status
  const imcCalculado = "24.2";
  const status = { label: 'Peso Ideal', color: 'text-emerald-500', badge: 'bg-emerald-500/10', bg: 'bg-emerald-500', pct: '50%' };

  // --- FUNÇÕES ---
  const handleAddAlimento = () => {
    console.log("Adicionando:", alInput);
    // Sua lógica de soma de macros aqui
    setAlInput({ nome: '', gramas: '' });
  };

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-500 ${dark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header Simples */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="font-black italic text-xl tracking-tighter">NUTRIFIT<span className="text-indigo-600">.2</span></h1>
        <button onClick={() => setDark(!dark)} className="text-[10px] font-bold uppercase opacity-40">
          {dark ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </header>

      <main className="max-w-md mx-auto px-6 mt-4">
        {step === 'resultado' ? (
          <div className="space-y-6">
            {/* Aviso de histórico */}
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
                setSugestoes={setSugestoes} 
                dbTotal={{}} // Passe seu banco de dados de alimentos aqui
                handleAdd={handleAddAlimento}
                dark={dark}
              />
            )}
          </div>
        ) : (
          /* Fluxo de Perfil */
          <div className="space-y-6">
            {profileFlow === 'menu' && (
              <ProfileMenu 
                setProfileFlow={setProfileFlow} 
                imcCalculado={imcCalculado} 
                status={status} 
                dark={dark} 
              />
            )}

            {profileFlow === 'calendario' && (
              <CalendarView 
                viewDate={viewDate}
                setViewDate={setViewDate}
                dataSelecionada={dataSelecionada}
                setDataSelecionada={setDataSelecionada}
                hojeStr={hojeStr}
                setStep={setStep}
                setProfileFlow={setProfileFlow}
                dark={dark}
              />
            )}

            {profileFlow === 'alimentos' && (
              <div className="space-y-6">
                <button onClick={() => setProfileFlow('menu')} className="flex items-center gap-2 font-black uppercase text-[10px] opacity-40 px-4">
                  <ChevronLeft size={16} /> Voltar
                </button>
                <div className="grid gap-4">
                  {Object.keys(meusAlimentos).length === 0 ? (
                    <p className="text-center opacity-30 py-10">Nenhum alimento salvo.</p>
                  ) : (
                    Object.entries(meusAlimentos).map(([nome, m]) => (
                      <div key={nome} className={`p-6 rounded-[2.5rem] border-2 flex justify-between items-center ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white shadow-sm'}`}>
                        <div>
                          <p className="font-black text-sm uppercase italic">{nome}</p>
                          <p className="text-[9px] opacity-40 font-bold uppercase">{m.kcal} kcal</p>
                        </div>
                        <button className="text-rose-500/50"><Trash2 size={18} /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {profileFlow === 'setup' && (
              <div className="text-center py-20 opacity-20 font-black uppercase italic">
                <button onClick={() => setProfileFlow('menu')} className="block mb-4 italic underline">Voltar</button>
                Configurações de Bio-Medidas
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navegação Fixa */}
      <BottomNav step={step} setStep={setStep} setProfileFlow={setProfileFlow} dark={dark} />
    </div>
  );
};

export default App;