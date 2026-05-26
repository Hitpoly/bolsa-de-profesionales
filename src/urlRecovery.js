// Recuperación de URL profunda para la sub-app Bolsa de Profesionales
// Se ejecuta antes de la inicialización de React Router para prevenir parpadeos y redirecciones.
try {
  const searchParams = new URLSearchParams(window.location.search);
  const targetRoute = searchParams.get('route');
  if (targetRoute && targetRoute !== '/' && targetRoute !== '') {
    const cleanParams = new URLSearchParams(window.location.search);
    cleanParams.delete('route');
    const searchString = cleanParams.toString();
    const finalUrl = targetRoute + (searchString ? '?' + searchString : '');
    // Modificar silenciosamente el historial de navegación antes de que React Router se monte
    window.history.replaceState(window.history.state, '', finalUrl);
  }
} catch (e) {
  console.error("[Bolsa Entry URL Recovery Error]", e);
}
