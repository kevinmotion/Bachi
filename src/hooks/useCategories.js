import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useCategories = (espacioId = undefined) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (espacioId === undefined) return; // Silent return while loading profile
    
    if (espacioId === null) {
      console.error("[useCategories] Error: espacioId es nulo. No se pueden obtener categorías.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('categorias')
        .select('*')
        .eq('espacio_id', espacioId)
        .order('nombre');

      if (supabaseError) throw supabaseError;
      setCategories(data || []);
    } catch (err) {
      setError(`Error al obtener categorías: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [espacioId]);

  const addCategory = async (nombre, icono = 'ShoppingBag', color = '#18181b') => {
    if (!espacioId || !nombre.trim()) return;
    setIsLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from('categorias')
        .insert([{ 
          nombre: nombre.trim(), 
          espacio_id: espacioId,
          icono: icono,
          color: color
        }])
        .select();

      if (supabaseError) {
        console.error("[useCategories] Error al insertar categoría:", supabaseError);
        throw supabaseError;
      }
      setCategories(prev => [...prev, data[0]]);
      return data[0];
    } catch (err) {
      setError(`Error al añadir categoría: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id, updates) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .select();

      if (supabaseError) throw supabaseError;
      setCategories(prev => prev.map(c => c.id === id ? data[0] : c));
      return data[0];
    } catch (err) {
      setError(`Error al actualizar categoría: ${err.message}`);
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const { error: supabaseError } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(`Error al eliminar categoría: ${err.message}`);
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
};
