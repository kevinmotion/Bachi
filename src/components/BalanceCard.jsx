import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function BalanceCard({ 
  netBalance, 
  spaceUsers = []
}) {
  const userA = spaceUsers[0]?.nombre || 'Usuario A';
  const userB = spaceUsers[1]?.nombre || 'Usuario B';
  const isBalanced = Math.abs(netBalance) < 0.01;
  const partnerOwesMe = netBalance > 0;
  
  const beneficiary = partnerOwesMe ? userA : userB;

  return (
    <div className="bg-white p-10 rounded-[32px] border border-zinc-100 shadow-sm flex flex-col items-center text-center space-y-6">
      <div className="space-y-2 pt-4">
        <h2 className={`text-6xl md:text-7xl font-sans font-black tracking-tighter leading-none ${
          isBalanced ? 'text-zinc-300' : 'text-zinc-900'
        }`}>
          S/ {Math.abs(netBalance || 0).toFixed(2)}
        </h2>
        
        <div className="flex flex-col items-center">
          {!isBalanced ? (
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="text-[11px] uppercase font-bold tracking-[0.2em] font-sans">A favor de</span>
              <span className="text-sm font-sans font-bold text-zinc-900 underline underline-offset-4 decoration-zinc-200">{beneficiary}</span>
            </div>
          ) : (
            <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-zinc-400 font-sans">Están a mano</span>
          )}
        </div>
      </div>
    </div>
  );
}
