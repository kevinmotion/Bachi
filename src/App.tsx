import React, { useState, useEffect } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { useCategories } from './hooks/useCategories';
import ExpenseForm from './components/ExpenseForm';
import BalanceCard from './components/BalanceCard';
import ExpenseList from './components/ExpenseList';
import Layout from './components/Layout';
import SettingsView from './components/SettingsView';
import AnalyticsView from './components/AnalyticsView';
import LoginView from './components/LoginView';
import { supabase } from './lib/supabaseClient';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, PlusCircle, History, LayoutDashboard, LogOut, Loader2, PieChart, Plus } from 'lucide-react';

import { useTheme } from './hooks/useTheme';

export default function App() {
  // Comentario para habilitar un nuevo commit
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error);
          if (error.message.includes("Refresh Token Not Found") || error.message.includes("Invalid Refresh Token")) {
            await supabase.auth.signOut();
          }
          setSession(null);
          setLoading(false);
          return;
        }
        setSession(session);
        if (session) fetchProfile(session.user.id, session.user.email || '');
        else setLoading(false);
      } catch (err) {
        console.error("Unexpected session error:", err);
        setSession(null);
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id, session.user.email || '');
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      // Use upsert to ensure profile exists
      const { data, error } = await supabase
        .from('perfiles')
        .upsert({ 
          id: userId, 
          email: email,
          // Only set defaults if it's a new record (Supabase upsert handles this if we don't provide them and they have defaults, 
          // but here we want to ensure nombre and partner_name have something if it's the first time)
        }, { onConflict: 'id' })
        .select()
        .single();
      
      if (error) throw error;

      // If nombre is null (newly created profile via upsert without defaults in DB), 
      // we might want to update it with defaults if it's the first time.
      // But better yet, let's just fetch and if it's empty, update.
      
      if (!data.nombre) {
        const { data: updatedData, error: updateError } = await supabase
          .from('perfiles')
          .update({ 
            nombre: 'Usuario', 
            espacio_shared_id: userId 
          })
          .eq('id', userId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        setProfile(updatedData);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const { 
    filteredExpenses, 
    filters, 
    updateFilters, 
    isLoading, 
    error: expensesError, 
    addExpense, 
    deleteExpense, 
    updateExpense, 
    balances,
    spaceUsers
  } = useExpenses(
    profile?.nombre || 'Yo',
    'Pareja', // Static fallback, will be overridden by spaceUsers logic
    profile
  );

  const { 
    categories, 
    isLoading: categoriesLoading, 
    error: categoriesError,
    addCategory, 
    updateCategory,
    deleteCategory 
  } = useCategories(profile);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-900 dark:text-zinc-100" size={32} />
      </div>
    );
  }

  if (!session) {
    return <LoginView />;
  }

  // Null guard for profile
  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="animate-spin text-zinc-900 dark:text-zinc-100" size={32} />
        <p className="text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">Cargando perfil y sincronizando datos...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        const currentDate = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <header className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-400 dark:text-zinc-500 capitalize">{currentDate}</p>
                <h1 className="font-serif italic text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight">Hola, {profile?.nombre || 'Usuario'}</h1>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 shadow-sm hover:text-rose-500 dark:hover:text-rose-400 transition-colors active:scale-90"
              >
                <LogOut size={16} />
              </button>
            </header>

            <BalanceCard 
              netBalance={isLoading ? null : balances.netBalance} 
              spaceUsers={spaceUsers}
              isLoading={isLoading}
            />

            <section className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-zinc-950 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-0 h-[90px]">
                <div className="flex items-center justify-center opacity-60 text-zinc-500 dark:text-zinc-400">
                  <p className="text-[7px] md:text-[8px] uppercase font-medium tracking-[0.15em] leading-tight">Gasto Total Mes</p>
                </div>
                <div className="flex items-start justify-center gap-0.5">
                  <span className="text-[10px] md:text-xs font-medium opacity-40 mt-[5px]">S/</span>
                  <p className="text-[25px] font-sans font-black text-zinc-900 dark:text-zinc-100 tracking-tighter break-words leading-[25px] mt-[5px] mb-[3px]">
                    {balances.totalGeneralPEN.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-950 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-[#f4f4f5] dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-0 h-[90px]">
                <div className="flex items-center justify-center text-[#71717b] dark:text-zinc-400">
                  <p className="text-[7px] md:text-[8px] uppercase font-medium tracking-[0.15em] leading-tight">Mi Gasto</p>
                </div>
                <div className="flex items-start justify-center gap-0.5">
                  <span className="text-[10px] md:text-xs font-medium text-[#18181b] dark:text-zinc-400 opacity-40 mt-[5px]">S/</span>
                  <p className="text-[25px] font-sans font-black text-[#18181b] dark:text-zinc-100 tracking-tighter break-words leading-[25px] mt-[5px] mb-[3px]">
                    {(balances.totals[profile?.id] || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </section>
          </div>
        );
      case 'registry':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8 space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 dark:text-zinc-500">Movimientos</p>
              <h2 className="font-serif italic text-3xl text-zinc-900 dark:text-zinc-100">Historial</h2>
            </header>

            <section className="space-y-6">
              {isLoading ? (
                <div className="p-12 text-center animate-pulse text-zinc-400 dark:text-zinc-500 italic bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800">
                  Cargando transacciones...
                </div>
              ) : (
                <ExpenseList 
                  expenses={filteredExpenses} 
                  onDeleteExpense={deleteExpense} 
                  onUpdateExpense={updateExpense}
                  spaceUsers={spaceUsers}
                  filters={filters}
                  onFilterChange={updateFilters}
                  categories={categories}
                />
              )}
            </section>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 dark:text-zinc-500">Visualización</p>
              <h2 className="font-serif italic text-3xl text-zinc-900 dark:text-zinc-100">Análisis</h2>
            </header>
            <AnalyticsView 
              expenses={filteredExpenses} 
              spaceUsers={spaceUsers}
              categories={categories}
            />
          </div>
        );
      case 'settings':
        return (
          <SettingsView 
            profile={profile} 
            onProfileUpdate={handleProfileUpdate} 
            categories={categories}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
            categoriesLoading={categoriesLoading}
            theme={theme}
            setTheme={setTheme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      isDrawerOpen={isDrawerOpen}
      onDrawerChange={setIsDrawerOpen}
      fabContent={
        <ExpenseForm 
          onAddExpense={addExpense} 
          categories={categories}
          spaceUsers={spaceUsers}
          currentUserId={profile?.id}
        />
      }
    >
      {(expensesError || categoriesError) && (
        <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-[32px] text-sm shadow-sm animate-in fade-in slide-in-from-top-4">
          <p className="font-bold mb-1">Error Técnico:</p>
          <p className="font-mono text-xs">{expensesError || categoriesError}</p>
        </div>
      )}

      {renderView()}
    </Layout>
  );
}
