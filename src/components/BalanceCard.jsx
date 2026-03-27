import React from 'react';
import { Wallet } from 'lucide-react';

export default function BalanceCard({ 
  netBalance, 
  spaceUsers = [],
  isLoading = false
}) {
  const userA = spaceUsers[0]?.nombre || 'Usuario A';
  const userB = spaceUsers[1]?.nombre || 'Usuario B';
  const isBalanced = Math.abs(netBalance || 0) < 0.01;
  const partnerOwesMe = netBalance > 0;
  
  const beneficiary = partnerOwesMe ? userA : userB;

  return (
    <div className="bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/40 dark:to-zinc-950 p-[25px] rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group h-[200px] mb-[20px]">
      <div className="absolute top-4 right-4 opacity-[0.03] dark:opacity-[0.02] group-hover:scale-110 transition-transform pointer-events-none">
        <Wallet size={120} />
      </div>

      <div className="relative z-10 flex items-center justify-center opacity-60">
        <p className="text-[9px] md:text-[10px] uppercase font-medium tracking-[0.2em]">Balance de Cuentas</p>
      </div>

      <div className="relative z-10 flex items-start justify-center gap-1.5">
        {isLoading ? (
          <div className="h-16 w-48 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
        ) : (
          <>
            <span className="text-base md:text-lg font-medium opacity-40 mt-1.5 md:mt-2">S/</span>
            <h2 className={`text-[64px] font-sans font-black tracking-tighter leading-[64px] ${
              isBalanced ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-900 dark:text-zinc-100'
            }`}>
              {Math.abs(netBalance || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h2>
          </>
        )}
      </div>
      
      {!isLoading && (
        <div className="relative z-10 flex items-center justify-center gap-1 opacity-80">
          {!isBalanced ? (
            <>
              <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-zinc-400 dark:text-zinc-500">A favor de</span>
              <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">{beneficiary}</span>
            </>
          ) : (
            <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Están a mano</span>
          )}
        </div>
      )}
    </div>
  );
}
