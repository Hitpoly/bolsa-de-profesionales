import { useEffect, useRef } from 'react';

export const SessionTracker = () => {
    const sessionIdRef = useRef<number | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('userId') || params.get('user_id');

        if (!userId) return;

        // 1. REGISTRAR INGRESO
        const startSession = async () => {
            try {
                const response = await fetch('http://localhost:5173/api/ajax/vinculacionController.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        accion: 'registrarIngreso', 
                        user_id: userId 
                    })
                });
                const result = await response.json();
                if (result.success) {
                    sessionIdRef.current = result.session_id;
                    console.log("[TRACKER] Sesión iniciada:", result.session_id);
                }
            } catch (error) {
                console.error("[TRACKER] Error al iniciar sesión:", error);
            }
        };

        startSession();

        // 2. REGISTRAR SALIDA AL DESMONTAR
        return () => {
            if (sessionIdRef.current) {
                const data = JSON.stringify({ 
                    accion: 'registrarSalida', 
                    session_id: sessionIdRef.current 
                });
                
                // Usamos sendBeacon para asegurar que la petición se envíe incluso al cerrar la pestaña
                navigator.sendBeacon('http://localhost:5173/api/ajax/vinculacionController.php', data);
                console.log("[TRACKER] Petición de salida enviada.");
            }
        };
    }, []);

    return null; // Este componente no renderiza nada visualmente
};
