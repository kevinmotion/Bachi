import React, { useMemo, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  LineChart, Line, CartesianGrid, Legend,
  AreaChart, Area
} from 'recharts';
import { format, subDays, isWithinInterval, startOfMonth, endOfMonth, parseISO, eachDayOfInterval, startOfDay, endOfDay, parse, getWeekOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, ArrowUpRight, ArrowDownRight, Calendar, Target, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = ['#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa'];

export default function AnalyticsView({ expenses, spaceUsers = [], categories = [] }) {
  const [selectedMonthStr, setSelectedMonthStr] = useState(format(new Date(), 'yyyy-MM'));
  const [trendView, setTrendView] = useState('daily'); // 'daily' or 'weekly'

  // Data processing
  const stats = useMemo(() => {
    if (!expenses || expenses.length === 0) return null;

    const selectedDate = parse(selectedMonthStr, 'yyyy-MM', new Date());
    const today = new Date();
    const isCurrentMonth = selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear();
    
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const categoryData = {};
    const userComparison = {};
    
    // Initialize userComparison with space users
    spaceUsers.forEach(user => {
      userComparison[user.id] = 0;
    });
    
    let totalThisMonth = 0;
    let totalLastMonth = 0;
    let maxExpense = 0;
    let maxExpenseConcept = '';

    const lastMonthStart = startOfMonth(subDays(monthStart, 1));
    const lastMonthEnd = endOfMonth(subDays(monthStart, 1));
    const daysInLastMonth = lastMonthEnd.getDate();

    // Daily trend for selected month
    const endDay = isCurrentMonth ? today : monthEnd;
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: endDay });
    const dailyTrend = daysInMonth.map(day => ({
      date: format(day, 'dd'),
      fullDate: format(day, 'd MMM', { locale: es }),
      amount: 0,
      week: getWeekOfMonth(day, { locale: es }) // Get week of month
    }));

    expenses.forEach(exp => {
      const expDate = parseISO(exp.fecha);
      const montoPEN = parseFloat(exp.monto) * parseFloat(exp.tipo_cambio || 1);

      // Current Month Stats
      if (isWithinInterval(expDate, { start: monthStart, end: monthEnd })) {
        // Category Distribution (Selected Month)
        categoryData[exp.categoria] = (categoryData[exp.categoria] || 0) + montoPEN;

        if (exp.pagador_id in userComparison) {
          userComparison[exp.pagador_id] += montoPEN;
        } else {
          userComparison[exp.pagador_id] = montoPEN;
        }
        totalThisMonth += montoPEN;
        if (montoPEN > maxExpense) {
          maxExpense = montoPEN;
          maxExpenseConcept = exp.concepto || exp.categoria;
        }

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

    // Calculate weekly trend
    const weeklyTrendMap = new Map();
    dailyTrend.forEach(day => {
      if (!weeklyTrendMap.has(day.week)) {
        weeklyTrendMap.set(day.week, {
          date: `Sem ${day.week}`,
          fullDate: `Semana ${day.week}`,
          amount: 0
        });
      }
      weeklyTrendMap.get(day.week).amount += day.amount;
    });
    const weeklyTrend = Array.from(weeklyTrendMap.values());

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

    const daysPassed = isCurrentMonth ? today.getDate() : monthEnd.getDate();
    const dailyAvg = totalThisMonth / (daysPassed || 1);
    const lastMonthDailyAvg = totalLastMonth / (daysInLastMonth || 1);
    
    const monthVariation = totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;
    const dailyVariation = lastMonthDailyAvg > 0 ? ((dailyAvg - lastMonthDailyAvg) / lastMonthDailyAvg) * 100 : 0;

    return { 
      pieData, 
      barData, 
      dailyTrend,
      weeklyTrend,
      dailyAvg, 
      dailyVariation,
      totalThisMonth,
      totalLastMonth,
      monthVariation,
      maxExpense,
      maxExpenseConcept
    };
  }, [expenses, spaceUsers, categories, selectedMonthStr]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-6 bg-white dark:bg-zinc-900 rounded-[48px] border border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-950 rounded-full flex items-center justify-center text-zinc-200 dark:text-zinc-700">
          <PieChartIcon size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <p className="text-zinc-900 dark:text-zinc-100 font-black text-lg">Sin datos analíticos</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm max-w-[240px] mx-auto">Registra tus primeros gastos para visualizar tus tendencias financieras.</p>
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

  const handlePrevMonth = () => {
    const current = parse(selectedMonthStr, 'yyyy-MM', new Date());
    const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    setSelectedMonthStr(format(prev, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const current = parse(selectedMonthStr, 'yyyy-MM', new Date());
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    setSelectedMonthStr(format(next, 'yyyy-MM'));
  };

  const selectedDate = parse(selectedMonthStr, 'yyyy-MM', new Date());
  const monthName = format(selectedDate, 'MMMM yyyy', { locale: es });

  const currentTrendData = trendView === 'daily' ? stats.dailyTrend : stats.weeklyTrend;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-32"
    >
      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4 mb-[15px]">
        <button 
          onClick={handlePrevMonth}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-5 py-2 rounded-full border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <Calendar size={12} className="text-accent" />
          <span className="font-bold text-zinc-900 dark:text-zinc-100 capitalize text-xs tracking-tight">
            {monthName}
          </span>
        </div>

        <button 
          onClick={handleNextMonth}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* KPI Section - Premium Look */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <motion.div variants={itemVariants} className="col-span-2 bg-accent border border-accent p-5 md:p-6 rounded-[32px] text-accent-foreground relative overflow-hidden group shadow-sm flex flex-col items-center justify-center text-center gap-3 md:gap-4 h-[160px] mb-[5px]">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-[0.1] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-4 right-4 opacity-[0.08] group-hover:scale-110 transition-transform pointer-events-none">
            <Activity size={100} />
          </div>
          
          <div className="relative z-10 flex items-center justify-center opacity-70">
            <p className="text-[8px] uppercase font-medium tracking-[0.15em]">Total Mes</p>
          </div>
          
          <div className="relative z-10 flex items-start justify-center gap-1">
            <span className="text-sm md:text-base font-medium opacity-50 mt-1">S/</span>
            <p className="text-[45px] font-sans font-black tracking-tighter break-words leading-[45px] text-accent-foreground">
              {stats.totalThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-1 opacity-90">
            {stats.monthVariation > 0 ? (
              <ArrowUpRight size={12} className="text-white shrink-0" />
            ) : (
              <ArrowDownRight size={12} className="text-white shrink-0" />
            )}
            <span className="text-[10px] font-bold text-white">
              {Math.abs(stats.monthVariation).toFixed(1)}%
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-1 bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-0 h-[110px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-20" />
          <div className="flex items-center justify-center opacity-60 text-zinc-500 dark:text-zinc-400">
            <p className="text-[7px] md:text-[8px] uppercase font-medium tracking-[0.15em] leading-tight">Promedio Diario</p>
          </div>
          <div className="flex items-start justify-center gap-0.5">
            <span className="text-[10px] md:text-xs font-medium opacity-40 mt-[5px]">S/</span>
            <p className="text-[25px] font-sans font-black text-accent tracking-tighter break-words leading-[25px] mt-[5px] mb-[3px]">
              {(stats.dailyAvg || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="relative z-10 flex items-center justify-center gap-1 opacity-80 mt-[5px] mb-[5px]">
            {(stats.dailyVariation || 0) > 0 ? (
              <ArrowUpRight size={10} className="text-rose-500 dark:text-rose-400 shrink-0" />
            ) : (
              <ArrowDownRight size={10} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
            )}
            <span className={`text-[10px] font-bold ${(stats.dailyVariation || 0) > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
              {Math.abs(stats.dailyVariation || 0).toFixed(1)}%
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-1 bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center gap-0 h-[110px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-20" />
          <div className="flex items-center justify-center opacity-60 text-zinc-500 dark:text-zinc-400">
            <p className="text-[7px] md:text-[8px] uppercase font-medium tracking-[0.15em] leading-tight">Mayor Gasto</p>
          </div>
          <div className="flex items-start justify-center gap-0.5">
            <span className="text-[10px] md:text-xs font-medium opacity-40 mt-[5px]">S/</span>
            <p className="text-[25px] font-sans font-black text-accent tracking-tighter break-words leading-[25px] mt-[5px] mb-[3px]">
              {(stats.maxExpense || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="relative z-10 flex items-center justify-center gap-1 mt-[5px] mb-[5px]">
            <span className="text-[7px] font-medium text-[#71717b] dark:text-zinc-400 truncate max-w-[80px] leading-[8.75px] uppercase tracking-wider">
              {stats.maxExpenseConcept || 'N/A'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Trend Chart */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">Tendencia de Gastos</h3>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Evolución durante el mes seleccionado</p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl">
            <button 
              onClick={() => setTrendView('daily')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${trendView === 'daily' ? 'bg-accent shadow-sm text-accent-foreground' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              Diario
            </button>
            <button 
              onClick={() => setTrendView('weekly')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${trendView === 'weekly' ? 'bg-accent shadow-sm text-accent-foreground' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              Semanal
            </button>
          </div>
        </div>
        
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart key={trendView} data={currentTrendData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" className="dark:stroke-zinc-800" />
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
                      <div className="bg-accent p-3 rounded-2xl shadow-xl border border-accent">
                        <p className="text-[10px] font-bold text-accent-foreground opacity-70 uppercase tracking-widest mb-1">{payload[0].payload.fullDate}</p>
                        <p className="text-sm font-black text-accent-foreground">S/ {payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                className="dark:stroke-zinc-100"
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
        <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-8">
          <div className="space-y-1">
            <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">Distribución</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Por categorías de gasto</p>
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
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', backgroundColor: 'var(--tw-colors-zinc-900)', color: 'white' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value) => `S/ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-300 dark:text-zinc-600">Total</p>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">S/ {stats.totalThisMonth.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>

            <div className="w-full space-y-3 mt-4">
              {stats.pieData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">S/ {item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* User Comparison */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-8">
          <div className="space-y-1">
            <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">Comparativa</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Gasto por persona en el mes</p>
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
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-zinc-900)', color: 'white' }}
                  formatter={(value) => `S/ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <Bar 
                  dataKey="value" 
                  fill="#18181b" 
                  className="dark:fill-zinc-100"
                  radius={[12, 12, 12, 12]} 
                  barSize={45}
                  animationDuration={1500}
                >
                  {stats.barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#18181b' : '#a1a1aa'} className={index === 0 ? 'dark:fill-zinc-100' : 'dark:fill-zinc-700'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-3xl space-y-4">
            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400 dark:text-zinc-500">Resumen de Participación</p>
            <div className="space-y-3">
              {stats.barData.map((user, idx) => {
                const percentage = stats.totalThisMonth > 0 ? (user.value / stats.totalThisMonth) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-zinc-500 dark:text-zinc-400">{user.name}</span>
                      <span className="text-zinc-900 dark:text-zinc-100">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${idx === 0 ? 'bg-accent' : 'bg-zinc-400 dark:bg-zinc-600'}`} 
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
