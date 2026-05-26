import { useState, useEffect, useMemo } from 'react';
import { Users, Loader2, Briefcase } from 'lucide-react';
import { SearchBar } from '../../components/SearchBar';
import { FilterBar } from '../../components/FilterBar';
import { ProfessionalCard } from '../../components/ProfessionalCard';
import { JobAdCard } from '../../components/JobAdCard';
import { buscarProfesionales, buscarAnuncios } from '../../services/api';
import { useSystem } from '../../data/SystemContext';
import axios from 'axios';
import { useNavigate } from 'react-router';

export function MarketplacePage() {
  const navigate = useNavigate();
  const { activeContext } = useSystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [data, setData] = useState([]); // Puede ser profesionales o anuncios
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userApps, setUserApps] = useState([]);
  const [savedAds, setSavedAds] = useState([]);

  // Determinar el modo basado en el contexto
  // Si es profesional, busca anuncios. Si es empresa, busca profesionales.
  const isProfessionalMode = useMemo(() => {
    return activeContext?.type === 'professional';
  }, [activeContext]);

  // Categorías reales de la Base de Datos para ANUNCIOS
  const CATEGORIAS_ANUNCIOS = [
    { id: 'Marketing Digital', nombre: 'Marketing Digital' },
    { id: 'Tecnología', nombre: 'Tecnología & Dev' },
    { id: 'Estrategia', nombre: 'Estrategia & Growth' },
    { id: 'Diseño', nombre: 'Diseño & Creatividad' },
    { id: 'Ventas', nombre: 'Ventas & Closing' },
  ];

  // Cargar especialidades reales para PROFESIONALES (Cuando la empresa busca talento)
  const cargarEspecialidades = async () => {
    if (isProfessionalMode) {
      setCargos(CATEGORIAS_ANUNCIOS);
      return;
    }

    const cacheKey = 'bolsa_especialidades_maestro';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setCargos(JSON.parse(cached));
      } catch (e) { localStorage.removeItem(cacheKey); }
    }

    try {
      const params = new URLSearchParams();
      params.append('accion', 'getEspecialidadesMaestro');
      const response = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php', params);
      if (response.data.success) {
        const freshData = response.data.data;
        const freshStr = JSON.stringify(freshData);
        if (freshStr !== cached) {
          setCargos(freshData);
          localStorage.setItem(cacheKey, freshStr);
        }
      }
    } catch (e) {
      console.error('Error cargando cargos reales:', e);
    }
  };

  useEffect(() => {
    cargarEspecialidades();
  }, [isProfessionalMode]);

  // IDENTIDAD ÚNICA: Priorizar URL (1500) sobre Contexto (2) para asegurar match con la BD
  const currentUserId = useMemo(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('userId') || new URLSearchParams(window.location.search).get('user_id');
    const fromContext = activeContext?.id;
    const fromStorage = localStorage.getItem('bolsa_userId') || sessionStorage.getItem('bolsa_last_userId');
    
    const finalId = fromUrl || fromContext || fromStorage;
    return finalId;
  }, [activeContext?.id]);

  // Función segura para guardar en localStorage (evita QuotaExceededError)
  const safeSetItem = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn("[Bolsa] Memoria llena, limpiando caché antiguo...");
        // Limpiar cachés de marketplace antiguos para hacer espacio
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('marketplace_cache_')) localStorage.removeItem(k);
        });
        try { localStorage.setItem(key, value); } catch (e2) { console.error("No se pudo guardar ni limpiando."); }
      }
    }
  };

  // 3. LÓGICA DE CARGA Y CACHÉ
  useEffect(() => {
    const cacheKey = `marketplace_cache_${isProfessionalMode ? 'ads' : 'pros'}_${searchQuery}_${selectedCargo || 'all'}`;
    
    setLoading(true);

    // CARGA INMEDIATA DESDE CACHÉ (Sin debounce para respuesta instantánea)
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        setData(JSON.parse(cached));
        // No llamamos a setLoading(false) aquí para que se vea el "Sincronizando..." arriba
      } catch (e) { 
        localStorage.removeItem(cacheKey); 
        setData([]);
      }
    } else {
      // Solo si NO hay caché limpiamos la data para que el loader principal se active
      setData([]);
    }

    const cargarData = async () => {
      try {
        let results = [];
        if (isProfessionalMode) {
          results = await buscarAnuncios(searchQuery, selectedCargo || '');
        } else {
          results = await buscarProfesionales(searchQuery, selectedCargo || undefined);
        }

        const optimizedResults = results.map(item => ({
          ...item,
          descripcion: item.descripcion?.length > 300 ? item.descripcion.substring(0, 300) + '...' : item.descripcion
        }));

        const resultsStr = JSON.stringify(optimizedResults);
        if (resultsStr !== cached) {
          setData(optimizedResults);
          safeSetItem(cacheKey, resultsStr);
        }
      } catch (error) {
        console.error('[Marketplace] Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      cargarData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCargo, isProfessionalMode, cargos, currentUserId]);

  // 4. LÓGICA DE CARGA DE ESTADOS (Postulaciones y Guardados)
  useEffect(() => {
    if (!currentUserId) return;

    const cacheKeyApps = `bolsa_user_apps_${currentUserId}`;
    const cacheKeySaved = `bolsa_user_saved_${currentUserId}`;

    const fetchUserStatus = async () => {
      const cachedApps = localStorage.getItem(cacheKeyApps);
      const cachedSaved = localStorage.getItem(cacheKeySaved);

      if (cachedApps) setUserApps(JSON.parse(cachedApps));
      if (cachedSaved) setSavedAds(JSON.parse(cachedSaved));

      if (isProfessionalMode) {
        try {
          const pApps = new URLSearchParams();
          pApps.append('accion', 'getPostulacionesByUser');
          pApps.append('user_id', currentUserId);

          const resApps = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/postulaciones.php', pApps);
          if (resApps.data.success) {
            const apps = resApps.data.data.map(app => parseInt(app.anuncio_id));
            setUserApps(apps);
            localStorage.setItem(cacheKeyApps, JSON.stringify(apps));
          }

          const pSaved = new URLSearchParams();
          pSaved.append('accion', 'getAnunciosGuardados');
          pSaved.append('user_id', currentUserId);

          const resSaved = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/anuncios.php', pSaved);
          if (resSaved.data.success) {
            const saved = resSaved.data.data.map(item => parseInt(item.anuncio_id));
            setSavedAds(saved);
            localStorage.setItem(cacheKeySaved, JSON.stringify(saved));
          }
        } catch (e) { console.error("[Bolsa Debug] Error sincronizando estados", e); }
      }
    };

    fetchUserStatus();
  }, [currentUserId, isProfessionalMode]);

  const handleOpenItem = (item) => {
    if (isProfessionalMode) {
      navigate(`/anuncio/${item.id}${window.location.search}`);
    } else {
      const targetId = item.user_id || item.id;
      navigate(`/perfil/${targetId}${window.location.search}`);
    }
  };

  const handleToggleSave = async (adId) => {
    if (!currentUserId) {
      alert("Debes estar registrado para guardar anuncios.");
      return;
    }

    const adIdInt = parseInt(adId);
    const wasSaved = savedAds.includes(adIdInt);
    const cacheKeySaved = `bolsa_user_saved_${currentUserId}`;

    // Optimistic update
    let newSaved = wasSaved ? savedAds.filter(id => id !== adIdInt) : [...savedAds, adIdInt];
    setSavedAds(newSaved);
    localStorage.setItem(cacheKeySaved, JSON.stringify(newSaved));

    try {
      const pToggle = new URLSearchParams();
      pToggle.append('accion', 'toggleGuardar');
      pToggle.append('user_id', currentUserId);
      pToggle.append('anuncio_id', adIdInt);

      const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/anuncios.php', pToggle);

      if (!res.data.success) {
        // Revertir
        setSavedAds(savedAds);
        localStorage.setItem(cacheKeySaved, JSON.stringify(savedAds));
      }
    } catch (e) {
      setSavedAds(savedAds);
      localStorage.setItem(cacheKeySaved, JSON.stringify(savedAds));
    }
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mb-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={isProfessionalMode ? "Busca vacantes por título o palabras clave..." : "Busca profesionales por nombre o cargo..."}
            />
          </div>
          <FilterBar selectedCargo={selectedCargo} onCargoChange={setSelectedCargo} cargos={cargos} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-sm text-gray-500 font-medium">
            {loading ? 'Sincronizando red...' : (
              <>
                Mostrando <span className="text-gray-900 font-bold">{data.length}</span> {isProfessionalMode ? 'oportunidades laborales' : 'profesionales'}
              </>
            )}
          </p>
        </div>

        {loading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 text-[#0a66c2] animate-spin" />
            <p className="text-sm text-gray-400 font-semibold animate-pulse">Buscando las mejores opciones...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed">
            {isProfessionalMode ? <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" /> : <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />}
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {isProfessionalMode ? 'No encontramos vacantes' : 'No se encontraron profesionales'}
            </h3>
            <p className="text-sm text-gray-500">Prueba ajustando tus filtros o términos de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((item, index) => (
              isProfessionalMode ? (
                <JobAdCard 
                  key={item.id || index} 
                  ad={item} 
                  isPostulado={userApps.includes(parseInt(item.id))}
                  isSaved={savedAds.includes(parseInt(item.id))}
                  onToggleSave={handleToggleSave}
                  onClick={() => handleOpenItem(item)} 
                />
              ) : (
                <ProfessionalCard key={index} profile={item} onClick={() => handleOpenItem(item)} />
              )
            ))}
          </div>
        )}
      </main>
    </>
  );
}
