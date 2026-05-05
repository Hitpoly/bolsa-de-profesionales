import { PerfilCompleto } from '../types/profile';
import { mockProfiles } from '../data/mockProfiles';

// URL de tu API real
const API_BASE_URL = 'https://apiweb.hitpoly.com/ajax/PerfilControlador.php';

/**
 * Servicio para interactuar con tu API de perfiles
 * 
 * Para usar datos reales:
 * 1. Cambia useMockData a false
 * 2. Asegúrate de que tu servidor PHP esté respondiendo correctamente
 * 3. Verifica que el CORS esté configurado (ya lo tienes en tu PHP)
 */

const useMockData = true; // Cambia a false para usar tu API real

/**
 * Función auxiliar para hacer peticiones POST a tu API
 */
async function apiRequest(funcion: string, additionalData: Record<string, any> = {}) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      funcion,
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
 * Obtiene el perfil completo de un usuario
 * Nota: Tu endpoint actual es para GUARDAR perfiles.
 * Necesitarás crear una función 'obtenerPerfil' en tu PHP que use ConsultaPerfil.php
 * 
 * Ejemplo en PHP:
 * case 'obtenerPerfil':
 *     include_once '../modelos/ConsultaPerfil.php';
 *     $consulta = new ConsultaPerfil();
 *     $perfil = $consulta->obtenerTodoElPerfil($user_id);
 *     $response = ['success' => true, 'data' => $perfil];
 *     break;
 */
export async function obtenerTodoElPerfil(userId: number): Promise<PerfilCompleto> {
  if (useMockData) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const profile = mockProfiles.find((p, index) => index + 1 === userId);
    
    if (!profile) {
      throw new Error('Perfil no encontrado');
    }
    
    return profile;
  }

  // Código para API real - necesitarás agregar esta función en tu PHP
  try {
    const response = await apiRequest('obtenerPerfil', { user_id: userId });
    return response.data as PerfilCompleto;
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
}

/**
 * Obtiene todos los profesionales
 * También necesitarás crear esta función en tu PHP
 * 
 * Ejemplo en PHP:
 * case 'obtenerTodosProfesionales':
 *     include_once '../modelos/ConsultaPerfil.php';
 *     $consulta = new ConsultaPerfil();
 *     // Aquí harías una query para obtener todos los usuarios con id_rol = 3 (Profesional)
 *     $response = ['success' => true, 'data' => $profesionales];
 *     break;
 */
export async function obtenerTodosLosProfesionales(): Promise<PerfilCompleto[]> {
  if (useMockData) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProfiles;
  }

  // Código para API real
  try {
    const response = await apiRequest('obtenerTodosProfesionales');
    return response.data as PerfilCompleto[];
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    throw error;
  }
}

/**
 * Busca profesionales por término de búsqueda y cargo
 * También necesitarás crear esta función en tu PHP
 */
export async function buscarProfesionales(
  query: string,
  cargoId?: number
): Promise<PerfilCompleto[]> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let results = mockProfiles;
    
    // Filtrar por cargo
    if (cargoId) {
      results = results.filter(p => p.usuario_principal.id_cargo === cargoId);
    }
    
    // Filtrar por búsqueda de texto
    if (query) {
      const searchLower = query.toLowerCase();
      results = results.filter(p => {
        const nombreCompleto = `${p.usuario_principal.nombre} ${p.usuario_principal.apellido}`.toLowerCase();
        const cargo = p.usuario_principal.nombre_cargo.toLowerCase();
        const about = p.sobre_mi.about_text.toLowerCase();
        
        return nombreCompleto.includes(searchLower) || 
               cargo.includes(searchLower) || 
               about.includes(searchLower);
      });
    }
    
    return results;
  }

  // Código para API real
  try {
    const response = await apiRequest('buscarProfesionales', {
      query,
      cargo_id: cargoId
    });
    return response.data as PerfilCompleto[];
  } catch (error) {
    console.error('Error en búsqueda:', error);
    throw error;
  }
}

/**
 * Guarda/actualiza un perfil completo
 * Esta función SÍ existe en tu API actual
 */
export async function guardarPerfilCompleto(userId: number, data: any): Promise<any> {
  if (useMockData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Perfil actualizado (mock)' };
  }

  try {
    const response = await apiRequest('guardarPerfilCompleto', {
      user_id: userId,
      ...data
    });
    return response;
  } catch (error) {
    console.error('Error al guardar perfil:', error);
    throw error;
  }
}