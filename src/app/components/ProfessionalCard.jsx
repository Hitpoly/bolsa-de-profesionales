import React, { useState } from 'react';
import { MapPin, Star, MessageCircle, CheckCircle2, Briefcase, Clock, LogIn } from 'lucide-react';
import { ProfessionalReviewsModal } from './ProfessionalReviewsModal';

export function ProfessionalCard({ profile, onClick }) {
  // Adaptabilidad: Soporta formato anidado (getDetailedProfile) o formato plano (buscarProfesionales)
  const nombre = profile?.user_name || profile?.usuario_principal?.nombre || 'Usuario';
  const apellido = profile?.user_name ? '' : (profile?.usuario_principal?.apellido || '');
  const cargo = profile?.specialization || profile?.usuario_principal?.nombre_cargo || 'Especialista Profesional';
  const bio = profile?.bio || profile?.sobre_mi?.about_text || 'Profesional altamente capacitado con enfoque en resultados y crecimiento corporativo.';
  const avatar = profile?.user_photo || profile?.usuario_principal?.foto || profile?.usuario_principal?.avatar || `https://ui-avatars.com/api/?name=${nombre}&background=random&color=fff`;
  const banner = profile?.cover_photo || profile?.perfil_general?.cover_photo || profile?.custom_banner || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop";

  // Parseo inteligente de Habilidades
  let skillsList = [];
  if (Array.isArray(profile?.skills)) {
    skillsList = profile.skills;
  } else if (typeof profile?.skills === 'string') {
    skillsList = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
  }

  // Parseo de Mercados (ahora guardado como JSON array)
  let markets = "Remoto / Global";
  if (profile?.international_markets) {
    try {
      const parsed = JSON.parse(profile.international_markets);
      if (Array.isArray(parsed) && parsed.length > 0) {
        markets = parsed.join(', ');
      }
    } catch (e) {
      if (typeof profile.international_markets === 'string' && profile.international_markets.length > 0) {
        markets = profile.international_markets;
      }
    }
  }

  const [showReviewsModal, setShowReviewsModal] = useState(false);

  return (
    <>
    <div 
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full relative group"
    >
      {/* Banner de Portada (Limpio, sin etiquetas ni zoom) */}
      <div className="h-44 w-full relative overflow-hidden bg-gray-100">
        <img src={banner} className="w-full h-full object-cover" alt="Cover" />
      </div>

      {/* Contenido Principal */}
      <div className="px-6 pb-6 relative flex-1 flex flex-col">
        
        {/* Encabezado: Avatar y Acciones */}
        <div className="flex justify-between items-end -mt-10 mb-4">
          <div className="relative z-10">
            <div className="p-1 bg-white rounded-full shadow-sm inline-block">
               <img
                  src={avatar}
                  alt={nombre}
                  className="w-[72px] h-[72px] rounded-full object-cover border border-gray-100 bg-gray-50"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${nombre}&background=f3f4f6&color=374151`; }}
                />
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" title="Online" />
          </div>
          
          <div className="flex flex-col items-end gap-2 mb-2">
            {/* Servicios Rápidos (Rango de Precios Pequeño) */}
            {profile?.servicios_rango && Array.isArray(profile.servicios_rango) && profile.servicios_rango.length > 0 && (
              <div className="flex items-center gap-1.5">
                {profile.servicios_rango.map((rango, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-white shadow-sm px-1.5 py-0.5 rounded border border-gray-100" title={`Valor estimado ${rango.tipo === 'hora' ? 'por hora' : 'por proyecto'}`}>
                    {rango.tipo === 'hora' ? <Clock className="w-3 h-3 text-[#0a66c2]" /> : <Briefcase className="w-3 h-3 text-purple-600" />}
                    <span>
                      {rango.min_price === rango.max_price 
                        ? `${rango.moneda || '$'}${Number(rango.min_price).toFixed(0)}`
                        : `${rango.moneda || '$'}${Number(rango.min_price).toFixed(0)}-${Number(rango.max_price).toFixed(0)}`
                      }
                      {rango.tipo === 'hora' && '/h'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Acciones principales (Reseñas y Ver perfil arriba) */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setShowReviewsModal(true)}
                className="py-1.5 px-3 bg-[#0a66c2] text-white rounded-full font-bold text-[11px] hover:bg-[#004182] transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                <Star className="w-3.5 h-3.5 fill-white text-white" /> 
                {(profile?.rating?.total || 0) > 0 
                  ? `${profile.rating.average} (${profile.rating.total}) Reseñas` 
                  : 'Reseñas'}
              </button>

              <button 
                onClick={onClick}
                className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:text-[#0a66c2] hover:bg-blue-50 border border-gray-100 transition-all flex items-center justify-center shadow-sm"
                title="Ver perfil"
              >
                <LogIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Información de Identidad */}
        <div className="space-y-0.5 mb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-[19px] text-gray-900 group-hover:text-[#0a66c2] transition-colors truncate tracking-tight">
              {nombre} {apellido}
            </h3>
            <CheckCircle2 className="w-4 h-4 text-[#0a66c2] shrink-0" />
          </div>
          <p className="text-sm font-bold text-gray-500">
            {cargo}
          </p>
        </div>

        {/* Datos Duros (Para Reclutadores) - Capsule layout */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg" title={markets}>
            <MapPin className="w-3.5 h-3.5 text-[#0a66c2]" />
            <span className="truncate max-w-[150px]">{markets}</span>
          </div>
          {profile?.experience_years > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
              <Briefcase className="w-3.5 h-3.5 text-[#0a66c2]" />
              <span>{profile.experience_years} Años Exp.</span>
            </div>
          )}
          {profile?.availability && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-green-600" />
              <span>{profile.availability}</span>
            </div>
          )}
        </div>

        {/* Bio Corta */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
          {bio}
        </p>
        
        {/* Habilidades (Máximo 4 para mantener limpieza) */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {skillsList.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-md border border-gray-200">
              {skill.nombre || skill}
            </span>
          ))}
          {skillsList.length > 4 && (
            <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-[11px] font-semibold rounded-md border border-gray-100">
              +{skillsList.length - 4}
            </span>
          )}
        </div>

      </div>
    </div>
    
    {showReviewsModal && (
       <ProfessionalReviewsModal profile={profile} onClose={() => setShowReviewsModal(false)} />
    )}
    </>
  );
}
