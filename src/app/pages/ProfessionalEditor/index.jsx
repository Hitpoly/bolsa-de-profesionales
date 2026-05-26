import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSystem } from '../../data/SystemContext';
import { obtenerTodoElPerfil } from '../../services/api';
import { ProfessionalForm } from './ProfessionalForm';
import { ServicesManager } from './ServicesManager';
import { ApplicationsPanel } from '../Applications/ApplicationsPanel';
import { ArrowLeft, Save, Loader2, CheckCircle2, ChevronDown, User, Building, Settings } from 'lucide-react';

export function ProfessionalEditorPage() {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const { setHeaderData, setMobileActions, activeContext, setActiveContext, userContexts } = useSystem();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ref para disparar el guardado desde el toolbar
  const saveRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showContextDropdown, setShowContextDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const userId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('userId') || 
           sessionStorage.getItem('bolsa_last_userId');
  }, []);

  // 1. Inicializar pestaña desde URL o sesión
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || sessionStorage.getItem('bolsa_active_tab') || 'profile';
  });

  // 2. Sincronizar pestaña con URL y sesión
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem('bolsa_active_tab', tabId);
    
    // Actualizar URL sin recargar la página completamente para mantener estado
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tabId);
    navigate({ search: params.toString() }, { replace: true });
  };

    // Cargar perfil
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    obtenerTodoElPerfil(userId)
      .then(data => {
        setProfile(data || null);
        setLoading(false);
      })
      .catch(() => {
        setProfile(null);
        setLoading(false);
      });
  }, [userId]);

  // Sincronizar contexto del sistema con el editor actual
  useEffect(() => {
    if (userContexts.professional && activeContext?.type !== 'professional') {
      setActiveContext({ ...userContexts.professional, type: 'professional' });
    }
  }, [userContexts.professional, activeContext?.type, setActiveContext]);

  // Configurar header
  useEffect(() => {
    setHeaderData({
      title: 'Editor de Perfil',
      subtitle: tipo === 'company' ? 'Empresa' : 'Profesional',
      icon: 'users',
      color: '#0a66c2'
    });
    window.bolsaBackHandler = () => {
      const suffix = userId ? `?userId=${userId}` : '';
      navigate(`/${suffix}`);
    };
    setMobileActions([]);
    
    return () => {
      setHeaderData({
        title: 'Bolsa de Empleo',
        subtitle: 'Oportunidades y talento profesional',
        icon: 'briefcase',
        color: '#0a66c2'
      });
      window.bolsaBackHandler = null;
      setMobileActions([]);
    };
  }, [tipo, userId]);

  if (loading) {
    return (
      <div className="font-sans bg-[#f3f2ef] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans bg-[#f3f2ef] min-h-screen pb-12">
      {/* Premium Sub-Header/Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 md:px-6 shadow-sm mb-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Izquierda: volver + título */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(userId ? `/?userId=${userId}` : '/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 flex items-center justify-center shrink-0"
              title="Volver al Inicio"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-gray-900 leading-tight truncate">Editor de Perfil</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5 truncate">
                {activeContext?.name || 'Mi Perfil Personal'}
              </p>
            </div>
          </div>

          {/* Derecha: solo botón Guardar */}
          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'profile' && (
              <button
                onClick={() => saveRef.current && saveRef.current()}
                disabled={saving}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-black transition-all shadow-sm ${
                  saved
                    ? 'bg-emerald-500 text-white shadow-emerald-100'
                    : 'bg-[#0a66c2] text-white hover:bg-[#084d8f] shadow-blue-100'
                } disabled:opacity-60`}
                title="Guardar cambios"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 md:px-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex gap-1 px-6 overflow-x-auto">
            {[
              { id: 'profile', label: 'Perfil' },
              { id: 'services', label: 'Servicios' },
              { id: 'postulaciones', label: 'Postulaciones' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'border-[#0a66c2] text-[#0a66c2]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'profile' && (
            <ProfessionalForm
              profile={profile}
              userId={userId}
              saveRef={saveRef}
              onSavingChange={setSaving}
              onSavedChange={setSaved}
            />
          )}
          {activeTab === 'services' && (
            <ServicesManager userId={userId} />
          )}
          {activeTab === 'postulaciones' && (
            <ApplicationsPanel />
          )}
        </div>
      </div>
    </div>
  );
}
