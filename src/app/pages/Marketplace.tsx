import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { buscarProfesionales } from '../services/api';
import CompanyEditor from '../components/CompanyEditor';
import ProfessionalEditor from '../components/ProfessionalEditor';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useSystem } from '../data/SystemContext';

export function Marketplace() {
  const navigate = useNavigate();
  const { view, setView, activeContext, userContexts, cargarContextos } = useSystem();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCargo, setSelectedCargo] = useState<number | null>(null);
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar especialidades reales
  const cargarEspecialidades = async () => {
    try {
      const response = await axios.post('https://apiweb.hitpoly.com/ajax/bolsaController.php', {
        accion: 'getTiposProfesionales'
      });
      if (response.data.success) {
        setCargos(response.data.data);
      }
    } catch (e) {
      console.error("Error cargando cargos reales:", e);
    }
  };

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  useEffect(() => {
    const cargarProfesionales = async () => {
      setLoading(true);
      try {
        const results = await buscarProfesionales(searchQuery, selectedCargo || undefined);
        setProfesionales(results);
      } catch (error) {
        console.error("Error cargando profesionales reales:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      cargarProfesionales();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCargo]);

  const handleOpenProfile = async (profile: any) => {
    // Navegamos directamente a la página de perfil
    const targetId = profile.user_id || profile.id;
    navigate(`/perfil/${targetId}${window.location.search}`);
  };

  return (
    <>
      {view === 'search' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-3xl mb-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Busca por nombre, cargo o habilidades..."
              />
            </div>
            <FilterBar
              selectedCargo={selectedCargo}
              onCargoChange={setSelectedCargo}
              cargos={cargos}
            />
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'search' ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-500 font-medium">
                {loading ? 'Sincronizando red...' : (
                  <>Mostrando <span className="text-gray-900 font-bold">{profesionales.length}</span> profesionales</>
                )}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-8 h-8 text-[#0a66c2] animate-spin" />
                <p className="text-sm text-gray-400 font-semibold animate-pulse">Cargando resultados...</p>
              </div>
            ) : profesionales.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No se encontraron profesionales</h3>
                <p className="text-sm text-gray-500">Prueba ajustando tus filtros o términos de búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profesionales.map((profile, index) => (
                  <ProfessionalCard
                    key={index}
                    profile={profile}
                    onClick={() => handleOpenProfile(profile)}
                  />
                ))}
              </div>
            )}
          </>
        ) : view === 'profile' ? (
          <ProfessionalEditor
            profile={userContexts.professional}
            userId={new URLSearchParams(window.location.search).get('userId') || new URLSearchParams(window.location.search).get('user_id')}
            onSave={cargarContextos}
            onClose={() => setView('search')}
          />
        ) : (
          <CompanyEditor
            company={activeContext}
            onSave={cargarContextos}
            onClose={() => setView('search')}
          />
        )}
      </main>
    </>
  );
}
