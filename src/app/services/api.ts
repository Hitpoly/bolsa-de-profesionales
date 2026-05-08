import { PerfilCompleto } from '../types/profile';
import { mockProfiles } from '../data/mockProfiles';

// URL de tu API real
const API_BASE_URL = 'https://apiweb.hitpoly.com/ajax/bolsaController.php';

const useMockData = false; 

/**
 * Función auxiliar para hacer peticiones POST a tu API
 */
async function apiRequest(accion: string, additionalData: Record<string, any> = {}) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accion,
      ...additionalData
    })
  });

  if (!response.ok) {
    throw new Error('Error en la petición al servidor');
  }

  const data = await response.json();
  
  if (!data.success && data.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Obtiene todos los profesionales reales
 */
export async function obtenerTodosLosProfesionales(): Promise<PerfilCompleto[]> {
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
export async function buscarProfesionales(
  query: string,
  cargoId?: number
): Promise<PerfilCompleto[]> {
  try {
    const response = await apiRequest('buscarProfesionales', {
      query,
      cargo_id: cargoId
    });
    
    return response.data.map((p: any) => ({
        ...p,
        usuario_principal: {
            nombre: p.nombre,
            apellido: p.apellido || '',
            nombre_cargo: p.nombre_especialidad || p.specialization,
            foto: p.foto
        },
        sobre_mi: {
            about_text: p.bio
        },
        skills: p.skills ? p.skills.split(',').map((s: string) => ({ nombre: s.trim() })) : [],
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
export async function obtenerTodoElPerfil(userId: number): Promise<PerfilCompleto> {
    try {
        const response = await apiRequest('getDetailedProfile', { user_id: userId });
        const p = response.data;
        const b = p.bolsa_data || {};
        
        return {
            ...p,
            user_id: userId,
            usuario_principal: {
                nombre: p.usuario_principal?.nombre || '',
                apellido: p.usuario_principal?.apellido || '',
                nombre_cargo: b.specialization || p.usuario_principal?.nombre_cargo || '',
                foto: p.usuario_principal?.avatar || b.foto
            },
            sobre_mi: {
                about_text: b.bio || p.perfil_general?.bio || ''
            },
            skills: b.skills ? b.skills.split(',').map((s: string) => ({ nombre: s.trim() })) : [],
            experience_years: b.experience_years || 0,
            availability: b.availability || 'full-time',
            social_links: p.links || [],
            experiencia_laboral: p.experiencia_laboral || [],
            educacion: p.educacion || [],
            idiomas: p.idiomas_lista || []
        } as any;
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        throw error;
    }
}