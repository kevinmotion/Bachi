import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useCategories = (profile) => {
  const espacioId = profile?.espacio_shared_id;
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!espacioId) return; // Silent return while loading profile
    
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
    // Validar que el perfil exista antes de intentar guardar
    if (!profile || !profile.espacio_shared_id) {
      throw new Error("Error: No se ha cargado tu perfil o espacio compartido.");
    }

    setIsLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from('categorias')
        .insert([{ 
          nombre: nombre.trim(), 
          icono: icono,
          color: color,
          espacio_id: profile.espacio_shared_id // <-- ESTA ES LA LÍNEA CRÍTICA AÑADIDA
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
