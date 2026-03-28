import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, Crown, ArrowRight } from 'lucide-react';

export default function Auth({ onLoginSuccess, dark }) {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  // URL de Produção sincronizada com seu App.jsx
  const API_URL = "https://nutrifit-1jhv.onrender.com"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    const endpoint = isLogin ? '/login' : '/register';
    const bodyData = isLogin ? { email, password } : { nome, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Erro na requisição');

      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', data.email);
        localStorage.setItem('nome', data.nome);
        onLoginSuccess(); 
      } else {
        alert('Conta criada com sucesso! Faça login.');
        setIsLogin(true);
      }
    } catch (error) {
      setErro(error.message);
    }
  };

  const inputStyle = `w-full p-4 rounded-2xl border-2 transition-all outline-none ${
    dark 
    ? 'bg-slate-900 border-slate-800 text-white focus:border-indigo-500' 
    : 'bg-white border-slate-100 text-slate-900 focus:border-indigo-600'
  }`;

  return (
    <div className="w-full max-w-sm mx-auto animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/40 rotate-3">
                <Crown size={32} className="text-white fill-white" />
            </div>
        </div>
        
        {/* Título com cor explícita para não ficar "apagado" */}
        <h2 className={`text-4xl font-black uppercase italic tracking-tighter leading-none ${dark ? 'text-white' : 'text-slate-900'}`}>
          {isLogin ? 'Entrar no' : 'Criar conta'}
          <span className="block text-indigo-600">NutriFit</span>
        </h2>
        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-2">
          {isLogin ? 'Bem-vindo de volta, atleta' : 'Junte-se à elite do treino'}
        </p>
      </div>

      {erro && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase text-center">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {!isLogin && (
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={18} />
            <input className={`${inputStyle} pl-12`} type="text" placeholder="SEU NOME" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
        )}

        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={18} />
          <input className={`${inputStyle} pl-12`} type="email" placeholder="E-MAIL" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={18} />
          <input className={`${inputStyle} pl-12`} type="password" placeholder="SENHA" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="w-full p-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase italic shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
          {isLogin ? 'Acessar Painel' : 'Finalizar Cadastro'}
          <ArrowRight size={20} />
        </button>
      </form>

      {/* Botão de alternância MUITO mais visível */}
      <div className="mt-10 text-center">
        <p className={`text-[10px] font-black uppercase opacity-40 mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
          {isLogin ? 'Novo por aqui?' : 'Já é membro?'}
        </p>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="px-6 py-2 rounded-xl border border-indigo-600/30 text-indigo-500 text-[11px] font-black uppercase italic hover:bg-indigo-600 hover:text-white transition-all"
        >
          {isLogin ? 'Criar Nova Conta' : 'Voltar para Login'}
        </button>
      </div>
    </div>
  );
}