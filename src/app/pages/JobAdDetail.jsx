import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, MapPin, DollarSign, Clock, Calendar, 
  Briefcase, Bookmark, Share2, Rocket, Building2, Target, CheckCircle2, Eye, X
} from 'lucide-react';
import axios from 'axios';
import { useSystem } from '../data/SystemContext';

const API_BOLSA = 'https://apibolsaprofesionales.hitpoly.com/ajax/anuncios.php';

export function JobAdDetail() {
  const { adId } = useParams();
  const navigate = useNavigate();
  const { user } = useSystem(); // Obtener el usuario actual
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [postulado, setPostulado] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // Handler para el botón de atrás del menú de navegación
  useEffect(() => {
    window.bolsaBackHandler = () => {
      if (window.history.length > 1) navigate(-1);
      else navigate('/');
    };
    return () => { window.bolsaBackHandler = null; };
  }, [navigate]);

  useEffect(() => {
    const cacheKey = `job_ad_detail_${adId}`;
    const sessionViewKey = `job_ad_viewed_${adId}`;
    
    const fetchAd = async () => {
      // 1. Cargar desde caché para respuesta instantánea
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setAd(cachedData);
          setLoading(false);
        } catch (e) { 
          localStorage.removeItem(cacheKey); 
        }
      }

      // Determinar si debemos incrementar las vistas (solo una vez por sesión del navegador)
      const yaRegistradoEnSesion = sessionStorage.getItem(sessionViewKey) === 'true';
      const incrementar = !yaRegistradoEnSesion;
      
      if (incrementar) {
        sessionStorage.setItem(sessionViewKey, 'true');
      }

      try {
        const response = await axios.post(API_BOLSA, {
          accion: 'getAnuncioById',
          id: adId,
          incrementar: incrementar
        });
        
        if (response.data.success) {
          const freshData = response.data.data;
          const freshStr = JSON.stringify(freshData);
          
          // 2. Solo actualizar estado y caché si los datos cambiaron o no había caché
          if (freshStr !== cached) {
            setAd(freshData);
            localStorage.setItem(cacheKey, freshStr);
          }
        }
      } catch (e) {
        // Silencioso
      } finally {
        setLoading(false);
      }
    };
    if (adId) fetchAd();
  }, [adId]);

  // Verificar si ya estaba guardado al cargar
  useEffect(() => {
    const checkSaved = async () => {
      const currentUserId = localStorage.getItem('bolsa_userId') || sessionStorage.getItem('bolsa_last_userId');
      if (currentUserId && currentUserId !== '0' && currentUserId !== 'null') {
        try {
          const res = await axios.post(API_BOLSA, {
            accion: 'checkGuardado',
            user_id: currentUserId,
            anuncio_id: adId
          });
          if (res.data.success) {
            setSaved(res.data.guardado);
          }
        } catch (e) {
          console.error("Error al verificar guardado:", e);
        }
      }
    };
    if (adId) checkSaved();
  }, [adId]);

  // Verificar si ya está postulado al cargar
  useEffect(() => {
    const checkPostulado = async () => {
      const currentUserId = localStorage.getItem('bolsa_userId') || sessionStorage.getItem('bolsa_last_userId');
      if (currentUserId && currentUserId !== '0' && currentUserId !== 'null') {
        try {
          const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/postulaciones.php', {
            accion: 'checkPostulado',
            user_id: currentUserId,
            anuncio_id: adId
          });
          if (res.data.success) {
            setPostulado(res.data.postulado);
          }
        } catch (e) {
          console.error("Error al verificar postulación:", e);
        }
      }
    };
    if (adId) checkPostulado();
  }, [adId]);

  // Lógica de validación de usuario registrado
  const handleProtectedAction = (actionCallback) => {
    const currentUserId = localStorage.getItem('bolsa_userId') || sessionStorage.getItem('bolsa_last_userId');
    
    if (!currentUserId || currentUserId === '0' || currentUserId === 'null') {
      alert("Debes estar registrado para realizar esta acción. Redirigiendo...");
      window.location.href = "https://hitpoly.com/";
      return;
    }
    actionCallback(currentUserId);
  };

  const handleCompartir = () => {
    // Generar la URL de producción independientemente de localhost o el iframe
    const url = `https://hitpoly.com/systems/bolsa/anuncio/${adId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGuardar = () => {
    handleProtectedAction(async (uid) => {
      // Toggle en el UI de inmediato (optimistic update)
      setSaved(!saved);
      try {
        const response = await axios.post(API_BOLSA, {
          accion: 'toggleGuardar',
          user_id: uid,
          anuncio_id: ad.id
        });
        if (!response.data.success) {
          // Si falló en la BD, revertir
          setSaved(saved);
          console.error(response.data.error);
        }
      } catch (e) {
        setSaved(saved);
        console.error("Error de red al guardar");
      }
    });
  };

  const handlePostular = () => {
    handleProtectedAction((uid) => {
      navigate(`/postularme/${ad.id}${window.location.search}`);
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Anuncio no encontrado</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#0a66c2] text-white rounded-xl font-bold">Ir al Marketplace</button>
      </div>
    );
  }

  // Format arrays safely
  const requisitos = Array.isArray(ad.requisitos) ? ad.requisitos : [];
  const responsabilidades = Array.isArray(ad.responsabilidades) ? ad.responsabilidades : [];
  const beneficios = Array.isArray(ad.beneficios) ? ad.beneficios : [];
  const herramientas = Array.isArray(ad.herramientas) ? ad.herramientas : [];

  return (
    <div className="flex-1 bg-gray-50/30 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Main Card */}
        <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Banner Area */}
          <div className="h-64 bg-gray-200 relative">
            {ad.imagen_url ? (
              <img 
                src={ad.imagen_url} 
                className="w-full h-full object-cover" 
                alt="Banner del anuncio" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#0a66c2] to-blue-800"></div>
            )}
          </div>
          
          {/* Header Info (Profile style) */}
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
              
              {/* Left Column: Avatar + Title Details Stacked (LinkedIn style) */}
              <div className="flex-1 flex flex-col items-start w-full">
                
                {/* Logo / Avatar (Overlapping the banner) */}
                <div className="-mt-16 md:-mt-20 w-32 h-32 md:w-36 md:h-36 bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center overflow-hidden shrink-0 z-10 group">
                  {ad.empresa_logo ? (
                    <img src={ad.empresa_logo} className="w-full h-full object-contain group-hover:scale-105 transition-transform" alt="Logo" />
                  ) : (
                    <Building2 className="w-12 h-12 text-gray-300" />
                  )}
                </div>

                {/* Badges / Etiquetas */}
                <div className="flex flex-wrap items-center gap-2 mt-6">
                  {ad.prioridad === 'urgente' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white animate-pulse">
                      🚨 URGENTE
                    </span>
                  )}
                  {ad.prioridad === 'destacado' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-yellow-950">
                      ⭐ DESTACADO
                    </span>
                  )}
                  {ad.estado === 'cerrado' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-600 text-white">
                      🔒 CERRADO
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-700 border border-green-200">
                      🟢 ACTIVO
                    </span>
                  )}
                  {ad.categoria && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                      📂 {ad.categoria}
                    </span>
                  )}
                </div>

                {/* Título, Empresa, Subtítulo */}
                <div className="mt-3">
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                    {ad.titulo}
                  </h1>
                  <p className="text-[#0a66c2] font-black text-base md:text-lg mt-1 tracking-wide">
                    {ad.empresa_nombre || 'Empresa Confidencial'}
                  </p>
                  {ad.subtitulo && (
                    <p className="text-gray-500 font-bold text-xs md:text-sm mt-1">
                      {ad.subtitulo}
                    </p>
                  )}
                </div>

                {/* Metadatos (Ubicación, Contrato, Modalidad, Salario) */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] md:text-xs font-bold text-gray-500 mt-4">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {ad.ubicacion || 'Global'}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> {ad.tipo_contrato?.replace('_', ' ')}</span>
                  <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-gray-400" /> {ad.modalidad}</span>
                  {ad.mostrar_salario === 1 && (
                    <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-1 rounded-md">
                      <DollarSign className="w-4 h-4" /> {ad.moneda} {parseFloat(ad.salario_min).toLocaleString()} - {parseFloat(ad.salario_max).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Estadísticas (Publicado, Límite, Vistas, Postulados) */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] md:text-xs font-bold text-gray-400 mt-3 pt-3 border-t border-gray-100 w-full">
                  {ad.created_at && (
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Publicado: {formatDate(ad.created_at)}</span>
                  )}
                  {ad.fecha_limite && (
                    <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded"><Calendar className="w-3.5 h-3.5" /> Límite: {formatDate(ad.fecha_limite)}</span>
                  )}
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {ad.vistas || 0} vistas</span>
                  <span className="flex items-center gap-1 text-[#0a66c2] bg-blue-50/50 px-2 py-0.5 rounded"><Rocket className="w-3.5 h-3.5" /> {ad.postulaciones_count || 0} postulaciones</span>
                </div>

              </div>

              {/* Right Column: Botones de acción */}
              <div className="flex flex-col gap-2.5 w-full md:w-56 shrink-0 mt-6 md:mt-24">
                <button 
                  className={`w-full px-6 py-2.5 font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 ${
                    ad.estado === 'cerrado'
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : postulado 
                        ? 'bg-emerald-600 text-white cursor-default' 
                        : 'bg-[#0a66c2] hover:bg-blue-700 text-white hover:-translate-y-0.5 active:scale-95'
                  }`}
                  onClick={ad.estado === 'cerrado' ? null : (postulado ? null : handlePostular)}
                  disabled={ad.estado === 'cerrado' || postulado}
                >
                  {ad.estado === 'cerrado' ? (
                    <>
                      <X className="w-4 h-4" /> CONVOCATORIA CERRADA
                    </>
                  ) : postulado ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> POSTULADO
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" /> POSTULARME
                    </>
                  )}
                </button>
                <div className="flex gap-2 w-full">
                  <button 
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-full transition-all font-bold text-[10px] md:text-[11px] ${
                      saved ? 'bg-blue-50/50 text-[#0a66c2] border-blue-200 shadow-sm' : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={handleGuardar}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#0a66c2]' : ''}`} /> 
                    {saved ? 'GUARDADO' : 'GUARDAR'}
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-full transition-all font-bold text-[10px] md:text-[11px]" 
                    onClick={handleCompartir}
                  >
                    <Share2 className="w-3.5 h-3.5" /> 
                    {copied ? '¡COPIADO!' : 'COMPARTIR'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Dos columnas de contenido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Columna principal */}
          <div className="md:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Descripción */}
            <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-[#0a66c2]" /> Acerca del Puesto
              </h2>
              <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed text-sm font-medium">
                {ad.descripcion}
              </div>
            </section>

            {/* Responsabilidades */}
            {responsabilidades.length > 0 && (
              <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-[#0a66c2]" /> Responsabilidades
                </h2>
                <ul className="space-y-4">
                  {responsabilidades.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 leading-relaxed text-sm font-medium">
                      <div className="mt-1 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      {resp}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Requisitos */}
            {requisitos.length > 0 && (
              <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-[#0a66c2]" /> Requisitos
                </h2>
                <ul className="space-y-4">
                  {requisitos.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 leading-relaxed text-sm font-medium">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-[#0a66c2] shrink-0"></div>
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Columna lateral */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            
            {/* Herramientas */}
            {herramientas.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Stack & Herramientas</h3>
                <div className="flex flex-wrap gap-2">
                  {herramientas.map((h, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Beneficios */}
            {beneficios.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Beneficios</h3>
                <ul className="space-y-3">
                  {beneficios.map((ben, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                      <span className="text-green-500">✨</span> {ben}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Card Empresa */}
            <div className="bg-gradient-to-b from-blue-50 to-white rounded-3xl border border-blue-100 p-6 shadow-sm text-center">
              <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mx-auto mb-4">
                {ad.empresa_logo ? (
                  <img src={ad.empresa_logo} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <Building2 className="w-full h-full text-gray-300" />
                )}
              </div>
              <h4 className="font-black text-gray-900 mb-1">{ad.empresa_nombre || 'Hitpoly'}</h4>
              <p className="text-xs text-gray-500 font-bold mb-4">{ad.ubicacion || 'Global'} • {ad.categoria || 'Tech'}</p>
              <button 
                onClick={() => ad.empresa_id && navigate(`/empresa/${ad.empresa_id}${window.location.search}`)}
                className="w-full py-3 bg-white border-2 border-blue-100 text-blue-600 font-black rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors text-xs uppercase tracking-wider"
              >
                Ver Perfil de Empresa
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
