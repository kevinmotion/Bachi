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

export default function App() {
  // Comentario para habilitar un nuevo commit
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id, session.user.email || '');
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    profile?.espacio_shared_id
  );

  const { 
    categories, 
    isLoading: categoriesLoading, 
    error: categoriesError,
    addCategory, 
    updateCategory,
    deleteCategory 
  } = useCategories(profile?.espacio_shared_id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
      </div>
    );
  }

  if (!session) {
    return <LoginView />;
  }

  // Null guard for profile
  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
        <p className="text-zinc-500 font-medium animate-pulse">Cargando perfil y sincronizando datos...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <header className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-400">Resumen Mensual</p>
                <h1 className="font-serif italic text-3xl text-zinc-900 tracking-tight">Hola, {profile?.nombre || 'Usuario'}</h1>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 bg-white border border-zinc-100 rounded-full flex items-center justify-center text-zinc-400 shadow-sm hover:text-rose-500 transition-colors active:scale-90"
              >
                <LogOut size={16} />
              </button>
            </header>

            <BalanceCard 
              netBalance={balances.netBalance} 
              spaceUsers={spaceUsers}
            />

            <section className="grid grid-cols-2 gap-3">
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-3">
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-400 font-sans">Gasto Total Mes</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-sans font-black text-zinc-900 tracking-tight">S/ {balances.totalGeneralPEN.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-zinc-900 p-6 rounded-[32px] shadow-xl shadow-zinc-200 space-y-3">
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-300 font-sans">Mi Gasto</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-sans font-black text-white tracking-tight">S/ {(balances.totals[profile?.id] || 0).toFixed(2)}</span>
                </div>
              </div>
            </section>
          </div>
        );
      case 'registry':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8 space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400">Movimientos</p>
              <h2 className="font-serif italic text-3xl text-zinc-900">Historial</h2>
            </header>

            <section className="space-y-6">
              {isLoading ? (
                <div className="p-12 text-center animate-pulse text-zinc-400 italic bg-white rounded-[40px] border border-zinc-100">
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
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400">Visualización</p>
              <h2 className="font-serif italic text-3xl text-zinc-900">Análisis</h2>
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
        <div className="mb-8 p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-[32px] text-sm shadow-sm animate-in fade-in slide-in-from-top-4">
          <p className="font-bold mb-1">Error Técnico:</p>
          <p className="font-mono text-xs">{expensesError || categoriesError}</p>
        </div>
      )}

      {renderView()}
    </Layout>
  );
}
