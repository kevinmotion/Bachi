import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Search, AlertCircle, Home, Utensils, Car, Sparkles, ShoppingBag, Calendar, Filter, X, User, Tag } from 'lucide-react';
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

  const hasActiveFilters = filters.categories.length > 0 || filters.monthYear || filters.payerId;

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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Hogar': return <Home size={12} />;
      case 'Comida': return <Utensils size={12} />;
      case 'Transporte': return <Car size={12} />;
      case 'Ocio': return <Sparkles size={12} />;
      default: return <ShoppingBag size={12} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar concepto..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center relative ${
            showFilters || hasActiveFilters
              ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200' 
              : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200'
          }`}
        >
          <Filter size={20} />
          {hasActiveFilters && !showFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full" />
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
            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-100/50 space-y-6 mb-6">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900">Filtros Avanzados</h4>
                {hasActiveFilters && (
                  <button 
                    onClick={() => onFilterChange({ categories: [], monthYear: '', payerId: '' })}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mes y Año */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 px-1 flex items-center gap-2">
                    <Calendar size={12} /> Fecha
                  </label>
                  <div className="relative">
                    <input
                      type="month"
                      value={filters.monthYear}
                      onChange={(e) => onFilterChange({ monthYear: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all appearance-none"
                    />
                  </div>
                </div>

                {/* Pagante */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 px-1 flex items-center gap-2">
                    <User size={12} /> Pagado por
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {spaceUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => togglePayer(user.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border active:scale-95 ${
                          filters.payerId === user.id
                            ? 'bg-zinc-900 border-zinc-900 text-white' 
                            : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200'
                        }`}
                      >
                        {user.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categorías */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 px-1 flex items-center gap-2">
                  <Tag size={12} /> Categorías
                </label>
                <div className="flex flex-wrap gap-2">
                  {displayCategoryNames.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border flex items-center gap-2 active:scale-95 ${
                        filters.categories.includes(cat)
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-200' 
                          : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200'
                      }`}
                    >
                      {getCategoryIcon(cat)}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Section */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-zinc-200">
            <div className="bg-zinc-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-zinc-300" />
            </div>
            <p className="text-zinc-900 font-bold">Sin resultados</p>
            <p className="text-xs text-zinc-400 mt-1">Prueba con otros filtros.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => {
              const isDeleting = deletingId === expense.id;
              const montoPEN = parseFloat(expense.monto) * parseFloat(expense.tipo_cambio || 1);
              const payer = spaceUsers.find(u => u.id === expense.pagador_id)?.nombre || 'Otro';

              return (
                <motion.div 
                  layout
                  key={expense.id} 
                  onClick={() => setEditingExpense(expense)}
                  className={`bg-white p-4 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                    isDeleting ? 'border-rose-200 ring-2 ring-rose-50' : 'border-zinc-100 hover:border-zinc-200'
                  } shadow-sm relative overflow-hidden`}
                >
                  <AnimatePresence>
                    {isDeleting && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-0 bg-rose-50/95 backdrop-blur-sm z-10 flex items-center justify-center gap-4 px-4"
                      >
                        <p className="text-rose-900 font-bold text-xs">¿Eliminar?</p>
                        <div className="flex gap-2">
                          <button onClick={() => confirmDelete(expense.id)} className="bg-rose-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold">Sí</button>
                          <button onClick={cancelDelete} className="bg-white text-rose-600 border border-rose-200 px-4 py-1.5 rounded-lg text-[10px] font-bold">No</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-2">
                    {/* Jerarquía 1: Concepto y Monto */}
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-zinc-900 text-sm truncate pr-4">{expense.concepto}</h3>
                      <span className="font-sans font-black text-zinc-900 text-sm whitespace-nowrap">
                        S/ {montoPEN.toFixed(2)}
                      </span>
                    </div>

                    {/* Jerarquía 2: Chips y Fecha */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="px-2 py-0.5 bg-zinc-50 text-zinc-500 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                          {getCategoryIcon(expense.categoria)}
                          {expense.categoria}
                        </span>
                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-400 rounded-md text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                          {payer}
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-300 font-medium whitespace-nowrap ml-2">
                        {format(new Date(expense.fecha), 'dd/MM/yy')}
                      </span>
                    </div>
                  </div>

                  {/* Delete button (small and subtle) */}
                  <button 
                    onClick={(e) => handleDeleteClick(e, expense.id)}
                    className="absolute top-1 right-1 p-1 text-zinc-200 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={10} />
                  </button>
                </motion.div>
              );
            })}
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
              className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md bg-white rounded-[40px] p-8 z-[110] shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif italic text-2xl text-zinc-900">Editar Gasto</h3>
                <button 
                  onClick={() => setEditingExpense(null)}
                  className="w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
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
