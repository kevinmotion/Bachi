import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Calendar, User, Users, DollarSign, Tag, ChevronDown, ChevronUp, PlusCircle, Check, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function ExpenseForm({ 
  onAddExpense = null, 
  onUpdateExpense = null,
  initialData = null,
  onSuccess = () => {},
  categories = [],
  spaceUsers = [],
  currentUserId = null
}) {
  const isEditing = !!initialData;
  const defaultCategories = [
    { nombre: 'Hogar', icon: LucideIcons.Home },
    { nombre: 'Comida', icon: LucideIcons.Utensils },
    { nombre: 'Transporte', icon: LucideIcons.Car },
    { nombre: 'Ocio', icon: LucideIcons.Sparkles },
    { nombre: 'Otros', icon: LucideIcons.ShoppingBag },
  ];

  const displayCategories = categories.length > 0 
    ? categories.map(c => {
        let IconComponent = LucideIcons.ShoppingBag;
        if (c.icono && LucideIcons[c.icono]) {
          IconComponent = LucideIcons[c.icono];
        } else {
          const defaultMatch = defaultCategories.find(dc => dc.nombre.toLowerCase() === c.nombre.toLowerCase());
          if (defaultMatch) IconComponent = defaultMatch.icon;
        }
        return { ...c, icon: IconComponent };
      }) 
    : defaultCategories;

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false);
  const [nota, setNota] = useState(initialData?.notas || '');
  const [debtInput, setDebtInput] = useState(initialData ? (parseFloat(initialData.factor_deuda) * 10).toString() : '5'); 

  const [formData, setFormData] = useState({
    concepto: initialData?.concepto || '',
    categoria: initialData?.categoria || displayCategories[0]?.nombre || 'Otros',
    monto: initialData?.monto || '',
    moneda: initialData?.moneda || 'PEN',
    tipo_cambio: initialData?.tipo_cambio || 3.75,
    factor_deuda: initialData?.factor_deuda ?? 0.5,
    pagador_id: initialData?.pagador_id || currentUserId || '',
    fecha: initialData?.fecha ? format(new Date(initialData.fecha), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  });

  useEffect(() => {
    if (displayCategories.length > 0 && !formData.categoria) {
      setFormData(prev => ({ ...prev, categoria: displayCategories[0].nombre }));
    }
  }, [displayCategories]);

  useEffect(() => {
    if (currentUserId && !formData.pagador_id && !isEditing) {
      setFormData(prev => ({ ...prev, pagador_id: currentUserId }));
    }
  }, [currentUserId, isEditing]);

  const togglePayer = () => {
    if (spaceUsers.length < 2) return;
    const currentIndex = spaceUsers.findIndex(u => u.id === formData.pagador_id);
    const nextIndex = (currentIndex + 1) % spaceUsers.length;
    setFormData({ ...formData, pagador_id: spaceUsers[nextIndex].id });
  };

  const cycleDebt = () => {
    const factors = [0.5, 1, 0];
    const currentFactor = parseFloat(formData.factor_deuda);
    const currentIndex = factors.indexOf(currentFactor);
    const nextIndex = (currentIndex + 1) % factors.length;
    const nextFactor = factors[nextIndex];
    setFormData({ ...formData, factor_deuda: nextFactor });
    setDebtInput((nextFactor * 10).toString());
  };

  const selectCategory = (catName) => {
    setFormData({ ...formData, categoria: catName });
    setIsCategoryModalOpen(false);
    // Focus amount input after category selection
    setTimeout(() => {
      document.getElementById('monto-input')?.focus();
    }, 100);
  };

  const handleDebtInputChange = (val) => {
    const num = parseInt(val);
    if (isNaN(num)) {
      setDebtInput('');
      return;
    }
    const clamped = Math.min(Math.max(num, 0), 10);
    setDebtInput(clamped.toString());
    setFormData({ ...formData, factor_deuda: clamped / 10 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.concepto || !formData.monto) return;

    const montoNum = parseFloat(formData.monto);
    if (montoNum <= 0) {
      alert('El monto debe ser mayor a cero');
      return;
    }

    const payload = {
      ...formData,
      concepto: formData.concepto.trim(),
      monto: montoNum,
      tipo_cambio: formData.moneda === 'USD' ? parseFloat(formData.tipo_cambio) : 1,
      factor_deuda: parseFloat(formData.factor_deuda),
      notas: nota
    };

    if (isEditing && onUpdateExpense) {
      await onUpdateExpense(initialData.id, payload);
    } else if (onAddExpense) {
      await onAddExpense(payload);
    }

    if (onSuccess) onSuccess();

    if (!isEditing) {
      setFormData({
        concepto: '',
        categoria: displayCategories[0]?.nombre || 'Otros',
        monto: '',
        moneda: 'PEN',
        tipo_cambio: 3.75,
        factor_deuda: 0.5,
        pagador_id: currentUserId || '',
        fecha: format(new Date(), "yyyy-MM-dd'T'HH:mm")
      });
      setDebtInput('5');
      setNota('');
    }
    setIsCategoryModalOpen(false);
    setIsNotaModalOpen(false);
  };

  const toggleMoneda = () => {
    setFormData(prev => ({ ...prev, moneda: prev.moneda === 'PEN' ? 'USD' : 'PEN' }));
  };

  const currentCategory = displayCategories.find(c => c.nombre === formData.categoria) || displayCategories[0];
  const CategoryIcon = currentCategory?.icon || LucideIcons.ShoppingBag;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3 h-[420px] flex flex-col">
        {/* FILA 1: Concepto */}
        <div className="space-y-0.5 mb-0.5">
          <span className="text-[8px] uppercase font-bold text-zinc-300 dark:text-zinc-600 tracking-[0.2em] ml-1">Concepto</span>
          <div className="flex items-center gap-2">
            <input
              id="concepto-input"
              type="text"
              value={formData.concepto}
              onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
              placeholder="¿En qué gastaste?"
              className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-800 rounded-none px-0 py-0.5 text-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-all font-serif italic placeholder:text-zinc-200 dark:placeholder:text-zinc-700"
              required
            />
            <button
              type="button"
              onClick={() => setIsNotaModalOpen(true)}
              className={`p-2 rounded-xl transition-colors border flex-shrink-0 ${
                nota 
                  ? 'bg-accent text-accent-foreground border-accent shadow-md shadow-zinc-200 dark:shadow-none' 
                  : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-500 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Añadir anotación"
            >
              <MessageSquare size={18} />
            </button>
          </div>
        </div>

        {/* FILA 2: Monto | Moneda | TC */}
        <div className="space-y-0.5 mb-0.5">
          <span className="text-[8px] uppercase font-bold text-zinc-300 dark:text-zinc-600 tracking-[0.2em] ml-1">Monto y Moneda</span>
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                id="monto-input"
                type="number"
                step="0.01"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                placeholder="0.00"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[32px] pl-3 pr-10 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-accent transition-all font-mono font-bold"
                required
              />
              <button
                type="button"
                onClick={toggleMoneda}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg flex items-center justify-center text-[9px] font-bold text-zinc-900 dark:text-zinc-100 shadow-sm active:scale-90 transition-transform"
              >
                {formData.moneda}
              </button>
            </div>

            {formData.moneda === 'USD' && (
              <div className="w-16">
                <input
                  type="number"
                  step="0.001"
                  value={formData.tipo_cambio}
                  onChange={(e) => setFormData({ ...formData, tipo_cambio: e.target.value })}
                  placeholder="TC"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[32px] px-1 py-3 text-[10px] text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-accent transition-all text-center"
                />
              </div>
            )}
          </div>
        </div>

        {/* FILA 3: Categoría */}
        <div className="space-y-0.5 mb-0.5">
          <span className="text-[8px] uppercase font-bold text-zinc-300 dark:text-zinc-600 tracking-[0.2em] ml-1">Categoría</span>
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="w-full h-11 px-4 rounded-[32px] border bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all flex items-center gap-2 active:scale-95"
          >
            <div className="p-1.5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
              <CategoryIcon size={14} className="text-zinc-900 dark:text-zinc-100" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {formData.categoria}
            </span>
          </button>
        </div>

        {/* FILA 4: Pagador y Deuda */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-0.5">
            <span className="text-[8px] uppercase font-bold text-zinc-300 dark:text-zinc-600 tracking-[0.2em] ml-1">Pagado por</span>
            <button
              type="button"
              onClick={togglePayer}
              className="w-full h-10 rounded-[32px] text-xs font-bold transition-all border bg-accent border-accent text-accent-foreground shadow-md shadow-zinc-100 dark:shadow-none flex items-center justify-center gap-2 active:scale-95"
            >
              <User size={15} />
              {spaceUsers.find(u => u.id === formData.pagador_id)?.nombre || 'Yo'}
            </button>
          </div>

          <div className="space-y-0.5">
            <span className="text-[8px] uppercase font-bold text-zinc-300 dark:text-zinc-600 tracking-[0.2em] ml-1">Deuda (%)</span>
            <div className="flex gap-1.5 h-10">
              <button
                type="button"
                onClick={cycleDebt}
                className="flex-1 rounded-[32px] border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold transition-all active:scale-90 flex items-center justify-center shadow-sm"
              >
                {Math.round(parseFloat(formData.factor_deuda) * 100)}%
              </button>
              <input
                type="number"
                min="0"
                max="10"
                value={debtInput}
                onChange={(e) => handleDebtInputChange(e.target.value)}
                className="w-10 rounded-[32px] border bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                placeholder="1-10"
              />
            </div>
          </div>
        </div>

        {/* FILA 5: Selector de Fecha */}
        <div className="space-y-0.5 mt-[-7px] mb-[5px]">
          <span className="text-[8px] uppercase font-bold text-zinc-300 dark:text-zinc-600 tracking-[0.2em] ml-1">Fecha</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600" size={14} />
            <input
              type="datetime-local"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[32px] pl-10 pr-3 py-3 text-xs text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
        </div>

        {/* FILA 6: Botón Registrar Gasto */}
        <div className="mt-auto pt-2">
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            className="w-full bg-accent text-accent-foreground py-3.5 rounded-[32px] font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-zinc-200 dark:shadow-none active:scale-95"
          >
            <Check size={16} /> {isEditing ? 'Actualizar Gasto' : 'Registrar Gasto'}
          </motion.button>
        </div>
      </form>

      {/* Category Modal (Popup) */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="fixed inset-0 bg-zinc-900/60 dark:bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-zinc-900 rounded-[32px] p-6 z-[110] shadow-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <div className="text-center mb-6">
                <h3 className="font-serif italic text-2xl text-zinc-900 dark:text-zinc-100">Categoría</h3>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {displayCategories.map((cat) => {
                  const Icon = cat.icon || LucideIcons.ShoppingBag;
                  const isActive = formData.categoria === cat.nombre;
                  return (
                    <button
                      key={cat.id || cat.nombre}
                      type="button"
                      onClick={() => selectCategory(cat.nombre)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border active:scale-95 ${
                        isActive 
                          ? 'bg-accent border-accent text-accent-foreground shadow-lg dark:shadow-none' 
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {cat.nombre}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="mt-6 w-full py-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </>
        )}
        {isNotaModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotaModalOpen(false)}
              className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-zinc-900 rounded-[32px] p-6 z-[110] shadow-2xl flex flex-col gap-4 border border-zinc-100 dark:border-zinc-800"
            >
              <div className="text-center">
                <h3 className="font-serif italic text-2xl text-zinc-900 dark:text-zinc-100">Añadir anotación</h3>
              </div>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Escribe una nota o detalle adicional..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[32px] p-4 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none h-32 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsNotaModalOpen(false)}
                  className="flex-1 py-3 rounded-[32px] text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => setIsNotaModalOpen(false)}
                  className="flex-1 py-3 rounded-[32px] text-xs font-bold text-accent-foreground bg-accent hover:opacity-90 transition-colors uppercase tracking-widest shadow-lg shadow-zinc-200 dark:shadow-none"
                >
                  Guardar Nota
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
