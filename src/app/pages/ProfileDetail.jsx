import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { ProfileView } from '../components/ProfileView';
import { obtenerTodoElPerfil } from '../services/api';

export function ProfileDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-gray-400 font-bold animate-pulse tracking-widest uppercase text-xs">Cargando Perfil Élite...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-[40px] shadow-2xl border border-gray-100 max-w-md">
          <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">
            {error || 'Perfil no encontrado'}
          </h2>
          <button 
            onClick={() => navigate('/')} 
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-gray-900 transition-all"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const currentUserId = new URLSearchParams(window.location.search).get('userId') || new URLSearchParams(window.location.search).get('user_id');

  return (
    <ProfileView 
        profile={profile}
        onBack={() => navigate('/')}
        isOwnProfile={String(userId) === String(currentUserId)}
    />
  );
}
