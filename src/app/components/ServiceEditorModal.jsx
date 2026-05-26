import React, { useState, useEffect } from 'react';
import {
  X, Plus, Trash2, Sparkles, Zap, HelpCircle, 
  ListOrdered, Image, Link, Clock, ShieldCheck
} from 'lucide-react';
import { ServiceEditorData } from '../data/types';

interface ServiceEditorModalProps {
  service?: any; // Servicio existente para editar
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: ServiceEditorData) => void;
}

export function ServiceEditorModal({ service, isOpen, onClose, onSave }: ServiceEditorModalProps) {
  const isEditing = !!service?.id;

  // Estado inicial
  const [formData, setFormData] = useState<ServiceEditorData>({
    titulo: '',
    subtitulo: '',
    descripcion: '',
    tipo: 'hora',
    precio_base: 0,
    precio_oferta: undefined,
    porcentaje_oferta: 0,
    moneda: 'USD',
    imagen: '',
    herramientas: [],
    entregables: [],
    beneficios: [],
    faqs: [],
    requisitos_cliente: [],
    proceso_trabajo: [],
    portfolio_items: [],
    disponibilidad_horas: undefined,
    tiempo_respuesta: '24 horas',
    garantia_dias: 0,
    revisiones_incluidas: 1,
    tiempo_total: '',
    oferta_fin: ''
  });

  const [activeTab, setActiveTab] = useState('basica');
  const [loading, setLoading] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (service) {
      const parseField = (field: any) => {
        if (!field) return [];
        if (typeof field === 'string') {
          try { return JSON.parse(field); } catch(e) { return []; }
        }
        return field;
      };

      setFormData({
        titulo: service.titulo || '',
        subtitulo: service.subtitulo || '',
        descripcion: service.descripcion || '',
        tipo: service.tipo || 'hora',
        precio_base: service.precio_base || 0,
        precio_oferta: service.precio_oferta || undefined,
        porcentaje_oferta: service.porcentaje_oferta || 0,
        moneda: service.moneda || 'USD',
        imagen: service.imagen || '',
        herramientas: parseField(service.herramientas),
        entregables: parseField(service.entregables),
        beneficios: parseField(service.beneficios),
        faqs: parseField(service.faqs),
        requisitos_cliente: typeof service.requisitos_cliente === 'string' 
          ? JSON.parse(service.requisitos_cliente) 
          : (service.requisitos_cliente || []),
        proceso_trabajo: parseField(service.proceso_trabajo),
        portfolio_items: parseField(service.portfolio_items),
        disponibilidad_horas: service.disponibilidad_horas || undefined,
        tiempo_respuesta: service.tiempo_respuesta || '24 horas',
        garantia_dias: service.garantia_dias || 0,
        revisiones_incluidas: service.revisiones_incluidas || 1,
        tiempo_total: service.tiempo_total || '',
        oferta_fin: service.oferta_fin || ''
      });
    }
  }, [service]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.titulo || !formData.descripcion || formData.precio_base <= 0) {
      alert('Por favor completa los campos obligatorios: título, descripción y precio base');
      return;
    }
    setLoading(true);
    onSave(formData);
    setLoading(false);
  };

  const tabs = [
    { id: 'basica', label: 'Básica' },
    { id: 'entregables', label: 'Entregables' },
    { id: 'beneficios', label: 'Beneficios' },
    { id: 'proceso', label: 'Proceso' },
    { id: 'faq', label: 'FAQ' },
    { id: 'config', label: 'Config.' }
  ];

  return (
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: Información Básica */}
          {activeTab === 'basica' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título del servicio *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={e => handleChange('titulo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Ej: Desarrollo Web Full Stack"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subtítulo (opcional)</label>
                <input
                  type="text"
                  value={formData.subtitulo}
                  onChange={e => handleChange('subtitulo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Ej: Aplicaciones modernas con React y Node.js"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción *</label>
                <textarea
                  value={formData.descripcion}
                  onChange={e => handleChange('descripcion', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Describe detalladamente lo que ofreces..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tipo *</label>
                  <select
                    value={formData.tipo}
                    onChange={e => handleChange('tipo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="hora">Por Hora</option>
                    <option value="proyecto">Por Proyecto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Moneda</label>
                  <select
                    value={formData.moneda}
                    onChange={e => handleChange('moneda', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="MXN">MXN</option>
                    <option value="ARS">ARS</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio Base *</label>
                  <input
                    type="number"
                    value={formData.precio_base}
                    onChange={e => handleChange('precio_base', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">% Oferta</label>
                  <input
                    type="number"
                    value={formData.porcentaje_oferta}
                    onChange={e => {
                      const pct = parseInt(e.target.value) || 0;
                      handleChange('porcentaje_oferta', pct);
                      if (pct > 0) {
                        handleChange('precio_oferta', formData.precio_base * (1 - pct / 100));
                      } else {
                        handleChange('precio_oferta', undefined);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio Oferta</label>
                  <input
                    type="number"
                    value={formData.precio_oferta || ''}
                    onChange={e => handleChange('precio_oferta', parseFloat(e.target.value) || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    min="0"
                    step="0.01"
                    disabled={formData.porcentaje_oferta > 0}
                  />
                </div>
              </div>

              {formData.tipo === 'proyecto' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tiempo Total</label>
                    <input
                      type="text"
                      value={formData.tiempo_total}
                      onChange={e => handleChange('tiempo_total', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Ej: 7 días"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fin de Oferta</label>
                    <input
                      type="datetime-local"
                      value={formData.oferta_fin}
                      onChange={e => handleChange('oferta_fin', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {formData.tipo === 'hora' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Horas Disponibles</label>
                  <input
                    type="number"
                    value={formData.disponibilidad_horas || ''}
                    onChange={e => handleChange('disponibilidad_horas', parseInt(e.target.value) || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Ej: 40 (dejar vacío para ilimitado)"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Imagen del Servicio (URL)</label>
                <input
                  type="text"
                  value={formData.imagen}
                  onChange={e => handleChange('imagen', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
                {formData.imagen && (
                  <img src={formData.imagen} alt="" className="mt-2 h-32 object-cover rounded-lg" />
                )}
              </div>
            </div>
          )}

          {/* TAB: Entregables */}
          {activeTab === 'entregables' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900">Entregables</h4>
                <button
                  onClick={() => handleChange('entregables', [
                    ...formData.entregables,
                    { titulo: '', descripcion: '', valor_individual: 0, tiempo_limite: '' }
                  ])}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
              {formData.entregables.map((ent: any, idx: number) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500">Entregable #{idx + 1}</span>
                    <button
                      onClick={() => handleChange('entregables', formData.entregables.filter((_: any, i: number) => i !== idx))}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={ent.titulo}
                    onChange={e => {
                      const newEnt = [...formData.entregables];
                      newEnt[idx].titulo = e.target.value;
                      handleChange('entregables', newEnt);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Título del entregable"
                  />
                  <textarea
                    value={ent.descripcion}
                    onChange={e => {
                      const newEnt = [...formData.entregables];
                      newEnt[idx].descripcion = e.target.value;
                      handleChange('entregables', newEnt);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={2}
                    placeholder="Descripción (opcional)"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={ent.valor_individual || ''}
                      onChange={e => {
                        const newEnt = [...formData.entregables];
                        newEnt[idx].valor_individual = parseFloat(e.target.value) || 0;
                        handleChange('entregables', newEnt);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Precio individual"
                      min="0"
                      step="0.01"
                    />
                    <input
                      type="text"
                      value={ent.tiempo_limite || ''}
                      onChange={e => {
                        const newEnt = [...formData.entregables];
                        newEnt[idx].tiempo_limite = e.target.value;
                        handleChange('entregables', newEnt);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Tiempo límite (ej: 3 días)"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: Beneficios */}
          {activeTab === 'beneficios' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900">¿Por qué elegir este servicio?</h4>
                <button
                  onClick={() => handleChange('beneficios', [
                    ...formData.beneficios,
                    { icon: 'zap', titulo: '', descripcion: '' }
                  ])}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
              {formData.beneficios.map((ben: any, idx: number) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500">Beneficio #{idx + 1}</span>
                    <button
                      onClick={() => handleChange('beneficios', formData.beneficios.filter((_: any, i: number) => i !== idx))}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <select
                    value={ben.icon}
                    onChange={e => {
                      const newBen = [...formData.beneficios];
                      newBen[idx].icon = e.target.value;
                      handleChange('beneficios', newBen);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="zap">⚡ Zap (Rápido)</option>
                    <option value="shield">🛡️ Shield (Seguro)</option>
                    <option value="refresh">🔄 Refresh (Revisión)</option>
                    <option value="target">🎯 Target (Enfoque)</option>
                  </select>
                  <input
                    type="text"
                    value={ben.titulo}
                    onChange={e => {
                      const newBen = [...formData.beneficios];
                      newBen[idx].titulo = e.target.value;
                      handleChange('beneficios', newBen);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Título del beneficio"
                  />
                  <textarea
                    value={ben.descripcion}
                    onChange={e => {
                      const newBen = [...formData.beneficios];
                      newBen[idx].descripcion = e.target.value;
                      handleChange('beneficios', newBen);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={2}
                    placeholder="Descripción del beneficio"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB: Proceso de Trabajo */}
          {activeTab === 'proceso' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900">Mi Proceso de Trabajo</h4>
                <button
                  onClick={() => handleChange('proceso_trabajo', [
                    ...formData.proceso_trabajo,
                    { orden: formData.proceso_trabajo.length + 1, titulo: '', descripcion: '', duracion_estimada: '' }
                  ])}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Agregar Paso
                </button>
              </div>
              {formData.proceso_trabajo.map((step: any, idx: number) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Paso {step.orden}</span>
                    <button
                      onClick={() => handleChange('proceso_trabajo', formData.proceso_trabajo.filter((_: any, i: number) => i !== idx))}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={step.titulo}
                    onChange={e => {
                      const newSteps = [...formData.proceso_trabajo];
                      newSteps[idx].titulo = e.target.value;
                      handleChange('proceso_trabajo', newSteps);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Título del paso"
                  />
                  <textarea
                    value={step.descripcion}
                    onChange={e => {
                      const newSteps = [...formData.proceso_trabajo];
                      newSteps[idx].descripcion = e.target.value;
                      handleChange('proceso_trabajo', newSteps);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={2}
                    placeholder="Descripción del paso"
                  />
                  <input
                    type="text"
                    value={step.duracion_estimada || ''}
                    onChange={e => {
                      const newSteps = [...formData.proceso_trabajo];
                      newSteps[idx].duracion_estimada = e.target.value;
                      handleChange('proceso_trabajo', newSteps);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Duración estimada (ej: 2-3 días)"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900">Preguntas Frecuentes</h4>
                <button
                  onClick={() => handleChange('faqs', [
                    ...formData.faqs,
                    { pregunta: '', respuesta: '' }
                  ])}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
              {formData.faqs.map((faq: any, idx: number) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500">FAQ #{idx + 1}</span>
                    <button
                      onClick={() => handleChange('faqs', formData.faqs.filter((_: any, i: number) => i !== idx))}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={faq.pregunta}
                    onChange={e => {
                      const newFaqs = [...formData.faqs];
                      newFaqs[idx].pregunta = e.target.value;
                      handleChange('faqs', newFaqs);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Pregunta"
                  />
                  <textarea
                    value={faq.respuesta}
                    onChange={e => {
                      const newFaqs = [...formData.faqs];
                      newFaqs[idx].respuesta = e.target.value;
                      handleChange('faqs', newFaqs);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={3}
                    placeholder="Respuesta"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB: Configuración Adicional */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Lo que necesito del cliente</h4>
                <div className="space-y-2">
                  {formData.requisitos_cliente.map((req: string, idx: number) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={req}
                        onChange={e => {
                          const newReqs = [...formData.requisitos_cliente];
                          newReqs[idx] = e.target.value;
                          handleChange('requisitos_cliente', newReqs);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Ej: Acceso a repositorio Git"
                      />
                      <button
                        onClick={() => handleChange('requisitos_cliente', formData.requisitos_cliente.filter((_: any, i: number) => i !== idx))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleChange('requisitos_cliente', [...formData.requisitos_cliente, ''])}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Agregar requisito
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Garantía (días)</label>
                  <input
                    type="number"
                    value={formData.garantia_dias}
                    onChange={e => handleChange('garantia_dias', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Revisiones incluidas</label>
                  <input
                    type="number"
                    value={formData.revisiones_incluidas}
                    onChange={e => handleChange('revisiones_incluidas', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tiempo respuesta</label>
                  <input
                    type="text"
                    value={formData.tiempo_respuesta}
                    onChange={e => handleChange('tiempo_respuesta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Ej: 24 horas"
                  />
                </div>
              </div>

              {/* Herramientas */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Herramientas/Tecnologías</h4>
                <div className="space-y-2">
                  {formData.herramientas.map((herr: any, idx: number) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={herr.nombre || herr.name || ''}
                        onChange={e => {
                          const newTools = [...formData.herramientas];
                          newTools[idx].nombre = e.target.value;
                          handleChange('herramientas', newTools);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Nombre de la herramienta"
                      />
                      <input
                        type="text"
                        value={herr.uso || ''}
                        onChange={e => {
                          const newTools = [...formData.herramientas];
                          newTools[idx].uso = e.target.value;
                          handleChange('herramientas', newTools);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Uso (ej: Frontend)"
                      />
                      <button
                        onClick={() => handleChange('herramientas', formData.herramientas.filter((_: any, i: number) => i !== idx))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleChange('herramientas', [...formData.herramientas, { nombre: '', uso: '' }])}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Agregar herramienta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#0a66c2] text-white rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Servicio')}
          </button>
        </div>
      </div>
    </div>
  );
}
