import React, { useState, useEffect } from 'react';
import { 
  User, Users, Save, CheckCircle2, Share2, Copy, RefreshCw, 
  Loader2, ShieldCheck, Key, Fingerprint, List, Plus, Trash2, 
  Eye, EyeOff, Home, Utensils, Car, Sparkles, ShoppingBag, 
  Heart, Gift, Coffee, Plane, Smartphone, Briefcase, Edit3, ClipboardCheck,
  ChevronRight, ChevronDown, Zap, Music, Gamepad2, Camera, Book, Globe, 
  Dumbbell, Pizza, Wine, Moon, Sun, Cloud, Umbrella, Wind, Flame, 
  Anchor, Award, Bell, Clock, Compass, CreditCard, Database, Feather, 
  Flag, Flashlight, Folder, HardDrive, Headphones, Image, Inbox, Laptop, 
  Layers, LifeBuoy, Link, Lock, Mail, Map, Mic, Monitor, Mouse, Package, 
  Paperclip, Pen, Phone, PieChart, Play, Printer, Puzzle, Radio, Search, 
  Send, Settings, Shield, Shirt, Skull, Smile, Speaker, Star, Tag, Target, 
  Terminal, ThumbsUp, Ticket, Timer, Wrench, Trash, Trophy, Truck, Tv, 
  Unlock, Upload, Video, Volume2, Wallet, Watch, Wifi
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'motion/react';

const ICON_OPTIONS = [
  { name: 'Home', icon: Home },
  { name: 'Utensils', icon: Utensils },
  { name: 'Car', icon: Car },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Heart', icon: Heart },
  { name: 'Gift', icon: Gift },
  { name: 'Coffee', icon: Coffee },
  { name: 'Plane', icon: Plane },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Zap', icon: Zap },
  { name: 'Music', icon: Music },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Camera', icon: Camera },
  { name: 'Book', icon: Book },
  { name: 'Globe', icon: Globe },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Pizza', icon: Pizza },
  { name: 'Wine', icon: Wine },
  { name: 'Moon', icon: Moon },
  { name: 'Sun', icon: Sun },
  { name: 'Cloud', icon: Cloud },
  { name: 'Umbrella', icon: Umbrella },
  { name: 'Wind', icon: Wind },
  { name: 'Flame', icon: Flame },
  { name: 'Anchor', icon: Anchor },
  { name: 'Award', icon: Award },
  { name: 'Bell', icon: Bell },
  { name: 'Clock', icon: Clock },
  { name: 'Compass', icon: Compass },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Database', icon: Database },
  { name: 'Feather', icon: Feather },
  { name: 'Flag', icon: Flag },
  { name: 'Flashlight', icon: Flashlight },
  { name: 'Folder', icon: Folder },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Headphones', icon: Headphones },
  { name: 'Image', icon: Image },
  { name: 'Inbox', icon: Inbox },
  { name: 'Laptop', icon: Laptop },
  { name: 'Layers', icon: Layers },
  { name: 'LifeBuoy', icon: LifeBuoy },
  { name: 'Link', icon: Link },
  { name: 'Lock', icon: Lock },
  { name: 'Mail', icon: Mail },
  { name: 'Map', icon: Map },
  { name: 'Mic', icon: Mic },
  { name: 'Monitor', icon: Monitor },
  { name: 'Mouse', icon: Mouse },
  { name: 'Package', icon: Package },
  { name: 'Paperclip', icon: Paperclip },
  { name: 'Pen', icon: Pen },
  { name: 'Phone', icon: Phone },
  { name: 'PieChart', icon: PieChart },
  { name: 'Play', icon: Play },
  { name: 'Printer', icon: Printer },
  { name: 'Puzzle', icon: Puzzle },
  { name: 'Radio', icon: Radio },
  { name: 'Search', icon: Search },
  { name: 'Send', icon: Send },
  { name: 'Settings', icon: Settings },
  { name: 'Shield', icon: Shield },
  { name: 'Shirt', icon: Shirt },
  { name: 'Skull', icon: Skull },
  { name: 'Smile', icon: Smile },
  { name: 'Speaker', icon: Speaker },
  { name: 'Star', icon: Star },
  { name: 'Tag', icon: Tag },
  { name: 'Target', icon: Target },
  { name: 'Terminal', icon: Terminal },
  { name: 'ThumbsUp', icon: ThumbsUp },
  { name: 'Ticket', icon: Ticket },
  { name: 'Timer', icon: Timer },
  { name: 'Wrench', icon: Wrench },
  { name: 'Trash', icon: Trash },
  { name: 'Trophy', icon: Trophy },
  { name: 'Truck', icon: Truck },
  { name: 'Tv', icon: Tv },
  { name: 'Unlock', icon: Unlock },
  { name: 'Upload', icon: Upload },
  { name: 'Video', icon: Video },
  { name: 'Volume2', icon: Volume2 },
  { name: 'Wallet', icon: Wallet },
  { name: 'Watch', icon: Watch },
  { name: 'Wifi', icon: Wifi },
];

const COLOR_OPTIONS = [
  '#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8',
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6',
  '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
];

export default function SettingsView({ 
  profile, 
  onProfileUpdate, 
  categories = [], 
  onAddCategory, 
  onUpdateCategory,
  onDeleteCategory, 
  categoriesLoading,
  theme,
  setTheme
}) {
  const [authUserId, setAuthUserId] = useState(null);
  const [userName, setUserName] = useState(profile?.nombre || '');
  const [syncId, setSyncId] = useState(profile?.espacio_shared_id || '');
  const [partnerUserId, setPartnerUserId] = useState('');
  const [linking, setLinking] = useState(false);
  
  // ID Visibility
  const [showId, setShowId] = useState(false);

  // Categories states
  const [newCategory, setNewCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('ShoppingBag');
  const [selectedColor, setSelectedColor] = useState('#18181b');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('ShoppingBag');
  const [editColor, setEditColor] = useState('#18181b');
  const [showAllIcons, setShowAllIcons] = useState(false);
  
  // Security states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // PWA Install states
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState(null); // Default open section
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const SectionHeader = ({ id, icon: Icon, title, subtitle }) => {
    const isOpen = openSection === id;
    return (
      <button
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between py-3 px-1 transition-all ${
          isOpen ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'
        }`}
      >
        <div className="flex items-center gap-3 text-left">
          <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'}`}>
            <Icon size={14} />
          </div>
          <div className="space-y-0.5">
            <h3 className={`font-bold text-xs tracking-tight ${isOpen ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>{title}</h3>
            {subtitle && !isOpen && <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">{subtitle}</p>}
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-600'}`}>
          <ChevronRight size={14} />
        </div>
      </button>
    );
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    // 1. Trazador de depuración en consola
    console.log("ESTADO ACTUAL DEL PERFIL:", profile);
    console.log("ID DE ESPACIO A ENVIAR:", profile?.espacio_shared_id);

    // 2. Barrera de validación (Hard Stop)
    if (!profile || !profile.espacio_shared_id) {
      alert("ERROR CRÍTICO: Tu perfil no tiene un 'espacio_id' asignado. Recarga la página o verifica la base de datos.");
      return; // Detener la ejecución aquí, no llamar a Supabase
    }

    if (!newCategory.trim()) return;
    
    try {
      // 3. Llamada a Supabase (Asegurando el mapeo exacto)
      const payload = {
        nombre: newCategory.trim(),
        icono: selectedIcon,
        color: selectedColor,
        espacio_id: profile.espacio_shared_id
      };

      console.log("PAYLOAD FINAL A SUPABASE:", payload);

      await onAddCategory(newCategory.trim(), selectedIcon, selectedColor);
      
      setNewCategory('');
      setSelectedIcon('ShoppingBag');
      setSelectedColor('#18181b');
      setIsCategoryModalOpen(false);
      setShowAllIcons(false);
      showToast('Categoría añadida');
    } catch (err) {
      alert('Error al añadir categoría: ' + err.message);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    try {
      await onUpdateCategory(editingCategory.id, {
        nombre: editName.trim(),
        icono: editIcon,
        color: editColor
      });
      setEditingCategory(null);
      setIsCategoryModalOpen(false);
      setShowAllIcons(false);
      showToast('Categoría actualizada');
    } catch (err) {
      alert('Error al actualizar categoría: ' + err.message);
    }
  };

  const startEditing = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.nombre);
    setEditIcon(cat.icono || 'ShoppingBag');
    setEditColor(cat.color || '#18181b');
    setShowAllIcons(false);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await onDeleteCategory(id);
      showToast('Categoría eliminada');
    } catch (err) {
      alert('Error al eliminar categoría: ' + err.message);
    }
  };

  const handleSync = async () => {
    if (!partnerUserId.trim()) return alert("Ingrese un ID");
    setLinking(true);
    try {
      // 1. Buscar el espacio_id de la pareja
      const { data: partnerData, error: fetchError } = await supabase
        .from('perfiles')
        .select('espacio_shared_id')
        .eq('id', partnerUserId.trim())
        .single();
      
      if (fetchError || !partnerData) {
        throw new Error("No se encontró el ID de la pareja. Verifica que sea correcto.");
      }
      
      if (!partnerData.espacio_shared_id) {
        throw new Error("La pareja no tiene un espacio configurado. Pídele que abra la app primero.");
      }

      // 2. Actualizar mi perfil con el espacio_id de la pareja
      const { error: updateError } = await supabase
        .from('perfiles')
        .update({ espacio_shared_id: partnerData.espacio_shared_id })
        .eq('id', authUserId);

      if (updateError) throw updateError;

      alert("¡Vinculación exitosa!");
      window.location.reload(); // Recargar para aplicar el nuevo contexto
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setLinking(false); // ESTO EVITA EL BUCLE INFINITO
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .update({ 
          nombre: userName, 
          espacio_shared_id: syncId 
        })
        .eq('id', profile.id)
        .select()
        .single();
      
      if (error) throw error;
      onProfileUpdate(data);
      setIsSaved(true);
      showToast('Perfil guardado');
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast('Contraseña actualizada');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert('Error al actualizar contraseña: ' + err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const copyToClipboard = (text, message = 'Copiado al portapapeles') => {
    navigator.clipboard.writeText(text);
    showToast(message);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Mi User ID - Espacio Compartido',
      text: `Este es mi ID para sincronizar gastos: ${authUserId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard(authUserId, 'ID copiado (Compartir no disponible)');
      }
    } else {
      copyToClipboard(authUserId, 'ID copiado al portapapeles');
    }
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase z-[100] animate-in fade-in slide-in-from-bottom-4 shadow-2xl';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  };

  const getIconComponent = (iconName) => {
    const option = ICON_OPTIONS.find(o => o.name === iconName);
    return option ? option.icon : ShoppingBag;
  };

  if (!authUserId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-zinc-300" size={32} />
        <p className="text-sm text-zinc-500 italic">Inicie sesión para ver su ID</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="px-1 py-4 space-y-1">
        <h2 className="font-serif italic text-3xl text-zinc-900 dark:text-zinc-100">Configuración</h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Personaliza tu experiencia y sincroniza datos.</p>
      </header>

      {/* Apariencia Section */}
      <div className="py-1">
        <SectionHeader 
          id="appearance" 
          icon={Moon} 
          title="Apariencia" 
          subtitle="Tema de la aplicación" 
        />
        <AnimatePresence>
          {openSection === 'appearance' && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-1 pb-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold tracking-widest opacity-40 dark:text-zinc-500">
                    Tema
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border ${theme === 'light' ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800' : 'border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900'} transition-all`}
                    >
                      <Sun size={16} className={theme === 'light' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'} />
                      <span className={`text-[10px] mt-1 font-medium ${theme === 'light' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>Claro</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border ${theme === 'dark' ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800' : 'border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900'} transition-all`}
                    >
                      <Moon size={16} className={theme === 'dark' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'} />
                      <span className={`text-[10px] mt-1 font-medium ${theme === 'dark' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>Oscuro</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border ${theme === 'system' ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800' : 'border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900'} transition-all`}
                    >
                      <Monitor size={16} className={theme === 'system' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'} />
                      <span className={`text-[10px] mt-1 font-medium ${theme === 'system' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>Sistema</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Identidad Section */}
      <div className="py-1">
        <SectionHeader 
          id="identity" 
          icon={Fingerprint} 
          title="Mi Identidad" 
          subtitle="ID único y compartir" 
        />
        <AnimatePresence>
          {openSection === 'identity' && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-1 pb-4 space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest opacity-40 dark:text-zinc-500">
                      User ID (UUID)
                    </label>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between overflow-hidden shadow-inner group">
                      <code className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 truncate select-all">
                        {showId ? authUserId : '********-****-****-****-************'}
                      </code>
                      <button 
                        type="button"
                        onClick={() => setShowId(!showId)}
                        className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        {showId ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button"
                        onClick={() => copyToClipboard(authUserId, 'ID copiado')}
                        className="flex items-center justify-center gap-1.5 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg font-bold text-[9px] uppercase tracking-widest active:scale-95"
                      >
                        <ClipboardCheck size={12} /> Copiar
                      </button>
                      <button 
                        type="button"
                        onClick={handleShare}
                        className="flex items-center justify-center gap-1.5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-bold text-[9px] uppercase tracking-widest active:scale-95 shadow-lg shadow-zinc-100 dark:shadow-none"
                      >
                        <Share2 size={12} /> Compartir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Perfil Section */}
      <div className="py-1">
        <SectionHeader 
          id="profile" 
          icon={User} 
          title="Perfil Personal" 
          subtitle="Nombre y preferencias" 
        />
        <AnimatePresence>
          {openSection === 'profile' && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-1 pb-4 space-y-3">
                <form onSubmit={handleSave} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-widest opacity-40 px-1 dark:text-zinc-500">
                      Mi Nombre
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all font-medium dark:text-zinc-100"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaved || loading}
                    className={`w-full py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      isSaved 
                        ? 'bg-green-500 text-white' 
                        : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md shadow-zinc-100 dark:shadow-none'
                    } active:scale-95 disabled:opacity-50`}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : isSaved ? (
                      <>
                        <CheckCircle2 size={14} /> ¡Actualizado!
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Guardar Perfil
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Sincronización Section */}
      <div className="py-1">
        <SectionHeader 
          id="sync" 
          icon={RefreshCw} 
          title="Sincronización" 
          subtitle="Vincular con pareja" 
        />
        <AnimatePresence>
          {openSection === 'sync' && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-1 pb-4 space-y-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 space-y-2">
                  <h4 className="text-[9px] uppercase font-bold tracking-widest text-zinc-900 dark:text-zinc-100">¿Cómo sincronizar?</h4>
                  <div className="space-y-1.5">
                    {[
                      'Pide el User ID a tu pareja.',
                      'Pégalo abajo y pulsa Vincular.',
                      'La app se actualizará sola.'
                    ].map((step, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="w-3.5 h-3.5 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center text-[7px] font-bold text-white dark:text-zinc-900 shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-[9px] text-zinc-500 dark:text-zinc-400">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-widest opacity-40 px-1 dark:text-zinc-500">
                      ID de tu Pareja
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={partnerUserId}
                        onChange={(e) => setPartnerUserId(e.target.value)}
                        placeholder="UUID de pareja..."
                        className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2 text-[9px] font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-zinc-100"
                      />
                      <button 
                        type="button"
                        onClick={handleSync}
                        disabled={linking || !partnerUserId}
                        className="px-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-bold text-[9px] uppercase tracking-widest active:scale-95 disabled:opacity-50"
                      >
                        {linking ? <Loader2 className="animate-spin" size={12} /> : 'Vincular'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-50 dark:border-zinc-800">
                    <label className="text-[9px] uppercase font-bold tracking-widest opacity-40 px-1 dark:text-zinc-500">Espacio Actual</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2 text-[8px] font-mono text-zinc-400 dark:text-zinc-500 truncate">
                        {syncId || 'Sin vincular'}
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setSyncId(crypto.randomUUID());
                          showToast('Nuevo ID generado');
                        }}
                        className="w-8 h-8 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 rounded-lg border border-zinc-100 dark:border-zinc-800 active:scale-90 flex items-center justify-center"
                      >
                        <RefreshCw size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Categorías Section */}
      <div className="py-1">
        <SectionHeader 
          id="categories" 
          icon={List} 
          title="Mis Categorías" 
          subtitle={`${categories.length} categorías activas`} 
        />
        <AnimatePresence>
          {openSection === 'categories' && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-1 pb-4 space-y-3">
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategory('');
                    setShowAllIcons(false);
                    setIsCategoryModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
                >
                  <Plus size={14} /> Añadir Nueva Categoría
                </button>

                <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                  {categoriesLoading ? (
                    <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-zinc-200 dark:text-zinc-700" size={20} /></div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const Icon = getIconComponent(cat.icono);
                        return (
                          <button 
                            key={cat.id} 
                            onClick={() => startEditing(cat)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border bg-zinc-50 border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95 group"
                          >
                            <div style={{ color: cat.color }} className="dark:brightness-125">
                              <Icon size={14} />
                            </div>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{cat.nombre}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Category Modal Popup */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-black text-xl text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h3>
                    <p className="text-xs text-zinc-400">Personaliza el nombre, icono y color.</p>
                  </div>
                  <button 
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>

                <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 px-1">Nombre</label>
                    <input
                      type="text"
                      value={editingCategory ? editName : newCategory}
                      onChange={(e) => editingCategory ? setEditName(e.target.value) : setNewCategory(e.target.value)}
                      placeholder="Ej. Mascotas, Suscripciones..."
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all font-medium dark:text-zinc-100"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 px-1">Color</label>
                    <div className="flex flex-wrap gap-3">
                      {COLOR_OPTIONS.map((color) => {
                        const isSelected = (editingCategory ? editColor : selectedColor) === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => editingCategory ? setEditColor(color) : setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full border-2 transition-all active:scale-90 ${
                              isSelected ? 'border-zinc-900 scale-125 shadow-md' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Icono</label>
                      <button 
                        type="button"
                        onClick={() => setShowAllIcons(!showAllIcons)}
                        className="text-[9px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity"
                      >
                        {showAllIcons ? 'Ver menos' : 'Ver todos'}
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {(showAllIcons ? ICON_OPTIONS : ICON_OPTIONS.slice(0, 15)).map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = (editingCategory ? editIcon : selectedIcon) === opt.name;
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => editingCategory ? setEditIcon(opt.name) : setSelectedIcon(opt.name)}
                            className={`w-full aspect-square rounded-2xl border flex items-center justify-center transition-all active:scale-90 ${
                              isSelected ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-200 dark:shadow-none' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-600'
                            }`}
                          >
                            <Icon size={20} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={editingCategory ? !editName.trim() : !newCategory.trim()}
                      className="w-full py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-[28px] font-bold text-sm flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-white transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-zinc-200 dark:shadow-none"
                    >
                      {editingCategory ? (
                        <>
                          <CheckCircle2 size={18} /> Actualizar Categoría
                        </>
                      ) : (
                        <>
                          <Plus size={18} /> Crear Categoría
                        </>
                      )}
                    </button>

                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(editingCategory.id)}
                        className="w-full py-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-[24px] font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-95"
                      >
                        <Trash2 size={16} /> Eliminar Categoría
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seguridad Section */}
      <div className="py-1">
        <SectionHeader 
          id="security" 
          icon={ShieldCheck} 
          title="Seguridad" 
          subtitle="Cambiar contraseña" 
        />
        <AnimatePresence>
          {openSection === 'security' && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-1 pb-4 space-y-3">
                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-mono dark:text-zinc-100"
                      required
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmar contraseña"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-mono dark:text-zinc-100"
                      required
                    />
                  </div>
                  <button type="submit" disabled={passwordLoading} className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-bold text-[10px] uppercase tracking-widest active:scale-95 disabled:opacity-50">
                    {passwordLoading ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Actualizar Contraseña'}
                  </button>
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* PWA Install Section */}
      {showInstallBtn && (
        <div className="py-2">
          <button
            onClick={handleInstallClick}
            className="w-full bg-zinc-900 dark:bg-zinc-100 p-3 rounded-xl text-white dark:text-zinc-900 flex items-center justify-between shadow-md shadow-zinc-200 dark:shadow-none active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="bg-white/10 dark:bg-zinc-900/10 p-1.5 rounded-lg">
                <Smartphone size={14} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs tracking-tight">Instalar App</h3>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">Acceso rápido y offline</p>
              </div>
            </div>
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
