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
    <div className="bg-accent p-[25px] rounded-[32px] border border-accent shadow-sm flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group h-[175px] mb-[15px]">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-[0.1] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-4 right-4 opacity-[0.08] group-hover:scale-110 transition-transform pointer-events-none text-accent-foreground">
        <Wallet size={120} />
      </div>

      <div className="relative z-10 flex items-center justify-center opacity-70 text-accent-foreground">
        <p className="text-[9px] md:text-[10px] uppercase font-medium tracking-[0.2em]">Balance de Cuentas</p>
      </div>

      <div className="relative z-10 flex items-start justify-center gap-1.5">
        {isLoading ? (
          <div className="h-16 w-48 bg-white/20 rounded-2xl animate-pulse" />
        ) : (
          <>
            <span className="text-base md:text-lg font-medium opacity-50 mt-1.5 md:mt-2 text-accent-foreground">S/</span>
            <h2 className={`text-[64px] font-sans font-black tracking-tighter leading-[64px] mb-[-10px] mt-[-5px] ${
              isBalanced ? 'opacity-40 text-accent-foreground' : 'text-accent-foreground'
            }`}>
              {Math.abs(netBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </>
        )}
      </div>
      
      {!isLoading && (
        <div className="relative z-10 flex items-center justify-center gap-1 opacity-90 text-accent-foreground">
          {!isBalanced ? (
            <>
              <span className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-70">A favor de</span>
              <span className="text-[11px] font-bold">{beneficiary}</span>
            </>
          ) : (
            <span className="text-[10px] uppercase font-bold tracking-[0.1em] opacity-70">Están a mano</span>
          )}
        </div>
      )}
    </div>
  );
}
