import { useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router';

/**
 * Componente que sincroniza el estado interno de la Bolsa con la URL del padre (Holding).
 * Envía un mensaje postMessage al padre cada vez que cambian los parámetros de la ruta.
 */
export function ParentUrlSynchronizer() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  // 1. Efecto de entrada: Si cargamos con ?userId=... o ?route=... en la query string
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get('userId') || searchParams.get('user_id');
    const targetRoute = searchParams.get('route');
    
    if (location.pathname === '/') {
      if (targetRoute) {
        console.log("[BOLSA] Auto-navegando por ruta específica:", targetRoute);
        navigate(targetRoute, { replace: true });
      } else if (userId && !params.userId) {
        console.log("[BOLSA] Detectado userId en URL, auto-navegando a perfil:", userId);
        navigate(`/perfil/${userId}`, { replace: true });
      }
    }
  }, []); 

  // 2. Efecto de sincronización: Notificamos al padre de los cambios actuales
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryUserId = searchParams.get('userId') || searchParams.get('user_id');
    
    // Evitamos el "flash" de reset durante la navegación inicial
    if (location.pathname === '/' && queryUserId && !params.userId) {
       return;
    }

    const messageParams: any = {};
    const path = location.pathname;

    // Sincronizar userId: prioridad params > query > último conocido (sessionStorage)
    if (params.userId) {
      messageParams.userId = params.userId;
      sessionStorage.setItem('bolsa_last_userId', params.userId);
    } else if (queryUserId) {
      messageParams.userId = queryUserId;
      sessionStorage.setItem('bolsa_last_userId', queryUserId);
    } else {
      // Fallback: usar el último userId conocido (ej: cuando se navega al editor)
      messageParams.userId = sessionStorage.getItem('bolsa_last_userId') || null;
    }

    // Sincronizar ruta (Estándar Hitpoly)
    messageParams.route = path !== '/' ? path : null;

    // No enviar mensajes vacíos al padre (ambos null)
    if (!messageParams.userId && !messageParams.route) {
      return;
    }

    window.parent.postMessage({
      type: 'UPDATE_PARENT_URL',
      params: messageParams
    }, '*');
  }, [location.pathname, location.search, params.userId]);

  return null;
}
