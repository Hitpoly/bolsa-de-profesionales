import React, { useState, useEffect, useRef } from 'react';
import {
   User, MapPin, Briefcase, Calendar, Globe, Mail,
   MessageCircle, ArrowLeft, Star, Award, Sparkles,
   Linkedin, Github, Twitter, Facebook, ExternalLink,
   Clock, BookOpen, Languages, CheckCircle2, Heart, Plane, History, Flag,
   DollarSign, ListChecks, ChevronRight, ShoppingCart, Tag, TrendingDown, ChevronLeft,
   Timer, Rocket, Zap, ShieldCheck, Camera, MoreHorizontal, Share2, Pencil, Eye, Search, X, Phone, Copy, Info
} from 'lucide-react';
import axios from 'axios';
import { useSystem } from '../data/SystemContext';

interface ProfileViewProps {
   profile: any;
   onBack: () => void;
   isOwnProfile?: boolean;
}

export function ProfileView({ profile, onBack, isOwnProfile = false }: ProfileViewProps) {
   const { activeContext, setHeaderData, setMobileActions } = useSystem();


   const [services, setServices] = useState<any[]>([]);
   const [loadingServices, setLoadingServices] = useState(true);
   const [showContactPopup, setShowContactPopup] = useState(false);
   const [showReviewsModal, setShowReviewsModal] = useState(false);
   const [showRegisterGuard, setShowRegisterGuard] = useState(false);
   const [showShareMenu, setShowShareMenu] = useState(false);
   const [reviewsData, setReviewsData] = useState<{ reviews: any[], average: number, total: number }>({ reviews: [], average: 0, total: 0 });
   const [selectedService, setSelectedService] = useState<any>(null);
   const [showAllCompanies, setShowAllCompanies] = useState(false);
   const [showShareModal, setShowShareModal] = useState(false);

   // ProfileView es vista de lectura — limpiar botones de acción del header
   useEffect(() => {
      setMobileActions([]);
      return () => setMobileActions([]);
   }, [setMobileActions]);

   useEffect(() => {
      if (selectedService) {
         setHeaderData({
            title: selectedService.titulo,
            subtitle: selectedService.tipo === 'hora' ? 'Servicio por Hora' : 'Proyecto Cerrado',
            icon: 'briefcase',
            color: '#0a66c2'
         });
         (window as any).bolsaBackHandler = () => setSelectedService(null);
      } else if (profile) {
         setHeaderData({
            title: `${profile.usuario_principal?.nombre || ''} ${profile.usuario_principal?.apellido || ''}`.trim() || 'Perfil Profesional',
            subtitle: profile.usuario_principal?.nombre_cargo || profile.especialidad || 'Profesional en Hitpoly',
            icon: 'users',
            color: '#0a66c2'
         });
         (window as any).bolsaBackHandler = null;
      }

      return () => {
         setHeaderData({
            title: 'Bolsa de Empleo',
            subtitle: 'Oportunidades y talento profesional',
            icon: 'briefcase',
            color: '#0a66c2'
         });
         (window as any).bolsaBackHandler = null;
      };
   }, [profile, selectedService]);
   const [copySuccess, setCopySuccess] = useState(false);

   const scrollHoraRef = useRef<HTMLDivElement>(null);
   const scrollProyectoRef = useRef<HTMLDivElement>(null);
   const shareRef = useRef<HTMLDivElement>(null);

   const {
      usuario_principal, sobre_mi, social_links, skills,
      experience_years, availability, experiencia_laboral,
      educacion, idiomas, perfil_general, empleo, viajes, hobbies, intereses,
      international_markets, total_amigos
   } = profile;

   const showcaseConfig = perfil_general?.bolsa_config ? (
      typeof perfil_general.bolsa_config === 'string'
         ? JSON.parse(perfil_general.bolsa_config)
         : perfil_general.bolsa_config
   ) : {
      experience_ids: [], employment_ids: [], education_ids: [],
      languages_ids: [], links_ids: [], travel_ids: [],
      hobbies_ids: [], interests_ids: []
   };

   useEffect(() => {
      cargarServicios();
      cargarReseñas();

      const handleClickOutside = (e: MouseEvent) => {
         if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
            setShowShareMenu(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [profile.user_id]);

   const cargarReseñas = async () => {
      try {
         const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php', {
            accion: 'getReviews',
            professional_id: profile.user_id || profile.id
         });
         if (res.data.success) setReviewsData(res.data.data);
      } catch (e) { }
   };

   const cargarServicios = async () => {
      setLoadingServices(true);
      try {
         const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php', {
            accion: 'getServices',
            user_id: profile.user_id || profile.id
         });
         if (res.data.success) setServices(res.data.data || []);
      } catch (e) { } finally { setLoadingServices(false); }
   };

   const handleInteraction = (callback: () => void) => {
      if (!activeContext) {
         setShowRegisterGuard(true);
      } else {
         callback();
      }
   };

   const handleShare = async () => {
      // Detectamos si estamos en local o producción para generar el enlace correcto
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isLocal ? 'http://localhost:3000' : 'https://hitpoly.com';

      // Construimos la URL de Hitpoly usando la ruta del sistema de bolsa y el parámetro userId
      const hitpolyUrl = `${baseUrl}/systems/bolsa?userId=${profile.user_id || profile.id}`;

      console.log("🔗 Generando enlace para compartir:", hitpolyUrl);

      // Abrimos el modal de compartir
      setShowShareModal(true);
      setShowShareMenu(false);

      // Intentamos copiar automáticamente al abrir
      try {
         if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(hitpolyUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
         } else {
            throw new Error("Clipboard API not available");
         }
      } catch (err) {
         console.warn("No se pudo copiar automáticamente, enviando petición al padre...");
         window.parent.postMessage({ type: 'COPY_TEXT', text: hitpolyUrl }, '*');
         // Mostramos éxito visual de todos modos porque el padre lo gestionará
         setCopySuccess(true);
         setTimeout(() => setCopySuccess(false), 2000);
      }
   };

   const copyToClipboard = async (text: string) => {
      try {
         // Prioridad 1: Clipboard API (Si hay permisos)
         if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
         } else {
            throw new Error("Clipboard API block or not available");
         }
      } catch (err) {
         console.warn("Clipboard API falló, usando postMessage al padre...");

         // Prioridad 2: Delegar al padre (Holding) - Es el método más fiable en iframes
         window.parent.postMessage({ type: 'COPY_TEXT', text: text }, '*');

         // Éxito visual optimista
         setCopySuccess(true);
         setTimeout(() => setCopySuccess(false), 2000);

         // Fallback 3: Método tradicional de emergencia (execCommand)
         try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
         } catch (e) { }
      }
   };

   const servicesHora = services.filter(s => s.tipo === 'hora');
   const servicesProyecto = services.filter(s => s.tipo === 'proyecto');

   const avatar = usuario_principal?.foto || usuario_principal?.avatar || `https://ui-avatars.com/api/?name=${usuario_principal?.nombre || 'User'}&background=random`;
   const banner = perfil_general?.cover_photo || "https://static.licdn.com/aero-v1/networks/sc/h/56v39626e2mxy74o0o3299o15";

   const getUserId = () => {
      return profile.user_id || profile.id;
   };

   const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
      if (ref.current) {
         const { scrollLeft, clientWidth } = ref.current;
         const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
         ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
   };

   // --- FILTRADO POR ESCAPARATE ---
   const visibleExperience = experiencia_laboral?.filter((ex: any) => showcaseConfig.experience_ids?.includes(ex.id)) || [];
   const visibleEmployment = empleo?.filter((em: any) => showcaseConfig.employment_ids?.includes(em.id)) || [];
   const visibleEducation = educacion?.filter((ed: any) => showcaseConfig.education_ids?.includes(ed.id)) || [];
   const visibleLanguages = idiomas?.filter((idm: any) => showcaseConfig.languages_ids?.includes(idm.id)) || [];
   const visibleLinks = social_links?.filter((sl: any) => showcaseConfig.links_ids?.includes(sl.id)) || [];
   const visibleHobbies = hobbies?.filter((h: any) => showcaseConfig.hobbies_ids?.includes(h.id)) || [];
   const visibleInterests = intereses?.filter((i: any) => showcaseConfig.interests_ids?.includes(i.id)) || [];

   // --- DETECCION DE MERCADOS (PAISES) ---
   const rawMarkets = profile.international_markets || profile.bolsa_data?.international_markets || profile.perfil_general?.international_markets || "";
   const markets = typeof rawMarkets === 'string' ? rawMarkets.split(',').map((m: string) => m.trim()).filter((m: string) => m !== '') : [];

   // --- RENDERIZADO DE LA PÁGINA DEL PRODUCTO (SERVICIO SELECCIONADO) ---
   if (selectedService) {
      let herramientasParsed = [];
      try {
         if (selectedService.herramientas) {
            herramientasParsed = typeof selectedService.herramientas === 'string' 
               ? JSON.parse(selectedService.herramientas) 
               : selectedService.herramientas;
         }
      } catch (e) { }

      return (
         <div className="font-sans text-gray-900 bg-[#f3f2ef] min-h-screen pb-20 animate-in fade-in flex flex-col">
            <div className="max-w-5xl mx-auto w-full md:pt-4 px-0 md:px-0">
               {/* Header Estilo LinkedIn */}
               <div className="bg-white md:rounded-xl border border-gray-200 overflow-hidden shadow-sm relative mb-6">
                  {selectedService.imagen ? (
                     <div className="w-full h-48 md:h-80 relative">
                        <img src={selectedService.imagen} alt={selectedService.titulo} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/5"></div>
                     </div>
                  ) : (
                     <div className="w-full h-32 md:h-48 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                  )}

                  <div className="p-6 md:p-8 relative">
                     <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                        <div className="flex-1 space-y-4">
                           <div className="flex flex-wrap gap-2">
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${selectedService.tipo === 'hora' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-[#0a66c2] border-blue-200'}`}>
                                 {selectedService.tipo === 'hora' ? 'Contratación por Hora' : 'Proyecto Cerrado'}
                              </span>
                              {selectedService.precio_oferta && selectedService.porcentaje_oferta > 0 && (
                                 <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-red-50 text-red-600 border border-red-100">
                                    {selectedService.porcentaje_oferta}% OFF
                                 </span>
                              )}
                           </div>
                           <h3 className="font-bold text-2xl md:text-3xl text-gray-900 leading-tight">{selectedService.titulo}</h3>
                           <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                              <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-gray-400" /> Servicio Profesional</div>
                              <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400" /> Remoto / Global</div>
                              <div className="flex items-center gap-1.5"><Languages className="w-4 h-4 text-gray-400" /> Multilingüe</div>
                           </div>
                        </div>

                        <div className="w-full md:w-80 bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio del Servicio</p>
                              <div className="flex items-baseline gap-2">
                                 <span className="text-3xl font-black text-gray-900">{selectedService.moneda} {Number(selectedService.precio_oferta || selectedService.precio_base).toFixed(0)}</span>
                                 {selectedService.tipo === 'hora' && <span className="text-sm text-gray-500 font-bold">/ h</span>}
                              </div>
                              {selectedService.precio_oferta && selectedService.porcentaje_oferta > 0 && (
                                 <p className="text-xs text-gray-400 line-through font-medium">{selectedService.moneda} {Number(selectedService.precio_base).toFixed(0)}</p>
                              )}
                           </div>
                           
                           <button
                              onClick={() => {
                                 window.parent.postMessage({
                                    type: 'ADD_TO_CART',
                                    product: {
                                       id: selectedService.id,
                                       name: selectedService.titulo,
                                       price_original: selectedService.precio_base,
                                       price_final: selectedService.precio_oferta || selectedService.precio_base,
                                       currency: selectedService.moneda || 'USD',
                                       type: 'servicio',
                                       details: selectedService.descripcion || '',
                                       image: selectedService.imagen || null
                                    }
                                 }, '*');
                                 setSelectedService(null);
                              }}
                              className="w-full py-3 bg-[#0a66c2] text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                           >
                              <ShoppingCart className="w-4 h-4" />
                              Contratar ahora
                           </button>
                           
                           <p className="text-[10px] text-gray-400 text-center font-medium">Pago seguro garantizado por Hitpoly</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Secciones de Detalles */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Columna Principal */}
                  <div className="lg:col-span-8 space-y-6">
                     
                     {/* Descripción */}
                     {selectedService.descripcion && (
                        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
                           <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Info className="w-5 h-5 text-[#0a66c2]" /> Acerca de este servicio
                           </h4>
                           <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{selectedService.descripcion}</p>
                        </div>
                     )}

                     {/* Entregables */}
                     {selectedService.entregables && selectedService.entregables.length > 0 && (
                        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
                           <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                              <ListChecks className="w-5 h-5 text-[#0a66c2]" /> Plan de Entregables
                           </h4>
                           <div className="space-y-4">
                              {selectedService.entregables.map((ent: any, idx: number) => (
                                 <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedService.tipo === 'hora' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                       <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                       <div className="flex justify-between items-start gap-4 mb-1">
                                          <h5 className="font-bold text-gray-900 text-sm">{ent.titulo}</h5>
                                          {ent.valor_individual && (
                                             <span className="text-[11px] font-bold text-gray-400">{selectedService.moneda} {Number(ent.valor_individual).toFixed(0)}</span>
                                          )}
                                       </div>
                                       {ent.descripcion && <p className="text-xs text-gray-500 mb-2">{ent.descripcion}</p>}
                                       {ent.tiempo_limite && (
                                          <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 uppercase">
                                             <Timer className="w-3.5 h-3.5" /> Entrega: {ent.tiempo_limite} días
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Columna Lateral */}
                  <div className="lg:col-span-4 space-y-6">
                     
                     {/* Tecnologías */}
                     {herramientasParsed && herramientasParsed.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                           <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-500" /> Tecnologías
                           </h4>
                           <div className="space-y-3">
                              {herramientasParsed.map((herr: any, idx: number) => (
                                 <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#0a66c2]">
                                          <Sparkles className="w-4 h-4" />
                                       </div>
                                       <div>
                                          <p className="text-xs font-bold text-gray-800">{herr.nombre || herr.name || herr.herramienta}</p>
                                          <p className="text-[10px] text-gray-400">{herr.uso || 'Uso estándar'}</p>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Garantía */}
                     <div className="bg-[#f3f2ef] p-6 rounded-xl border border-gray-200/50">
                        <div className="flex items-start gap-3">
                           <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                           <div>
                              <p className="text-xs font-bold text-gray-900 mb-1">Protección Hitpoly</p>
                              <p className="text-[10px] text-gray-500 leading-relaxed">Tu pago está protegido. Liberamos los fondos solo cuando confirmas la recepción del servicio.</p>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="font-sans text-gray-900 bg-[#f0f2f5] min-h-screen pb-20">
         <style>{`
            .scrollbar-hide::-webkit-scrollbar {
               display: none;
            }
            .scrollbar-hide {
               -ms-overflow-style: none;
               scrollbar-width: none;
            }
         `}</style>

         {/* --- CABECERA ESTILO FACEBOOK --- */}
         <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-5xl mx-auto relative">

               {/* Banner con fondo a los lados */}
               <div className="relative w-full aspect-[2.5/1] md:aspect-[3/1] bg-gradient-to-b from-gray-300 to-gray-200 overflow-hidden md:rounded-b-xl shadow-inner">
                  <img src={banner} alt="Banner" className="w-full h-full object-cover" />

                  {isOwnProfile && (
                     <button className="absolute bottom-4 right-4 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-sm font-bold flex items-center gap-2 hover:bg-white transition-all">
                        <Camera className="w-4 h-4" /> Editar foto de portada
                     </button>
                  )}
               </div>

               {/* Info de Perfil (Avatar + Nombre + Botones) */}
               <div className="px-4 md:px-8 pb-6">
                  <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 mb-4 gap-4">
                     <div className="relative">
                        <div className="p-1 bg-white rounded-full shadow-md">
                           <img src={avatar} alt={usuario_principal?.nombre} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white" />
                        </div>
                        {isOwnProfile && (
                           <button className="absolute bottom-2 right-2 p-2 bg-gray-100 rounded-full border border-gray-200 hover:bg-gray-200 shadow-sm transition-all">
                              <Camera className="w-4 h-4" />
                           </button>
                        )}
                     </div>

                     <div className="flex-1 text-center md:text-left pb-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                           <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                              {usuario_principal?.nombre} {usuario_principal?.apellido}
                           </h1>
                           <span className="text-gray-500 text-sm font-normal md:mt-1">({usuario_principal?.genero || 'Él/Ella'})</span>
                        </div>
                        <p className="text-gray-600 font-medium text-lg">{usuario_principal?.nombre_cargo || 'Profesional en Hitpoly'}</p>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mt-1 text-sm text-gray-500">
                           <span className="font-bold text-gray-700">{total_amigos || 0} amigos</span>
                           <span>•</span>
                           <span className="hover:underline cursor-pointer">{profile.datos_personales?.city}, {profile.datos_personales?.country}</span>
                        </div>
                     </div>

                     <div className="flex gap-2 pb-2">
                        <button
                           onClick={() => handleInteraction(() => window.parent.postMessage({ type: 'OPEN_CHAT', userId: profile.user_id }, '*'))}
                           className="px-4 py-2 bg-[#1877f2] text-white rounded-lg font-bold hover:bg-[#166fe5] transition-all flex items-center gap-2 shadow-sm"
                        >
                           <MessageCircle className="w-4 h-4" /> Enviar mensaje
                        </button>
                        <button
                           onClick={() => handleInteraction(() => setShowReviewsModal(true))}
                           className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-all flex items-center gap-2"
                        >
                           <Star className="w-4 h-4" /> Reseñas
                        </button>
                        <div className="relative" ref={shareRef}>
                           <button
                              onClick={() => setShowShareMenu(!showShareMenu)}
                              className="p-2 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-all"
                           >
                              <MoreHorizontal className="w-5 h-5" />
                           </button>
                           {showShareMenu && (
                              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] p-2">
                                 <button onClick={handleShare} className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-100 rounded-lg flex items-center gap-3">
                                    <Share2 className="w-4 h-4 text-blue-600" /> Compartir perfil
                                 </button>
                                 <button onClick={() => setShowContactPopup(true)} className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-100 rounded-lg flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-green-600" /> Ver contacto
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* --- CONTENIDO PRINCIPAL (Centrado debajo) --- */}
         <div className="max-w-5xl mx-auto px-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

               {/* --- COLUMNA IZQUIERDA --- */}
               <div className="lg:col-span-8 space-y-4">

                  {/* ANALISIS / SUGERENCIAS */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                     <h3 className="font-semibold text-lg mb-1">Análisis</h3>
                     <p className="text-xs text-gray-500 flex items-center gap-1 mb-4"><Eye className="w-3 h-3" /> Solo para ti</p>
                     <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 font-bold text-sm"><User className="w-4 h-4 text-blue-500" /> 14 vistas del perfil</div>
                           <p className="text-xs text-gray-500">Descubre quién ha visto tu perfil.</p>
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 font-bold text-sm"><History className="w-4 h-4 text-orange-500" /> 0 impresiones de la pub.</div>
                           <p className="text-xs text-gray-500">Comienza una publicación...</p>
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 font-bold text-sm"><Search className="w-4 h-4 text-green-500" /> 0 apariciones en búsquedas</div>
                           <p className="text-xs text-gray-500">Actualiza tu perfil para aparecer más.</p>
                        </div>
                     </div>
                  </div>

                  {/* ACERCA DE */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                     <h3 className="font-semibold text-xl mb-4">Acerca de</h3>
                     <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {sobre_mi?.about_text || 'Sin descripción profesional definida.'}
                     </p>
                  </div>

                  {/* IMPACTO PROFESIONAL (ESTILO LINKEDIN) */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                     <h3 className="font-semibold text-lg mb-4 text-gray-900">Perfil Profesional</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <div className="flex items-start gap-3">
                           <div className="p-2 bg-indigo-50 rounded-full shrink-0"><History className="w-5 h-5 text-indigo-500" /></div>
                           <div>
                              <p className="text-sm font-semibold text-gray-900">{experience_years || '0'}+ años de experiencia</p>
                              <p className="text-xs text-gray-500">Trayectoria profesional comprobada</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-3">
                           <div className="p-2 bg-teal-50 rounded-full shrink-0"><Timer className="w-5 h-5 text-teal-500" /></div>
                           <div>
                              <p className="text-sm font-semibold text-gray-900 uppercase">{availability || 'Disponibilidad inmediata'}</p>
                              <p className="text-xs text-gray-500">Modalidad de contratación</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* CARRUSEL DE SERVICIOS POR HORA */}
                  {servicesHora.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-hidden relative">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="font-semibold text-xl">Servicios por Hora</h3>
                           <div className="flex gap-2">
                              <button onClick={() => scroll(scrollHoraRef, 'left')} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
                              <button onClick={() => scroll(scrollHoraRef, 'right')} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
                           </div>
                        </div>
                        <div ref={scrollHoraRef} className="flex gap-4 overflow-x-auto snap-x scrollbar-hide">
                           {servicesHora.map((s, idx) => (
                              <div key={idx} className="min-w-[300px] md:min-w-[340px] snap-start border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all flex flex-col justify-between bg-white shadow-sm overflow-hidden group cursor-pointer" onClick={() => handleInteraction(() => setSelectedService(s))}>
                                 {/* Imagen superior */}
                                 {s.imagen ? (
                                    <div className="relative h-40 w-full overflow-hidden bg-gray-100 shrink-0">
                                       <img src={s.imagen} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                 ) : (
                                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 w-full shrink-0"></div>
                                 )}

                                 <div className="p-5 space-y-4 flex-1 flex flex-col">
                                    {/* Titulo y descripcion */}
                                    <div>
                                       <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight">{s.titulo}</h4>
                                       <p className="text-xs text-gray-500 line-clamp-2 mt-1">{s.descripcion}</p>
                                    </div>

                                    {/* Entregables reducidos */}
                                    {s.entregables && s.entregables.length > 0 && (
                                       <div className="pt-2">
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">¿Qué incluye?</p>
                                          <div className="space-y-1.5">
                                             {s.entregables.slice(0, 2).map((ent: any, eIdx: number) => (
                                                <div key={eIdx} className="flex items-start gap-2 text-xs text-gray-600">
                                                   <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                                   <span className="line-clamp-1">{ent.titulo}</span>
                                                </div>
                                             ))}
                                             {s.entregables.length > 2 && (
                                                <p className="text-[11px] text-blue-600 font-bold pl-5 pt-1">+{s.entregables.length - 2} items más...</p>
                                             )}
                                          </div>
                                       </div>
                                    )}
                                 </div>

                                 {/* Footer */}
                                 <div className="p-5 pt-4 mt-auto border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    <div className="flex flex-col">
                                       {s.precio_oferta && s.porcentaje_oferta > 0 ? (
                                          <>
                                             <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-[10px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded-sm">-{s.porcentaje_oferta}%</span>
                                                <span className="text-[10px] text-gray-400 line-through decoration-gray-400/50">{s.moneda} {Number(s.precio_base).toFixed(0)}</span>
                                             </div>
                                             <span className="font-black text-blue-700 text-xl leading-none">{s.moneda} {Number(s.precio_oferta).toFixed(0)} <span className="text-xs font-normal text-gray-500 ml-0.5">/ h</span></span>
                                          </>
                                       ) : (
                                          <span className="font-black text-gray-900 text-xl leading-none">{s.moneda} {Number(s.precio_base).toFixed(0)} <span className="text-xs font-normal text-gray-500 ml-0.5">/ h</span></span>
                                       )}
                                    </div>
                                    <button
                                       onClick={(e) => { e.stopPropagation(); handleInteraction(() => setSelectedService(s)); }}
                                       className="px-5 py-2 bg-white border-2 border-[#0a66c2] text-[#0a66c2] rounded-full font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm"
                                    >
                                       Ver más
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* CARRUSEL DE SERVICIOS POR PROYECTO */}
                  {servicesProyecto.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-hidden relative">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="font-semibold text-xl">Servicios por Proyecto</h3>
                           <div className="flex gap-2">
                              <button onClick={() => scroll(scrollProyectoRef, 'left')} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
                              <button onClick={() => scroll(scrollProyectoRef, 'right')} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
                           </div>
                        </div>
                        <div ref={scrollProyectoRef} className="flex gap-4 overflow-x-auto snap-x scrollbar-hide">
                           {servicesProyecto.map((s, idx) => (
                              <div key={idx} className="min-w-[300px] md:min-w-[340px] snap-start border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all flex flex-col justify-between bg-white shadow-sm overflow-hidden group cursor-pointer" onClick={() => handleInteraction(() => setSelectedService(s))}>
                                 {/* Imagen superior */}
                                 {s.imagen ? (
                                    <div className="relative h-40 w-full overflow-hidden bg-gray-100 shrink-0">
                                       <img src={s.imagen} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                 ) : (
                                    <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600 w-full shrink-0"></div>
                                 )}

                                 <div className="p-5 space-y-4 flex-1 flex flex-col">
                                    {/* Titulo y descripcion */}
                                    <div>
                                       <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight">{s.titulo}</h4>
                                       <p className="text-xs text-gray-500 line-clamp-2 mt-1">{s.descripcion}</p>
                                    </div>

                                    {/* Tiempos */}
                                    {(s.tiempo_total || s.oferta_fin) && (
                                       <div className="flex flex-wrap gap-1.5 pt-1">
                                          {s.tiempo_total && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium flex items-center gap-1"><Timer className="w-3 h-3" /> {s.tiempo_total} {String(s.tiempo_total).includes('días') ? '' : 'días'}</span>}
                                          {s.oferta_fin && <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-md font-bold flex items-center gap-1"><Calendar className="w-3 h-3" /> Oferta hasta: {new Date(s.oferta_fin.replace(' ', 'T')).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>}
                                       </div>
                                    )}

                                    {/* Entregables reducidos */}
                                    {s.entregables && s.entregables.length > 0 && (
                                       <div className="pt-2 border-t border-gray-50">
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Entregables Clave</p>
                                          <div className="space-y-1.5">
                                             {s.entregables.slice(0, 2).map((ent: any, eIdx: number) => (
                                                <div key={eIdx} className="flex items-start gap-2 text-xs text-gray-600">
                                                   <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                                                   <span className="line-clamp-1">{ent.titulo}</span>
                                                </div>
                                             ))}
                                             {s.entregables.length > 2 && (
                                                <p className="text-[11px] text-purple-600 font-bold pl-5 pt-1">+{s.entregables.length - 2} items más...</p>
                                             )}
                                          </div>
                                       </div>
                                    )}
                                 </div>

                                 {/* Footer */}
                                 <div className="p-5 pt-4 mt-auto border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    <div className="flex flex-col">
                                       {s.precio_oferta && s.porcentaje_oferta > 0 ? (
                                          <>
                                             <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-[10px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded-sm">-{s.porcentaje_oferta}%</span>
                                                <span className="text-[10px] text-gray-400 line-through decoration-gray-400/50">{s.moneda} {Number(s.precio_base).toFixed(0)}</span>
                                             </div>
                                             <span className="font-black text-blue-700 text-xl leading-none">{s.moneda} {Number(s.precio_oferta).toFixed(0)}</span>
                                          </>
                                       ) : (
                                          <span className="font-black text-gray-900 text-xl leading-none">{s.moneda} {Number(s.precio_base).toFixed(0)}</span>
                                       )}
                                    </div>
                                    <button
                                       onClick={(e) => { e.stopPropagation(); handleInteraction(() => setSelectedService(s)); }}
                                       className="px-5 py-2 bg-[#0a66c2] text-white rounded-full font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                       Ver más
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* SKILLS */}
                  {skills && typeof skills === 'string' && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500" /> Conocimientos y aptitudes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                           {skills.split(',').map((skill, i) => (
                              <div key={i} className="py-3 border-b border-gray-100 flex items-center gap-2">
                                 <span className="font-bold text-sm text-gray-800">{skill.trim()}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

               </div>

               {/* --- COLUMNA DERECHA --- */}
               <div className="lg:col-span-4 space-y-4">

                  {visibleLinks.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="font-semibold text-md text-gray-900 mb-4">Presencia Digital</h4>
                        <div className="space-y-3">
                           {visibleLinks.map((link: any, idx: number) => (
                              <a
                                 key={idx}
                                 href={link.url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="flex items-center gap-3 text-sm text-blue-600 font-bold hover:underline group"
                              >
                                 <Globe className="w-4 h-4 text-sky-500 group-hover:text-blue-600" />
                                 <span className="truncate">{link.label || link.url}</span>
                                 <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* EXPERIENCIA (ESTILO LINKEDIN) */}
                  {(visibleExperience.length > 0 || visibleEmployment.length > 0) && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-xl mb-6">Experiencia</h3>
                        <div className="space-y-8">
                           {[...visibleExperience, ...visibleEmployment].map((exp: any, idx: number) => (
                              <div key={idx} className="flex gap-4 relative">
                                 <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center shrink-0 border border-blue-100">
                                    <Briefcase className="w-6 h-6 text-blue-500" />
                                 </div>
                                 <div className="space-y-1 pb-4 border-b border-gray-100 w-full">
                                    <h4 className="font-bold text-md">{exp.job_title || exp.position}</h4>
                                    <p className="text-sm text-gray-700">{exp.company_name}</p>
                                    <p className="text-xs text-gray-500">{exp.start_date} — {exp.end_date || 'Actualidad'}</p>
                                    <p className="text-xs text-gray-500">{exp.location}</p>
                                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{exp.description}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* EDUCACION */}
                  {visibleEducation.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h3 className="font-semibold text-xl mb-6">Educación</h3>
                        <div className="space-y-8">
                           {visibleEducation.map((edu: any, idx: number) => (
                              <div key={idx} className="flex gap-4">
                                 <div className="w-12 h-12 bg-purple-50 rounded flex items-center justify-center shrink-0 border border-purple-100">
                                    <BookOpen className="w-6 h-6 text-purple-500" />
                                 </div>
                                 <div className="space-y-1 pb-4 border-b border-gray-100 w-full">
                                    <h4 className="font-bold text-md">{edu.institution_name}</h4>
                                    <p className="text-sm text-gray-700">{edu.specialization}</p>
                                    <p className="text-xs text-gray-500">{edu.start_year} — {edu.end_year || 'Actualidad'}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {visibleLanguages.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="font-semibold text-md text-gray-900 mb-6 flex items-center gap-2"><Languages className="w-5 h-5 text-emerald-500" /> Idiomas</h4>
                        <div className="space-y-4">
                           {visibleLanguages.map((lang: any, idx: number) => (
                              <div key={idx} className="flex flex-col">
                                 <span className="font-bold text-sm text-gray-800">{lang.idioma}</span>
                                 <span className="text-xs text-gray-500">{lang.nivel}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {profile.herramientas?.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="font-semibold text-md text-gray-900 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-orange-500" /> Herramientas</h4>
                        <div className="flex flex-wrap gap-2">
                           {profile.herramientas.map((h: any, idx: number) => (
                              <span key={idx} className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1 border border-orange-100 rounded-full">{h.nombre}</span>
                           ))}
                        </div>
                     </div>
                  )}

                  {markets.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="font-semibold text-md text-gray-900 mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-cyan-500" /> Alcance Global</h4>
                        <div className="flex flex-wrap gap-2">
                           {markets.map((m: string, i: number) => (
                              <span key={i} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 capitalize">
                                 {m}
                              </span>
                           ))}
                        </div>
                     </div>
                  )}

                  {visibleHobbies.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="font-semibold text-md text-gray-900 mb-4 flex items-center gap-2">
                           <Heart className="w-4 h-4 text-red-500" /> Pasatiempos (Hobbies)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {visibleHobbies.map((h: any, idx: number) => (
                              <span key={idx} className="text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-full">{h.hobby_name}</span>
                           ))}
                        </div>
                     </div>
                  )}

                  {visibleInterests.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h4 className="font-semibold text-md text-gray-900 mb-4 flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-blue-500" /> Intereses
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {visibleInterests.map((i: any, idx: number) => (
                              <span key={idx} className="text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{i.interest_name}</span>
                           ))}
                        </div>
                     </div>
                  )}

               </div>
            </div>

            {/* BOTONES FLOTANTES (FAB) PARA MÓVIL/RÁPIDO */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 md:hidden">
               <button
                  onClick={() => setShowReviewsModal(true)}
                  className="p-4 bg-white text-gray-700 rounded-full shadow-2xl border border-gray-100 hover:scale-110 transition-transform flex items-center justify-center"
                  title="Ver reseñas"
               >
                  <Star className={`w-6 h-6 ${reviewsData.average > 0 ? 'fill-yellow-400 text-yellow-400' : ''}`} />
               </button>
               <button
                  onClick={() => handleInteraction(() => window.parent.postMessage({ type: 'OPEN_CHAT', userId: profile.user_id }, '*'))}
                  className="p-4 bg-[#0a66c2] text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
                  title="Enviar mensaje"
               >
                  <MessageCircle className="w-6 h-6" />
               </button>
            </div>

            {/* MODAL DE INFORMACIÓN DE CONTACTO ESTRATÉGICO */}
            {showContactPopup && (
               <div
                  className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                  onClick={() => setShowContactPopup(false)}
               >
                  <div
                     className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300"
                     onClick={(e) => e.stopPropagation()}
                  >
                     <div className="flex justify-between items-center p-4 border-b border-gray-100">
                        <h3 className="font-bold text-lg text-gray-900">{usuario_principal?.nombre} {usuario_principal?.apellido}</h3>
                        <button onClick={() => setShowContactPopup(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
                     </div>

                     <div className="p-6 space-y-6">
                        {/* RESUMEN DE DECISIÓN RÁPIDA */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Resumen Profesional</p>
                           <p className="text-sm font-bold text-blue-900">
                              {experience_years}+ Años de experiencia en {usuario_principal?.nombre_cargo || 'Especialidad'}
                           </p>
                           <p className="text-xs text-blue-700 mt-1">Disponible para: {availability || 'Proyectos Inmediatos'}</p>

                           {(() => {
                              const expLabs = [...(experiencia_laboral || [])];
                              const currentJobs = expLabs.filter(e => e.is_current || !e.end_date);
                              const pastJobs = expLabs.filter(e => !e.is_current && e.end_date);

                              const allCompanies = Array.from(new Set([
                                 ...currentJobs,
                                 ...(empleo || []),
                                 ...pastJobs,
                                 ...expLabs.reverse()
                              ].map((ex: any) => ex.company_name).filter(Boolean)));

                              if (allCompanies.length === 0) return null;
                              return (
                                 <p className="text-xs text-blue-800 mt-2 font-medium border-t border-blue-200/50 pt-2 flex flex-wrap items-center gap-1">
                                    <span className="font-bold">Trabajó con:</span>
                                    {showAllCompanies ? allCompanies.join(', ') : allCompanies.slice(0, 3).join(', ')}
                                    {allCompanies.length > 3 && !showAllCompanies && (
                                       <button onClick={() => setShowAllCompanies(true)} className="text-blue-600 font-bold hover:underline">
                                          +{allCompanies.length - 3} más
                                       </button>
                                    )}
                                 </p>
                              );
                           })()}
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Servicios Destacados</h4>
                           <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar-list">
                              {servicesHora.slice(0, 1).map((s, idx) => (
                                 <div key={`h-${idx}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                       <p className="text-sm font-semibold text-gray-900 line-clamp-1">{s.titulo}</p>
                                       <p className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Tarifa por Hora</p>
                                    </div>
                                    <span className="font-black text-blue-700 whitespace-nowrap ml-2">{s.moneda} {Number(s.precio_oferta || s.precio_base).toFixed(0)}<span className="text-[10px] font-normal text-gray-400">/h</span></span>
                                 </div>
                              ))}
                              {servicesProyecto.slice(0, 1).map((s, idx) => (
                                 <div key={`p-${idx}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                       <p className="text-sm font-semibold text-gray-900 line-clamp-1">{s.titulo}</p>
                                       <p className="text-[10px] font-bold text-purple-600 uppercase flex items-center gap-1"><Zap className="w-3 h-3" /> Proyecto Completo</p>
                                    </div>
                                    <span className="font-black text-blue-700 whitespace-nowrap ml-2">{s.moneda} {Number(s.precio_oferta || s.precio_base).toFixed(0)}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                        <button onClick={() => handleInteraction(() => window.parent.postMessage({ type: 'OPEN_CHAT', userId: profile.user_id }, '*'))} className="flex-1 py-3 bg-[#0a66c2] text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                           Enviar Mensaje
                        </button>
                        <button onClick={() => setShowContactPopup(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-full hover:bg-white transition-all">
                           Seguir viendo
                        </button>
                     </div>
                  </div>
               </div>
            )}



            {/* MODAL DE RESEÑAS */}
            {showReviewsModal && (
               <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowReviewsModal(false)}>
                  <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                     <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Star className="w-6 h-6 fill-current" /></div>
                           <div>
                              <h3 className="text-xl font-bold text-gray-900">Reseñas de Clientes</h3>
                              <p className="text-xs text-gray-500 font-medium">Promedio: {reviewsData.average} ★ ({reviewsData.total} reseñas)</p>
                           </div>
                        </div>
                        <button onClick={() => setShowReviewsModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {reviewsData.reviews.length > 0 ? (
                           reviewsData.reviews.map((r, idx) => (
                              <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 space-y-3">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <img src={r.reviewer_avatar || `https://ui-avatars.com/api/?name=${r.reviewer_name}&background=random`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                                       <div>
                                          <p className="text-sm font-bold text-gray-900">{r.reviewer_name}</p>
                                          <div className="flex text-yellow-400">
                                             {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-gray-200'}`} />
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">{new Date(r.created_at).toLocaleDateString()}</span>
                                 </div>
                                 <p className="text-sm text-gray-600 italic leading-relaxed">"{r.comment}"</p>
                              </div>
                           ))
                        ) : (
                           <div className="py-20 text-center space-y-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300"><Star className="w-8 h-8" /></div>
                              <p className="text-gray-500 font-medium">Aún no hay reseñas para este profesional.</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {/* GUARD DE REGISTRO */}
            {showRegisterGuard && (
               <div className="fixed inset-0 bg-[#0a66c2]/40 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in zoom-in duration-300">
                  <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl text-center space-y-6 border border-white/20">
                     <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto rotate-12">
                        <Rocket className="w-10 h-10 text-[#0a66c2] -rotate-12" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900">¡Únete a Hitpoly!</h3>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed">
                           Necesitas una cuenta para enviar mensajes, ver precios detallados e interactuar con los mejores profesionales.
                        </p>
                     </div>
                     <div className="flex flex-col gap-3">
                        <button
                           onClick={() => {
                              const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://hitpoly.com';
                              window.parent.location.href = `${baseUrl}/registro?redirect=${encodeURIComponent(window.parent.location.href)}`;
                           }}
                           className="w-full py-4 bg-[#0a66c2] text-white rounded-2xl font-black text-lg hover:bg-[#004182] hover:scale-[1.02] transition-all shadow-lg shadow-blue-200"
                        >
                           Registrarme ahora
                        </button>
                        <button
                           onClick={() => setShowRegisterGuard(false)}
                           className="text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors"
                        >
                           Quizás más tarde
                        </button>
                     </div>
                  </div>
               </div>
            )}
            {/* MODAL DE COMPARTIR PERFIL */}
            {showShareModal && (
               <div
                  className="fixed inset-0 z-[30000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                  onClick={() => setShowShareModal(false)}
               >
                  <div
                     className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20"
                     onClick={(e) => e.stopPropagation()}
                  >
                     <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
                              <Share2 className="w-6 h-6" />
                           </div>
                           <div>
                              <h3 className="font-black text-xl text-gray-900 tracking-tight">Compartir Perfil</h3>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enlace Profesional</p>
                           </div>
                        </div>
                        <button
                           onClick={() => setShowShareModal(false)}
                           className="p-2 hover:bg-gray-200 rounded-full transition-colors group"
                        >
                           <X className="w-6 h-6 text-gray-400 group-hover:scale-110 transition-transform" />
                        </button>
                     </div>

                     <div className="p-8 space-y-8">
                        <div className="space-y-3 text-center">
                           <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                              <Globe className="w-10 h-10 text-blue-600" />
                           </div>
                           <p className="text-gray-500 text-sm font-medium leading-relaxed">
                              Copia este enlace para compartir el perfil de <span className="text-gray-900 font-bold">{usuario_principal?.nombre}</span> con tu red o clientes.
                           </p>
                        </div>

                        <div className="relative group">
                           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Search className="h-4 w-4 text-gray-300" />
                           </div>
                           <input
                              type="text"
                              readOnly
                              value={`${window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://hitpoly.com'}/systems/bolsa?userId=${profile.user_id || profile.id}`}
                              className="block w-full pl-11 pr-20 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 focus:outline-none focus:border-blue-500 transition-all select-all truncate"
                           />
                           <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                              <button
                                 onClick={() => copyToClipboard(`${window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://hitpoly.com'}/systems/bolsa?userId=${profile.user_id || profile.id}`)}
                                 className={`p-2 rounded-xl transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-white text-blue-600 border border-gray-100 hover:bg-blue-50 shadow-sm'}`}
                              >
                                 {copySuccess ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                              </button>
                           </div>
                        </div>

                        {copySuccess && (
                           <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm animate-in slide-in-from-bottom-2">
                              <CheckCircle2 className="w-4 h-4" /> ¡Copiado con éxito!
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
