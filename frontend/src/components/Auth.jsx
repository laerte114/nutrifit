import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, Crown } from 'lucide-react';

export default function Auth({ onLoginSuccess, dark }) {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  // Sincronizado com a URL do seu App.jsx
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

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro na requisição');
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', data.email);
        localStorage.setItem('nome', data.nome);
        onLoginSuccess(); 
      } else {
        alert('Conta criada com sucesso! Por favor, faça login.');
        setIsLogin(true);
      }
    } catch (error) {
      setErro(error.message);
    }
  };

  // Estilo de botão padrão do seu App.jsx
  const btnPrimary = `w-full p-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase italic shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4`;
  
  const inputStyle = `w-full p-4 rounded-2xl border-2 transition-all outline-none ${
    dark 
    ? 'bg-slate-900 border-slate-800 text-white focus:border-indigo-500' 
    : 'bg-white border-slate-100 text-slate-900 focus:border-indigo-600'
  }`;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-10 space-y-2">
        <div className="flex justify-center mb-4">
            <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20">
                <Crown size={32} className="text-white fill-white" />
            </div>
        </div>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter">
          {isLogin ? 'Entrar no' : 'Criar conta'}
          <span className="block text-indigo-600">NutriFit</span>
        </h2>
        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">
          Sua evolução começa aqui
        </p>
      </div>

      {erro && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
            <input 
              className={`${inputStyle} pl-12`}
              type="text" 
              placeholder="SEU NOME" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              required 
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
          <input 
            className={`${inputStyle} pl-12`}
            type="email" 
            placeholder="E-MAIL" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
          <input 
            className={`${inputStyle} pl-12`}
            type="password" 
            placeholder="SENHA" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" className={btnPrimary}>
          {isLogin ? 'Entrar Agora' : 'Finalizar Cadastro'}
          {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)} 
        className="w-full mt-8 text-[11px] font-black uppercase italic opacity-60 hover:opacity-100 transition-opacity tracking-wider"
      >
        {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já possui uma conta? Voltar ao login'}
      </button>
    </div>
  );
}