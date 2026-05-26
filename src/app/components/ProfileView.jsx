import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
   User, Users, MapPin, Briefcase, Calendar, Globe, Mail,
   MessageCircle, ArrowLeft, Star, Award, Sparkles,
   Linkedin, Github, Twitter, Facebook, ExternalLink,
   Clock, BookOpen, Languages, CheckCircle2, Heart, Plane, History, Flag,
   DollarSign, ListChecks, ChevronRight, ShoppingCart, Tag, TrendingDown, ChevronLeft,
   Timer, Rocket, Zap, ShieldCheck, Settings, Camera, MoreHorizontal, Share2, Pencil, Eye, Search, X, Phone, Copy, Info, EditIcon, Save, Loader2, Filter, Plus
} from 'lucide-react';
import axios from 'axios';
import { useSystem } from '../data/SystemContext';

export function ProfileView({ profile, onBack, isOwnProfile = false }) {
   const navigate = useNavigate();
   const location = useLocation();

   const { activeContext, setHeaderData, setMobileActions, cargarContextos } = useSystem();

   const [services, setServices] = useState([]);
   const [loadingServices, setLoadingServices] = useState(true);
   const [showContactPopup, setShowContactPopup] = useState(false);
   const [showReviewsModal, setShowReviewsModal] = useState(false);
   const [showRegisterGuard, setShowRegisterGuard] = useState(false);
   const [showShareMenu, setShowShareMenu] = useState(false);
   const [reviewsData, setReviewsData] = useState({ reviews: [], average: 0, total: 0 });
   const [showAllCompanies, setShowAllCompanies] = useState(false);
   const [showShareModal, setShowShareModal] = useState(false);
   const [isWritingReview, setIsWritingReview] = useState(false);
   const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
   const [submittingReview, setSubmittingReview] = useState(false);
   const [serviceFilter, setServiceFilter] = useState('all');
   const [showCreateDropdown, setShowCreateDropdown] = useState(false);
   const createDropdownRef = useRef(null);

   useEffect(() => {
      setMobileActions([]);
      return () => {
         setMobileActions([]);
      };
   }, [setMobileActions]);

   useEffect(() => {
      if (profile) {
         const fullName = `${profile.usuario_principal?.nombre || ''} ${profile.usuario_principal?.apellido || ''}`.trim();
         
         // BACKUP DE IDENTIDAD: Guardar nombre real para que el SystemContext lo use en el desplegable
         const uid = profile.user_id || profile.id;
         const currentUid = localStorage.getItem('bolsa_userId');

         if (fullName && !fullName.includes('Usuario #')) {
            const oldBackup = localStorage.getItem(`bolsa_name_backup_${uid}`);
            localStorage.setItem(`bolsa_name_backup_${uid}`, fullName);
            
            // Si el nombre es nuevo y es el del usuario logueado, refrescamos contextos para que el dropdown se cure
            if (oldBackup !== fullName && String(uid) === String(currentUid)) {
               cargarContextos();
            }
         }

         setHeaderData({
            title: fullName || 'Perfil Profesional',
            subtitle: profile.usuario_principal?.nombre_cargo || profile.especialidad || 'Profesional en Hitpoly',
            icon: 'users',
            color: '#0a66c2'
         });
         window.bolsaBackHandler = null;
      }

      return () => {
         setHeaderData({
            title: 'Bolsa de Empleo',
            subtitle: 'Oportunidades y talento profesional',
            icon: 'briefcase',
            color: '#0a66c2'
         });
         window.bolsaBackHandler = null;
      };
   }, [profile, cargarContextos]);

   const [copySuccess, setCopySuccess] = useState(false);

   const scrollHoraRef = useRef(null);
   const scrollProyectoRef = useRef(null);
   const scrollMensualRef = useRef(null);
   const shareRef = useRef(null);

   const {
      usuario_principal, sobre_mi, social_links, links, skills,
      experience_years, availability, experiencia_laboral,
      educacion, idiomas_lista, perfil_general, empleo, viajes, hobbies, intereses,
      international_markets, total_amigos
   } = profile;

   // Parsear skills si vienen como JSON string
   const parsedSkills = React.useMemo(() => {
      if (!skills) return [];
      try {
         const parsed = typeof skills === 'string' ? JSON.parse(skills) : skills;
         return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
         // Fallback por si no es JSON válido pero es una lista separada por comas
         return typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : [skills];
      }
   }, [skills]);

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

      const handleClickOutside = (e) => {
         if (shareRef.current && !shareRef.current.contains(e.target)) {
            setShowShareMenu(false);
         }
         if (createDropdownRef.current && !createDropdownRef.current.contains(e.target)) {
            setShowCreateDropdown(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);

      // Auto-open reviews modal if action=review in URL
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'review') {
         setTimeout(() => setShowReviewsModal(true), 300);
      }

      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [profile.user_id]);

   const cargarReseñas = async () => {
      try {
         const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/reviewController.php', {
            accion: 'getReviews',
            professional_id: profile.user_id || profile.id
         });

         if (res.data.success) {
            setReviewsData(res.data.data);
         }
      } catch (e) { }
   };

   const cargarServicios = async () => {
      setLoadingServices(true);
      try {
         const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php', {
            accion: 'getServices',
            user_id: profile.user_id || profile.id
         });
         if (res.data.success) {
             const rawData = res.data.data;
             const servicesArray = Array.isArray(rawData) 
                ? rawData 
                : (rawData && typeof rawData === 'object' ? Object.values(rawData) : []);
             setServices(servicesArray);
          }
      } catch (e) { } finally { setLoadingServices(false); }
   };

   const handleInteraction = (callback) => {
      if (!activeContext) {
         setShowRegisterGuard(true);
      } else {
         callback();
      }
   };

   const handleSaveReview = async () => {
      if (!newReview.comment.trim()) {
         alert("Por favor escribe un comentario");
         return;
      }
      
      const isEnterprise = activeContext?.type === 'enterprise';
      const rName = isEnterprise ? (activeContext?.nombre || activeContext?.company_name) : (activeContext?.name || activeContext?.nombre || 'Usuario');
      const rAvatar = isEnterprise 
         ? (activeContext?.logo_url || activeContext?.logo || activeContext?.foto) 
         : (activeContext?.custom_avatar || activeContext?.avatar || activeContext?.foto || usuario_principal?.foto || '');

      const payload = {
         accion: 'saveReview',
         professional_id: profile.user_id || profile.id,
         reviewer_id: activeContext?.user_id || activeContext?.id,
         reviewer_type: activeContext?.type || 'professional',
         reviewer_name: rName,
         reviewer_avatar: rAvatar,
         // Campos extra para redundancia
         tipo: activeContext?.type,
         nombre_capturado: rName,
         avatar_capturado: rAvatar,
         rating: newReview.rating,
         comment: newReview.comment
      };
      
      setSubmittingReview(true);
      try {
         const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/reviewController.php', payload);
         
         if (res.data.success) {
            setIsWritingReview(false);
            setNewReview({ rating: 5, comment: '' });
            cargarReseñas();
         } else {
            alert(res.data.error || "Error al guardar la reseña");
         }
      } catch (e) {
         alert("Error de conexión al guardar la reseña");
      } finally {
         setSubmittingReview(false);
      }
   };

   const handleShare = async () => {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isLocal ? 'http://localhost:3000' : 'https://hitpoly.com';
      const hitpolyUrl = `${baseUrl}/systems/bolsa?userId=${profile.user_id || profile.id}`;

      setShowShareModal(true);
      setShowShareMenu(false);

      try {
         if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(hitpolyUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
         } else {
            throw new Error("Clipboard API not available");
         }
      } catch (err) {
         window.parent.postMessage({ type: 'COPY_TEXT', text: hitpolyUrl }, '*');
         setCopySuccess(true);
         setTimeout(() => setCopySuccess(false), 2000);
      }
   };

   const copyToClipboard = async (text) => {
      try {
         if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
         } else {
            throw new Error("Clipboard API block or not available");
         }
      } catch (err) {
         window.parent.postMessage({ type: 'COPY_TEXT', text: text }, '*');
         setCopySuccess(true);
         setTimeout(() => setCopySuccess(false), 2000);

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

    const servicesFiltered = services.filter(s => {
       if (serviceFilter === 'all') return true;
       return s.tipo === serviceFilter;
    });

    const servicesHora = servicesFiltered.filter(s => s.tipo === 'hora');
    const servicesProyecto = servicesFiltered.filter(s => s.tipo === 'proyecto');
    const servicesMensual = servicesFiltered.filter(s => s.tipo === 'mensual');

    const scroll = (ref, direction) => {
       if (ref.current) {
          const scrollAmount = 340;
          ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
       }
    };

   const avatar = usuario_principal?.foto || usuario_principal?.avatar || `https://ui-avatars.com/api/?name=${usuario_principal?.nombre || 'User'}&background=random`;
   const banner = perfil_general?.cover_photo || "https://static.licdn.com/aero-v1/networks/sc/h/56v39626e2mxy74o0o3299o15";

   const getUserId = () => {
      return profile.user_id || profile.id;
   };

   const visibleExperience = experiencia_laboral?.filter((ex) => showcaseConfig.experience_ids?.includes(String(ex.id)) || showcaseConfig.experience_ids?.includes(Number(ex.id))) || [];
   const visibleEmployment = empleo?.filter((em) => showcaseConfig.employment_ids?.includes(String(em.id)) || showcaseConfig.employment_ids?.includes(Number(em.id))) || [];
   const visibleEducation = educacion?.filter((ed) => showcaseConfig.education_ids?.includes(String(ed.id)) || showcaseConfig.education_ids?.includes(Number(ed.id))) || [];
   const visibleLanguages = idiomas_lista?.filter((idm) => showcaseConfig.languages_ids?.includes(String(idm.id)) || showcaseConfig.languages_ids?.includes(Number(idm.id))) || [];
   const visibleLinks = links?.filter((sl) => showcaseConfig.links_ids?.includes(String(sl.id)) || showcaseConfig.links_ids?.includes(Number(sl.id))) || [];
   const visibleHobbies = hobbies?.filter((h) => showcaseConfig.hobbies_ids?.includes(String(h.id)) || showcaseConfig.hobbies_ids?.includes(Number(h.id))) || [];
   const visibleInterests = intereses?.filter((i) => showcaseConfig.interests_ids?.includes(String(i.id)) || showcaseConfig.interests_ids?.includes(Number(i.id))) || [];
   const visibleTravel = viajes?.filter((v) => showcaseConfig.travel_ids?.includes(String(v.id)) || showcaseConfig.travel_ids?.includes(Number(v.id))) || [];

   const rawMarkets = profile.international_markets || profile.bolsa_data?.international_markets || profile.perfil_general?.international_markets || "";
   const markets = typeof rawMarkets === 'string' ? JSON.parse(rawMarkets || "[]") : (Array.isArray(rawMarkets) ? rawMarkets : []);

   return (
      <div className="font-sans text-gray-900 bg-[#f0f2f5] min-h-screen pb-20">
         <style>{`
            .custom-scrollbar::-webkit-scrollbar {
               height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
               background: #f1f1f1;
               border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
               background: transparent;
               border-radius: 10px;
               transition: background 0.3s;
            }
            .custom-scrollbar:hover::-webkit-scrollbar-thumb {
               background: #0a66c2;
            }
            @media (max-width: 768px) {
               .custom-scrollbar::-webkit-scrollbar {
                  display: none;
               }
            }
         `}</style>          <div className="bg-white shadow-xl border-b border-gray-100">
             <div className="max-w-5xl mx-auto relative">
                {/* Banner - Sin border radius en la base */}
                <div className="relative w-full aspect-[2.5/1] md:aspect-[3/1] bg-gray-100 overflow-hidden shadow-lg group">
                   <img 
                    src={banner} 
                    alt="Banner" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                   {isOwnProfile && (
                      <button 
                        onClick={() => navigate('/editar-perfil')}
                        className="absolute bottom-6 right-6 px-4 py-2 bg-white/30 backdrop-blur-md border border-white/40 text-white rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 hover:bg-white hover:text-gray-900 transition-all"
                      >
                         <Camera className="w-4 h-4" /> Editar portada
                      </button>
                   )}
                </div>

                <div className="px-6 md:px-12 pb-10">
                   {/* Info section - Margen negativo reducido significativamente para dar más aire */}
                   <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-8 md:-mt-10 mb-6 gap-6">
                      <div className="relative">
                         <div className="p-1.5 bg-white rounded-full shadow-2xl ring-4 ring-white/50">
                            <img 
                                src={avatar} 
                                alt={usuario_principal?.nombre} 
                                className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white shadow-inner" 
                            />
                         </div>
                          {isOwnProfile && (
                             <button
                               onClick={() => navigate('/editar-perfil')}
                               className="absolute bottom-3 right-3 p-3 bg-blue-600 text-white rounded-full border-4 border-white shadow-xl hover:bg-blue-700 hover:scale-110 transition-all z-10"
                               title="Editar perfil profesional"
                             >
                               <Pencil className="w-5 h-5" />
                             </button>
                          )}
                      </div>

                      <div className="flex-1 text-center md:text-left pb-2">
                         <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight drop-shadow-sm">
                               {usuario_principal?.nombre} {usuario_principal?.apellido}
                            </h1>
                            {usuario_principal?.genero && (
                               <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-full uppercase tracking-widest md:mt-2">
                                  {usuario_principal.genero}
                               </span>
                            )}
                         </div>
                         <p className="text-blue-600 font-black text-xl md:text-2xl mt-1 tracking-tight">
                            {usuario_principal?.nombre_cargo || 'Profesional Élite'}
                         </p>
                         <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                               <Users className="w-4 h-4 text-blue-500" />
                               <span className="font-bold text-gray-700">{total_amigos || 0} amigos</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                               <MapPin className="w-4 h-4 text-red-500" />
                               <span className="font-bold text-gray-700 uppercase tracking-tight">
                                  {profile.datos_personales?.city || 'Ciudad'}, {profile.datos_personales?.country || 'País'}
                               </span>
                            </div>
                         </div>
                      </div>

                      <div className="flex gap-3 pb-2">
                           <button
                              onClick={() => handleInteraction(() => {
                                 window.parent.postMessage({ 
                                    type: 'OPEN_FLOATING_CHAT', 
                                    myId: activeContext?.id,
                                    partner: {
                                       id: profile.id,
                                       name: `${profile.usuario_principal?.nombre || 'Usuario'} ${profile.usuario_principal?.apellido || ''}`.trim(),
                                       avatar: profile.usuario_principal?.foto || profile.usuario_principal?.avatar || `https://ui-avatars.com/api/?name=${profile.usuario_principal?.nombre}`,
                                       type: 'professional'
                                    }
                                 }, '*');
                              })}
                              className="px-6 py-3 bg-[#0a66c2] text-white rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-200 group"
                           >
                            <MessageCircle className="w-5 h-5 group-hover:animate-bounce" /> Mensaje
                         </button>
                         <button
                            onClick={() => handleInteraction(() => setShowReviewsModal(true))}
                            className="p-3 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md"
                         >
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                         </button>
                         <div className="relative" ref={shareRef}>
                            <button
                               onClick={() => setShowShareMenu(!showShareMenu)}
                               className="p-3 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black hover:bg-gray-50 transition-all shadow-md"
                            >
                               <MoreHorizontal className="w-5 h-5" />
                            </button>
                            {showShareMenu && (
                               <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] p-3 animate-in fade-in slide-in-from-top-2">
                                  <button onClick={handleShare} className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-blue-50 hover:text-blue-600 rounded-xl flex items-center gap-3 transition-colors">
                                     <Share2 className="w-4 h-4" /> Compartir perfil
                                  </button>
                                  <button onClick={() => setShowContactPopup(true)} className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-green-50 hover:text-green-600 rounded-xl flex items-center gap-3 transition-colors">
                                     <Phone className="w-4 h-4" /> Información de contacto
                                  </button>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="max-w-5xl mx-auto px-5 mt-4">

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mt-6">
                <div className="lg:col-span-8 space-y-4">
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

                  {/* Sección Acerca de / Escaparate */}
                  {(showcaseConfig.sobre_mi_ids?.includes('about_text') || showcaseConfig.sobre_mi_ids?.includes('favorite_quotes')) && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm overflow-hidden relative group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" /> Acerca de
                      </h3>
                      <div className="space-y-6">
                        {showcaseConfig.sobre_mi_ids?.includes('about_text') && sobre_mi?.about_text && (
                          <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line font-medium italic">
                            "{sobre_mi.about_text}"
                          </p>
                        )}
                        {showcaseConfig.sobre_mi_ids?.includes('favorite_quotes') && sobre_mi?.favorite_quotes && (
                          <div className="mt-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 relative">
                            <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-blue-200 animate-pulse" />
                            <p className="text-blue-900 font-bold italic text-lg text-center">
                              "{sobre_mi.favorite_quotes}"
                            </p>
                            <p className="text-blue-400 text-[10px] uppercase font-black tracking-[0.2em] mt-4 text-center">Cita Favorita</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 text-gray-900">Perfil Profesional</h3>
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

                  {servicesHora.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-hidden relative">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="font-semibold text-xl">Servicios por Hora</h3>
                           <div className="flex gap-2">
                              <button onClick={() => scroll(scrollHoraRef, 'left')} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
                              <button onClick={() => scroll(scrollHoraRef, 'right')} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
                           </div>
                        </div>
                        <div ref={scrollHoraRef} className="flex gap-4 overflow-x-auto snap-x custom-scrollbar pb-4">
                           {servicesHora.map((s, idx) => (
                              <div key={idx} className="w-[320px] min-w-[320px] max-w-[320px] snap-start border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all flex flex-col justify-between bg-white shadow-sm overflow-hidden group cursor-pointer" onClick={() => handleInteraction(() => navigate('/servicio/' + s.id, { state: { service: s, profile } }))}>
                                 {s.imagen ? (
                                    <div className="relative h-40 w-full overflow-hidden bg-gray-100 shrink-0">
                                       <img src={s.imagen} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                 ) : (
                                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 w-full shrink-0"></div>
                                 )}

                                 <div className="p-5 space-y-4 flex-1 flex flex-col">
                                    <div>
                                       <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight">{s.titulo}</h4>
                                       <p className="text-xs text-gray-500 line-clamp-2 mt-1">{s.descripcion}</p>
                                    </div>

                                    {s.entregables && s.entregables.length > 0 && (
                                       <div className="pt-2">
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">¿Qué incluye?</p>
                                          <div className="space-y-1.5">
                                             {s.entregables.slice(0, 2).map((ent, eIdx) => (
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
                                       onClick={(e) => { e.stopPropagation(); handleInteraction(() => navigate('/servicio/' + s.id, { state: { service: s, profile } })); }}
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

                  {servicesProyecto.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-hidden relative">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="font-semibold text-xl">Servicios por Proyecto</h3>
                           <div className="flex gap-2">
                              <button onClick={() => scroll(scrollProyectoRef, 'left')} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
                              <button onClick={() => scroll(scrollProyectoRef, 'right')} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
                           </div>
                        </div>
                        <div ref={scrollProyectoRef} className="flex gap-4 overflow-x-auto snap-x custom-scrollbar pb-4">
                           {servicesProyecto.map((s, idx) => (
                              <div key={idx} className="w-[320px] min-w-[320px] max-w-[320px] snap-start border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all flex flex-col justify-between bg-white shadow-sm overflow-hidden group cursor-pointer" onClick={() => handleInteraction(() => navigate('/servicio/' + s.id, { state: { service: s, profile } }))}>
                                 {s.imagen ? (
                                    <div className="relative h-40 w-full overflow-hidden bg-gray-100 shrink-0">
                                       <img src={s.imagen} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                 ) : (
                                    <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600 w-full shrink-0"></div>
                                 )}

                                 <div className="p-5 space-y-4 flex-1 flex flex-col">
                                    <div>
                                       <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight">{s.titulo}</h4>
                                       <p className="text-xs text-gray-500 line-clamp-2 mt-1">{s.descripcion}</p>
                                    </div>

                                    {(s.tiempo_total || s.oferta_fin) && (
                                       <div className="flex flex-wrap gap-1.5 pt-1">
                                          {s.tiempo_total && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium flex items-center gap-1"><Timer className="w-3 h-3" /> {s.tiempo_total} {String(s.tiempo_total).includes('días') ? '' : 'días'}</span>}
                                          {s.oferta_fin && <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-md font-bold flex items-center gap-1"><Calendar className="w-3 h-3" /> Oferta hasta: {new Date(s.oferta_fin.replace(' ', 'T')).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>}
                                       </div>
                                    )}

                                    {s.entregables && s.entregables.length > 0 && (
                                       <div className="pt-2 border-t border-gray-50">
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Entregables Clave</p>
                                          <div className="space-y-1.5">
                                             {s.entregables.slice(0, 2).map((ent, eIdx) => (
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
                                       onClick={(e) => { e.stopPropagation(); handleInteraction(() => navigate('/servicio/' + s.id, { state: { service: s, profile } })); }}
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

                  {servicesMensual.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-hidden relative">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="font-semibold text-xl flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-indigo-600" /> Servicios Mensuales / Empleo
                           </h3>
                           <div className="flex gap-2">
                              <button onClick={() => scroll(scrollMensualRef, 'left')} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
                              <button onClick={() => scroll(scrollMensualRef, 'right')} className="p-1.5 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
                           </div>
                        </div>
                        <div ref={scrollMensualRef} className="flex gap-4 overflow-x-auto snap-x custom-scrollbar pb-4">
                           {servicesMensual.map((s, idx) => (
                              <div key={idx} className="w-[320px] min-w-[320px] max-w-[320px] snap-start border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all flex flex-col justify-between bg-white shadow-sm overflow-hidden group cursor-pointer" onClick={() => handleInteraction(() => navigate('/servicio/' + s.id, { state: { service: s, profile } }))}>
                                 {s.imagen ? (
                                    <div className="relative h-40 w-full overflow-hidden bg-gray-100 shrink-0">
                                       <img src={s.imagen} alt={s.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                       <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">SALARIO MENSUAL</div>
                                    </div>
                                 ) : (
                                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-blue-600 w-full shrink-0"></div>
                                 )}

                                 <div className="p-5 space-y-4 flex-1 flex flex-col">
                                    <div>
                                       <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight">{s.titulo}</h4>
                                       <p className="text-xs text-gray-500 line-clamp-2 mt-1">{s.descripcion}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                       <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> {s.disponibilidad_horas || '40'}h / semana
                                       </span>
                                       <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                                          <MapPin className="w-3 h-3" /> {s.modalidad || 'Remoto'}
                                       </span>
                                    </div>
                                 </div>

                                 <div className="p-5 pt-4 mt-auto border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    <div className="flex flex-col">
                                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-0.5">Sueldo Mensual</span>
                                       <span className="font-black text-gray-900 text-xl leading-none">{s.moneda} {Number(s.precio_base).toLocaleString()}</span>
                                    </div>
                                    <button
                                       onClick={(e) => { e.stopPropagation(); handleInteraction(() => navigate('/servicio/' + s.id, { state: { service: s, profile } })); }}
                                       className="px-5 py-2 bg-indigo-600 text-white rounded-full font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                       Ver detalles
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {parsedSkills && parsedSkills.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                           <Award className="w-4 h-4 text-yellow-500" /> Conocimientos y aptitudes
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-4">
                           {parsedSkills.map((skill, i) => (
                              <div key={i} className="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2 group hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
                                 <CheckCircle2 className="w-4 h-4 text-blue-500 opacity-50 group-hover:opacity-100" />
                                 <span className="font-bold text-gray-800">{skill.nombre || skill}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

               </div>

                <div className="lg:col-span-4 space-y-4">
                  {visibleLinks.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h4 className="font-bold text-md text-gray-900 mb-4">Presencia Digital</h4>
                        <div className="space-y-3">
                           {visibleLinks.map((link, idx) => (
                              <a
                                 key={idx}
                                 href={link.url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all group"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:text-blue-600 transition-colors">
                                       <Globe className="w-4 h-4 text-sky-500" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 truncate max-w-[140px]">{link.label || link.url}</span>
                                 </div>
                                 <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                              </a>
                           ))}
                        </div>
                     </div>
                  )}

                  {(visibleExperience.length > 0 || visibleEmployment.length > 0) && (
                     <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                           <Briefcase className="w-4 h-4 text-blue-600" /> Experiencia Profesional
                        </h3>
                        <div className="space-y-10 relative before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                           {[...visibleExperience, ...visibleEmployment].map((exp, idx) => (
                              <div key={idx} className="flex gap-6 relative group">
                                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border-2 border-gray-100 shadow-sm z-10 group-hover:border-blue-500 transition-colors">
                                    <Briefcase className="w-6 h-6 text-blue-500" />
                                 </div>
                                 <div className="space-y-1 w-full pb-6 border-b border-gray-50 last:border-0">
                                    <h4 className="font-black text-lg text-gray-900 leading-none">{exp.job_title || exp.position}</h4>
                                    <p className="text-blue-600 font-bold text-sm">{exp.company_name}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                       <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exp.start_date} — {exp.end_date || 'Actualidad'}</span>
                                       <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.location}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-4 leading-relaxed whitespace-pre-line">{exp.description}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {visibleEducation.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                           <BookOpen className="w-4 h-4 text-purple-600" /> Formación Académica
                        </h3>
                        <div className="space-y-10 relative before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                           {visibleEducation.map((edu, idx) => (
                              <div key={idx} className="flex gap-6 relative group">
                                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border-2 border-gray-100 shadow-sm z-10 group-hover:border-purple-500 transition-colors">
                                    <BookOpen className="w-6 h-6 text-purple-500" />
                                 </div>
                                 <div className="space-y-1 w-full pb-6 border-b border-gray-50 last:border-0">
                                    <h4 className="font-black text-lg text-gray-900 leading-none">{edu.institution_name}</h4>
                                    <p className="text-purple-600 font-bold text-sm">{edu.specialization}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                       <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {edu.start_year} — {edu.end_year || 'Actualidad'}</span>
                                    </div>
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
                           {visibleLanguages.map((lang, idx) => (
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
                           {profile.herramientas.map((h, idx) => (
                              <span key={idx} className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1 border border-orange-100 rounded-full">{h.nombre}</span>
                           ))}
                        </div>
                     </div>
                  )}

                  {markets && markets.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h4 className="font-bold text-md text-gray-900 mb-4 flex items-center gap-2">
                           <Globe className="w-5 h-5 text-cyan-500" /> Alcance Global
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {markets.map((m, i) => (
                              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-xl text-xs font-black uppercase tracking-tight">
                                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                                 {m}
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {visibleTravel.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h4 className="font-bold text-md text-gray-900 mb-4 flex items-center gap-2">
                           <Plane className="w-5 h-5 text-blue-500" /> Destinos y Viajes
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                           {visibleTravel.map((v, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                 <MapPin className="w-3.5 h-3.5 text-red-400" />
                                 <span className="text-xs font-bold text-gray-700">{v.location_name}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {visibleHobbies.length > 0 && (
                     <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h4 className="font-bold text-md text-gray-900 mb-4 flex items-center gap-2">
                           <Heart className="w-4 h-4 text-red-500" /> Pasatiempos (Hobbies)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {visibleHobbies.map((h, idx) => (
                              <span key={idx} className="text-xs font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-xl border border-gray-100">{h.hobby_name}</span>
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
                           {visibleInterests.map((i, idx) => (
                              <span key={idx} className="text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{i.interest_name}</span>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 md:hidden">
               <button
                  onClick={() => setShowReviewsModal(true)}
                  className="p-4 bg-white text-gray-700 rounded-full shadow-2xl border border-gray-100 hover:scale-110 transition-transform flex items-center justify-center"
                  title="Ver reseñas"
               >
                  <Star className={`w-6 h-6 ${reviewsData.average > 0 ? 'fill-yellow-400 text-yellow-400' : ''}`} />
               </button>
               <button
                  onClick={() => handleInteraction(() => {
                     window.parent.postMessage({ 
                        type: 'OPEN_FLOATING_CHAT', 
                        myId: activeContext?.id,
                        partner: {
                           id: profile.id,
                           name: `${profile.usuario_principal?.nombre || 'Usuario'} ${profile.usuario_principal?.apellido || ''}`.trim(),
                           avatar: profile.usuario_principal?.foto || profile.usuario_principal?.avatar || `https://ui-avatars.com/api/?name=${profile.usuario_principal?.nombre}`,
                           type: 'professional'
                        }
                     }, '*');
                  })}
                  className="p-4 bg-[#0a66c2] text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
                  title="Enviar mensaje"
               >
                  <MessageCircle className="w-6 h-6" />
               </button>
            </div>

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
                              ].map((ex) => ex.company_name).filter(Boolean)));

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
                        <button 
                           onClick={() => handleInteraction(() => {
                              window.parent.postMessage({ 
                                 type: 'OPEN_FLOATING_CHAT', 
                                 myId: activeContext?.id,
                                 partner: {
                                    id: profile.id,
                                    name: `${profile.usuario_principal?.nombre || 'Usuario'} ${profile.usuario_principal?.apellido || ''}`.trim(),
                                    avatar: profile.usuario_principal?.foto || profile.usuario_principal?.avatar || `https://ui-avatars.com/api/?name=${profile.usuario_principal?.nombre}`,
                                    type: 'professional'
                                 }
                              }, '*');
                           })}
                           className="flex-1 py-3 bg-[#0a66c2] text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                        >
                           Enviar Mensaje
                        </button>
                        <button onClick={() => setShowContactPopup(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-full hover:bg-white transition-all">
                           Seguir viendo
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {showReviewsModal && (
               <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowReviewsModal(false)}>
                  <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] md:max-h-[80vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                     <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Star className="w-6 h-6 fill-current" /></div>
                           <div>
                              <h3 className="text-xl font-bold text-gray-900">Reseñas de Clientes</h3>
                              <p className="text-xs text-gray-500 font-medium">Promedio: {reviewsData.average} ★ ({reviewsData.total} reseñas)</p>
                           </div>
                        </div>
                        <button onClick={() => { setShowReviewsModal(false); setIsWritingReview(false); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar custom-scrollbar-subtle">
                        {isWritingReview ? (
                           <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                              <div className="text-center space-y-2">
                                 <h4 className="font-bold text-gray-900">Tu opinión es importante</h4>
                                 <p className="text-sm text-gray-500">¿Cómo fue tu experiencia trabajando con {usuario_principal?.nombre}?</p>
                              </div>

                              <div className="flex justify-center gap-2">
                                 {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                       key={star}
                                       onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                       className="p-1 transition-transform hover:scale-125"
                                    >
                                       <Star className={`w-10 h-10 ${star <= newReview.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                    </button>
                                 ))}
                              </div>

                              <div className="space-y-2">
                                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Comentario</label>
                                 <textarea
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                    placeholder="Cuéntanos más sobre el servicio, profesionalismo y resultados..."
                                    className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none text-sm transition-all"
                                 />
                              </div>

                              <div className="flex gap-3">
                                 <button
                                    onClick={() => setIsWritingReview(false)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-white transition-all"
                                 >
                                    Cancelar
                                 </button>
                                 <button
                                    onClick={handleSaveReview}
                                    disabled={submittingReview || !newReview.comment.trim()}
                                    className="flex-[2] py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                 >
                                    {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Publicar Reseña
                                 </button>
                              </div>
                           </div>
                        ) : reviewsData.reviews.length > 0 ? (
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
                              {true && (
                                 <button 
                                    onClick={() => handleInteraction(() => setIsWritingReview(true))}
                                    className="px-6 py-3 bg-white border-2 border-yellow-500 text-yellow-600 font-bold rounded-xl hover:bg-yellow-50 transition-all flex items-center gap-2 mx-auto"
                                 >
                                    <Pencil className="w-5 h-5" /> Sé el primero en dejar una reseña
                                 </button>
                              )}
                           </div>
                        )}
                     </div>

                     {!isWritingReview && reviewsData.reviews.length > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-center">
                           <button 
                              onClick={() => handleInteraction(() => setIsWritingReview(true))}
                              className="w-full max-w-xs py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-100"
                           >
                              <Pencil className="w-5 h-5" /> Dejar reseña
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            )}

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
                              // Intentamos avisar al padre (Holding) para que gestione la navegación
                              // Esto evita problemas de puertos (5173 vs 3000)
                              window.parent.postMessage({ type: 'NAVIGATE', path: '/register' }, '*');
                              
                              // Como fallback por si el padre no responde o no hay iframe
                              const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
                              window.location.href = `${baseUrl}/register`;
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
