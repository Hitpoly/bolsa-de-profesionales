import { MapPin, Star, Briefcase, ChevronRight, MessageCircle, UserPlus, CheckCircle2, Heart } from 'lucide-react';

interface ProfessionalCardProps {
  profile: any;
  onClick: () => void;
}

export function ProfessionalCard({ profile, onClick }: ProfessionalCardProps) {
  const { usuario_principal, sobre_mi, skills, perfil_general } = profile;
  
  const bio = sobre_mi?.about_text || 'Estratega enfocado en resultados.';
  const avatar = usuario_principal?.foto || usuario_principal?.avatar || `https://ui-avatars.com/api/?name=${usuario_principal?.nombre || 'User'}&background=random`;
  const banner = perfil_general?.cover_photo || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop";

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      {/* Banner de Portada */}
      <div className="h-24 w-full relative overflow-hidden bg-gray-100">
        <img src={banner} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Cover" />
      </div>

      {/* Contenido Principal */}
      <div className="px-5 pb-5 relative flex-1 flex flex-col">
        {/* Avatar */}
        <div className="relative -mt-10 mb-3 flex justify-center md:justify-start">
          <div className="p-1 bg-white rounded-full">
             <img
                src={avatar}
                alt={`${usuario_principal?.nombre}`}
                className="w-20 h-20 rounded-full object-cover border border-gray-100"
              />
          </div>
          <div className="absolute bottom-1.5 right-1.5 md:right-auto md:left-[64px] w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
        </div>
        
        {/* Información de Identidad */}
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-1">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#0a66c2] transition-colors truncate">
              {usuario_principal?.nombre} {usuario_principal?.apellido}
            </h3>
            <CheckCircle2 className="w-4 h-4 text-[#0a66c2]" />
          </div>
          <p className="text-xs font-semibold text-gray-500">
            {usuario_principal?.nombre_cargo || 'Especialista Profesional'}
          </p>
        </div>

        {/* Bio Corta */}
        <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed font-medium">
          {bio}
        </p>
        
        {/* Habilidades */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {skills?.slice(0, 3).map((skill: any, idx: number) => (
            <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-semibold rounded border border-gray-100">
              {skill.nombre || skill}
            </span>
          ))}
          {skills?.length > 3 && (
            <span className="text-[10px] font-bold text-gray-300 self-center">+{skills.length - 3}</span>
          )}
        </div>
        
        {/* Hobbies */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {profile.hobbies.slice(0, 3).map((h: any, idx: number) => (
              <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 text-[9px] font-bold rounded-full border border-red-100">
                <Heart className="w-2.5 h-2.5" /> {h.hobby_name}
              </span>
            ))}
          </div>
        )}
        
        {/* Info Geográfica */}
        <div className="mt-auto pt-4 flex items-center justify-between">
           <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
             <MapPin className="w-3.5 h-3.5" />
             <span>Remoto / Global</span>
           </div>
           <div className="flex items-center gap-1">
             <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
             <span className="text-xs font-bold text-gray-900">4.9</span>
           </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-2 gap-2 mt-4">
           <button className="py-2 bg-blue-50 text-[#0a66c2] rounded-full font-bold text-[11px] hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5">
             <MessageCircle className="w-3.5 h-3.5" /> Mensaje
           </button>
           <button className="py-2 bg-white text-gray-600 border border-gray-300 rounded-full font-bold text-[11px] hover:bg-gray-50 transition-all flex items-center justify-center gap-1">
             Ver perfil
           </button>
        </div>
      </div>
    </div>
  );
}
