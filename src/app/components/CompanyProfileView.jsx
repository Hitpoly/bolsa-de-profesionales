import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import axios from 'axios';
import { 
  Building2, MapPin, Globe, Mail, Phone, Calendar, Users, 
  ExternalLink, ChevronLeft, PlayCircle, Star, BadgeCheck, Briefcase, Clock, DollarSign
} from 'lucide-react';

const VideoEmbedder = ({ url, platform, orientation }) => {
  if (!url) return null;

  const isVertical = orientation === 'vertical';
  const containerClass = isVertical 
    ? "aspect-[9/16] w-full max-w-[300px] mx-auto rounded-2xl overflow-hidden shadow-lg" 
    : "aspect-video w-full rounded-2xl overflow-hidden shadow-lg";

  // Simple iframe embed for Youtube as example. 
  // In a real prod environment you might want specific embeds for TikTok/IG.
  let embedUrl = url;
  if (platform === 'youtube' && url.includes('watch?v=')) {
    embedUrl = url.replace('watch?v=', 'embed/');
  }

  return (
    <div className={containerClass}>
      <iframe 
        src={embedUrl}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Testimonial Video"
      />
    </div>
  );
};

export function CompanyProfileView({ profile, anuncios = [], onBack }) {
  const navigate = useNavigate();
  const { info, servicios = [], portafolios = [], equipo = [] } = profile;
  
  // Parsear redes sociales
  let socials = {};
  try { if (info.social) socials = JSON.parse(info.social); } catch(e) {}

  const [pricingData, setPricingData] = useState({});
  
  useEffect(() => {
    if (!servicios.length || !info?.id) return;
    const fetchPricing = async () => {
      const results = {};
      for (const svc of servicios) {
        if (!svc.slug) continue;
        try {
          const res = await axios.post('https://apiweb.hitpoly.com/ajax/servicesController.php', {
            accion: 'get_service_pricing',
            empresa_id: svc.empresa_id || info.id,
            slug: svc.slug
          });
          if (res.data.success && res.data.data?.pricing_data) {
            results[svc.id] = res.data.data.pricing_data;
          }
        } catch(e) {}
      }
      setPricingData(results);
    };
    fetchPricing();
  }, [servicios, info?.id]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-[#101828]">
      
      {/* 1. HERO SECTION */}
      <div className="relative h-[350px] md:h-[450px] w-full bg-gray-900">
        {info.banner ? (
          <img src={info.banner} alt="Banner" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80" />
        )}
        
        {/* Overlay gradient para que el texto sea legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-transparent to-transparent" />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        
        {/* Cabecera Flotante */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col md:flex-row gap-6 items-start md:items-center"
        >
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 -mt-20 md:-mt-24 z-20">
            {info.logo ? (
              <img src={info.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <Building2 className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Info Principal */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
                {info.nombre}
              </h1>
              <BadgeCheck className="w-8 h-8 text-blue-500" />
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm font-medium text-gray-500 mb-3">
              {info.industry && (
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                  <Building2 className="w-4 h-4" /> {info.industry}
                </div>
              )}
              {info.city && (
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                  <MapPin className="w-4 h-4" /> {info.city}
                </div>
              )}
              {info.size && (
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                  <Users className="w-4 h-4" /> {info.size} empleados
                </div>
              )}
              {info.founded && (
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" /> Fund. {info.founded}
                </div>
              )}
            </div>

          </div>

          {/* CTA */}
          {info.website && (
            <a 
              href={info.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#101828] text-white rounded-xl font-bold hover:bg-black transition-all hover:-translate-y-1"
            >
              <Globe className="w-5 h-5" />
              Visitar Sitio Web
            </a>
          )}
        </motion.div>

        {/* 2. GRID DE DETALLES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Columna Izquierda (About) */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Sobre Nosotros
              </h2>
              <div className="prose prose-blue max-w-none text-gray-600">
                <p className="whitespace-pre-wrap leading-relaxed">{info.description || 'No hay descripción disponible.'}</p>
                {info.objective && (
                  <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Nuestra Misión / Objetivo</h3>
                    <p className="text-blue-800 italic">{info.objective}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* SERVICIOS OFRECIDOS */}
            {servicios.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-black mb-6">Nuestros Servicios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicios.map((svc) => (
                    <div 
                      key={svc.id}
                      onClick={() => {
                        const companyServiceInfo = {
                          isCompanyService: true,
                          companyId: info.id,
                          service: svc
                        };
                        localStorage.setItem('last_active_company_service', JSON.stringify(companyServiceInfo));
                        navigate(`/servicio/${svc.id}`, { 
                          state: { 
                            service: svc, 
                            isCompanyService: true, 
                            companyId: info.id 
                          } 
                        });
                      }}
                      className="cursor-pointer group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all"
                    >
                      <div className="h-44 bg-gray-200 overflow-hidden">
                        {svc.image ? (
                          <img src={svc.image} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Building2 className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">{svc.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{svc.description}</p>
                        {pricingData[svc.id] && pricingData[svc.id].planes?.[0] && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                {pricingData[svc.id].planes.length} planes disponibles
                              </span>
                              <span className="text-lg font-black text-gray-900">
                                ${pricingData[svc.id].planes[0].precioDescuento || pricingData[svc.id].planes[0].precioReal}
                              </span>
                            </div>
                            {pricingData[svc.id].planes[0].precioReal && pricingData[svc.id].planes[0].precioDescuento && (
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-gray-400 line-through">${pricingData[svc.id].planes[0].precioReal}</span>
                                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                                  -{Math.round((1 - pricingData[svc.id].planes[0].precioDescuento / pricingData[svc.id].planes[0].precioReal) * 100)}%
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                              {pricingData[svc.id].planes[0].descripcion && (
                                <span className="line-clamp-1 italic">"{pricingData[svc.id].planes[0].descripcion}"</span>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center text-blue-600 font-bold text-sm mt-auto pt-2 border-t border-gray-50">
                          Ver detalles <ChevronLeft className="w-4 h-4 ml-1 rotate-180" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PORTAFOLIO Y TESTIMONIOS */}
            {portafolios.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-black mb-6">Casos de Éxito & Portafolio</h2>
                <div className="space-y-8">
                  {portafolios.map((port) => (
                    <div id={`portafolio-${port.id}`} key={port.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                      
                      {port.testimonio_url_video && (
                        <div className="w-full bg-black p-4 flex items-center justify-center">
                          <VideoEmbedder 
                            url={port.testimonio_url_video} 
                            platform={port.testimonio_plataforma}
                            orientation={port.testimonio_orientacion}
                          />
                        </div>
                      )}
                      {!port.testimonio_url_video && port.imagen_portada && (
                        <img src={port.imagen_portada} alt={port.titulo} className="w-full h-64 object-cover" />
                      )}

                      <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold">{port.titulo}</h3>
                          {port.enlace_externo && (
                            <a href={port.enlace_externo} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                              Visitar Proyecto <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-gray-600 whitespace-pre-wrap">{port.descripcion}</p>
                        
                        {port.testimonio_autor && (
                          <div className="mt-6 flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Testimonio de cliente</p>
                              <p className="font-bold text-gray-900">{port.testimonio_autor}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* EQUIPO */}
            {equipo.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-black mb-6">Nuestro Equipo</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {equipo.map((miembro) => (
                    <a 
                      key={miembro.id}
                      href={`/perfil/${miembro.profesional_id}`}
                      className="group bg-white p-4 rounded-2xl flex flex-col items-center text-center shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1"
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-gray-100 group-hover:border-blue-500 transition-colors">
                        {miembro.avatar ? (
                          <img src={`https://apibolsaprofesionales.hitpoly.com/assets/img/avatar/${miembro.avatar}`} alt={miembro.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 leading-tight">{miembro.nombre} {miembro.apellidos}</h3>
                      <p className="text-xs text-gray-500 mt-1">{miembro.cargo_rol}</p>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

          </div>

          {/* Columna Derecha (Sidebar) */}
          <div className="space-y-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="font-bold mb-4 text-gray-900 border-b border-gray-100 pb-2">Información</h3>
              <div className="space-y-4">
                {info.founded && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <span className="block font-medium text-gray-900">Fundación</span>
                      {info.founded}
                    </div>
                  </div>
                )}
                {info.size && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Users className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <span className="block font-medium text-gray-900">Tamaño de empresa</span>
                      {info.size}
                    </div>
                  </div>
                )}
                {info.industry && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <span className="block font-medium text-gray-900">Sector</span>
                      {info.industry}
                    </div>
                  </div>
                )}
                {info.city && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <span className="block font-medium text-gray-900">Ubicación</span>
                      {info.city}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* PORTAFOLIO */}
            {portafolios.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="font-bold mb-4 text-gray-900 border-b border-gray-100 pb-2">Portafolio</h3>
                <div className="space-y-3">
                  {portafolios.slice(0, 3).map((port) => (
                    <div key={port.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => {
                      const el = document.getElementById(`portafolio-${port.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        {port.imagen_portada ? (
                          <img src={port.imagen_portada} alt={port.titulo} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Star className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{port.titulo}</p>
                        {port.testimonio_autor && (
                          <p className="text-[11px] text-gray-500 truncate">{port.testimonio_autor}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {portafolios.length > 3 && (
                    <p className="text-xs font-bold text-blue-600 text-center pt-2">+{portafolios.length - 3} proyectos más</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ANUNCIOS DISPONIBLES */}
            {anuncios.filter(a => a.estado === 'abierto').length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" /> Vacantes Abiertas
                  </h3>
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {anuncios.filter(a => a.estado === 'abierto').length}
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-tabs pb-2 -mx-2 px-2">
                  {anuncios.filter(a => a.estado === 'abierto').map((anuncio) => (
                    <div 
                      key={anuncio.id}
                      onClick={() => navigate(`/anuncio/${anuncio.id}`)}
                      className="flex-none w-52 bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100 cursor-pointer hover:shadow-md transition-all group"
                    >
                      <h4 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {anuncio.titulo}
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                          <MapPin className="w-3 h-3" /> {anuncio.modalidad} {anuncio.ubicacion ? `• ${anuncio.ubicacion}` : ''}
                        </div>
                        {anuncio.salario_min && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600">
                            <DollarSign className="w-3 h-3" /> {anuncio.moneda} {anuncio.salario_min}{anuncio.salario_max ? ` - ${anuncio.salario_max}` : ''}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                          <Clock className="w-3 h-3" /> {anuncio.tipo_contrato?.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => navigate(`/empresa/${info.id}/vacantes`)}
                  className="mt-3 w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 py-2 rounded-lg hover:bg-blue-50 transition-all"
                >
                  Ver todas las vacantes →
                </button>
              </motion.div>
            )}

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="font-bold mb-4 text-gray-900 border-b border-gray-100 pb-2">Contacto</h3>
              <div className="space-y-4">
                {info.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                    <span>{info.address}</span>
                  </div>
                )}
                {info.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                    <a href={`mailto:${info.email}`} className="hover:text-blue-600">{info.email}</a>
                  </div>
                )}
                {info.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                    <a href={`tel:${info.phone}`} className="hover:text-blue-600">{info.phone}</a>
                  </div>
                )}
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}
