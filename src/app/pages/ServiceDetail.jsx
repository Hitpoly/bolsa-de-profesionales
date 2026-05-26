import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  Briefcase, Globe, Languages, ShoppingCart,
  ShieldCheck, Sparkles, Info, ListChecks, CheckCircle2,
  Timer, Zap, ChevronDown, RefreshCw, Clock, Star, Tag, History, Award, DollarSign, Eye
} from 'lucide-react';
import { useSystem } from '../data/SystemContext';
import axios from 'axios';

export function ServiceDetail({ previewService = null, isPreviewMode = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { activeContext, setHeaderData, setMobileActions } = useSystem();
  const [service, setService] = useState(() => {
    const cached = sessionStorage.getItem(`svc_cache_${serviceId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.service) return parsed.service;
      } catch (e) {}
    }
    return previewService || location.state?.service || null;
  });
  const [loading, setLoading] = useState(!isPreviewMode && !service);
  const [error, setError] = useState(null);

  const [isCompanyService, setIsCompanyService] = useState(() => {
    const cached = sessionStorage.getItem(`svc_cache_${serviceId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.isCompanyService) return true;
      } catch (e) {}
    }
    return location.state?.isCompanyService || false;
  });
  const [companyId, setCompanyId] = useState(() => {
    const cached = sessionStorage.getItem(`svc_cache_${serviceId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.companyId) return parsed.companyId;
      } catch (e) {}
    }
    return location.state?.companyId || service?.empresa_id || null;
  });
  const [showPricing, setShowPricing] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  useEffect(() => {
    if (isPreviewMode && previewService) {
      const parsed = { ...previewService };
      ['herramientas', 'entregables', 'beneficios', 'faqs', 'requisitos_cliente', 'proceso_trabajo', 'portfolio_items'].forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
          try {
            const decoded = JSON.parse(parsed[field]);
            parsed[field] = Array.isArray(decoded) ? decoded : Object.values(decoded);
          } catch (e) { parsed[field] = []; }
        } else if (!parsed[field]) {
          parsed[field] = [];
        }
      });
      setService(parsed);
      setLoading(false);
    }
  }, [previewService, isPreviewMode]);

  useEffect(() => {
    if (isPreviewMode) return;
    let stale = false;

    const parseSvc = (svc) => {
      const parsed = { ...svc };
      ['herramientas', 'entregables', 'beneficios', 'faqs', 'requisitos_cliente', 'proceso_trabajo', 'portfolio_items'].forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
          try {
            const decoded = JSON.parse(parsed[field]);
            parsed[field] = Array.isArray(decoded) ? decoded : Object.values(decoded);
          } catch (e) { parsed[field] = []; }
        } else if (!parsed[field]) {
          parsed[field] = [];
        }
      });
      return parsed;
    };

    if (service && typeof service.beneficios === 'string') {
      setService(parseSvc(service));
    }

    const loadService = async (retries = 2) => {
      const sId = serviceId || location.state?.service?.id;
      if (stale) return;
      if (!sId) {
        setError('Servicio no encontrado');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php', {
          accion: 'getServiceDetail',
          service_id: sId
        });

        if (!stale) {
          if (res.data.success && res.data.data) {
            setService(parseSvc(res.data.data));
            setError(null);
          } else if (retries > 0) {
            await loadService(retries - 1);
          } else {
            setError('Servicio no encontrado');
          }
        }
      } catch (e) {
        if (!stale && retries > 0) {
          await loadService(retries - 1);
        } else if (!stale) {
          setError('Error al cargar el servicio. Intenta de nuevo.');
        }
      } finally {
        if (!stale) {
          setLoading(false);
        }
      }
    };

    if (!service) {
      loadService();
    } else {
      setLoading(false);
    }

    return () => { stale = true; };
  }, [serviceId, location.pathname, isPreviewMode]);

  useEffect(() => {
    if (service && isCompanyService && serviceId) {
      sessionStorage.setItem(`svc_cache_${serviceId}`, JSON.stringify({
        service,
        companyId,
        isCompanyService: true
      }));
    } else if (service && serviceId) {
      sessionStorage.removeItem(`svc_cache_${serviceId}`);
    }
  }, [service, isCompanyService, companyId, serviceId]);

  const profile = location.state?.profile;

  useEffect(() => {
    if (!service || isPreviewMode) return;

    setHeaderData({
      title: service.titulo || 'Servicio',
      subtitle: service.professional?.nombre ? `Por ${service.professional.nombre}` : (service.tipo === 'hora' ? 'Servicio por Hora' : 'Proyecto Cerrado'),
      icon: 'briefcase',
      color: '#0a66c2'
    });
    window.bolsaBackHandler = () => {
      if (window.history.length > 1) navigate(-1);
      else navigate('/');
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
  }, [service, isPreviewMode, setHeaderData, navigate, setMobileActions]);

  useEffect(() => {
    if (!service || !isCompanyService || isPreviewMode) return;
    setMobileActions([
      {
        id: 'toggle-view',
        icon: showPricing ? 'eye' : 'dollar',
        title: showPricing ? 'VER SERVICIO' : 'CONSULTAR PRECIOS',
        color: showPricing ? '#0a66c2' : '#059669',
        onClick: () => setShowPricing(prev => !prev)
      }
    ]);
  }, [service, isCompanyService, isPreviewMode, showPricing, setMobileActions]);

  const handleInteraction = (callback) => {
    if (isPreviewMode) return;
    if (!activeContext) return;
    callback();
  };

  const getUserId = () => profile?.user_id || profile?.id || null;

  let herramientasParsed = [];
  try {
    if (service?.herramientas) {
      herramientasParsed = typeof service.herramientas === 'string'
        ? JSON.parse(service.herramientas)
        : service.herramientas;
    }
  } catch (e) { }

  if (!loading && isCompanyService && service) {
    const slug = service.slug || service.id;
    const baseUrl = window.location.hostname === 'localhost'
      ? `http://localhost:3000`
      : `https://hitpoly.com`;
    const searchParams = new URLSearchParams();
    searchParams.set('preview', 'true');
    if (service?.id) searchParams.set('serviceId', service.id);
    const qs = searchParams.toString();
    const iframeUrl = showPricing
      ? `${baseUrl}/servicios/${companyId}/${slug}/precios?${qs}`
      : `${baseUrl}/servicios/${companyId}/${slug}?${qs}`;

    return (
      <div className="w-full bg-white h-[calc(100vh-80px)] overflow-hidden relative">
        <iframe
          key={showPricing ? 'pricing' : 'landing'}
          src={iframeUrl}
          title="Servicio Corporativo"
          className="w-full h-full border-0 absolute inset-0"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`font-sans text-gray-900 bg-[#f3f2ef] ${isPreviewMode ? '' : 'min-h-screen'} flex items-center justify-center`}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (!loading && error && !service) {
    return (
      <div className={`font-sans text-gray-900 bg-[#f3f2ef] ${isPreviewMode ? '' : 'min-h-screen'} flex items-center justify-center`}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <Info className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-700 font-bold">{error || 'Servicio no encontrado'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#0a66c2] text-white rounded-full font-bold text-sm hover:bg-blue-700"
          >
            Ir al Marketplace
          </button>
        </div>
      </div>
    );
  }

  const [faqOpenIndex, setFaqOpenIndex] = useState(null);
  const discountedPrice = service.precio_oferta && service.porcentaje_oferta > 0
    ? service.precio - (service.precio * service.porcentaje_oferta / 100)
    : null;

  const handleAddToCart = () => {
    if (!activeContext) return;
    const cart = activeContext?.cart || [];
    const newItem = {
      type: 'servicio',
      id: service.id,
      serviceId: service.id,
      name: service.titulo,
      professionalName: service.professional?.nombre || 'Profesional',
      price: discountedPrice || service.precio,
      originalPrice: discountedPrice ? service.precio : null,
      tipo: service.tipo,
      imagen: service.imagen,
      cantidad: 1
    };
    setShowPurchaseDialog(false);
    activeContext.setCart([...cart, newItem]);
    activeContext.setShowCartDrawer(true);
  };

  return (
    <>
      <div className={`font-sans text-gray-900 bg-[#f3f2ef] ${isPreviewMode ? 'pb-20' : 'min-h-screen pb-20'} animate-in fade-in flex flex-col`}>
        <div className="max-w-5xl mx-auto w-full md:pt-4 md:px-5">
          <div className="bg-white rounded-none md:rounded-xl border border-gray-200 overflow-hidden shadow-sm relative mb-6">
            {service.imagen ? (
              <div className="w-full h-48 md:h-80 relative">
                <img
                  src={service.imagen}
                  alt={service.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('bg-gradient-to-r', 'from-gray-200', 'to-gray-300');
                  }}
                />
                <div className="absolute inset-0 bg-black/5"></div>
              </div>
            ) : (
              <div className="w-full h-32 md:h-48 bg-gradient-to-r from-gray-200 to-gray-300"></div>
            )}

            <div className="p-6 md:p-10 relative z-10 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div className="flex-1 space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${service.tipo === 'hora' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-[#0a66c2] border-blue-200'}`}>
                      {service.tipo === 'hora' ? 'Contratación por Hora' : 'Proyecto Cerrado'}
                    </span>
                    {service.precio_oferta && service.porcentaje_oferta > 0 && (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {service.porcentaje_oferta}% OFF
                      </span>
                    )}
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Profesional Verificado
                    </span>
                    {service.garantia_dias > 0 && (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-50 text-green-700 border border-green-100 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> {service.garantia_dias} días garantía
                      </span>
                    )}
                    {service.revisiones_incluidas > 0 && (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-50 text-orange-700 border border-orange-100 flex items-center gap-1">
                        <History className="w-3 h-3" /> {service.revisiones_incluidas} Revisiones
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                    {service.titulo}
                  </h1>

                  {service.professional?.nombre && (
                    <p className="text-gray-600 text-sm flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#0a66c2]" />
                      Por <span className="font-semibold text-gray-800">{service.professional.nombre}</span>
                    </p>
                  )}

                  {service.ubicacion && (
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> {service.ubicacion}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs">
                    {service.rating && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {Number(service.rating).toFixed(1)}
                      </span>
                    )}
                    {service.reviews_count && (
                      <span className="text-gray-400">({service.reviews_count} reseñas)</span>
                    )}
                  </div>

                  {service.descripcion && (
                    <p className="text-gray-700 text-sm leading-relaxed">{service.descripcion}</p>
                  )}
                </div>

                <div className="lg:w-72 w-full shrink-0">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4">
                    <div>
                      {discountedPrice ? (
                        <div className="space-y-1">
                          <p className="text-3xl font-extrabold text-gray-900">
                            ${Number(discountedPrice).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-400 line-through">
                            ${Number(service.precio).toLocaleString()}
                          </p>
                          <p className="text-xs font-bold text-red-500">
                            {service.porcentaje_oferta}% de descuento
                          </p>
                        </div>
                      ) : (
                        <p className="text-3xl font-extrabold text-gray-900">
                          ${Number(service.precio).toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {service.tipo === 'hora' ? 'por hora' : 'precio fijo'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPurchaseDialog(true)}
                      className="w-full py-3 bg-[#0a66c2] text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Contratar ahora
                    </button>

                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                        Compra protegida
                      </p>
                      {service.garantia_dias > 0 && (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                          {service.garantia_dias} días de garantía
                        </p>
                      )}
                      {service.revisiones_incluidas > 0 && (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-orange-500" />
                          {service.revisiones_incluidas} revisiones incluidas
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        Paga en cuotas sin interés
                      </p>
                    </div>
                  </div>

                  {herramientasParsed.length > 0 && (
                    <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-3 mt-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tecnologías</p>
                      <div className="flex flex-wrap gap-2">
                        {herramientasParsed.map((herramienta, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700">
                            {herramienta}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {service.descripcion_larga && (
              <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#0a66c2]" /> Acerca de este servicio
                </h2>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {service.descripcion_larga}
                </div>
              </div>
            )}

            {Array.isArray(service.beneficios) && service.beneficios.length > 0 && (
              <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0a66c2]" /> Beneficios
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.beneficios.map((beneficio, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{beneficio}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(service.requisitos_cliente) && service.requisitos_cliente.length > 0 && (
              <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-[#0a66c2]" /> Requisitos del Cliente
                </h2>
                <ul className="space-y-3">
                  {service.requisitos_cliente.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-[#0a66c2] rounded-full shrink-0 mt-1.5"></span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(service.proceso_trabajo) && service.proceso_trabajo.length > 0 && (
              <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#0a66c2]" /> Proceso de Trabajo
                </h2>
                <div className="space-y-0">
                  {service.proceso_trabajo.map((paso, idx) => (
                    <div key={idx} className="flex gap-4 pb-6 relative last:pb-0">
                      {idx < service.proceso_trabajo.length - 1 && (
                        <div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      <div className="w-7 h-7 bg-[#0a66c2] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 relative z-10">
                        {idx + 1}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm font-semibold text-gray-900">{paso.titulo || `Paso ${idx + 1}`}</p>
                        <p className="text-sm text-gray-600 mt-1">{paso.descripcion || paso}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(service.entregables) && service.entregables.length > 0 && (
              <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#0a66c2]" /> Entregables
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.entregables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(service.faqs) && service.faqs.length > 0 && (
              <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0a66c2]" /> Preguntas Frecuentes
                </h2>
                <div className="space-y-3">
                  {service.faqs.map((faq, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-gray-900 pr-4">{faq.pregunta || faq.titulo || faq}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${faqOpenIndex === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {faqOpenIndex === idx && (
                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                          {faq.respuesta || faq.descripcion || faq.contenido || ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 md:p-8 border border-blue-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">¿Listo para comenzar?</h3>
                  <p className="text-sm text-gray-600">
                    Contrata este servicio y empieza a trabajar con {service.professional?.nombre || 'el profesional'} hoy mismo.
                  </p>
                </div>
                <button
                  onClick={() => setShowPurchaseDialog(true)}
                  className="shrink-0 px-8 py-3 bg-[#0a66c2] text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Contratar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      {showPurchaseDialog && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-bottom-0">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="w-7 h-7 text-[#0a66c2]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Confirmar contratación</h3>
                <p className="text-sm text-gray-500 mt-1">
                  ¿Estás seguro de que deseas agregar este servicio a tu carrito?
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                <div className="flex items-center gap-3">
                  {service.imagen && (
                    <img src={service.imagen} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{service.titulo}</p>
                    <p className="text-xs text-gray-500">{service.professional?.nombre || 'Profesional'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">
                      ${Number(discountedPrice || service.precio).toLocaleString()}
                    </p>
                    {discountedPrice && (
                      <p className="text-[10px] text-gray-400 line-through">
                        ${Number(service.precio).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseDialog(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-[#0a66c2] text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-md"
                >
                  <ShoppingCart className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
