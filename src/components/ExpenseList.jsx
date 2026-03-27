import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import * as LucideIcons from 'lucide-react';
import { Trash2, Search, AlertCircle, Calendar, Filter, X, User, Tag, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ExpenseForm from './ExpenseForm';

export default function ExpenseList({ 
  expenses, 
  onDeleteExpense, 
  onUpdateExpense, 
  spaceUsers = [],
  filters,
  onFilterChange,
  categories = []
}) {
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateRangeSelect = (range) => {
    if (!range) {
      onFilterChange({ dateRange: { start: '', end: '' } });
      return;
    }
    
    onFilterChange({
      dateRange: {
        start: range.from ? format(range.from, 'yyyy-MM-dd') : '',
        end: range.to ? format(range.to, 'yyyy-MM-dd') : ''
      },
      monthYear: '' // Clear month filter when using range
    });
  };

  const selectedRange = {
    from: filters.dateRange?.start ? new Date(filters.dateRange.start) : undefined,
    to: filters.dateRange?.end ? new Date(filters.dateRange.end) : undefined
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.monthYear || filters.payerId || filters.dateRange?.start || filters.dateRange?.end;

  const defaultCategoryNames = ['Hogar', 'Comida', 'Transporte', 'Ocio', 'Otros'];
  const displayCategoryNames = categories.length > 0 
    ? categories.map(c => c.nombre)
    : defaultCategoryNames;

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const confirmDelete = async (id) => {
    await onDeleteExpense(id);
    setDeletingId(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const toggleCategory = (cat) => {
    const current = filters.categories || [];
    const next = current.includes(cat)
      ? current.filter(c => c !== cat)
      : [...current, cat];
    onFilterChange({ categories: next });
  };

  const togglePayer = (payerId) => {
    const next = filters.payerId === payerId ? '' : payerId;
    onFilterChange({ payerId: next });
  };

  const getCategoryIcon = (categoryName) => {
    const cat = categories.find(c => c.nombre === categoryName);
    let IconComponent = LucideIcons.ShoppingBag;
    
    if (cat && cat.icono && LucideIcons[cat.icono]) {
      IconComponent = LucideIcons[cat.icono];
    } else {
      switch (categoryName) {
        case 'Hogar': IconComponent = LucideIcons.Home; break;
        case 'Comida': IconComponent = LucideIcons.Utensils; break;
        case 'Transporte': IconComponent = LucideIcons.Car; break;
        case 'Ocio': IconComponent = LucideIcons.Sparkles; break;
      }
    }
    return <IconComponent size={12} />;
  };

  const groupedExpenses = expenses.reduce((acc, expense) => {
    const date = new Date(expense.fecha);
    const monthYear = format(date, 'MMMM yyyy', { locale: es });
    const capitalizedMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    
    if (!acc[capitalizedMonthYear]) {
      acc[capitalizedMonthYear] = [];
    }
    acc[capitalizedMonthYear].push(expense);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Search & Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar concepto..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center relative ${
            showFilters || hasActiveFilters
              ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-200 dark:shadow-none' 
              : 'bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-700'
          }`}
        >
          <Filter size={20} />
          {hasActiveFilters && !showFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white dark:border-zinc-950 rounded-full" />
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-100/50 dark:shadow-none space-y-6 mb-6">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Filtros Avanzados</h4>
                {hasActiveFilters && (
                  <button 
                    onClick={() => onFilterChange({ categories: [], monthYear: '', payerId: '', dateRange: { start: '', end: '' } })}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Primera línea: Fechas */}
                <div className="space-y-3 relative" ref={calendarRef}>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 px-1 flex items-center gap-2">
                    <Calendar size={12} /> Rango de Fechas
                  </label>
                  <button
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all flex justify-between items-center text-zinc-600 dark:text-zinc-300 text-left"
                  >
                    {selectedRange.from ? (
                      selectedRange.to ? (
                        `${format(selectedRange.from, 'dd MMM yyyy', { locale: es })} - ${format(selectedRange.to, 'dd MMM yyyy', { locale: es })}`
                      ) : (
                        format(selectedRange.from, 'dd MMM yyyy', { locale: es })
                      )
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-600">Seleccionar fechas...</span>
                    )}
                    <ChevronDown size={16} className={`transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-xl rounded-2xl p-4 z-50"
                      >
                        <DayPicker
                          mode="range"
                          selected={selectedRange}
                          onSelect={handleDateRangeSelect}
                          locale={es}
                          className="font-sans dark:text-zinc-100"
                          classNames={{
                            day_selected: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:text-white dark:hover:text-zinc-900",
                            day_range_middle: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
                            day_range_start: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900",
                            day_range_end: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900",
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Segunda línea: Pagante y Categorías */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pagante */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 px-1 flex items-center gap-2">
                      <User size={12} /> Pagado por
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {spaceUsers.map(user => (
                        <button
                          key={user.id}
                          onClick={() => togglePayer(user.id)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border active:scale-95 ${
                            filters.payerId === user.id
                              ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900' 
                              : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-700'
                          }`}
                        >
                          {user.nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categorías */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500 px-1 flex items-center gap-2">
                      <Tag size={12} /> Categorías
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {displayCategoryNames.map(cat => (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border flex items-center gap-2 active:scale-95 ${
                            filters.categories.includes(cat)
                              ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 shadow-md shadow-zinc-200 dark:shadow-none' 
                              : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-700'
                          }`}
                        >
                          {getCategoryIcon(cat)}
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Section */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-950 rounded-[40px] border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="bg-zinc-50 dark:bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-zinc-900 dark:text-zinc-100 font-bold">Sin resultados</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Prueba con otros filtros.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedExpenses).map(([month, monthExpenses]) => (
              <div key={month} className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-2">
                  {month}
                </h3>
                <div className="space-y-2">
                  {monthExpenses.map((expense) => {
                    const isDeleting = deletingId === expense.id;
                    const montoPEN = parseFloat(expense.monto) * parseFloat(expense.tipo_cambio || 1);
                    const payer = spaceUsers.find(u => u.id === expense.pagador_id)?.nombre || 'Otro';

                    return (
                      <motion.div 
                        layout
                        key={expense.id} 
                        onClick={() => setEditingExpense(expense)}
                        className={`bg-white dark:bg-zinc-950 p-4 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                          isDeleting ? 'border-rose-200 dark:border-rose-900 ring-2 ring-rose-50 dark:ring-rose-950/30' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
                        } shadow-sm relative overflow-hidden`}
                      >
                        <AnimatePresence>
                          {isDeleting && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute inset-0 bg-rose-50/95 dark:bg-rose-950/95 backdrop-blur-sm z-10 flex items-center justify-center gap-4 px-4"
                            >
                              <p className="text-rose-900 dark:text-rose-100 font-bold text-xs">¿Eliminar?</p>
                              <div className="flex gap-2">
                                <button onClick={() => confirmDelete(expense.id)} className="bg-rose-600 dark:bg-rose-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold">Sí</button>
                                <button onClick={cancelDelete} className="bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-4 py-1.5 rounded-lg text-[10px] font-bold">No</button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex flex-col gap-2">
                          {/* Jerarquía 1: Concepto y Monto */}
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col pr-4">
                              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">{expense.concepto}</h3>
                              {expense.notas && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 italic mt-0.5 line-clamp-2">{expense.notas}</p>
                              )}
                            </div>
                            <span className="font-sans font-black text-zinc-900 dark:text-zinc-100 text-sm whitespace-nowrap mt-0.5">
                              S/ {montoPEN.toFixed(2)}
                            </span>
                          </div>

                          {/* Jerarquía 2: Chips y Fecha */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                                {getCategoryIcon(expense.categoria)}
                                {expense.categoria}
                              </span>
                              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-md text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                                {payer}
                              </span>
                            </div>
                            <span className="text-[9px] text-zinc-300 dark:text-zinc-600 font-medium whitespace-nowrap ml-2">
                              {format(new Date(expense.fecha), 'dd/MM/yy')}
                            </span>
                          </div>
                        </div>

                        {/* Delete button (small and subtle) */}
                        <button 
                          onClick={(e) => handleDeleteClick(e, expense.id)}
                          className="absolute top-1 right-1 p-1 text-zinc-200 dark:text-zinc-700 hover:text-rose-400 dark:hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={10} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Popup (Modal) */}
      <AnimatePresence>
        {editingExpense && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingExpense(null)}
              className="fixed inset-0 bg-zinc-900/60 dark:bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white dark:bg-zinc-950 rounded-[40px] p-8 z-[110] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif italic text-2xl text-zinc-900 dark:text-zinc-100">Editar Gasto</h3>
                <button 
                  onClick={() => setEditingExpense(null)}
                  className="w-8 h-8 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <ExpenseForm 
                onUpdateExpense={onUpdateExpense}
                initialData={editingExpense}
                onSuccess={() => setEditingExpense(null)}
                categories={categories}
                spaceUsers={spaceUsers}
                currentUserId={editingExpense.pagador_id}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
