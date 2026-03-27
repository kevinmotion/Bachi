import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  LineChart, Line, CartesianGrid, Legend,
  AreaChart, Area
} from 'recharts';
import { format, subDays, isWithinInterval, startOfMonth, endOfMonth, parseISO, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, ArrowUpRight, ArrowDownRight, Calendar, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = ['#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa'];

export default function AnalyticsView({ expenses, spaceUsers = [], categories = [] }) {
  // Data processing
  const stats = useMemo(() => {
    if (!expenses || expenses.length === 0) return null;

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const categoryData = {};
    const userComparison = {};
    
    // Initialize userComparison with space users
    spaceUsers.forEach(user => {
      userComparison[user.id] = 0;
    });
    
    let totalThisMonth = 0;
    let totalLastMonth = 0;
    let maxExpense = 0;

    const lastMonthStart = startOfMonth(subDays(monthStart, 1));
    const lastMonthEnd = endOfMonth(subDays(monthStart, 1));

    // Daily trend for current month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: now });
    const dailyTrend = daysInMonth.map(day => ({
      date: format(day, 'dd'),
      fullDate: format(day, 'd MMM', { locale: es }),
      amount: 0
    }));

    expenses.forEach(exp => {
      const expDate = parseISO(exp.fecha);
      const montoPEN = parseFloat(exp.monto) * parseFloat(exp.tipo_cambio || 1);
      
      // Category Distribution (All time)
      categoryData[exp.categoria] = (categoryData[exp.categoria] || 0) + montoPEN;

      // Current Month Stats
      if (isWithinInterval(expDate, { start: monthStart, end: monthEnd })) {
        if (exp.pagador_id in userComparison) {
          userComparison[exp.pagador_id] += montoPEN;
        } else {
          userComparison[exp.pagador_id] = montoPEN;
        }
        totalThisMonth += montoPEN;
        if (montoPEN > maxExpense) maxExpense = montoPEN;

        // Add to daily trend
        const dayIdx = dailyTrend.findIndex(d => d.date === format(expDate, 'dd'));
        if (dayIdx !== -1) {
          dailyTrend[dayIdx].amount += montoPEN;
        }
      }

      // Last Month Stats
      if (isWithinInterval(expDate, { start: lastMonthStart, end: lastMonthEnd })) {
        totalLastMonth += montoPEN;
      }
    });

    const pieData = Object.entries(categoryData)
      .map(([name, value]) => {
        const cat = categories.find(c => c.nombre === name);
        return { 
          name, 
          value, 
          color: cat?.color || '#71717a' 
        };
      })
      .sort((a, b) => b.value - a.value);

    const barData = Object.entries(userComparison).map(([id, value]) => {
      const user = spaceUsers.find(u => u.id === id);
      return { 
        name: user?.nombre || 'Otro', 
        value 
      };
    });

    const dailyAvg = totalThisMonth / (now.getDate());
    const monthVariation = totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;

    return { 
      pieData, 
      barData, 
      dailyTrend,
      dailyAvg, 
      totalThisMonth,
      totalLastMonth,
      monthVariation,
      maxExpense
    };
  }, [expenses, spaceUsers, categories]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-6 bg-white rounded-[48px] border border-dashed border-zinc-200">
        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200">
          <PieChartIcon size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <p className="text-zinc-900 font-black text-lg">Sin datos analíticos</p>
          <p className="text-zinc-400 text-sm max-w-[240px] mx-auto">Registra tus primeros gastos para visualizar tus tendencias financieras.</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-32"
    >
      {/* KPI Section - Premium Look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="bg-zinc-900 p-6 rounded-[32px] text-white relative overflow-hidden group shadow-xl shadow-zinc-200">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity size={64} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">Total Mes</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-sans font-black tracking-tight">S/ {stats.totalThisMonth.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
              <div className="flex items-center gap-1.5">
                {stats.monthVariation > 0 ? (
                  <ArrowUpRight size={14} className="text-rose-400" />
                ) : (
                  <ArrowDownRight size={14} className="text-emerald-400" />
                )}
                <span className={`text-[10px] font-bold ${stats.monthVariation > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {Math.abs(stats.monthVariation).toFixed(1)}% vs mes anterior
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
              <Zap size={12} />
            </div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">Promedio Diario</p>
          </div>
          <p className="text-3xl font-sans font-black text-zinc-900 tracking-tight">S/ {stats.dailyAvg.toFixed(2)}</p>
          <div className="h-1 w-full bg-zinc-50 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-900 rounded-full" style={{ width: '65%' }} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
              <Target size={12} />
            </div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">Mayor Gasto</p>
          </div>
          <p className="text-3xl font-sans font-black text-zinc-900 tracking-tight">S/ {stats.maxExpense.toFixed(2)}</p>
          <p className="text-[10px] text-zinc-400 font-medium italic">En un solo movimiento</p>
        </motion.div>
      </div>

      {/* Main Trend Chart */}
      <motion.div variants={itemVariants} className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-900" />
              <h3 className="font-black text-zinc-900 text-lg tracking-tight">Tendencia de Gastos</h3>
            </div>
            <p className="text-xs text-zinc-400">Evolución diaria durante el mes actual</p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-xl">
            <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-[10px] font-bold text-zinc-900">Diario</button>
            <button className="px-4 py-1.5 text-[10px] font-bold text-zinc-400">Semanal</button>
          </div>
        </div>
        
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyTrend}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#a1a1aa' }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-zinc-900 p-3 rounded-2xl shadow-xl border border-zinc-800">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{payload[0].payload.fullDate}</p>
                        <p className="text-sm font-black text-white">S/ {payload[0].value.toFixed(2)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#18181b" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm space-y-8">
          <div className="space-y-1">
            <h3 className="font-black text-zinc-900 text-lg tracking-tight">Distribución</h3>
            <p className="text-xs text-zinc-400">Por categorías de gasto</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="h-[240px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value) => `S/ ${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-300">Total</p>
                <p className="text-lg font-black text-zinc-900">S/ {stats.totalThisMonth.toFixed(0)}</p>
              </div>
            </div>

            <div className="w-full space-y-3 mt-4">
              {stats.pieData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-900">S/ {item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* User Comparison */}
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm space-y-8">
          <div className="space-y-1">
            <h3 className="font-black text-zinc-900 text-lg tracking-tight">Comparativa</h3>
            <p className="text-xs text-zinc-400">Gasto por persona este mes</p>
          </div>
          
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.barData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#71717a' }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 12 }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => `S/ ${value.toFixed(2)}`}
                />
                <Bar 
                  dataKey="value" 
                  fill="#18181b" 
                  radius={[12, 12, 12, 12]} 
                  barSize={45}
                  animationDuration={1500}
                >
                  {stats.barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#18181b' : '#a1a1aa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-50 p-5 rounded-3xl space-y-4">
            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Resumen de Participación</p>
            <div className="space-y-3">
              {stats.barData.map((user, idx) => {
                const percentage = (user.value / stats.totalThisMonth) * 100;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-zinc-500">{user.name}</span>
                      <span className="text-zinc-900">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${idx === 0 ? 'bg-zinc-900' : 'bg-zinc-400'}`} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
