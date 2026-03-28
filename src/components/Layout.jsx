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

  const navItemsLeft = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'registry', icon: List, label: 'Historial' },
  ];

  const navItemsRight = [
    { id: 'analytics', icon: PieChart, label: 'Análisis' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  const handleFabClick = () => {
    setIsDrawerOpen(true);
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onViewChange(item.id)}
        className={`flex-1 flex flex-col items-center justify-center h-full gap-[2px] transition-all active:scale-95 ${
          isActive ? 'text-accent' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-header-bg transition-colors duration-300">
      <main className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 z-50 h-[60px] transition-colors">
        <div className="max-w-md mx-auto h-full flex justify-between items-center px-2">
          {navItemsLeft.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}

          {/* Center FAB */}
          <div className="flex-1 flex justify-center h-full relative">
            <button
              onClick={handleFabClick}
              className="absolute -top-6 w-[48px] h-[48px] bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </div>

          {navItemsRight.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
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
              className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 md:max-w-lg md:mx-auto bg-white dark:bg-zinc-900 z-[70] max-h-[95vh] overflow-y-auto no-scrollbar shadow-2xl rounded-b-[40px] md:rounded-b-[32px] border-b border-zinc-100 dark:border-zinc-800"
            >
              <div className="p-5 pt-6 relative">
                <div className="absolute top-3 left-1/2 -translate-x-1/2">
                  <div className="w-10 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute top-3 right-5 w-8 h-8 bg-zinc-50 dark:bg-zinc-950 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors z-10"
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
