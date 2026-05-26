import React from 'react';
import { 
  Briefcase, MapPin, DollarSign, Clock, Calendar, 
  Bookmark, Rocket, Target, Building2, ChevronRight
} from 'lucide-react';

export function JobAdCard({ ad, onClick, isPostulado, isSaved, onToggleSave }) {
  const isUrgente = ad.prioridad === 'urgente';
  const isDestacado = ad.prioridad === 'destacado';

  // Formatear salario
  const formatSalario = () => {
    if (!ad.mostrar_salario) return 'Salario no mostrado';
    const min = parseFloat(ad.salario_min).toLocaleString();
    const max = parseFloat(ad.salario_max).toLocaleString();
    return `${ad.moneda} ${min} - ${max}`;
  };

  // Truncar descripción
  const snippet = ad.descripcion?.length > 120 
    ? ad.descripcion.substring(0, 120) + '...' 
    : ad.descripcion;

  return (
    <div 
      onClick={onClick}
      className={`group bg-white rounded-3xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer flex flex-col h-full relative overflow-hidden ${
        isDestacado ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
    >
      {/* Banner / Portada */}
      {ad.imagen_url ? (
        <div className="h-32 w-full shrink-0 relative bg-gray-100">
          <img src={ad.imagen_url} alt="Portada" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
        </div>
      ) : (
        <div className="h-6 w-full bg-gradient-to-r from-[#0a66c2] to-[#004182] shrink-0"></div>
      )}

      <div className="p-6 pt-0 flex flex-col flex-1 relative">
        {/* Cabecera: Logo y Etiquetas */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-3">
            <div className={`w-16 h-16 rounded-2xl bg-white border-4 border-white flex items-center justify-center overflow-hidden shrink-0 shadow-md ${ad.imagen_url ? '-mt-8 relative z-10' : '-mt-3 relative z-10'}`}>
              {ad.empresa_logo ? (
                <img src={ad.empresa_logo} alt="Logo" className="w-full h-full object-contain bg-white" />
              ) : (
                <Building2 className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div>
              <p className="text-[#0a66c2] text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">
                {ad.empresa_nombre || 'Empresa Confidencial'}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {ad.modalidad}
                </span>
                {isUrgente && (
                  <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    Urgente 🔥
                  </span>
                )}
                {isDestacado && (
                  <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Destacado ⭐
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 mt-3">
            {isPostulado && (
              <div className="p-2 text-green-500 bg-green-50 rounded-full" title="Ya estás postulado a esta vacante">
                <Rocket className="w-5 h-5 fill-current" />
              </div>
            )}
            <button 
              className={`transition-all p-2 rounded-full ${isSaved ? 'bg-blue-50 text-[#0a66c2] scale-110' : 'bg-gray-50 text-gray-400 hover:text-[#0a66c2] hover:bg-blue-50'}`} 
              onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(ad.id); }}
              title={isSaved ? "Quitar de guardados" : "Guardar anuncio"}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-[#0a66c2]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Título y Descripción */}
        <div className="mb-6">
          <h3 
            className="text-xl font-black text-gray-900 leading-tight group-hover:text-[#0a66c2] transition-colors mb-2 truncate"
            title={ad.titulo}
          >
            {ad.titulo}
          </h3>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            {snippet}
          </p>
        </div>

        {/* Detalles Rápidos (Grid) */}
        <div className="grid grid-cols-2 gap-y-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-700">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{ad.ubicacion || 'Global'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-700">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="truncate">{ad.tipo_contrato?.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-700">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="truncate">{formatSalario()}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="truncate">Reciente</span>
          </div>
        </div>

        {/* Habilidades / Herramientas */}
        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Target className="w-3 h-3" /> {ad.categoria || 'General'}
          </span>
          {(Array.isArray(ad.herramientas) ? ad.herramientas : []).slice(0, 3).map((h, i) => (
            <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {h}
            </span>
          ))}
          {(Array.isArray(ad.herramientas) && ad.herramientas.length > 3) && (
            <span className="px-2 py-1 text-gray-400 text-[10px] font-bold">
              +{ad.herramientas.length - 3} más
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

