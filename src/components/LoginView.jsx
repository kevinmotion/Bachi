import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogIn, UserPlus, Mail, Lock, Loader2, Heart } from 'lucide-react';

export default function LoginView() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        alert('Registro exitoso. Por favor verifica tu correo si es necesario.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-accent rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-zinc-200">
            <Heart className="text-accent-foreground fill-accent-foreground" size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif italic text-4xl text-zinc-900 dark:text-zinc-100">Gastos en Pareja</h1>
            <p className="text-zinc-400 text-sm">Sincroniza tus finanzas con amor y orden.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-100 dark:shadow-none space-y-6">
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-950 rounded-2xl">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${isLogin ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-400 dark:text-zinc-500'}`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${!isLogin ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-400 dark:text-zinc-500'}`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest opacity-30 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest opacity-30 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-medium animate-in shake duration-300">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-5 rounded-[24px] font-bold text-sm flex items-center justify-center gap-2 shadow-2xl shadow-zinc-200 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                isLogin ? <LogIn size={20} /> : <UserPlus size={20} />
              )}
              {isLogin ? 'Entrar' : 'Crear Cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
          Seguro y Privado • Powered by Supabase
        </p>
      </div>
    </div>
  );
}
