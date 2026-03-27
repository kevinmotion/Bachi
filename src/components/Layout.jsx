import React, { useState } from 'react';
import { Home, List, Settings, Plus, X, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ 
  children, 
  currentView, 
  onViewChange, 
  fabContent = null,
  isDrawerOpen: externalIsDrawerOpen,
  onDrawerChange
}) {
  const [internalIsDrawerOpen, setInternalIsDrawerOpen] = useState(false);
  
  const isDrawerOpen = externalIsDrawerOpen !== undefined ? externalIsDrawerOpen : internalIsDrawerOpen;
  const setIsDrawerOpen = onDrawerChange || setInternalIsDrawerOpen;

  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'registry', icon: List, label: 'Historial' },
    { id: 'analytics', icon: PieChart, label: 'Análisis' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  const handleFabClick = () => {
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <main className="max-w-2xl mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FAB */}
      {fabContent && currentView !== 'settings' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFabClick}
          className="fixed bottom-24 right-6 w-16 h-16 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-zinc-400 z-40"
        >
          <Plus size={28} />
        </motion.button>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-6 py-4 z-50">
        <div className="max-w-2xl mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`relative flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                  isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-zinc-50' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 w-1 h-1 bg-zinc-900 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {isDrawerOpen && fabContent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 md:max-w-lg md:mx-auto bg-white z-[70] max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-b-[40px] md:rounded-b-[32px]"
            >
              <div className="p-5 pt-6 relative">
                <div className="absolute top-3 left-1/2 -translate-x-1/2">
                  <div className="w-10 h-1 bg-zinc-100 rounded-full" />
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute top-3 right-5 w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors z-10"
                >
                  <X size={16} />
                </button>
                {React.cloneElement(fabContent, { 
                  onSuccess: () => setIsDrawerOpen(false) 
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
