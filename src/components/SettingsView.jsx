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
  categoriesLoading 
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
  const [openSection, setOpenSection] = useState('identity'); // Default open section
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const SectionHeader = ({ id, icon: Icon, title, subtitle }) => {
    const isOpen = openSection === id;
    return (
      <button
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between p-6 rounded-[32px] transition-all ${
          isOpen ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200' : 'bg-white border border-zinc-100 text-zinc-900'
        }`}
      >
        <div className="flex items-center gap-4 text-left">
          <div className={`p-2.5 rounded-2xl transition-colors ${isOpen ? 'bg-white/10 text-white' : 'bg-zinc-50 text-zinc-400'}`}>
            <Icon size={20} />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm tracking-tight">{title}</h3>
            {subtitle && !isOpen && <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{subtitle}</p>}
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-white' : 'text-zinc-300'}`}>
          <ChevronRight size={20} />
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
    if (!newCategory.trim()) return;
    
    try {
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
    <div className="space-y-4 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="px-2 py-4 space-y-1">
        <h2 className="font-serif italic text-3xl text-zinc-900">Configuración</h2>
        <p className="text-xs text-zinc-400">Personaliza tu experiencia y sincroniza datos.</p>
      </header>

      {/* Identidad Section */}
      <div className="space-y-2">
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
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-6 mt-1 mx-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">
                      User ID (UUID)
                    </label>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex items-center justify-between overflow-hidden shadow-inner group">
                      <code className="text-[10px] font-mono text-zinc-500 truncate select-all">
                        {showId ? authUserId : '********-****-****-****-************'}
                      </code>
                      <button 
                        type="button"
                        onClick={() => setShowId(!showId)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        {showId ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button"
                        onClick={() => copyToClipboard(authUserId, 'ID copiado')}
                        className="flex items-center justify-center gap-2 py-3.5 bg-zinc-50 border border-zinc-100 text-zinc-600 rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95"
                      >
                        <ClipboardCheck size={14} /> Copiar
                      </button>
                      <button 
                        type="button"
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 py-3.5 bg-zinc-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 shadow-lg shadow-zinc-100"
                      >
                        <Share2 size={14} /> Compartir
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
      <div className="space-y-2">
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
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-6 mt-1 mx-1">
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 px-1">
                      Mi Nombre
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaved || loading}
                    className={`w-full py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isSaved 
                        ? 'bg-green-500 text-white' 
                        : 'bg-zinc-900 text-white shadow-lg shadow-zinc-100'
                    } active:scale-95 disabled:opacity-50`}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : isSaved ? (
                      <>
                        <CheckCircle2 size={16} /> ¡Actualizado!
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Guardar Perfil
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
      <div className="space-y-2">
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
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-6 mt-1 mx-1">
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 space-y-4">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-900">¿Cómo sincronizar?</h4>
                  <div className="space-y-3">
                    {[
                      'Pide el User ID a tu pareja.',
                      'Pégalo abajo y pulsa Vincular.',
                      'La app se actualizará sola.'
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <span className="w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-[10px] text-zinc-500">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 px-1">
                      ID de tu Pareja
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={partnerUserId}
                        onChange={(e) => setPartnerUserId(e.target.value)}
                        placeholder="UUID de pareja..."
                        className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                      <button 
                        type="button"
                        onClick={handleSync}
                        disabled={linking || !partnerUserId}
                        className="px-5 bg-zinc-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest active:scale-95 disabled:opacity-50"
                      >
                        {linking ? <Loader2 className="animate-spin" size={14} /> : 'Vincular'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-zinc-50">
                    <label className="text-[10px] uppercase font-bold tracking-widest opacity-40 px-1">Espacio Actual</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-[9px] font-mono text-zinc-400 truncate">
                        {syncId || 'Sin vincular'}
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setSyncId(crypto.randomUUID());
                          showToast('Nuevo ID generado');
                        }}
                        className="w-10 h-10 bg-zinc-50 text-zinc-400 rounded-xl border border-zinc-100 active:scale-90 flex items-center justify-center"
                      >
                        <RefreshCw size={16} />
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
      <div className="space-y-2">
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
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-6 mt-1 mx-1">
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategory('');
                    setShowAllIcons(false);
                    setIsCategoryModalOpen(true);
                  }}
                  className="w-full py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all active:scale-95"
                >
                  <Plus size={16} /> Añadir Nueva Categoría
                </button>

                <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                  {categoriesLoading ? (
                    <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-zinc-200" /></div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {categories.map((cat) => {
                        const Icon = getIconComponent(cat.icono);
                        return (
                          <div key={cat.id} className="flex items-center justify-between p-3.5 rounded-2xl border bg-zinc-50 border-zinc-100">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white" style={{ color: cat.color }}>
                                <Icon size={16} />
                              </div>
                              <span className="text-xs font-bold text-zinc-800">{cat.nombre}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => startEditing(cat)} className="p-2 text-zinc-400 hover:text-zinc-900"><Edit3 size={14} /></button>
                              <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-zinc-400 hover:text-rose-500"><Trash2 size={14} /></button>
                            </div>
                          </div>
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
              className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-black text-xl text-zinc-900 tracking-tight">
                      {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h3>
                    <p className="text-xs text-zinc-400">Personaliza el nombre, icono y color.</p>
                  </div>
                  <button 
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
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
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
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
                        className="text-[9px] font-black uppercase tracking-widest text-zinc-900 hover:opacity-70 transition-opacity"
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
                              isSelected ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200' : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200'
                            }`}
                          >
                            <Icon size={20} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={editingCategory ? !editName.trim() : !newCategory.trim()}
                    className="w-full py-5 bg-zinc-900 text-white rounded-[28px] font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-zinc-200"
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
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seguridad Section */}
      <div className="space-y-2">
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
              <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm space-y-6 mt-1 mx-1">
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono"
                      required
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmar contraseña"
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono"
                      required
                    />
                  </div>
                  <button type="submit" disabled={passwordLoading} className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-xs active:scale-95 disabled:opacity-50">
                    {passwordLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Actualizar Contraseña'}
                  </button>
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* PWA Install Section */}
      {showInstallBtn && (
        <div className="mx-1">
          <button
            onClick={handleInstallClick}
            className="w-full bg-zinc-900 p-6 rounded-[32px] text-white flex items-center justify-between shadow-xl shadow-zinc-200 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <Smartphone size={20} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm tracking-tight">Instalar App</h3>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Acceso rápido y offline</p>
              </div>
            </div>
            <Plus size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
