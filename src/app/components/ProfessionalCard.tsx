import { Link } from 'react-router';
import { MapPin, Star, Briefcase } from 'lucide-react';
import { PerfilCompleto } from '../types/profile';

interface ProfessionalCardProps {
  profile: PerfilCompleto;
  userId: number;
}

export function ProfessionalCard({ profile, userId }: ProfessionalCardProps) {
  const { usuario_principal, sobre_mi, datos_personales, empleo, idiomas_lista } = profile;
  
  // Obtener trabajo actual
  const trabajoActual = empleo[0];
  
  // Extraer primer párrafo del about
  const shortDescription = sobre_mi.about_text.split('.')[0] + '.';
  
  return (
    <Link 
      to={`/perfil/${userId}`}
      className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* Header con avatar y nombre */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={usuario_principal.avatar}
            alt={`${usuario_principal.nombre} ${usuario_principal.apellido}`}
            className="w-20 h-20 rounded-full object-cover flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {usuario_principal.nombre} {usuario_principal.apellido}
            </h3>
            
            <p className="text-sm font-medium text-blue-600 mt-1">
              {usuario_principal.nombre_cargo}
            </p>
            
            {datos_personales.city && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{datos_personales.city}, {datos_personales.country}</span>
              </div>
            )}
          </div>
          
          {/* Rating simulado */}
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.{Math.floor(Math.random() * 3) + 7}</span>
          </div>
        </div>
        
        {/* Descripción */}
        <p className="text-sm text-gray-600 mt-4 line-clamp-2">
          {shortDescription}
        </p>
        
        {/* Trabajo actual */}
        {trabajoActual && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-700">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span className="truncate">{trabajoActual.company_name}</span>
          </div>
        )}
        
        {/* Footer con idiomas y precio simulado */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-2 text-xs text-gray-500">
            {idiomas_lista.slice(0, 2).map((idioma, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 rounded">
                {idioma.idioma}
              </span>
            ))}
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500">Desde</p>
            <p className="font-semibold text-gray-900">
              ${Math.floor(Math.random() * 40 + 20)}/hora
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
