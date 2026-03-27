import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useExpenses = (userName = 'Usuario A', partnerName = 'Usuario B', espacioId = undefined) => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [spaceUsers, setSpaceUsers] = useState([]);

  const fetchSpaceUsers = useCallback(async () => {
    if (!espacioId) return;
    try {
      const { data, error: supabaseError } = await supabase
        .from('perfiles')
        .select('id, nombre')
        .eq('espacio_shared_id', espacioId);

      if (supabaseError) throw supabaseError;
      setSpaceUsers(data || []);
    } catch (err) {
      console.error("Error fetching space users:", err);
    }
  }, [espacioId]);

  const fetchExpenses = useCallback(async () => {
    if (espacioId === undefined) return; // Silent return while loading profile
    
    if (espacioId === null) {
      console.error("[useExpenses] Error: espacioId es nulo. No se pueden obtener gastos.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('gastos')
        .select('*')
        .eq('espacio_id', espacioId)
        .order('fecha', { ascending: false });

      if (supabaseError) throw supabaseError;
      setExpenses(data || []);
    } catch (err) {
      setError(`Error al obtener gastos: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [espacioId]);

  const addExpense = async (expenseData) => {
    if (!espacioId) {
      const errorMsg = `[useExpenses] Error: espacioId es ${espacioId === null ? 'nulo' : 'indefinido'}. No se puede registrar el gasto.`;
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('gastos')
        .insert([{ ...expenseData, espacio_id: espacioId }])
        .select();

      if (supabaseError) {
        console.error("[useExpenses] Error al insertar gasto:", supabaseError);
        throw supabaseError;
      }
      
      // Update local state
      setExpenses(prev => [data[0], ...prev]);
      return data[0];
    } catch (err) {
      setError(`Error al añadir gasto: ${err.message}`);
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const balances = useMemo(() => {
    const totals = {};
    let totalDebeA = 0; // What User A owes Partner
    let totalDebeB = 0; // What Partner owes User A
    let totalGeneralPEN = 0;

    expenses.forEach(expense => {
      const montoPEN = parseFloat(expense.monto) * parseFloat(expense.tipo_cambio || 1);
      const pagadorId = expense.pagador_id;
      const factorDeuda = parseFloat(expense.factor_deuda || 0.5);
      
      totalGeneralPEN += montoPEN;
      totals[pagadorId] = (totals[pagadorId] || 0) + montoPEN;
      
      const deudaGenerada = montoPEN * factorDeuda;
      
      // Dynamic logic: find who paid and who is the "other"
      const payer = spaceUsers.find(u => u.id === pagadorId || u.nombre === pagadorId);
      const otherUser = spaceUsers.find(u => u.id !== payer?.id);

      if (payer) {
        if (payer.id === spaceUsers[0]?.id) {
          // First user in spaceUsers list paid
          totalDebeB += deudaGenerada;
        } else {
          // Second user in spaceUsers list paid
          totalDebeA += deudaGenerada;
        }
      }
    });

    const netBalance = totalDebeB - totalDebeA;
    let summary = "Están a mano.";
    
    const userA = spaceUsers[0]?.nombre || 'Usuario A';
    const userB = spaceUsers[1]?.nombre || 'Usuario B';

    if (netBalance > 0) {
      summary = `${userB} le debe a ${userA}: S/ ${netBalance.toFixed(2)}`;
    } else if (netBalance < 0) {
      summary = `${userA} le debe a ${userB}: S/ ${Math.abs(netBalance).toFixed(2)}`;
    }

    return {
      totals,
      totalDebeA,
      totalDebeB,
      totalGeneralPEN,
      netBalance,
      summary
    };
  }, [expenses, userName, partnerName]);

  const deleteExpense = async (id) => {
    console.log("Iniciando borrado para ID:", id);
    if (!id) {
      console.error("Error: ID no definido.");
      return;
    }
    const { error, status } = await supabase.from('gastos').delete().eq('id', id);

    if (error) {
      console.error("Error de Supabase:", error.message, "Status:", status);
      alert(`Error al borrar: ${error.message}`);
      return;
    }

    console.log("Borrado exitoso en DB. Actualizando estado local...");
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  const updateExpense = async (id, updatedData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('gastos')
        .update(updatedData)
        .eq('id', id)
        .select();

      if (supabaseError) throw supabaseError;
      
      // Update local state
      setExpenses(prev => prev.map(e => e.id === id ? data[0] : e));
      return data[0];
    } catch (err) {
      setError(`Error al actualizar gasto: ${err.message}`);
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const [filters, setFilters] = useState({
    searchTerm: '',
    categories: [],
    monthYear: '', // Format: YYYY-MM
    payerId: ''
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.concepto.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(expense.categoria);
      const matchesPayer = !filters.payerId || expense.pagador_id === filters.payerId;
      
      let matchesMonth = true;
      if (filters.monthYear) {
        const [year, month] = filters.monthYear.split('-');
        const expenseDate = new Date(expense.fecha);
        matchesMonth = expenseDate.getFullYear() === parseInt(year) && (expenseDate.getMonth() + 1) === parseInt(month);
      }
      
      return matchesSearch && matchesCategory && matchesMonth && matchesPayer;
    });
  }, [expenses, filters]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    fetchExpenses();
    fetchSpaceUsers();
  }, [fetchExpenses, fetchSpaceUsers]);

  return {
    expenses,
    filteredExpenses,
    filters,
    updateFilters,
    isLoading,
    error,
    fetchExpenses,
    fetchSpaceUsers,
    addExpense,
    deleteExpense,
    updateExpense,
    balances,
    spaceUsers
  };
};
