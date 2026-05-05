import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  Heart,
  Loader2,
  Calendar,
  Building
} from 'lucide-react';
import { PerfilCompleto } from '../types/profile';
import { obtenerTodoElPerfil } from '../services/api';

export function ProfileDetail() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PerfilCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await obtenerTodoElPerfil(parseInt(userId));
        setProfile(data);
      } catch (err) {
        setError('Error al cargar el perfil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Perfil no encontrado'}
          </h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const { usuario_principal, sobre_mi, datos_personales, experiencia_laboral, empleo, educacion, contacto, links, idiomas_lista, hobbies } = profile;
  
  const email = contacto.find(c => c.contact_type === 'EMAIL')?.contact_value;
  const phone = contacto.find(c => c.contact_type === 'PHONE')?.contact_value;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a profesionales
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar izquierdo */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card de perfil */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <img
                  src={usuario_principal.avatar}
                  alt={`${usuario_principal.nombre} ${usuario_principal.apellido}`}
                  className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
                />
                
                <h1 className="text-2xl font-bold text-gray-900">
                  {usuario_principal.nombre} {usuario_principal.apellido}
                </h1>
                
                <p className="text-blue-600 font-medium mt-2">
                  {usuario_principal.nombre_cargo}
                </p>
                
                {datos_personales.city && (
                  <div className="flex items-center justify-center gap-1 text-gray-600 mt-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{datos_personales.city}, {datos_personales.country}</span>
                  </div>
                )}

                <button className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Contactar Profesional
                </button>
              </div>
            </div>

            {/* Información de contacto */}
            {(email || phone) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contacto</h3>
                <div className="space-y-3">
                  {email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-700 break-all">
                        {email}
                      </a>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${phone}`} className="text-gray-700 hover:text-gray-900">
                        {phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Idiomas */}
            {idiomas_lista.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Idiomas</h3>
                <div className="space-y-2">
                  {idiomas_lista.map((idioma, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{idioma.idioma}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {idioma.nivel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enlaces */}
            {links.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Enlaces</h3>
                <div className="space-y-2">
                  {links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Hobbies */}
            {hobbies.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Intereses</h3>
                <div className="flex flex-wrap gap-2">
                  {hobbies.map((hobby, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      <Heart className="w-3 h-3" />
                      {hobby.hobby_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sobre mí */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre mí</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {sobre_mi.about_text}
              </p>
              
              {sobre_mi.favorite_quotes && (
                <blockquote className="mt-6 pl-4 border-l-4 border-blue-600 italic text-gray-600">
                  "{sobre_mi.favorite_quotes}"
                </blockquote>
              )}
            </div>

            {/* Experiencia laboral */}
            {experiencia_laboral.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Experiencia Laboral
                </h2>
                <div className="space-y-6">
                  {experiencia_laboral.map((exp) => (
                    <div key={exp.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {exp.job_title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Building className="w-4 h-4" />
                          <span>{exp.company_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{exp.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(exp.start_date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })} - {' '}
                            {exp.end_date 
                              ? new Date(exp.end_date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                              : 'Presente'
                            }
                          </span>
                        </div>
                        <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Educación */}
            {educacion.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Educación
                </h2>
                <div className="space-y-6">
                  {educacion.map((edu) => (
                    <div key={edu.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-green-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {edu.degree_type} en {edu.specialization}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {edu.institution_name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {edu.start_year} - {edu.end_year || 'Presente'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
