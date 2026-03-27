import React, { useMemo } from 'react';
import { Search, Plus, ArrowUpRight, ArrowDownLeft, MoreHorizontal } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard({ 
  profile, 
  expenses = [], 
  balances, 
  spaceUsers = [], 
  categories = [],
  onAddExpenseClick,
  onViewAllClick
}) {
  const userName = profile?.nombre || 'Usuario';
  const netBalance = balances?.netBalance || 0;
  const isDebt = netBalance < 0;
  const isCredit = netBalance > 0;
  const isBalanced = Math.abs(netBalance) < 0.01;

  // Get last 5 expenses
  const recentExpenses = useMemo(() => {
    return [...expenses].slice(0, 5);
  }, [expenses]);

  // Calculate distribution
  const distributionData = useMemo(() => {
    const categoryTotals = {};
    let total = 0;

    expenses.forEach(expense => {
      const amount = parseFloat(expense.monto) * parseFloat(expense.tipo_cambio || 1);
      categoryTotals[expense.categoria] = (categoryTotals[expense.categoria] || 0) + amount;
      total += amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [expenses]);

  const COLORS = ['#18181b', '#3f3f46', '#71717a'];

  return (
    <div className="pb-24 space-y-2">
      {/* Header (Saludo) */}
      <div className="p-6 pb-2 flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          ¡Hola, {userName}!
        </h1>
        <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
          <Search size={20} />
        </div>
      </div>

      {/* Card de Saldos Netos */}
      <div className="px-6">
        <Card className="p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 border-none shadow-xl shadow-indigo-100/50 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
          
          <div className="flex justify-between items-center relative z-10">
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400">Estado de cuenta</p>
              <h2 className={`text-3xl font-bold tracking-tight ${
                isDebt ? 'text-rose-600' : isCredit ? 'text-emerald-600' : 'text-zinc-500'
              }`}>
                {isBalanced ? 'Están a mano' : isDebt ? `Debes S/ ${Math.abs(netBalance).toFixed(2)}` : `Te deben S/ ${netBalance.toFixed(2)}`}
              </h2>
            </div>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={onAddExpenseClick}
              className="h-14 w-14 rounded-2xl p-0 flex items-center justify-center shadow-indigo-200"
            >
              <Plus size={24} />
            </Button>
          </div>
        </Card>
      </div>

      {/* Movimientos Recientes */}
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Movimientos recientes</h2>
          <Button variant="ghost" size="sm" onClick={onViewAllClick} className="text-zinc-400">
            Ver todos
          </Button>
        </div>

        <div className="space-y-4">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense) => {
              const category = categories.find(c => c.nombre === expense.categoria);
              const isUserPayer = expense.pagador_id === profile?.id;
              const amountPEN = parseFloat(expense.monto) * parseFloat(expense.tipo_cambio || 1);
              
              return (
                <Card key={expense.id} className="p-4 border-zinc-50 hover:border-zinc-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${category?.color || '#f4f4f5'}20` }}
                    >
                      <span className="text-xl" style={{ color: category?.color || '#71717a' }}>
                        {category?.icono || '💰'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-900 truncate">{expense.concepto}</p>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
                        {format(new Date(expense.fecha), 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-zinc-900">S/ {amountPEN.toFixed(2)}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isUserPayer ? 'text-emerald-600' : 'text-zinc-400'}`}>
                        Pagado por {isUserPayer ? 'ti' : (spaceUsers.find(u => u.id === expense.pagador_id)?.nombre || 'Pareja')}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="py-12 text-center text-zinc-300 italic">
              No hay movimientos recientes
            </div>
          )}
        </div>
      </div>

      {/* Distribución de Gastos */}
      <div className="p-6 space-y-6">
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Distribución de gastos</h2>
        
        <Card className="p-6 border-zinc-50">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData.length > 0 ? distributionData : [{ name: 'Empty', value: 1 }]}
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.length > 0 ? (
                      distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))
                    ) : (
                      <Cell fill="#f4f4f5" />
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-4">
              {distributionData.length > 0 ? (
                distributionData.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-bold text-zinc-600 truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-900">{item.percentage.toFixed(0)}%</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 italic">Sin datos este mes</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
