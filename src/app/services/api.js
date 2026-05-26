import axios from 'axios';

const API_BASE_URL = 'https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php';

/**
 * Función auxiliar para hacer peticiones POST a la API usando Axios
 */
async function apiRequest(accion, additionalData = {}) {
  try {
    const params = new URLSearchParams();
    params.append('accion', accion);
    
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'object') {
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, value);
      }
    });

    const response = await axios.post(API_BASE_URL, params);

    const data = response.data;
    
    if (!data.success && data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Error en el servidor');
    }
    throw error;
  }
}

/**
 * Obtiene todos los profesionales reales
 */
export async function obtenerTodosLosProfesionales() {
  try {
    const response = await apiRequest('buscarProfesionales', { query: '' });
    return response.data;
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    return [];
  }
}

/**
 * Busca profesionales por término de búsqueda y cargo
 */
export async function buscarProfesionales(query, cargoId) {
  try {
    const response = await apiRequest('buscarProfesionales', {
      query,
      cargo_id: cargoId
    });

    
    const data = Array.isArray(response.data) ? response.data : Object.values(response.data || {});
    
    return data.map((p) => ({
      ...p,
      usuario_principal: {
        nombre: p.nombre,
        apellido: p.apellido || '',
        nombre_cargo: p.nombre_especialidad || p.specialization,
        foto: p.custom_avatar || p.avatar
      },
      perfil_general: {
        cover_photo: p.custom_banner
      },
      rating: {
        average: parseFloat(p.avg_rating) || 0,
        total: parseInt(p.total_reviews) || 0
      },
      sobre_mi: {
        about_text: p.bio
      },
      skills: (() => {
        const raw = p.skills;
        if (!raw) return [];
        if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.map(s => typeof s === 'string' ? { nombre: s } : s);
          } catch(e) {}
          return raw.split(',').map((s) => ({ nombre: s.trim() })).filter(s => s.nombre);
        }
        if (Array.isArray(raw)) return raw.map(s => typeof s === 'string' ? { nombre: s } : s);
        return [];
      })(),
      hobbies: p.hobbies || []
    }));
  } catch (error) {
    console.error('Error en búsqueda:', error);
    return [];
  }
}

/**
 * Obtiene el perfil de un usuario específico
 */
export async function obtenerTodoElPerfil(userId) {
  try {

    
    // 1. Traer datos de la Bolsa (Banner, Bio adaptada, Showcase Config)
    let p = {};
    try {

      const bolsaResponse = await apiRequest('getDetailedProfile', { user_id: userId });
      p = bolsaResponse.data || {};
    } catch (e) {
      // Silencioso
    }


    
    // 2. Traer datos Centrales (Educación, Experiencia, Idiomas, etc.)
    let central = {};
    try {

      const centralRes = await axios.post('https://apiweb.hitpoly.com/ajax/ObtenerPerfilController.php', {
        user_id: userId
      });

      if (centralRes.data && centralRes.data.success) {
        central = centralRes.data.datos || {};
      }
    } catch (e) {
      // Silencioso
    }

    
    const perfilCombinado = {
      ...central, 
      ...p,       
      user_id: userId,
      usuario_principal: {
        ...(central.usuario_principal || {}),
        nombre: p.name || p.usuario_principal?.nombre || central.usuario_principal?.nombre || '',
        apellido: p.apellido || p.usuario_principal?.apellido || central.usuario_principal?.apellido || '',
        nombre_cargo: p.specialization || p.usuario_principal?.nombre_cargo || central.usuario_principal?.nombre_cargo || '',
        foto: p.custom_avatar || p.avatar || p.usuario_principal?.foto || central.usuario_principal?.foto || ''
      },
      perfil_general: {
        ...(central.perfil_general || {}),
        ...(p.perfil_general || {}),
        cover_photo: p.custom_banner || p.perfil_general?.cover_photo || central.perfil_general?.cover_photo,
        bolsa_config: p.showcase_config || p.perfil_general?.bolsa_config
      },
      sobre_mi: {
        about_text: p.bio || p.sobre_mi?.about_text || central.sobre_mi?.about_text || '',
        favorite_quotes: p.sobre_mi?.favorite_quotes || central.sobre_mi?.favorite_quotes || ''
      },
      bolsa_data: p,
      skills: (() => {
        const raw = p.skills;
        if (!raw) return central.skills || [];
        if (Array.isArray(raw)) return raw.map((s) => typeof s === 'object' ? s : { nombre: String(s) });
        if (typeof raw === 'string') {
          if (raw.includes('[object Object]')) return [];
          return raw.split(',').map((s) => ({ nombre: s.trim() })).filter(s => s.nombre);
        }
        return [];
      })(),
      experience_years: p.experience_years || central.experience_years || 0,
      availability: (() => {
        const avail = p.availability || 'full-time';
        const map = {
          'full-time': 'Tiempo completo',
          'part-time': 'Medio tiempo',
          'immediate': 'Disponibilidad inmediata',
          'freelance': 'Freelance'
        };
        return map[avail.toLowerCase()] || avail;
      })(),
      experiencia_laboral: p.experiencia_laboral || central.experiencia_laboral || [],
      empleo:             p.empleo              || central.empleo              || [],
      educacion:          p.educacion           || central.educacion           || [],
      idiomas_lista:      p.idiomas_lista       || central.idiomas_lista       || [],
      viajes:             p.viajes              || central.viajes              || [],
      hobbies:            p.hobbies             || central.hobbies             || [],
      intereses:          p.intereses           || central.intereses           || [],
      enlaces:            p.enlaces             || central.enlaces             || []
    };


    return perfilCombinado;

  } catch (error) {
    console.error('[FRONTEND ERROR CRÍTICO] Error al obtener perfil combinado:', error);
    throw error;
  }
}

/**
 * Busca anuncios de empleo por término de búsqueda y categoría
 */
export async function buscarAnuncios(query = '', categoria = '') {
  try {
    const params = new URLSearchParams();
    params.append('accion', 'getAllAnuncios');
    params.append('query', query);
    params.append('categoria', categoria);
    const response = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/anuncios.php', params);

    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error al buscar anuncios:', error);
    return [];
  }
}

export const obtenerTodoElPerfilEmpresa = async (empresa_id) => {
  try {
    const params = new URLSearchParams();
    params.append('accion', 'get_perfil_publico');
    params.append('empresa_id', empresa_id);

    const response = await axios.post(`https://apibolsaprofesionales.hitpoly.com/ajax/EmpresaPublicController.php`, params);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Error al obtener perfil de empresa');
  } catch (error) {
    console.error('Error in obtenerTodoElPerfilEmpresa:', error);
    throw error;
  }
};
