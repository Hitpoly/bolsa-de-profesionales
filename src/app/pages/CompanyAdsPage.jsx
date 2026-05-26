import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Briefcase, MapPin, DollarSign, Clock, Eye, Send, Loader2, Building2 } from 'lucide-react';
import axios from 'axios';

export function CompanyAdsPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [anuncios, setAnuncios] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [adsRes, profileRes] = await Promise.all([
          axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/anuncios.php', {
            accion: 'getAnunciosEmpresa',
            empresa_id: parseInt(companyId)
          }),
          axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/EmpresaPublicController.php', {
            accion: 'get_perfil_publico',
            empresa_id: parseInt(companyId)
          })
        ]);
        if (adsRes.data.success) setAnuncios(adsRes.data.data);
        if (profileRes.data.success) setCompanyName(profileRes.data.data.info?.nombre || '');
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [companyId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-8 h-8 text-[#0a66c2]" />
          <div>
            <h1 className="text-2xl font-black text-gray-900">Vacantes de {companyName || 'la empresa'}</h1>
            <p className="text-sm text-gray-500 font-medium">
              {anuncios.filter(a => a.estado === 'abierto').length} vacantes activas • {anuncios.length} en total
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
          </div>
        ) : anuncios.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No hay vacantes publicadas</h3>
            <p className="text-gray-500 mt-2">Esta empresa aún no ha publicado ninguna vacante.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {anuncios.map((anuncio) => (
              <div
                key={anuncio.id}
                onClick={() => navigate(`/anuncio/${anuncio.id}`)}
                className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  anuncio.estado === 'abierto' ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-black text-gray-900">{anuncio.titulo}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        anuncio.estado === 'abierto' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {anuncio.estado}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {anuncio.modalidad} {anuncio.ubicacion ? `(${anuncio.ubicacion})` : ''}</span>
                      {anuncio.salario_min && (
                        <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> {anuncio.moneda} {anuncio.salario_min} - {anuncio.salario_max}</span>
                      )}
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {anuncio.tipo_contrato?.replace(/_/g, ' ')}</span>
                      <span className="flex items-center gap-1.5 text-indigo-500"><Eye className="w-3.5 h-3.5" /> {anuncio.vistas || 0} vistas</span>
                      {anuncio.postulaciones_count > 0 && (
                        <span className="flex items-center gap-1.5 text-blue-500"><Send className="w-3.5 h-3.5" /> {anuncio.postulaciones_count} postulaciones</span>
                      )}
                    </div>
                  </div>
                  {anuncio.prioridad === 'urgente' && (
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-black uppercase animate-pulse shrink-0">
                      Urgente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
