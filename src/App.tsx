import React, { useState, useEffect } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { useCategories } from './hooks/useCategories';
import ExpenseForm from './components/ExpenseForm';
import BalanceCard from './components/BalanceCard';
import ExpenseList from './components/ExpenseList';
import FoodBalanceCard from './components/FoodBalanceCard';
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
  const { theme, setTheme, accent, setAccent } = useTheme();

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
      // First, try to fetch the existing profile
      let { data, error } = await supabase
        .from('perfiles')
        .select()
        .eq('id', userId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newData, error: insertError } = await supabase
          .from('perfiles')
          .insert({ 
            id: userId, 
            email: email,
            nombre: 'Usuario', 
            espacio_shared_id: userId,
            accent_color: accent // Use current local accent as default for new profile
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        data = newData;
      } else if (error) {
        throw error;
      }

      // If we have data, set profile and accent
      if (data) {
        setProfile(data);
        if (data.accent_color) {
          setAccent(data.accent_color);
        }
      }
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const { 
    expenses,
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
    setAccent('default');
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] dark:bg-zinc-950 flex items-center justify-center">
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
      <div className="min-h-screen bg-[#fbfbfb] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
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
          <>
            <header className="px-8 pt-8 pb-6 flex justify-between items-start text-header-fg">
              <div className="space-y-1">
                <h1 className="font-serif italic text-4xl tracking-tight">Hola, {profile?.nombre || 'Usuario'}</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-80 capitalize">{currentDate}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 bg-white/10 dark:bg-black/10 border border-white/20 dark:border-black/20 rounded-full flex items-center justify-center text-accent-foreground shadow-sm hover:opacity-80 transition-all active:scale-90"
              >
                <LogOut size={16} className="text-header-fg" />
              </button>
            </header>
            <div className="flex-1 bg-[#fbfbfb] dark:bg-zinc-950 rounded-t-[32px] p-6 md:p-8 space-y-8 pb-32">
              <BalanceCard 
                netBalance={isLoading ? null : balances.netBalance} 
                spaceUsers={spaceUsers}
                isLoading={isLoading}
              />

            <section className="grid grid-cols-2 gap-3 mb-[15px]">
              <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-0 h-[90px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-20" />
                <div className="flex items-center justify-center opacity-60 text-zinc-500 dark:text-zinc-400">
                  <p className="text-[7px] md:text-[8px] uppercase font-medium tracking-[0.15em] leading-tight">Gasto Total Mes</p>
                </div>
                <div className="flex items-start justify-center gap-0.5">
                  <span className="text-[10px] md:text-xs font-medium opacity-40 mt-[5px]">S/</span>
                  <p className="text-[25px] font-sans font-black text-accent tracking-tighter break-words leading-[25px] mt-[5px] mb-[3px]">
                    {balances.totalGeneralPEN.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-[32px] border border-[#f4f4f5] dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-0 h-[90px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-20" />
                <div className="flex items-center justify-center text-[#71717b] dark:text-zinc-400">
                  <p className="text-[7px] md:text-[8px] uppercase font-medium tracking-[0.15em] leading-tight">Mi Gasto</p>
                </div>
                <div className="flex items-start justify-center gap-0.5">
                  <span className="text-[10px] md:text-xs font-medium text-[#18181b] dark:text-zinc-400 opacity-40 mt-[5px]">S/</span>
                  <p className="text-[25px] font-sans font-black text-accent tracking-tighter break-words leading-[25px] mt-[5px] mb-[3px]">
                    {(balances.totals[profile?.id] || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </section>

            <FoodBalanceCard expenses={expenses} />
            </div>
          </>
        );
      case 'registry':
        return (
          <>
            <header className="px-8 pt-8 pb-6 space-y-1 text-header-fg">
              <h2 className="font-serif italic text-4xl tracking-tight">Historial</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-80">Movimientos</p>
            </header>
            <div className="flex-1 bg-[#fbfbfb] dark:bg-zinc-950 rounded-t-[32px] p-6 md:p-8 pb-32">
              <section className="space-y-6">
                {isLoading ? (
                  <div className="p-12 text-center animate-pulse text-zinc-400 dark:text-zinc-500 italic bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
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
          </>
        );
      case 'analytics':
        return (
          <>
            <header className="px-8 pt-8 pb-6 space-y-1 text-header-fg">
              <h2 className="font-serif italic text-4xl tracking-tight">Análisis</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-80">Visualización</p>
            </header>
            <div className="flex-1 bg-[#fbfbfb] dark:bg-zinc-950 rounded-t-[32px] p-6 md:p-8 pb-32">
              <AnalyticsView 
                expenses={filteredExpenses} 
                spaceUsers={spaceUsers}
                categories={categories}
              />
            </div>
          </>
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
            accent={accent}
            setAccent={setAccent}
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
