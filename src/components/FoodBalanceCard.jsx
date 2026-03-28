import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function FoodBalanceCard({ expenses }) {
  const [showAmount, setShowAmount] = useState(false);
  
  const stats = useMemo(() => {
    if (!expenses || expenses.length === 0) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let nutricionTotal = 0;
    let chatarraTotal = 0;

    expenses.forEach(exp => {
      // Parse YYYY-MM-DD correctly without timezone shift
      const [year, month, day] = exp.fecha.split('T')[0].split('-');
      const expDate = new Date(year, month - 1, day);
      
      // Only current month for Home view consistency
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        const montoPEN = parseFloat(exp.monto) * parseFloat(exp.tipo_cambio || 1);
        if (exp.categoria === 'Nutrición') nutricionTotal += montoPEN;
        if (exp.categoria === 'Chatarra') chatarraTotal += montoPEN;
      }
    });

    const foodTotal = nutricionTotal + chatarraTotal;
    if (foodTotal === 0) return null;

    const nutricionPct = (nutricionTotal / foodTotal) * 100;
    const chatarraPct = (chatarraTotal / foodTotal) * 100;

    const winner = nutricionTotal >= chatarraTotal ? 'Nutrición' : 'Chatarra';
    const loser = winner === 'Nutrición' ? 'Chatarra' : 'Nutrición';
    
    const winnerTotal = nutricionTotal >= chatarraTotal ? nutricionTotal : chatarraTotal;
    const loserTotal = winner === 'Nutrición' ? chatarraTotal : nutricionTotal;
    
    const winnerPct = nutricionTotal >= chatarraTotal ? nutricionPct : chatarraPct;
    const loserPct = 100 - winnerPct;

    return {
      winner,
      loser,
      winnerTotal,
      loserTotal,
      winnerPct,
      loserPct
    };
  }, [expenses]);

  if (!stats) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setShowAmount(!showAmount)}
      className="bg-white dark:bg-zinc-900 p-5 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center gap-3 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform h-[105px]"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-20" />
      
      {/* Top Labels */}
      <div className="flex justify-between items-end px-1">
        <span className="font-black text-accent text-lg leading-none uppercase tracking-tight">
          {stats.winner}
        </span>
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          {stats.loser}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${stats.winnerPct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full bg-accent rounded-full"
        />
      </div>

      {/* Bottom Labels - Toggleable */}
      <div className="flex justify-between items-start px-1 h-4">
        <div className="flex flex-col">
          <AnimatePresence mode="wait">
            <motion.span 
              key={showAmount ? 'amount' : 'pct'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-[12px] font-black text-zinc-900 dark:text-zinc-100 leading-none"
            >
              {showAmount 
                ? `S/ ${stats.winnerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `${stats.winnerPct.toFixed(0)}%`
              }
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex flex-col items-end">
          <AnimatePresence mode="wait">
            <motion.span 
              key={showAmount ? 'amount' : 'pct'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 leading-none"
            >
              {showAmount 
                ? `S/ ${stats.loserTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `${stats.loserPct.toFixed(0)}%`
              }
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
