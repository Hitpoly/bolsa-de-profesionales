import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, Settings, Loader2, DollarSign, Rocket, Timer, Briefcase, ChevronDown, ListChecks } from 'lucide-react';
import axios from 'axios';
import { useSystem } from '../../data/SystemContext';
import { useRef } from 'react';

const API_BOLSA = 'https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php';

export function ServicesManager({ userId }) {
  const navigate = useNavigate();
  const { setHeaderData, setMobileActions } = useSystem();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showNew, setShowNew] = useState(null);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('all');
  const dropdownRef = useRef(null);

  const cargarServices = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API_BOLSA, { accion: 'getServices', user_id: userId });
      if (res.data.success) {

        const rawData = res.data.data;
        const servicesArray = Array.isArray(rawData) 
          ? rawData 
          : (rawData && typeof rawData === 'object' ? Object.values(rawData) : []);
        setServices(servicesArray);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (userId) cargarServices();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCreateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userId]);

  useEffect(() => {
    const actions = [];
    if (showNew || editingId) {
      actions.push({
        id: 'save',
        icon: 'save',
        onClick: () => {},
        disabled: true
      });
    } else {
      actions.push({
        id: 'new-proyecto',
        icon: 'plus',
        onClick: () => { setShowNew('proyecto'); }
      });
      actions.push({
        id: 'new-hora',
        icon: 'plus',
        onClick: () => { setShowNew('hora'); }
      });
    }
    setMobileActions(actions);
    return () => setMobileActions([]);
  }, [showNew, editingId]);

  const handleDelete = async (service) => {
    if (!confirm(`¿Eliminar "${service.titulo}"?`)) return;
    try {
      const res = await axios.post(API_BOLSA, { accion: 'deleteService', user_id: userId, service_id: service.id });
      if (res.data.success) cargarServices();
    } catch (e) { alert('Error al eliminar'); }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2] mx-auto mb-4" />
        <p className="text-gray-500">Cargando tarifario...</p>
      </div>
    );
  }

  if (showNew) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setShowNew(null)} className="p-2 hover:bg-gray-100 rounded-full">
            ←
          </button>
          <h3 className="text-xl font-bold">Nuevo Servicio {showNew === 'proyecto' ? 'por Proyecto' : showNew === 'hora' ? 'por Hora' : 'Mensual'}</h3>
        </div>
        <p className="text-gray-500">Usa las rutas /crear-servicio/:tipo para edición completa.</p>
        <button 
          onClick={() => navigate(`/editar-servicio/new_${showNew}?userId=${userId}`)}
          className="mt-4 px-6 py-3 bg-[#0a66c2] text-white rounded-full font-bold"
        >
          Ir a Editor Completo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#0a66c2]" /> Gestión de Servicios
          </h4>
          
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button 
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0a66c2] text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 group"
            >
              <Plus className={`w-4 h-4 transition-transform ${showCreateDropdown ? 'rotate-90' : ''}`} />
              CREAR NUEVO
              <ChevronDown className="w-4 h-4" />
            </button>

            {showCreateDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200 p-1">
                <button 
                  onClick={() => { setShowNew('proyecto'); setShowCreateDropdown(false); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-colors text-left"
                >
                  <div className="p-2 bg-blue-50 rounded-lg"><Rocket className="w-4 h-4 text-blue-600" /></div>
                  <span className="text-sm font-bold text-gray-700">Por Proyecto</span>
                </button>
                <button 
                  onClick={() => { setShowNew('hora'); setShowCreateDropdown(false); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-orange-50 rounded-xl transition-colors text-left"
                >
                  <div className="p-2 bg-orange-50 rounded-lg"><Timer className="w-4 h-4 text-orange-600" /></div>
                  <span className="text-sm font-bold text-gray-700">Por Hora</span>
                </button>
                <button 
                  onClick={() => { setShowNew('mensual'); setShowCreateDropdown(false); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-colors text-left"
                >
                  <div className="p-2 bg-purple-50 rounded-lg"><Briefcase className="w-4 h-4 text-purple-600" /></div>
                  <span className="text-sm font-bold text-gray-700">Salario Mensual</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto w-full transition-all group/filters"
               style={{ 
                 scrollbarWidth: 'none', 
                 msOverflowStyle: 'none'
               }}>
            <style>{`
              .group\\/filters:hover { scrollbar-width: thin; }
              .group\\/filters::-webkit-scrollbar { height: 4px; display: none; }
              .group\\/filters:hover::-webkit-scrollbar { display: block; }
              .group\\/filters::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
              {[
                { id: 'all', label: 'Todos', icon: ListChecks },
                { id: 'proyecto', label: 'Proyectos', icon: Rocket },
                { id: 'hora', label: 'Por Hora', icon: Timer },
                { id: 'mensual', label: 'Mensuales', icon: Briefcase }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setServiceFilter(f.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    serviceFilter === f.id ? 'bg-white text-[#0a66c2] shadow-md' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {f.label}
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${serviceFilter === f.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                    {f.id === 'all' ? services.length : services.filter(s => s.tipo === f.id).length}
                  </span>
                </button>
              ))}
            </div>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="font-medium">Aún no tienes servicios</p>
            <p className="text-sm mt-1">Crea tu primer servicio para comenzar a recibir clientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services
              .filter(s => serviceFilter === 'all' || s.tipo === serviceFilter)
              .map((s, idx) => (
              <div key={s.id || `svc-${idx}`} className="p-4 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        s.tipo === 'hora' ? 'bg-purple-50 text-purple-700' : 
                        s.tipo === 'mensual' ? 'bg-indigo-50 text-indigo-700' : 
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {s.tipo === 'hora' ? 'Por Hora' : s.tipo === 'mensual' ? 'Salario Mensual' : 'Por Proyecto'}
                      </span>
                    </div>
                    <h5 className="font-bold text-gray-900">{s.titulo}</h5>
                    <p className="text-sm text-gray-600 mt-1">{s.descripcion?.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {s.moneda} {Number(s.precio_oferta || s.precio_base).toLocaleString()}
                      {s.tipo === 'hora' ? ' / hora' : s.tipo === 'mensual' ? ' / mensual' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/editar-servicio/${s.id}?userId=${userId}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Editar"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(s)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
