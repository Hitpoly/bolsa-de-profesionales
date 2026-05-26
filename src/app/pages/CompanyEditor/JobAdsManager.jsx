import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { 
  Plus, Trash2, Edit3, Save, X, Briefcase, MapPin, DollarSign, 
  Clock, CheckCircle2, List, Target, Gift, Wrench, ChevronDown, 
  Loader2, AlertCircle, Eye, Rocket, Info, Send, Camera, Power
} from 'lucide-react';
import axios from 'axios';
import { uploadToImageKit } from '../../services/imageKitService';

const API_BOLSA = 'https://apibolsaprofesionales.hitpoly.com/ajax/anuncios.php';

export function JobAdsManager({ empresaId, userId, defaultCategory }) {
  const navigate = useNavigate();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    descripcion: '',
    categoria: '',
    modalidad: 'remoto',
    tipo_contrato: 'tiempo_completo',
    ubicacion: '',
    salario_min: '',
    salario_max: '',
    moneda: 'USD',
    mostrar_salario: true,
    imagen_url: '',
    requisitos: [],
    responsabilidades: [],
    beneficios: [],
    herramientas: [],
    fecha_limite: '',
    prioridad: 'normal'
  });

  // Campos temporales para inputs de listas
  const [tempInput, setTempInput] = useState({
    requisito: '',
    responsabilidad: '',
    beneficio: '',
    herramienta: ''
  });

  const cargarAnuncios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(API_BOLSA, {
        accion: 'getAnunciosEmpresa',
        empresa_id: empresaId
      });
      if (res.data.success) {
        setAnuncios(res.data.data);
      }
    } catch (e) {
      console.error("Error cargando anuncios");
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    if (empresaId) cargarAnuncios();
  }, [empresaId, cargarAnuncios]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        const url = await uploadToImageKit(file, userId, `/bolsa/ads/${empresaId}`);
        setFormData(prev => ({ ...prev, imagen_url: url }));
      } catch (e) {
        alert("Error al subir imagen a ImageKit");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.titulo || !formData.descripcion) {
      alert("Título y descripción son obligatorios");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(API_BOLSA, {
        accion: 'saveAnuncio',
        id: editingId,
        empresa_id: empresaId,
        user_id: userId,
        ...formData,
        categoria: formData.categoria || defaultCategory
      });

      if (res.data.success) {
        setShowForm(false);
        setEditingId(null);
        resetForm();
        cargarAnuncios();
      } else {
        alert(res.data.error || "Error al guardar anuncio");
      }
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      subtitulo: '',
      descripcion: '',
      categoria: defaultCategory || '',
      modalidad: 'remoto',
      tipo_contrato: 'tiempo_completo',
      ubicacion: '',
      salario_min: '',
      salario_max: '',
      moneda: 'USD',
      mostrar_salario: true,
      imagen_url: '',
      requisitos: [],
      responsabilidades: [],
      beneficios: [],
      herramientas: [],
      fecha_limite: '',
      prioridad: 'normal'
    });
    setEditingId(null);
  };

  // Helper: si el campo viene como string JSON lo parsea, si ya es array lo devuelve
  const parseArrayField = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim().startsWith('[')) {
      try { return JSON.parse(val); } catch { return []; }
    }
    return [];
  };

  const handleEdit = (anuncio) => {
    setFormData({
      titulo: anuncio.titulo,
      subtitulo: anuncio.subtitulo || '',
      descripcion: anuncio.descripcion,
      categoria: anuncio.categoria || '',
      modalidad: anuncio.modalidad || 'remoto',
      tipo_contrato: anuncio.tipo_contrato || 'tiempo_completo',
      ubicacion: anuncio.ubicacion || '',
      salario_min: anuncio.salario_min || '',
      salario_max: anuncio.salario_max || '',
      moneda: anuncio.moneda || 'USD',
      mostrar_salario: !!anuncio.mostrar_salario,
      imagen_url: anuncio.imagen_url || '',
      requisitos:        parseArrayField(anuncio.requisitos),
      responsabilidades: parseArrayField(anuncio.responsabilidades),
      beneficios:        parseArrayField(anuncio.beneficios),
      herramientas:      parseArrayField(anuncio.herramientas),
      fecha_limite: anuncio.fecha_limite || '',
      prioridad: anuncio.prioridad || 'normal'
    });
    setEditingId(anuncio.id);
    setShowForm(true);
  };

  const handleToggleEstado = async (id) => {
    try {
      const res = await axios.post(API_BOLSA, {
        accion: 'toggleEstado',
        id: id,
        empresa_id: empresaId
      });
      if (res.data.success) {
        cargarAnuncios();
      } else {
        alert(res.data.error || "Error al cambiar estado");
      }
    } catch (e) { alert("Error de red"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este anuncio?")) return;
    try {
      const res = await axios.post(API_BOLSA, {
        accion: 'deleteAnuncio',
        id: id,
        empresa_id: empresaId
      });
      if (res.data.success) {
        cargarAnuncios();
      }
    } catch (e) { alert("Error al eliminar"); }
  };

  const addListItem = (field, valueKey) => {
    if (!tempInput[valueKey].trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], tempInput[valueKey].trim()]
    }));
    setTempInput(prev => ({ ...prev, [valueKey]: '' }));
  };

  const removeListItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading && anuncios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Cargando tus anuncios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de Gestión */}
      {!showForm && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-600" /> Mis Anuncios de Empleo
            </h3>
            <p className="text-sm text-gray-500 font-medium">Publica vacantes y encuentra a los mejores profesionales de Hitpoly.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-6 py-3 bg-[#0a66c2] text-white rounded-xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> PUBLICAR NUEVA VACANTE
          </button>
        </div>
      )}

      {/* Listado de Anuncios */}
      {!showForm && (
        <div className="grid grid-cols-1 gap-4">
          {anuncios.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Briefcase className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Aún no has publicado anuncios</h4>
              <p className="text-gray-500 max-w-xs mx-auto mt-2">Crea tu primera vacante para empezar a recibir postulaciones de talentos.</p>
            </div>
          ) : (
            anuncios.map(anuncio => (
              <div key={anuncio.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    {anuncio.imagen_url ? (
                      <img src={anuncio.imagen_url} className="w-full h-full object-cover" alt="Banner" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-black text-gray-900">{anuncio.titulo}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        anuncio.estado === 'abierto' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {anuncio.estado}
                      </span>
                      
                      {anuncio.prioridad && anuncio.prioridad !== 'normal' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          anuncio.prioridad === 'urgente' ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-400 text-yellow-900'
                        }`}>
                          {anuncio.prioridad}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {anuncio.modalidad} {anuncio.ubicacion ? `(${anuncio.ubicacion})` : ''}</span>
                      <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> {anuncio.moneda} {anuncio.salario_min} - {anuncio.salario_max}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {anuncio.tipo_contrato.replace('_', ' ')}</span>
                      <span className="flex items-center gap-1.5 text-indigo-500"><Eye className="w-3.5 h-3.5" /> {anuncio.vistas || 0} vistas</span>
                      <div 
                        onClick={(e) => { e.stopPropagation(); navigate(`/mis-postulaciones${window.location.search}`); }}
                        className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" /> {anuncio.postulaciones_count || 0} postulaciones
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleToggleEstado(anuncio.id)}
                    className={`p-3 rounded-xl transition-all shadow-sm ${
                      anuncio.estado === 'abierto' 
                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white' 
                        : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                    }`}
                    title={anuncio.estado === 'abierto' ? "Apagar anuncio" : "Prender anuncio"}
                  >
                    <Power className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate(`/mis-postulaciones${window.location.search}`)}
                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    title="Ver Postulaciones"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleEdit(anuncio)}
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Editar"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(anuncio.id)}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Formulario de Creación/Edición */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-r from-[#0a66c2] to-[#004182] p-8 text-white flex justify-between items-center relative">
            <div className="z-10">
              <h3 className="text-2xl font-black">{editingId ? 'Editar Vacante' : 'Nueva Vacante de Empleo'}</h3>
              <p className="text-blue-100 text-sm font-medium opacity-80">Completa los detalles para atraer al talento ideal.</p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors z-10">
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Banner Upload Section */}
          <div className="relative h-48 bg-gray-100 group">
            {uploadingImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-[#0a66c2]">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest mt-2">Subiendo...</p>
              </div>
            ) : formData.imagen_url ? (
              <img src={formData.imagen_url} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Briefcase className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Sin Imagen de Portada</p>
              </div>
            )}
            <div 
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
              onClick={() => document.getElementById('adBannerInput').click()}
            >
              <Camera className="w-10 h-10 text-white mb-2" />
              <p className="text-white text-xs font-black uppercase tracking-tighter text-center">Cambiar Imagen de Portada</p>
            </div>
            <input 
              id="adBannerInput" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            {formData.imagen_url && (
              <button 
                onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, imagen_url: '' })); }}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg z-20"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-8 space-y-8">
            {/* Sección 1: Datos Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Título del Anuncio</label>
                <input 
                  type="text" 
                  value={formData.titulo} 
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                  placeholder="Ej: Media Buyer Senior para E-commerce"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Prioridad</label>
                <select 
                  value={formData.prioridad} 
                  onChange={e => setFormData({...formData, prioridad: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                >
                  <option value="normal">Normal</option>
                  <option value="urgente">Urgente 🔥</option>
                  <option value="destacado">Destacado ⭐</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Fecha Límite</label>
                <input 
                  type="date" 
                  value={formData.fecha_limite} 
                  onChange={e => setFormData({...formData, fecha_limite: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                />
              </div>
            </div>

            {/* Sección 2: Modalidad y Contrato */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Modalidad</label>
                <select 
                  value={formData.modalidad} 
                  onChange={e => setFormData({...formData, modalidad: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                >
                  <option value="remoto">100% Remoto</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Tipo de Contrato</label>
                <select 
                  value={formData.tipo_contrato} 
                  onChange={e => setFormData({...formData, tipo_contrato: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                >
                  <option value="tiempo_completo">Tiempo Completo</option>
                  <option value="medio_tiempo">Medio Tiempo</option>
                  <option value="proyecto">Por Proyecto</option>
                  <option value="mensual">Mensual (Retainer)</option>
                  <option value="practicas">Prácticas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Ubicación (Ciudad/País)</label>
                <input 
                  type="text" 
                  value={formData.ubicacion} 
                  onChange={e => setFormData({...formData, ubicacion: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                  placeholder="Ej: Madrid o Global"
                />
              </div>
            </div>

            {/* Sección 3: Descripción Detallada */}
            <div className="pt-6 border-t border-gray-100">
              <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Descripción de la Vacante</label>
              <textarea 
                value={formData.descripcion} 
                onChange={e => setFormData({...formData, descripcion: e.target.value})}
                rows={6}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold resize-none"
                placeholder="Explica detalladamente qué buscas y qué ofrece la empresa..."
              />
            </div>

            {/* Sección 4: Compensación */}
            <div className="bg-blue-50 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-blue-800 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Rango Salarial Estimado
                </h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.mostrar_salario} 
                    onChange={e => setFormData({...formData, mostrar_salario: e.target.checked})}
                    className="w-5 h-5 rounded-lg text-blue-600"
                  />
                  <span className="text-xs font-black text-blue-700">Mostrar salario en el anuncio</span>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-blue-400 uppercase ml-2 mb-1 block">Mínimo</label>
                  <input 
                    type="number" 
                    value={formData.salario_min} 
                    onChange={e => setFormData({...formData, salario_min: e.target.value})}
                    className="w-full px-5 py-3 bg-white border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-400 uppercase ml-2 mb-1 block">Máximo</label>
                  <input 
                    type="number" 
                    value={formData.salario_max} 
                    onChange={e => setFormData({...formData, salario_max: e.target.value})}
                    className="w-full px-5 py-3 bg-white border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-blue-400 uppercase ml-2 mb-1 block">Moneda</label>
                  <input 
                    type="text" 
                    value={formData.moneda} 
                    onChange={e => setFormData({...formData, moneda: e.target.value})}
                    className="w-full px-5 py-3 bg-white border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Sección 5: Listas (Requisitos, Responsabilidades, etc) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
              {/* Requisitos */}
              <div className="space-y-4">
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" /> Requisitos Técnicos
                </h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tempInput.requisito} 
                    onChange={e => setTempInput({...tempInput, requisito: e.target.value})}
                    onKeyPress={e => e.key === 'Enter' && addListItem('requisitos', 'requisito')}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-bold"
                    placeholder="Ej: 3 años en Meta Ads"
                  />
                  <button onClick={() => addListItem('requisitos', 'requisito')} className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.requisitos.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl text-xs font-bold text-orange-700">
                      <span>• {item}</span>
                      <button onClick={() => removeListItem('requisitos', i)} className="text-orange-400 hover:text-orange-600"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Responsabilidades */}
              <div className="space-y-4">
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Responsabilidades
                </h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tempInput.responsabilidad} 
                    onChange={e => setTempInput({...tempInput, responsabilidad: e.target.value})}
                    onKeyPress={e => e.key === 'Enter' && addListItem('responsabilidades', 'responsabilidad')}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-bold"
                    placeholder="Ej: Gestión de $10k presupuesto"
                  />
                  <button onClick={() => addListItem('responsabilidades', 'responsabilidad')} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.responsabilidades.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-xl text-xs font-bold text-green-700">
                      <span>• {item}</span>
                      <button onClick={() => removeListItem('responsabilidades', i)} className="text-green-400 hover:text-green-600"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beneficios */}
              <div className="space-y-4">
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-500" /> Beneficios
                </h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tempInput.beneficio} 
                    onChange={e => setTempInput({...tempInput, beneficio: e.target.value})}
                    onKeyPress={e => e.key === 'Enter' && addListItem('beneficios', 'beneficio')}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-bold"
                    placeholder="Ej: Bonos por desempeño"
                  />
                  <button onClick={() => addListItem('beneficios', 'beneficio')} className="p-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.beneficios.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl text-xs font-bold text-purple-700">
                      <span>• {item}</span>
                      <button onClick={() => removeListItem('beneficios', i)} className="text-purple-400 hover:text-purple-600"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Herramientas */}
              <div className="space-y-4">
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" /> Herramientas / Software
                </h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tempInput.herramienta} 
                    onChange={e => setTempInput({...tempInput, herramienta: e.target.value})}
                    onKeyPress={e => e.key === 'Enter' && addListItem('herramientas', 'herramienta')}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-bold"
                    placeholder="Ej: Salesforce, Slack"
                  />
                  <button onClick={() => addListItem('herramientas', 'herramienta')} className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.herramientas.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl text-xs font-bold text-blue-700">
                      <span>• {item}</span>
                      <button onClick={() => removeListItem('herramientas', i)} className="text-blue-400 hover:text-blue-600"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Formulario */}
            <div className="pt-10 flex items-center justify-end gap-4 border-t border-gray-100">
              <button 
                onClick={() => setShowForm(false)}
                className="px-8 py-4 text-gray-500 font-black hover:text-gray-900 transition-colors"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-10 py-4 bg-[#0a66c2] text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {editingId ? 'GUARDAR CAMBIOS' : 'PUBLICAR AHORA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
