import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Building, Save, Loader2, Info, Camera, Pencil, Tag, ShieldCheck, Timer, CheckCircle2, History, Award, Globe, ShoppingCart, Clock, Star, Share2, Search, X, Copy, Rocket, ChevronDown, User, Briefcase, Send, Plus, Edit2, Trash2, ArrowLeft, Eye, FileText, Users } from 'lucide-react';
import { useSystem } from '../../data/SystemContext';
import axios from 'axios';
import { uploadToImageKit } from '../../services/imageKitService';

const API_EMPRESA = 'https://apibolsaprofesionales.hitpoly.com/ajax/empresaController.php';

import { JobAdsManager } from './JobAdsManager';
import { ApplicationsPanel } from '../Applications/ApplicationsPanel';
import { PortfolioTab } from './PortfolioTab';
import { TeamTab } from './TeamTab';

export function CompanyEditorPage() {
  const navigate = useNavigate();
  const { setHeaderData, setMobileActions, userContexts, activeContext, setActiveContext, cargarContextos } = useSystem();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') || sessionStorage.getItem('bolsa_company_active_tab');
    if (tab === 'ads') return 'ads';
    if (tab === 'apps') return 'apps';
    if (tab === 'services') return 'services';
    return 'profile';
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem('bolsa_company_active_tab', tabId);
    
    // Actualizar URL sin recargar la página completamente
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tabId);
    navigate({ search: params.toString() }, { replace: true });
  };

  const [formData, setFormData] = useState({
    company_name: '',
    description: '',
    industry: '',
    size: '',
    founded: '',
    website: '',
    logo: '',
    banner: '',
    nit_rut: '',
    address: '',
    phone: '',
    email: '',
    city: '',
    zip: '',
    marketing_budget: '',
    annual_income: '',
    objective: '',
    tax_id: '',
    social: ''
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sectores, setSectores] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const tabsContainerRef = useRef(null);
  
  useEffect(() => {
    if (tabsContainerRef.current) {
      const el = tabsContainerRef.current;
      console.log('scrollWidth:', el.scrollWidth, 'clientWidth:', el.clientWidth);
    }
  }, []);
  const [companyServices, setCompanyServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Estados para el Editor de Servicios
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [savingService, setSavingService] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estado para el dropdown del toolbar
  const [showContextDropdown, setShowContextDropdown] = useState(false);

  // Upload company logo/banner to ImageKit → store only the URL
  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    

    // Mostrar vista previa local INMEDIATA
    const localPreviewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, [field]: localPreviewUrl }));
    
    setUploadingImage(true);
    try {
      const folder = field === 'logo' ? '/bolsa/company-logos' : '/bolsa/company-banners';
      
      const url = await uploadToImageKit(file, userId || 'company', folder);
      
      if (url) {
        setFormData(prev => ({ ...prev, [field]: url }));
      }
    } catch (err) {
      alert(`Error al subir la imagen.`);
      
      // En caso de error, revertimos la imagen previa (blob:)
      setFormData(prev => ({ ...prev, [field]: '' }));
    } finally {
      setUploadingImage(false);
    }
  };

  const userId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('userId') || 
           sessionStorage.getItem('bolsa_last_userId');
  }, []);

  // Sincronizar contexto del sistema con el editor actual
  useEffect(() => {
    if (userContexts.companies && userContexts.companies.length > 0 && activeContext?.type !== 'enterprise') {
      setActiveContext({ ...userContexts.companies[0], type: 'enterprise' });
    }
  }, [userContexts.companies, activeContext?.type, setActiveContext]);

  // Sincronizar formulario con los datos de la base de datos
  useEffect(() => {
    if (userContexts.companies && userContexts.companies.length > 0) {
      const data = userContexts.companies[0];


      setFormData(prev => {
        const newData = { ...prev };
        
        // Solo actualizamos si el valor en el estado es vacío O si el nuevo valor es significativo
        if (data.company_name || data.nombre) newData.company_name = data.company_name || data.nombre;
        if (data.description || data.descripcion) newData.description = data.description || data.descripcion;
        if (data.sector_id) newData.industry = data.sector_id;
        if (data.size || data.tamano) newData.size = data.size || data.tamano;
        if (data.founded || data.fundacion) newData.founded = data.founded || data.fundacion;
        if (data.sitio_web || data.website) newData.website = data.sitio_web || data.website;
        if (data.logo_url) newData.logo = data.logo_url;
        if (data.banner_url) newData.banner = data.banner_url;
        if (data.nit_rut) newData.nit_rut = data.nit_rut;
        if (data.direccion || data.address) newData.address = data.direccion || data.address;
        if (data.telefono || data.phone) newData.phone = data.telefono || data.phone;
        if (data.email_contacto || data.email) newData.email = data.email_contacto || data.email;
        if (data.ciudad || data.city) newData.city = data.ciudad || data.city;
        if (data.codigo_postal || data.zip) newData.zip = data.codigo_postal || data.zip;
        if (data.presupuesto_marketing || data.marketing_budget) newData.marketing_budget = data.presupuesto_marketing || data.marketing_budget;
        if (data.ingreso_anual_estimado || data.annual_income) newData.annual_income = data.ingreso_anual_estimado || data.annual_income;
        if (data.objetivo_principal || data.objective) newData.objective = data.objetivo_principal || data.objective;
        if (data.documento_fiscal_id || data.tax_id) newData.tax_id = data.documento_fiscal_id || data.tax_id;
        if (data.red_social_principal || data.social) newData.social = data.red_social_principal || data.social;

        return newData;
      });
    }
  }, [userContexts.companies]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      
      // Si no hay contextos cargados, intentamos cargarlos
      if (!userContexts.professional && userContexts.companies.length === 0) {
        await cargarContextos();
      }

      // Cargar sectores
      try {
        const sRes = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php', { accion: 'getSectors' });
        if (sRes.data.success) {

          setSectores(sRes.data.data);
        }
      } catch (e) { }

      setLoading(false);
    };

    if (userId) init();
    else setLoading(false);

    setHeaderData({
      title: 'Editor de Empresa',
      subtitle: 'Gestiona la información de tu empresa',
      icon: 'building',
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
  }, [userId]);

  const handleSave = useCallback(async () => {
    if (uploadingImage) {
      alert("Por favor, espera a que la imagen termine de subir antes de guardar.");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(API_EMPRESA, {
        accion: 'saveCompany',
        user_id: userId,
        company_data: formData
      });

      if (res.data.success) {
        setSaved(true);
        setDebugInfo(res.data.diagnostics);
        cargarContextos(); 
        setTimeout(() => setSaved(false), 3000);
      } else {

        setDebugInfo(res.data.diagnostics || { error: res.data.error });
        setShowDebug(true);
        alert(res.data.error || 'Error al guardar');
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  }, [formData, userId, cargarContextos]);

  // Cargar servicios corporativos
  useEffect(() => {
    if (activeTab === 'services' && activeContext?.id) {
      // Evitar recargas si ya tenemos los servicios y el ID no ha cambiado
      if (companyServices.length > 0 && companyServices[0].empresa_id === activeContext.id) {
        setLoadingServices(false);
        return;
      }

      const fetchServices = async () => {
        setLoadingServices(true);
        try {
          const res = await axios.post('https://apiweb.hitpoly.com/ajax/servicesController.php', {
            accion: 'get_services_list',
            empresa_id: activeContext.id
          });
          
          if (res.data.success) {
            console.log('=== SERVICIOS EMPRESA DESDE EDITOR ===');
            console.log('Cantidad:', res.data.data.length);
            res.data.data.forEach((svc, i) => {
              console.log(`Servicio #${i}:`, { ...svc, page_data: svc.page_data ? '(presente)' : '(ausente)' });
              if (svc.page_data) {
                console.log('  page_data keys:', Object.keys(svc.page_data));
                if (svc.page_data.pricing) console.log('  pricing.planes:', svc.page_data.pricing.planes);
              }
            });
            console.log('=======================================');

            const normalized = res.data.data.map(s => ({
              ...s,
              image: s.image?.startsWith('/') ? `https://holding.hitpoly.com${s.image}` : s.image
            }));
            setCompanyServices(normalized);
          }
        } catch (e) {
          // Silencioso
        } finally {
          setLoadingServices(false);
        }
      };
      fetchServices();
    }
  }, [activeTab, activeContext?.id]);

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.")) return;
    
    try {
      const res = await axios.post('https://apiweb.hitpoly.com/ajax/servicesController.php', {
        accion: 'delete_service',
        service_id: serviceId,
        empresa_id: activeContext.id
      });
      if (res.data.success) {
        setCompanyServices(prev => prev.filter(s => s.id !== serviceId));
      }
    } catch (e) {
      console.error("Error al eliminar servicio:", e);
    }
  };

  const handleCreateService = () => {
    const suffix = activeContext?.id ? `?type=enterprise&companyId=${activeContext.id}` : '?type=enterprise';
    navigate(`/crear-servicio-empresa${suffix}`);
  };

  const handleEditService = (service) => {
    const suffix = activeContext?.id ? `?type=enterprise&companyId=${activeContext.id}` : '?type=enterprise';
    navigate(`/editar-servicio-empresa/${service.id}${suffix}`);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setSavingService(true);
    try {
      const res = await axios.post('https://apiweb.hitpoly.com/ajax/servicesController.php', {
        accion: 'save_service',
        ...editingService,
        empresa_id: activeContext.id
      });
      if (res.data.success) {
        // Refrescar lista
        const listRes = await axios.post('https://apiweb.hitpoly.com/ajax/servicesController.php', {
          accion: 'get_services_list',
          empresa_id: activeContext.id
        });
        const normalized = listRes.data.data.map(s => ({
          ...s,
          image: s.image?.startsWith('/') ? `https://holding.hitpoly.com${s.image}` : s.image
        }));
        setCompanyServices(normalized);
        setIsServiceModalOpen(false);
        setEditingService(null);
      }
    } catch (e) {
      // Silencioso
    } finally {
      setSavingService(false);
    }
  };

  const handleServiceImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const url = await uploadToImageKit(file, userId, `/servicios/${activeContext.id}`);
      setEditingService(prev => ({ ...prev, image: url }));
    } catch (e) {
      // Silencioso
    } finally {
      setUploadingImage(false);
    }
  };

  // Configurar acciones del encabezado dinámicamente
  useEffect(() => {
    if (activeTab === 'ads') {
      setMobileActions([]);
      return;
    }
    setMobileActions([
      {
        id: 'save-company',
        title: saving ? 'Guardando...' : 'Guardar',
        icon: saving ? 'loader' : (saved ? 'check' : 'save'),
        onClick: handleSave,
        disabled: saving,
        color: saved ? '#10b981' : '#0a66c2'
      },
      {
        id: 'preview-company',
        title: 'Ver Portada',
        icon: 'eye',
        onClick: () => {
          const suffix = userId ? `?userId=${userId}` : '';
          navigate(`/${suffix}`);
        },
        color: '#6b7280'
      }
    ]);
  }, [saving, saved, handleSave, userId, navigate, setMobileActions]);



  if (loading) {
    return (
      <div className="font-sans bg-[#f3f2ef] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0a66c2] mx-auto mb-4" />
          <p className="text-gray-500">Cargando datos de empresa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Premium Sub-Header/Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 md:px-6 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Izquierda: botón volver + título */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(userId ? `/?userId=${userId}` : '/')}
              className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 flex items-center justify-center shrink-0"
              title="Volver al Inicio"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-gray-900 leading-tight truncate">Editor de Empresa</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5 truncate">
                {formData.company_name || 'Mi Empresa'}
              </p>
            </div>
          </div>

          {/* Derecha: botón Ver Perfil Público y botón Guardar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(`/empresa/${activeContext?.id}`)}
              className="px-3 sm:px-4 py-2 rounded-xl text-sm font-black transition-all ml-2 bg-purple-600 text-white hover:bg-purple-700 shadow-md flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Perfil Público</span>
            </button>
            {activeTab === 'profile' && (
              <button
                onClick={handleSave}
                disabled={saving || !!uploadingImage}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sistema de Pestañas Elite */}
        <div ref={tabsContainerRef} className="flex items-center gap-2 mb-6 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto scrollbar-tabs">
          <button 
            onClick={() => handleTabChange('profile')}
            className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-[#0a66c2] text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Building className="w-5 h-5" /> INFORMACIÓN
          </button>
          <button 
            onClick={() => handleTabChange('ads')}
            className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ads' ? 'bg-[#0a66c2] text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="w-5 h-5" /> ANUNCIOS
          </button>
          <button 
            onClick={() => handleTabChange('services')}
            className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'services' ? 'bg-[#0a66c2] text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Award className="w-5 h-5" /> SERVICIOS
          </button>
          <button 
            onClick={() => handleTabChange('apps')}
            className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'apps' ? 'bg-[#0a66c2] text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Send className="w-5 h-5" /> POSTULACIONES
          </button>
          <button 
            onClick={() => handleTabChange('portfolio')}
            className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'portfolio' ? 'bg-[#0a66c2] text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" /> PORTAFOLIO
          </button>
          <button 
            onClick={() => handleTabChange('team')}
            className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'team' ? 'bg-[#0a66c2] text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" /> EQUIPO
          </button>
        </div>

        {activeTab === 'ads' ? (
          <JobAdsManager 
            empresaId={activeContext?.id} 
            userId={userId} 
            defaultCategory={sectores.find(s => s.id == formData.industry)?.nombre || ''}
          />
        ) : activeTab === 'apps' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <ApplicationsPanel />
          </div>
        ) : activeTab === 'services' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-[#0a66c2]" /> Servicios Corporativos
              </h4>
              <div className="flex items-center gap-4">
                <button 
                  className="bg-[#0a66c2] text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-[#084d8f] transition-all"
                  onClick={handleCreateService}
                >
                  <Plus className="w-4 h-4" /> CREAR
                </button>
              </div>
            </div>

            {loadingServices ? (
              <div className="text-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2] mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Cargando tus servicios corporativos...</p>
              </div>
            ) : companyServices.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium text-lg text-gray-600">Aún no tienes servicios dinámicos</p>
                <p className="text-sm mt-2 max-w-md mx-auto">
                  Aquí aparecerán los servicios estructurados con Landing Page personalizada que configures para tu empresa.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {companyServices.map((service) => {
                  return (
                    <div 
                      key={service.id} 
                      className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                      onClick={() => window.open(`http://localhost:3000/servicios/${activeContext.id}/${service.slug}`, '_blank')}
                    >
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x225?text=Servicio'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between">
                        <span className="text-white text-xs font-bold flex items-center gap-1">
                          Ver Landing Page <Rocket className="w-3 h-3" />
                        </span>
                        <div className="flex gap-2">
                          <button 
                            className="bg-white/20 hover:bg-white/40 p-2 rounded-lg backdrop-blur-sm transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleEditService(service); }}
                          >
                            <Edit2 className="w-3 h-3 text-white" />
                          </button>
                          <button 
                            className="bg-red-500/80 hover:bg-red-500 p-2 rounded-lg backdrop-blur-sm transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleDeleteService(service.id); }}
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h5 className="font-black text-gray-900 mb-2 group-hover:text-[#0a66c2] transition-colors">{service.title}</h5>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#0a66c2] bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                          {service.slug}
                        </span>
                        <div className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase">Activo</span>
                        </div>
                      </div>
                    </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'portfolio' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8">
            <PortfolioTab empresaId={activeContext?.id} />
          </div>
        ) : activeTab === 'team' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-8">
            <TeamTab empresaId={activeContext?.id} />
          </div>
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
            {/* Sección de Imágenes */}
            <div className="mb-10">
            <div className="relative group mb-12">
              <div 
                className="w-full h-48 rounded-xl bg-gradient-to-r from-[#0a66c2]/20 to-[#0a66c2]/5 overflow-hidden border border-gray-100 flex items-center justify-center cursor-pointer relative"
                onClick={() => document.getElementById('bannerInput').click()}
              >
                {uploadingImage === 'banner' && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
                    <Loader2 className="w-10 h-10 text-[#0a66c2] animate-spin mb-2 drop-shadow-md" />
                    <span className="text-xs font-bold text-[#0a66c2] bg-white/90 px-4 py-1.5 rounded-full shadow-sm">Subiendo a ImageKit...</span>
                  </div>
                )}
                {formData.banner ? (
                  <img src={formData.banner} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <div className="text-center">
                    <Building className="w-12 h-12 text-[#0a66c2]/30 mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#0a66c2]/50 uppercase tracking-widest">Añadir Portada</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <input id="bannerInput" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} disabled={!!uploadingImage} />
              </div>

              {/* Logo de Empresa */}
              <div className="absolute -bottom-10 left-8 z-30">
                <div className="relative group/logo">
                  <div 
                    className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl border border-gray-100 overflow-hidden cursor-pointer flex items-center justify-center relative"
                    onClick={() => document.getElementById('logoInput').click()}
                  >
                    {uploadingImage === 'logo' && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl">
                        <Loader2 className="w-8 h-8 text-[#0a66c2] animate-spin mb-1" />
                        <span className="text-[10px] font-bold text-[#0a66c2] bg-white px-2 py-0.5 rounded-full shadow-sm">Subiendo...</span>
                      </div>
                    )}
                    {formData.logo ? (
                      <img src={formData.logo} className="w-full h-full object-contain" alt="Logo" />
                    ) : (
                      <Building className="w-16 h-16 text-gray-200" />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center rounded-2xl z-10">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input id="logoInput" type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} disabled={!!uploadingImage} />
                </div>
              </div>
            </div>
          </div>

          <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-[#0a66c2]" /> Información de Empresa
          </h4>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1 group relative w-fit">
                <label className="block text-sm font-bold text-gray-700">Nombre de la Empresa</label>
                <Info className="w-4 h-4 text-gray-400 hover:text-[#0a66c2] cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center leading-relaxed">
                  El nombre oficial o comercial de tu compañía tal como quieres que los profesionales lo vean.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
              <input
                type="text"
                value={formData.company_name}
                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: Hitpoly S.A."
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1 group relative w-fit">
                <label className="block text-sm font-bold text-gray-700">Descripción</label>
                <Info className="w-4 h-4 text-gray-400 hover:text-[#0a66c2] cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center leading-relaxed">
                  Una descripción atractiva de lo que hace tu empresa, su misión, visión y cultura de trabajo.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Describe tu empresa..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1 group relative w-fit">
                  <label className="block text-sm font-bold text-gray-700">Industria</label>
                  <Info className="w-4 h-4 text-gray-400 hover:text-[#0a66c2] cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center leading-relaxed">
                    Sector al que pertenece. Ej: Tecnología, Finanzas, Marketing, Salud.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
                <select
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecciona un sector...</option>
                  {sectores.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1 group relative w-fit">
                  <label className="block text-sm font-bold text-gray-700">Tamaño</label>
                  <Info className="w-4 h-4 text-gray-400 hover:text-[#0a66c2] cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center leading-relaxed">
                    Cantidad aproximada de empleados actuales en tu organización.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
                <select
                  value={formData.size}
                  onChange={e => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecciona...</option>
                  <option value="1-10">1-10 empleados</option>
                  <option value="11-50">11-50 empleados</option>
                  <option value="51-200">51-200 empleados</option>
                  <option value="200+">200+ empleados</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1 group relative w-fit">
                  <label className="block text-sm font-bold text-gray-700">Fundación</label>
                  <Info className="w-4 h-4 text-gray-400 hover:text-[#0a66c2] cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center leading-relaxed">
                    Año en que se creó la empresa.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.founded}
                  onChange={e => setFormData({ ...formData, founded: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Ej: 2020"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1 group relative w-fit">
                  <label className="block text-sm font-bold text-gray-700">Sitio Web</label>
                  <Info className="w-4 h-4 text-gray-400 hover:text-[#0a66c2] cursor-help transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center leading-relaxed">
                    Enlace a la página web principal de la empresa.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Campos adicionales unificados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">NIT / RUT</label>
              <input
                type="text"
                value={formData.nit_rut}
                onChange={e => setFormData({ ...formData, nit_rut: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: 900.123.456-7"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email de Contacto</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="contacto@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: +57 300 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: Calle 123 #45-67"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: Bogotá"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Código Postal</label>
              <input
                type="text"
                value={formData.zip}
                onChange={e => setFormData({ ...formData, zip: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: 110111"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Objetivo Principal de la Empresa</label>
              <input
                type="text"
                value={formData.objective}
                onChange={e => setFormData({ ...formData, objective: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: Expandir presencia en mercados internacionales"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Presupuesto de Marketing</label>
              <input
                type="text"
                value={formData.marketing_budget}
                onChange={e => setFormData({ ...formData, marketing_budget: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: 5000 USD / mes"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ingreso Anual Estimado</label>
              <input
                type="text"
                value={formData.annual_income}
                onChange={e => setFormData({ ...formData, annual_income: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Ej: 1M - 5M USD"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ID Fiscal / Documento</label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Número de registro legal"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Red Social Principal</label>
              <input
                type="text"
                value={formData.social}
                onChange={e => setFormData({ ...formData, social: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Link a LinkedIn o Instagram"
              />
            </div>
          </div>
        </div>
      )}

      {/* Panel de Diagnóstico / Debug */}
      {(showDebug && debugInfo) && (
        <div className="mt-6 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden font-mono text-xs">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" /> Diagnóstico del Servidor (Real-time)
            </span>
            <button onClick={() => setShowDebug(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {/* Logs de ejecución */}
            <div>
              <p className="text-indigo-400 font-bold mb-2 uppercase tracking-widest text-[10px]">Trazabilidad de Ejecución:</p>
              <div className="bg-black/40 p-3 rounded-lg border border-slate-700 max-h-40 overflow-y-auto">
                {debugInfo.logs?.map((log, i) => (
                  <div key={i} className="text-slate-300 py-0.5 border-l-2 border-indigo-500/30 pl-3 mb-1 hover:bg-white/5 transition-colors">
                    <span className="text-slate-500 mr-2">[{i+1}]</span> {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Estado final de la DB */}
            {debugInfo.db_state && (
              <div>
                <p className="text-emerald-400 font-bold mb-2 uppercase tracking-widest text-[10px]">Estado Persistido en Base de Datos:</p>
                <div className="bg-black/40 p-3 rounded-lg border border-slate-700 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800">
                        <th className="pb-2 pr-4 font-normal">Columna</th>
                        <th className="pb-2 font-normal">Valor Detectado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(debugInfo.db_state).map(([key, val]) => (
                        <tr key={key} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                          <td className="py-1.5 pr-4 text-slate-400 font-bold">{key}</td>
                          <td className="py-1.5 text-slate-200">
                            {val === null ? <span className="text-slate-600 italic">NULL</span> : 
                             (typeof val === 'string' && val.startsWith('data:image') ? 
                               <span className="text-indigo-400 text-[10px] break-all">Base64 Image ({val.length} bytes)</span> : 
                               String(val))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);
}
