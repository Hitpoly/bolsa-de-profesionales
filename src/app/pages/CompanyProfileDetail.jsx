import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { CompanyProfileView } from '../components/CompanyProfileView';
import { obtenerTodoElPerfilEmpresa } from '../services/api';
import axios from 'axios';

export function CompanyProfileDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anuncios, setAnuncios] = useState([]);

  // Handler para el botón de atrás del menú
  useEffect(() => {
    window.bolsaBackHandler = () => {
      if (window.history.length > 1) navigate(-1);
      else navigate('/');
    };
    return () => { window.bolsaBackHandler = null; };
  }, [navigate]);

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!companyId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await obtenerTodoElPerfilEmpresa(parseInt(companyId));
        setProfile(data);
      } catch (err) {
        setError('Error al cargar el perfil de la empresa');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const cargarAnuncios = async () => {
      try {
        const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/anuncios.php', {
          accion: 'getAnunciosEmpresa',
          empresa_id: parseInt(companyId)
        });
        if (res.data.success) {
          setAnuncios(res.data.data);
        }
      } catch (e) {
        console.error('Error cargando anuncios:', e);
      }
    };

    cargarPerfil();
    cargarAnuncios();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#101828] animate-spin" />
            <p className="text-[#64748B] font-bold animate-pulse tracking-widest uppercase text-xs">Cargando Perfil Élite...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center p-12 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-md w-full">
          <h2 className="text-2xl font-black text-[#101828] mb-4 uppercase tracking-tight">
            {error || 'Empresa no encontrada'}
          </h2>
          <p className="text-[#64748B] mb-8">El perfil de la empresa que estás buscando no existe o no está disponible públicamente.</p>
          <button 
            onClick={() => navigate('/')} 
            className="w-full px-8 py-4 bg-[#101828] text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all hover:scale-[1.02]"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const currentUserId = new URLSearchParams(window.location.search).get('userId') || new URLSearchParams(window.location.search).get('user_id');

  return (
    <CompanyProfileView 
        profile={profile}
        anuncios={anuncios}
        onBack={() => navigate('/')}
        isOwnProfile={false} 
    />
  );
}
