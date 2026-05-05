import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { PerfilCompleto } from '../types/profile';
import { buscarProfesionales } from '../services/api';
import { mockProfiles } from '../data/mockProfiles';

export function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCargo, setSelectedCargo] = useState<number | null>(null);
  const [profesionales, setProfesionales] = useState<PerfilCompleto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProfesionales = async () => {
      setLoading(true);
      try {
        const results = await buscarProfesionales(searchQuery, selectedCargo || undefined);
        setProfesionales(results);
      } catch (error) {
        console.error('Error al cargar profesionales:', error);
        // Fallback a datos mock en caso de error
        setProfesionales(mockProfiles);
      } finally {
        setLoading(false);
      }
    };

    // Debounce para la búsqueda
    const timer = setTimeout(() => {
      cargarProfesionales();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCargo]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Encuentra Profesionales</h1>
              <p className="text-gray-600 mt-1">Conecta con los mejores talentos para tu proyecto</p>
            </div>
          </div>
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nombre, cargo o especialidad..."
          />
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <FilterBar
            selectedCargo={selectedCargo}
            onCargoChange={setSelectedCargo}
          />
        </div>
      </div>

      {/* Resultados */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contador de resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? (
              'Buscando...'
            ) : (
              <>
                <span className="font-semibold text-gray-900">{profesionales.length}</span>{' '}
                {profesionales.length === 1 ? 'profesional encontrado' : 'profesionales encontrados'}
              </>
            )}
          </p>
        </div>

        {/* Grid de profesionales */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : profesionales.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron profesionales
            </h3>
            <p className="text-gray-500">
              Intenta ajustar tu búsqueda o filtros
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profesionales.map((profile, index) => (
              <ProfessionalCard
                key={index}
                profile={profile}
                userId={index + 1}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
