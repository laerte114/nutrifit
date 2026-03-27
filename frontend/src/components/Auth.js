import React, { useState } from 'react';

// Recebe a função onLoginSuccess do componente pai (App.js)
export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Login e Registro
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  // Troque pela URL do seu backend no Render quando for para produção
  const API_URL = 'http://localhost:3001'; 

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
        // LOGIN COM SUCESSO: Salva os dados no navegador
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', data.email);
        localStorage.setItem('nome', data.nome);
        
        // Avisa o App.js que o usuário logou!
        onLoginSuccess(); 
      } else {
        // REGISTRO COM SUCESSO: Alterna para a tela de login
        alert('Conta criada com sucesso! Por favor, faça login.');
        setIsLogin(true);
      }
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>{isLogin ? 'Entrar no NutriFit' : 'Criar Nova Conta'}</h2>
      
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!isLogin && (
          <input 
            type="text" 
            placeholder="Seu Nome" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            required 
          />
        )}
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">
          {isLogin ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)} 
        style={{ marginTop: '15px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
      >
        {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
      </button>
    </div>
  );
}