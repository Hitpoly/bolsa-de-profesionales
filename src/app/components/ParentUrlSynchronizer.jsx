import { useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * Componente que sincroniza el estado interno de la Bolsa con la URL del padre (Holding).
 * Envía un mensaje postMessage al padre cada vez que cambian los parámetros de la ruta.
 */
export function ParentUrlSynchronizer() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. Efecto de entrada: Si cargamos con ?userId=... o ?route=... en la query string
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    let userId = searchParams.get('userId') || searchParams.get('user_id');
    if (userId && typeof userId === 'string') {
      if (userId.includes('?')) userId = userId.split('?')[0];
      if (userId.includes('%3F')) userId = userId.split('%3F')[0];
    }
    const targetRoute = searchParams.get('route');
    
    // Si el usuario está autenticado, evitamos la redirección automática al perfil público.
    const isLoggedIn = !!user?.user_id;

    if (location.pathname === '/') {
      if (targetRoute && targetRoute !== '/' && targetRoute !== '') {
        // Redirigir SIEMPRE a la ruta de destino (deep-link / recuperación de recarga)
        navigate(targetRoute, { replace: true });
      } else if (userId && !params.userId && !isLoggedIn) {
        // Si no está logueado (es un visitante externo), redirigir al perfil del profesional
        navigate(`/perfil/${userId}`, { replace: true });
      }
    }
  }, [location.pathname, location.search, params.userId, user, navigate]); 

  // 2. Efecto de sincronización: Notificamos al padre de los cambios actuales
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    let queryUserId = searchParams.get('userId') || searchParams.get('user_id');
    if (queryUserId && typeof queryUserId === 'string') {
      if (queryUserId.includes('?')) queryUserId = queryUserId.split('?')[0];
      if (queryUserId.includes('%3F')) queryUserId = queryUserId.split('%3F')[0];
    }
    

    const messageParams = {};
    const path = location.pathname;

    // Sincronizar userId: prioridad params > query > último conocido (sessionStorage)
    let finalUserId = null;
    if (params.userId) {
      finalUserId = params.userId;
    } else if (queryUserId) {
      finalUserId = queryUserId;
    } else {
      finalUserId = sessionStorage.getItem('bolsa_last_userId') || null;
    }

    if (finalUserId && typeof finalUserId === 'string') {
      if (finalUserId.includes('?')) finalUserId = finalUserId.split('?')[0];
      if (finalUserId.includes('%3F')) finalUserId = finalUserId.split('%3F')[0];
    }

    if (finalUserId) {
      messageParams.userId = finalUserId;
      sessionStorage.setItem('bolsa_last_userId', finalUserId);
    }

    // Sincronizar ruta (Estándar Hitpoly)
    messageParams.route = path;

    // console.log("[Bolsa] Sincronizando con Padre:", messageParams);

    // No enviar mensajes vacíos o redundantes al padre
    if (window === window.parent) return;
    if (!messageParams.userId && messageParams.route === '/') return;

    window.parent.postMessage({
      type: 'UPDATE_PARENT_URL',
      params: messageParams
    }, '*');
  }, [location.pathname, location.search, params.userId]);

  return null;
}
