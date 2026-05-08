import React, { useState, useEffect, KeyboardEvent, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  User, Briefcase, Award, Clock, Plus, Trash2, Save, Sparkles,
  ChevronDown, Eye, EyeOff, Globe, BookOpen, Languages,
  Heart, Plane, History, CheckCircle2, Star, X, Search, Flag,
  DollarSign, ListChecks, Calendar, Settings, ChevronRight, AlertCircle, Trash,
  TrendingDown, Info, Timer, ImagePlus, Loader2, Zap, ArrowLeft, Rocket,
  PenTool, Layers, Database, Server, Terminal, Layout, ClipboardList, MessageSquare, Table,
  Code, Image, Users, Camera
} from 'lucide-react';
import axios from 'axios';
import { useSystem } from '../data/SystemContext';
import { obtenerTodoElPerfil } from '../services/api';
import { ProfileView } from './ProfileView';

// --- CONFIGURACIÓN HÍBRIDA DE APIS ---
const API_HOLDING = 'https://apiweb.hitpoly.com/ajax/bolsaController.php';
const API_BOLSA = 'https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php';

const styles = {
  card: "linkedin-card",
  section: "linkedin-section",
  input: "linkedin-input",
  label: "linkedin-label",
  btnPrimary: "linkedin-btn-primary",
  btnSecondary: "linkedin-btn-secondary",
  btnGhost: "linkedin-btn-ghost",
  header: "bg-white border-b border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6"
};

const MASTER_TOOLS = [
  { nombre: 'Figma', categoria: 'Diseño', icono: 'PenTool' },
  { nombre: 'Adobe Photoshop', categoria: 'Diseño', icono: 'Image' },
  { nombre: 'Adobe Illustrator', categoria: 'Diseño', icono: 'Layers' },
  { nombre: 'React', categoria: 'Desarrollo', icono: 'Code' },
  { nombre: 'Node.js', categoria: 'Desarrollo', icono: 'Server' },
  { nombre: 'Python', categoria: 'Desarrollo', icono: 'Terminal' },
  { nombre: 'PHP', categoria: 'Desarrollo', icono: 'Code' },
  { nombre: 'MySQL', categoria: 'Base de Datos', icono: 'Database' },
  { nombre: 'Google Ads', categoria: 'Marketing', icono: 'TrendingUp' },
  { nombre: 'Facebook Ads', categoria: 'Marketing', icono: 'Users' },
  { nombre: 'SEO', categoria: 'Marketing', icono: 'Search' },
  { nombre: 'Microsoft Excel', categoria: 'Productividad', icono: 'Table' },
  { nombre: 'Notion', categoria: 'Productividad', icono: 'BookOpen' },
  { nombre: 'Slack', categoria: 'Comunicación', icono: 'MessageSquare' },
  { nombre: 'Trello', categoria: 'Gestión', icono: 'Layout' },
  { nombre: 'Asana', categoria: 'Gestión', icono: 'ClipboardList' }
];

const ToolIcon = ({ name, className = "w-4 h-4" }: { name: string, className?: string }) => {
  if (name && (name.startsWith('http') || name.startsWith('data:'))) {
    return <img src={name} alt="Icon" className={`${className} object-contain rounded-md`} />;
  }
  const icons: any = {
    PenTool, Image, Layers, Code, Server, Terminal, Database, TrendingUp: ArrowLeft, Users, Search, Table, BookOpen, MessageSquare, Layout, ClipboardList
  };
  const IconComp = icons[name] || Settings;
  return <IconComp className={className} />;
};

const getUserId = () => {
  return new URLSearchParams(window.location.search).get('userId') || 
         new URLSearchParams(window.location.search).get('user_id') || 
         sessionStorage.getItem('bolsa_last_userId');
};

const DeleteConfirmModal = ({ isOpen, onCancel, onConfirm, title, loading }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative z-10 animate-in zoom-in duration-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">¿Confirmar Eliminación?</h3>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">Esta acción no se puede deshacer. ¿Estás seguro que deseas eliminar <strong>{title}</strong>?</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicePageEditor = ({ service, onClose, onSaved, handleSaveService, loading }: any) => {
    const { setMobileActions } = useSystem();
    const [localData, setLocalData] = useState(() => {
      let herr: any[] = [];
      if (service?.herramientas) {
        try { herr = typeof service.herramientas === 'string' ? JSON.parse(service.herramientas) : service.herramientas; } catch (e) { }
      }
      return {
        ...(service || {
          tipo: 'proyecto', titulo: '', descripcion: '', especificaciones_tecnicas: '', imagen: '',
          precio_base: 0, porcentaje_oferta: 0, precio_oferta: null, oferta_fin: null, tiempo_total: '', moneda: 'USD',
          entregables: []
        }),
        herramientas: herr
      };
    });
    const [saved, setSaved] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deliverableToDelete, setDeliverableToDelete] = useState<number | null>(null);
    const [toolSearch, setToolSearch] = useState('');
    const [showToolSuggestions, setShowToolSuggestions] = useState(false);
    const toolSearchRef = useRef<HTMLDivElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingImage(true);
      try {
        const uid = getUserId();
        const authRes = await axios.get(`https://apiweb.hitpoly.com/ajax/imagekit_auth.php?userId=${uid}`);
        const { token, expire, signature, publicKey } = authRes.data;
        const fd = new FormData();
        fd.append('file', file);
        fd.append('fileName', `servicio_${uid}_${Date.now()}.jpg`);
        fd.append('publicKey', publicKey);
        fd.append('signature', signature);
        fd.append('expire', expire);
        fd.append('token', token);
        fd.append('useUniqueFileName', 'true');
        fd.append('folder', `/profiles/${uid}/services`);
        const resIK = await axios.post('https://upload.imagekit.io/api/v1/files/upload', fd);
        setLocalData((prev: any) => ({ ...prev, imagen: resIK.data.url }));
      } catch (err) {
        console.error("Error uploading image:", err);
      } finally {
        setUploadingImage(false);
      }
    };

    useEffect(() => {
      if (service) {
        let herr: any[] = [];
        if (service.herramientas) {
          try { herr = typeof service.herramientas === 'string' ? JSON.parse(service.herramientas) : service.herramientas; } catch (e) { }
        }
        setLocalData({ ...service, herramientas: herr });
      }
    }, [service]);

    const dataRef = useRef(localData);
    useEffect(() => { dataRef.current = localData; }, [localData]);

    const doSave = useCallback(() => {
      setSaved(true);
      const currentData = dataRef.current;
      const dataToSave = { 
        ...currentData, 
        precio_base: (currentData.tipo === 'proyecto' && currentData.entregables.length > 0) 
            ? currentData.entregables.reduce((sum: number, ent: any) => sum + Number(ent.valor_individual || 0), 0)
            : Number(currentData.precio_base),
        herramientas: JSON.stringify(currentData.herramientas) 
      };

      handleSaveService(dataToSave, (savedData: any) => {
        setLocalData((prev: any) => ({ ...prev, id: savedData.id }));
        setTimeout(() => setSaved(false), 3000);
        if (onSaved) onSaved(savedData);
        onClose(); 
      });
    }, [handleSaveService, onSaved, onClose]);

    const addEntregable = () => setLocalData({ ...localData, entregables: [...localData.entregables, { titulo: '', descripcion: '', valor_individual: 0, tiempo_limite: '' }] });
    const updateEntregable = (idx: number, field: string, value: any) => {
      const newList = [...localData.entregables];
      newList[idx] = { ...newList[idx], [field]: value };
      setLocalData({ ...localData, entregables: newList });
    };


    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (toolSearchRef.current && !toolSearchRef.current.contains(e.target as Node)) {
          setShowToolSuggestions(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredMasterTools = MASTER_TOOLS.filter(t => 
      (t.nombre.toLowerCase().includes(toolSearch.toLowerCase()) || 
       t.categoria.toLowerCase().includes(toolSearch.toLowerCase())) &&
      !localData.herramientas.some((h: any) => h.nombre.toLowerCase() === t.nombre.toLowerCase())
    );

    const handleSelectTool = useCallback((tool: any) => {
      setLocalData(prev => ({ 
        ...prev, 
        herramientas: [...prev.herramientas, { ...tool, uso: '' }] 
      }));
      setToolSearch('');
      setShowToolSuggestions(false);
    }, []);

    const handleAddCustomTool = useCallback(async () => {
      if (!toolSearch.trim()) return;
      const toolName = toolSearch.trim();
      const newTool = { nombre: toolName, categoria: 'Personalizado', icono: 'Settings', uso: '' };
      setLocalData(prev => ({ ...prev, herramientas: [...prev.herramientas, newTool] }));
      setToolSearch('');
      setShowToolSuggestions(false);
      try {
        await axios.post(API_HOLDING, {
          accion: 'addMasterTool',
          tool_data: { nombre: toolName, categoria: 'Otros', icono: 'Settings' }
        });
      } catch (e) { }
    }, [toolSearch]);

    const updateHerramienta = useCallback((idx: number, field: string, value: any) => {
      setLocalData(prev => {
        const newList = [...prev.herramientas];
        newList[idx] = { ...newList[idx], [field]: value };
        return { ...prev, herramientas: newList };
      });
    }, []);

    const handlePercentChange = useCallback((val: number) => {
      setLocalData(prev => ({ ...prev, porcentaje_oferta: val }));
    }, []);

    const derivedPriceBase = useMemo(() => {
      if (localData.tipo === 'proyecto' && localData.entregables.length > 0) {
        return localData.entregables.reduce((sum: number, ent: any) => sum + Number(ent.valor_individual || 0), 0);
      }
      return Number(localData.precio_base);
    }, [localData.entregables, localData.tipo, localData.precio_base]);

    const derivedOferta = useMemo(() => {
      return localData.porcentaje_oferta > 0 ? derivedPriceBase * (1 - (localData.porcentaje_oferta / 100)) : null;
    }, [derivedPriceBase, localData.porcentaje_oferta]);

    const derivedTiempoTotal = useMemo(() => {
        if (localData.tipo === 'proyecto' && localData.entregables.length > 0) {
            let totalDays = 0;
            localData.entregables.forEach((ent: any) => {
              const days = parseInt(ent.tiempo_limite);
              if (!isNaN(days)) totalDays += days;
            });
            return totalDays > 0 ? `${totalDays} días` : '';
        }
        return localData.tiempo_total;
    }, [localData.entregables, localData.tipo, localData.tiempo_total]);

    const serviceMobileActions = useMemo(() => [
      {
        id: 'discard_service',
        icon: 'x' as any,
        title: 'Descartar',
        onClick: onClose,
        color: '#6b7280'
      },
      {
        id: 'save_service_mobile',
        icon: loading ? 'loader' : (saved ? 'check' : 'save'),
        title: loading ? 'Publicando...' : (saved ? 'Guardado' : 'Guardar cambios'),
        onClick: doSave,
        disabled: loading,
        color: saved ? '#10b981' : '#0a66c2'
      }
    ], [loading, saved, doSave, onClose]);

    useEffect(() => {
      setMobileActions(serviceMobileActions);
      return () => setMobileActions([]);
    }, [serviceMobileActions, setMobileActions]);

    return (
      <div className="min-h-screen bg-[#f3f2ef] w-full flex flex-col animate-in fade-in duration-300 pb-20">
        <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-8 space-y-6">
          

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Columna Principal */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Cover Image Section */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-[#0a66c2]" /> Portada Visual
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paso 1 de 4</span>
                </div>
                <div className="p-8">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative group w-full mx-auto">
                      {localData.imagen ? (
                        <>
                          <img src={localData.imagen} alt="Portada" className="w-full h-72 object-cover rounded-xl border border-gray-200 shadow-md transition-all duration-300" />
                          <label className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm hover:bg-white text-[#0a66c2] rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-all transform hover:scale-110 active:scale-95 border border-gray-100">
                            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </label>
                        </>
                      ) : (
                        <label className={`w-full h-64 bg-gray-50 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-50/50 ${uploadingImage ? 'opacity-50 pointer-events-none' : 'border-gray-300 hover:border-[#0a66c2]'}`}>
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-400 group-hover:text-[#0a66c2] transition-colors">
                            {uploadingImage ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImagePlus className="w-8 h-8" />}
                          </div>
                          <div className="text-center">
                            <span className="block text-sm font-bold text-gray-700">Cargar Portada Visual</span>
                            <span className="text-xs text-gray-500">Haz clic para seleccionar una imagen</span>
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium text-center max-w-lg">
                      Sugerencia: Usa una imagen de alta resolución (1200x600px) que represente la calidad de tu trabajo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Información General */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-8 py-4 border-b border-gray-100 bg-gray-50/30">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#0a66c2]" /> Información Principal
                  </h3>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Título del Servicio</label>
                      <input type="text" value={localData.titulo} onChange={(e) => setLocalData({ ...localData, titulo: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] outline-none transition-all font-semibold" placeholder="Ej: Diseño de Branding Corporativo..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tipo de Contratación</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest ${localData.tipo === 'hora' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-[#0a66c2] border border-blue-200'}`}>
                          {localData.tipo === 'hora' ? 'Por Hora' : 'Por Proyecto'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Descripción Profesional</label>
                    <textarea rows={5} value={localData.descripcion} onChange={(e) => setLocalData({ ...localData, descripcion: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] outline-none transition-all resize-none text-sm" placeholder="Describe a detalle qué ofreces en este servicio..." />
                  </div>
                </div>
              </div>

              {/* Entregables */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-purple-500" /> Plan de Entregables
                  </h3>
                  <button onClick={addEntregable} className="text-xs font-bold text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-purple-100">
                    <Plus className="w-4 h-4" /> Agregar Ítem
                  </button>
                </div>
                <div className="p-8 space-y-4">
                  {localData.entregables.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
                      <p className="text-sm text-gray-400 font-medium">No has agregado entregables aún.</p>
                    </div>
                  ) : (
                    localData.entregables.map((ent: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm relative group/item">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500 rounded-l-xl opacity-50"></div>
                        <div className="pl-4 space-y-4">
                          <div className="flex gap-4">
                            <input type="text" value={ent.titulo} onChange={(e) => updateEntregable(idx, 'titulo', e.target.value)} className="flex-1 bg-white px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-400 outline-none font-bold text-gray-900 transition-all text-sm" placeholder="Nombre del entregable..." />
                            <button onClick={() => setDeliverableToDelete(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Descripción del Entregable</label>
                            <textarea rows={2} value={ent.descripcion || ''} onChange={(e) => updateEntregable(idx, 'descripcion', e.target.value)} className="w-full bg-white px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-400 outline-none text-sm transition-all resize-none" placeholder="¿Qué incluye este entregable?..." />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Valor ({localData.moneda})</label>
                              <input type="number" value={ent.valor_individual} onChange={(e) => updateEntregable(idx, 'valor_individual', Number(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold" />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Días Estimados</label>
                              <input type="number" value={ent.tiempo_limite} onChange={(e) => updateEntregable(idx, 'tiempo_limite', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Columna Lateral (Sticky) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
              
              {/* Tarifas Section */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" /> Tarifas y Ofertas
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio Base ({localData.moneda})</label>
                    <div className={`px-4 py-3 rounded-xl border font-bold flex items-center gap-2 ${localData.tipo === 'proyecto' && localData.entregables.length > 0 ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-white text-gray-700 border-gray-300'}`}>
                      <span className="text-gray-400">$</span>
                      <input type="number" value={derivedPriceBase} disabled={localData.tipo === 'proyecto' && localData.entregables.length > 0} onChange={(e) => setLocalData({ ...localData, precio_base: Number(e.target.value) })} className="bg-transparent outline-none w-full" />
                    </div>
                    {localData.tipo === 'proyecto' && localData.entregables.length > 0 && <p className="text-[9px] text-blue-500 font-bold italic">Calculado según tus entregables</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#0a66c2] uppercase tracking-widest">Descuento (%)</label>
                    <div className="px-4 py-3 bg-blue-50 rounded-xl border border-blue-100 font-bold text-[#0a66c2] flex items-center gap-2">
                      <input type="number" value={localData.porcentaje_oferta || ''} onChange={(e) => handlePercentChange(Number(e.target.value))} className="bg-transparent outline-none w-full placeholder:text-blue-300" placeholder="0" />
                      <span>%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Precio Final para el Cliente</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-green-700">{localData.moneda}</span>
                      <span className="text-3xl font-black text-green-700">{Number(derivedOferta || derivedPriceBase).toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vencimiento de Oferta</label>
                    <input type="date" value={localData.oferta_fin ? localData.oferta_fin.split(' ')[0] : ''} onChange={(e) => setLocalData({ ...localData, oferta_fin: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold outline-none focus:border-[#0a66c2]" />
                  </div>
                </div>
              </div>

              {/* Tecnologías Section */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" /> Tecnologías
                  </h3>
                  <button onClick={() => setShowToolSuggestions(true)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><Search className="w-4 h-4" /></button>
                </div>
                <div className="p-6">
                  <div className="relative mb-4" ref={toolSearchRef}>
                    <input type="text" value={toolSearch} onChange={(e) => { setToolSearch(e.target.value); setShowToolSuggestions(true); }} onFocus={() => setShowToolSuggestions(true)} placeholder="Buscar..." className="w-full pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white focus:border-blue-300" />
                    {showToolSuggestions && (toolSearch.length > 0 || filteredMasterTools.length > 0) && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden p-1 max-h-48 overflow-y-auto">
                        {filteredMasterTools.map((tool, i) => (
                          <button key={i} onClick={() => handleSelectTool(tool)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 flex items-center justify-between group">
                            <span className="text-xs font-bold text-gray-700">{tool.nombre}</span>
                            <Plus className="w-3 h-3 text-gray-300 group-hover:text-blue-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {localData.herramientas.map((herr: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center shrink-0"><ToolIcon name={herr.icono} className="w-3 h-3 text-[#0a66c2]" /></div>
                          <span className="text-xs font-bold text-gray-800 truncate">{herr.nombre}</span>
                        </div>
                        <button onClick={() => setLocalData({ ...localData, herramientas: localData.herramientas.filter((_: any, i: number) => i !== idx) })} className="p-1 text-gray-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {deliverableToDelete !== null && (
          <DeleteConfirmModal
            isOpen={true}
            title={localData.entregables[deliverableToDelete]?.titulo || 'este entregable'}
            onCancel={() => setDeliverableToDelete(null)}
            onConfirm={() => {
              setLocalData({ ...localData, entregables: localData.entregables.filter((_: any, i: number) => i !== deliverableToDelete) });
              setDeliverableToDelete(null);
            }}
          />
        )}
      </div>
    );
  }
interface ProfessionalEditorProps {
  profile: any;
  userId?: string | number | null;
  onSave: () => void;
  onClose: () => void;
}

const ProfessionalEditor: React.FC<ProfessionalEditorProps> = ({ profile, userId: propsUserId, onSave, onClose }) => {
  const { setHeaderData, setMobileActions } = useSystem();
  const routerNavigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'master' | 'showcase' | 'services'>('master');
  const [loading, setLoading] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);
  const [fullProfileData, setFullProfileData] = useState<any>(null);

  const [formData, setFormData] = useState({
    bio: '', specialization: '', experience_years: '',
    availability: '', skills: '', international_markets: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [marketInput, setMarketInput] = useState('');
  const [marketsList, setMarketsList] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const [services, setServices] = useState<any[]>([]);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceToDelete, setServiceToDelete] = useState<any>(null);
  const [expandedService, setExpandedService] = useState<number | null>(null);
  
  const [loadingServices, setLoadingServices] = useState(false);
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showcaseConfig, setShowcaseConfig] = useState<any>({
    experience_ids: [], employment_ids: [], education_ids: [],
    languages_ids: [], links_ids: [], travel_ids: [],
    hobbies_ids: [], interests_ids: []
  });
  const [showPreview, setShowPreview] = useState(false);

  const userId = useMemo(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('userId') || new URLSearchParams(window.location.search).get('user_id');
    return propsUserId || profile?.user_id || profile?.id || fromUrl;
  }, [propsUserId, profile]);

  const cargarServicios = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.post(API_BOLSA, { accion: 'getServices', user_id: userId });
      if (res.data.success) setServices(res.data.data || []);
    } catch (e) {
      console.error("💥 [DEBUG] ProfessionalEditor: Error en cargarServicios:", e);
    }
  }, [userId]);

  const cargarEspecialidades = useCallback(async () => {
    try {
      const res = await axios.post(API_HOLDING, { accion: 'getTiposProfesionales' });
      if (res.data.success) setSpecialties(res.data.data || []);
    } catch (e) { }
  }, []);

  const cargarDatosCompletos = useCallback(async () => {
    if (!userId) return;
    setLoadingFull(true);
    try {
      const data = await obtenerTodoElPerfil(Number(userId));
      setFullProfileData(data);
      const rawConfig = (data as any).bolsa_data?.bolsa_config || (data as any).perfil_general?.bolsa_config;
      if (rawConfig) {
        try {
          const config = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
          setShowcaseConfig(config);
        } catch (e) { console.error("❌ Error parseando bolsa_config:", e); }
      }
    } catch (e) { console.error("❌ Error en cargarDatosCompletos:", e); } finally { setLoadingFull(false); }
  }, [userId]);

  const handleSaveMainProfile = useCallback(async () => {
    if (loading || !userId) return;
    setLoading(true);
    try {
      const selectedSpec = specialties.find(s => s.nombre === formData.specialization);
      const payload = {
        accion: 'saveStep', user_id: userId,
        bolsa_config: JSON.stringify(showcaseConfig),
        step_data: { user_type: 'professional', ...formData, specialization_id: selectedSpec?.id, bolsa_config: JSON.stringify(showcaseConfig) }
      };
      const res = await axios.post(API_HOLDING, payload);
      if (res.data.success) {
        setShowSuccess(true);
        onSave();
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (e) { } finally { setLoading(false); }
  }, [loading, userId, specialties, formData, showcaseConfig, onSave]);

  const mainMobileActions = useMemo(() => [
    {
      id: 'preview',
      icon: 'eye' as const,
      title: 'Vista previa',
      onClick: () => {
        routerNavigate(`/perfil/${userId}${window.location.search}`);
      },
      color: '#6b7280'
    },
    {
      id: 'save',
      icon: loading ? 'loader' : (showSuccess ? 'check' : 'save') as any,
      title: loading ? 'Publicando...' : (showSuccess ? 'Publicado' : 'Publicar'),
      onClick: handleSaveMainProfile,
      disabled: loading,
      color: showSuccess ? '#10b981' : '#0a66c2'
    }
  ], [userId, loading, showSuccess, handleSaveMainProfile, routerNavigate]);

  const handleCloseServiceEditor = useCallback(() => {
    setEditingService(null);
  }, []);

  useEffect(() => {
    if (editingService !== null) {
      setHeaderData({
        title: editingService === 'new_proyecto' || editingService === 'new_hora' ? 'Nuevo Servicio' : 'Editar Servicio',
        subtitle: 'Configura los detalles de tu oferta',
        icon: 'briefcase',
        color: '#0a66c2'
      });
      (window as any).bolsaBackHandler = handleCloseServiceEditor;
      // ServicePageEditor maneja sus propios mobileActions directamente
    } else {
      setHeaderData({
        title: 'Editor de Perfil Profesional',
        subtitle: 'Gestiona tu identidad y servicios',
        icon: 'users',
        color: '#0a66c2'
      });
      (window as any).bolsaBackHandler = null;
      setMobileActions(mainMobileActions);
    }

    return () => {
      (window as any).bolsaBackHandler = null;
    };
  }, [editingService, setHeaderData, setMobileActions, mainMobileActions, handleCloseServiceEditor]);

  useEffect(() => {
    cargarDatosCompletos();
    cargarEspecialidades();
    cargarServicios();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setShowSpecDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cargarDatosCompletos, cargarEspecialidades, cargarServicios]);

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        specialization: profile.specialization || '',
        experience_years: profile.experience_years || '',
        availability: profile.availability || '',
        skills: profile.skills || '',
        international_markets: profile.international_markets || ''
      });
      if (profile.skills) setSkillsList(profile.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== ''));
      if (profile.international_markets) setMarketsList(profile.international_markets.split(',').map((s: string) => s.trim()).filter((s: string) => s !== ''));
    }
  }, [profile]);

  const handleSaveService = useCallback(async (serviceData: any, onSaved?: (savedData: any) => void) => {
    if (!serviceData.id) setLoading(true);
    if (!userId) return;

    try {
      const res = await axios.post(API_BOLSA, { accion: 'saveService', user_id: userId, service_data: serviceData });
      if (res.data.success) {
        const finalSavedData = res.data.service || { ...serviceData, id: res.data.id };

        setServices(prev => {
          const index = prev.findIndex(s => s.id === finalSavedData.id);
          if (index !== -1) {
            const newList = [...prev];
            newList[index] = { ...finalSavedData };
            return newList;
          }
          return [...prev, { ...finalSavedData }];
        });

        setEditingService({ ...finalSavedData });
        if (onSaved) onSaved(finalSavedData);
      } else {
        alert('Error: ' + (res.data.error || 'No se pudo guardar'));
      }
    } catch (e: any) {
      console.error("💥 [DEBUG] ProfessionalEditor: Error en handleSaveService:", e);
      alert('Error al guardar: ' + (e.response?.data?.error || e.message));
    } finally { setLoading(false); }
  }, [userId]);

  const confirmDeleteService = useCallback(async () => {
    if (!serviceToDelete || !userId) return;
    setLoading(true);
    try {
      const res = await axios.post(API_BOLSA, { accion: 'deleteService', user_id: userId, service_id: serviceToDelete.id });
      if (res.data.success) {
        setServiceToDelete(null);
        setServices(prev => prev.filter(s => s.id !== serviceToDelete.id));
      }
    } catch (e) {
      console.error("💥 [DEBUG] ProfessionalEditor: Error en confirmDeleteService:", e);
    } finally { setLoading(false); }
  }, [serviceToDelete, userId]);

  // ServicePageEditor y DeleteConfirmModal movidos a nivel superior para evitar bucles de renderizado y recreación de componentes.

  const handleAddMarket = () => { const trimmed = marketInput.trim(); if (trimmed && !marketsList.includes(trimmed)) { const newList = [...marketsList, trimmed]; setMarketsList(newList); setFormData({ ...formData, international_markets: newList.join(', ') }); setMarketInput(''); } };
  const handleRemoveMarket = (m: string) => { const newList = marketsList.filter(item => item !== m); setMarketsList(newList); setFormData({ ...formData, international_markets: newList.join(', ') }); };
  const handleAddSkill = () => { const trimmedSkill = skillInput.trim(); if (trimmedSkill && !skillsList.includes(trimmedSkill)) { const newList = [...skillsList, trimmedSkill]; setSkillsList(newList); setFormData({ ...formData, skills: newList.join(', ') }); setSkillInput(''); } };
  const handleRemoveSkill = (skill: string) => { const newList = skillsList.filter(s => s !== skill); setFormData({ ...formData, skills: newList.join(', ') }); };

  return (
    <div className="custom-scrollbar-wrapper">
      <style>{`.custom-scrollbar-list::-webkit-scrollbar { width: 8px; } .custom-scrollbar-list::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; } .custom-scrollbar-list::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; border: 2px solid #f1f1f1; }`}</style>

      {editingService !== null && (
        <ServicePageEditor
          service={
            editingService === 'new_proyecto' ? { tipo: 'proyecto', entregables: [] } :
              editingService === 'new_hora' ? { tipo: 'hora', entregables: [] } :
                editingService
          }
          onClose={handleCloseServiceEditor}
          onSaved={cargarServicios}
          handleSaveService={handleSaveService}
          loading={loading}
        />
      )}

      {serviceToDelete && (
        <DeleteConfirmModal
          isOpen={!!serviceToDelete}
          title={serviceToDelete.titulo}
          loading={loading}
          onCancel={() => setServiceToDelete(null)}
          onConfirm={confirmDeleteService}
        />
      )}

      {editingService === null && (
        <div className="space-y-10 pb-20">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-2 md:p-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 w-full md:w-auto overflow-x-auto no-scrollbar">
              {[
                { id: 'master', label: 'Identidad', icon: <User className="w-3.5 h-3.5 md:w-4 h-4" /> },
                { id: 'services', label: 'Servicios', icon: <DollarSign className="w-3.5 h-3.5 md:w-4 h-4" /> },
                { id: 'showcase', label: 'Escaparate', icon: <Eye className="w-3.5 h-3.5 md:w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 md:flex-none px-2.5 md:px-6 py-2 md:py-2.5 rounded-md font-bold flex items-center justify-center gap-1.5 md:gap-2 transition-all text-[10px] md:text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-[#0a66c2] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => {
                  const uid = getUserId();
                  routerNavigate(`/perfil/${uid}${window.location.search}`);
                }}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-all flex items-center gap-2 text-sm shadow-sm"
              >
                <Eye className="w-4 h-4" />
                Vista previa
              </button>
              {!showSuccess ? (
                <button
                  onClick={handleSaveMainProfile}
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#0a66c2] text-white font-bold rounded-full hover:bg-blue-700 transition-all flex items-center gap-2 text-sm shadow-lg"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Publicando...' : 'Publicar'}
                </button>
              ) : (
                <div className="bg-green-600 text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publicado</span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {activeTab === 'master' && (
              <div className="lg:col-span-12 space-y-6 animate-in fade-in duration-500">
                <div className={styles.section}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2"><User className="w-5 h-5 text-[#0a66c2]" /> Perfil Profesional</h3>
                      <div>
                        <label className={styles.label}>Biografía Corta</label>
                        <textarea name="bio" rows={4} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className={`${styles.input} min-h-[120px]`} placeholder="Resume tu valor profesional..." />
                      </div>
                      <div className="relative" ref={dropdownRef}>
                        <label className={styles.label}>Especialidad Principal</label>
                        <div onClick={() => setShowSpecDropdown(!showSpecDropdown)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer hover:bg-white transition-all">
                          <span className="text-sm font-semibold text-gray-700">{formData.specialization || "Selecciona tu cargo..."}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSpecDropdown ? 'rotate-180' : ''}`} />
                        </div>
                        {showSpecDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-1">
                            {specialties.map(spec => (
                              <div key={spec.id} onClick={() => { setFormData({ ...formData, specialization: spec.nombre }); setShowSpecDropdown(false); }} className={`px-4 py-2 text-sm font-medium rounded-md cursor-pointer hover:bg-blue-50 ${formData.specialization === spec.nombre ? 'text-[#0a66c2] bg-blue-50 font-bold' : 'text-gray-600'}`}>{spec.nombre}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-[#0a66c2]" /> Configuración de Mercado</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className={styles.label}>Años Experiencia</label><input type="number" name="experience_years" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })} className={styles.input} /></div>
                        <div><label className={styles.label}>Disponibilidad</label><select name="availability" value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} className={styles.input}><option value="full-time">Full Time</option><option value="part-time">Part Time</option><option value="freelance">Freelance</option></select></div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className={styles.label}>🌎 Mercados de Impacto</label>
                        <div className="flex gap-2 mb-3">
                          <input type="text" value={marketInput} onChange={(e) => setMarketInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddMarket()} className={styles.input} placeholder="País..." />
                          <button onClick={handleAddMarket} className="p-2.5 bg-[#0a66c2] text-white rounded-lg hover:bg-[#004182] transition-all"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {marketsList.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-white text-[#0a66c2] font-semibold text-[11px] rounded-full border border-[#0a66c2]/20">{m}<button onClick={() => handleRemoveMarket(m)}><X className="w-3 h-3" /></button></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'showcase' && (
              <div className="lg:col-span-12 space-y-6 animate-in fade-in duration-500">
                <div className={styles.section}>
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-8">
                    <div className="p-3 bg-blue-50 text-[#0a66c2] rounded-lg"><Eye className="w-6 h-6" /></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Configuración del Escaparate</h3>
                      <p className="text-sm text-gray-500 font-medium">Elige qué información de Holding quieres destacar.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fullProfileData ? (
                      <>
                        {[
                          { id: 'experience', label: 'Labor Actual', data: fullProfileData.experiencia_laboral, icon: <Briefcase className="w-4 h-4" />, titleKey: 'job_title' },
                          { id: 'employment', label: 'Empleos Anteriores', data: fullProfileData.empleo, icon: <History className="w-4 h-4" />, titleKey: 'position' },
                          { id: 'education', label: 'Formación Académica', data: fullProfileData.educacion, icon: <BookOpen className="w-4 h-4" />, titleKey: 'specialization' },
                          { id: 'languages', label: 'Idiomas', data: fullProfileData.idiomas, icon: <Languages className="w-4 h-4" />, titleKey: 'idioma' },
                          { id: 'links', label: 'Enlaces y Redes', data: fullProfileData.links, icon: <Globe className="w-4 h-4" />, titleKey: 'label' },
                          { id: 'hobbies', label: 'Hobbies', data: fullProfileData.hobbies, icon: <Heart className="w-4 h-4" />, titleKey: 'hobby_name' },
                          { id: 'interests', label: 'Intereses', data: fullProfileData.intereses, icon: <Sparkles className="w-4 h-4" />, titleKey: 'interest_name' }
                        ].map(section => (
                          <div key={section.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col h-full">
                            <div className="flex items-center gap-2 text-gray-900 font-bold mb-4 pb-2 border-b border-gray-200/50">
                              <span className="text-[#0a66c2]">{section.icon}</span>
                              <span className="text-sm">{section.label}</span>
                            </div>
                            <div className="space-y-2 overflow-y-auto custom-scrollbar-list pr-1 max-h-48">
                              {section.data && section.data.length > 0 ? section.data.map((item: any) => (
                                <label key={item.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-[#0a66c2] hover:bg-blue-50/10 transition-all">
                                  <input type="checkbox" checked={showcaseConfig[`${section.id}_ids`]?.includes(item.id)} onChange={(e) => {
                                    const key = `${section.id}_ids`;
                                    const current = showcaseConfig[key] || [];
                                    const newList = e.target.checked ? [...current, item.id] : current.filter((id: any) => id !== item.id);
                                    setShowcaseConfig({ ...showcaseConfig, [key]: newList });
                                  }} className="w-4 h-4 rounded border-gray-300 text-[#0a66c2] focus:ring-[#0a66c2]" />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[11px] font-bold text-gray-800 truncate">{item[section.titleKey] || item.titulo || item.empresa || item.nombre || 'Sin título'}</span>
                                    {(item.company_name || item.institution_name || item.empresa) && (
                                      <span className="text-[10px] font-semibold text-gray-500 truncate">{item.company_name || item.institution_name || item.empresa}</span>
                                    )}
                                  </div>
                                </label>
                              )) : <p className="text-[10px] text-gray-400 font-bold italic p-4 text-center">Sin datos registrados</p>}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="col-span-full py-10 text-center animate-pulse font-bold text-gray-400">Cargando datos de Holding...</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="lg:col-span-12 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Tarifario de Servicios</h3>
                    <p className="text-xs text-gray-500 font-medium">Define tus paquetes y tarifas profesionales.</p>
                  </div>
                  <div className="flex flex-row gap-2 sm:gap-3 w-full md:w-auto">
                    <button onClick={() => setEditingService('new_proyecto')} className={`${styles.btnSecondary} flex-1 md:flex-none px-6 justify-center py-2.5 text-[10px] sm:text-sm whitespace-nowrap`}>
                      <Plus className="w-3.5 h-3.5 sm:w-4 h-4" /> Por Proyecto
                    </button>
                    <button onClick={() => setEditingService('new_hora')} className={`${styles.btnPrimary} flex-1 md:flex-none px-6 justify-center py-2.5 text-[10px] sm:text-sm whitespace-nowrap`}>
                      <Plus className="w-3.5 h-3.5 sm:w-4 h-4" /> Por Hora
                    </button>
                  </div>
                </div>
                {loadingServices ? <div className="py-20 text-center font-bold text-gray-400 animate-pulse">Cargando tarifario...</div> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {services.map((service) => {
                      return (
                        <div key={service.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden h-full">
                          {service.imagen ? (
                            <div className="relative h-44 overflow-hidden bg-gray-100">
                              <img src={service.imagen} alt={service.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute top-3 left-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${service.tipo === 'hora' ? 'bg-purple-600 text-white' : 'bg-[#0a66c2] text-white'}`}>
                                  {service.tipo === 'hora' ? 'Por Hora' : 'Proyecto'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-44 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                              <div className="flex flex-col items-center gap-2 text-gray-300">
                                <Sparkles className="w-8 h-8" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{service.tipo === 'hora' ? 'Servicio por Hora' : 'Servicio por Proyecto'}</span>
                              </div>
                            </div>
                          )}

                          <div className="p-6 flex-1 flex flex-col space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[#0a66c2] transition-colors">{service.titulo}</h4>
                              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingService(service)} className="p-2 text-gray-400 hover:text-[#0a66c2] hover:bg-blue-50 rounded-lg transition-all" title="Editar"><Settings className="w-4 h-4" /></button>
                                <button onClick={() => setServiceToDelete(service)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-500 font-medium line-clamp-3 leading-relaxed">{service.descripcion}</p>

                            <div className="flex flex-wrap gap-2 pt-2">
                              {service.tiempo_total && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 text-gray-500 rounded text-[10px] font-bold border border-gray-100">
                                  <Timer className="w-3 h-3" /> {service.tiempo_total}
                                </div>
                              )}
                              {service.porcentaje_oferta > 0 && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold border border-green-100">
                                  <TrendingDown className="w-3 h-3" /> {service.porcentaje_oferta}% OFF
                                </div>
                              )}
                            </div>

                            {service.entregables && service.entregables.length > 0 && (
                              <div className="pt-4 border-t border-gray-100 mt-auto">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contenido del Servicio</p>
                                  <span className="text-[10px] font-bold text-gray-300">{service.entregables.length} ítems</span>
                                </div>
                                <div className="space-y-2">
                                  {service.entregables.slice(0, 3).map((ent: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between group/item">
                                      <div className="flex items-center gap-2 truncate pr-4">
                                        <div className="w-1 h-1 bg-blue-400 rounded-full shrink-0 group-hover/item:w-2 transition-all" />
                                        <span className="text-[11px] font-semibold text-gray-600 truncate">{ent.titulo}</span>
                                      </div>
                                      <div className="flex flex-col items-end gap-0.5 shrink-0 min-w-fit">
                                        <span className="text-[10px] font-bold text-gray-900 leading-none">
                                          {service.moneda} {Number(ent.valor_individual || 0).toLocaleString()}
                                        </span>
                                        {ent.tiempo_limite && (
                                          <span className="text-[9px] font-medium text-gray-400 flex items-center gap-0.5 leading-none">
                                            <Timer className="w-2.5 h-2.5" /> {ent.tiempo_limite}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Inversión Estimada</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900">{service.moneda} {Number(service.precio_oferta || service.precio_base).toLocaleString()}</span>
                                {service.porcentaje_oferta > 0 && <span className="text-xs text-gray-400 line-through font-medium">{service.moneda} {Number(service.precio_base).toLocaleString()}</span>}
                              </div>
                            </div>
                            <button onClick={() => setEditingService(service)} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white transition-all shadow-sm">
                              Gestionar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>

  );

};

export default ProfessionalEditor;
