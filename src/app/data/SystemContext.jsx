import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

import { useAuth } from '../context/AuthContext';
const SystemContext = createContext(undefined);

export function SystemProvider({ children }) {
  const { user } = useAuth();
  const [view, setView] = useState('search');
  const [userContexts, setUserContexts] = useState(() => {
    const saved = localStorage.getItem('bolsa_contexts_cache');
    return saved ? JSON.parse(saved) : { professional: null, companies: [] };
  });

  const [activeContext, setActiveContext] = useState(() => {
    const savedActive = localStorage.getItem('bolsa_active_context');
    if (savedActive) {
      try {
        return JSON.parse(savedActive);
      } catch (e) { }
    }
    
    const savedCache = localStorage.getItem('bolsa_contexts_cache');
    if (savedCache) {
      try {
        const data = JSON.parse(savedCache);
        if (data.companies && data.companies.length > 0) {
          return { ...data.companies[0], type: 'enterprise' };
        }
        if (data.professional) {
          return { ...data.professional, type: 'professional' };
        }
      } catch (e) { }
    }
    return null;
  });

  // Guardar contexto activo cuando cambie
  useEffect(() => {
    if (activeContext) {
      try {
        localStorage.setItem('bolsa_active_context', JSON.stringify(activeContext));
        if (activeContext.type) {
          sessionStorage.setItem('bolsa_last_context_type', activeContext.type);
        }
      } catch (e) {
        // Silencioso
      }
    }
  }, [activeContext]);

  const cargarContextos = useCallback(async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      
      // CAZA-IDS: Si viene en la URL, lo guardamos a fuego en la sesión para que no se pierda
      let urlUid = searchParams.get('userId') || searchParams.get('user_id');
      if (urlUid && typeof urlUid === 'string') {
        if (urlUid.includes('?')) urlUid = urlUid.split('?')[0];
        if (urlUid.includes('%3F')) urlUid = urlUid.split('%3F')[0];
        sessionStorage.setItem('bolsa_last_userId', urlUid);
        localStorage.setItem('bolsa_userId', urlUid);
      }

      let uid = urlUid || user?.id || sessionStorage.getItem('bolsa_last_userId') || localStorage.getItem('bolsa_userId');
      if (uid && typeof uid === 'string') {
        if (uid.includes('?')) uid = uid.split('?')[0];
        if (uid.includes('%3F')) uid = uid.split('%3F')[0];
      }
      
      if (!uid) {
        return;
      }
      
      sessionStorage.setItem('bolsa_last_userId', uid);
      localStorage.setItem('bolsa_userId', uid); // Persistencia extra

      // USAR apibolsaprofesionales.hitpoly.com para consistencia con el resto de la app
      const API_BOLSA = `https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php`;
      const API_EMPRESA = `https://apibolsaprofesionales.hitpoly.com/ajax/empresaController.php`;

      const ts = Date.now();

      const pBolsa = new URLSearchParams();
      pBolsa.append('accion', 'getProfessionalProfile');
      pBolsa.append('user_id', uid);

      const pEmpresa = new URLSearchParams();
      pEmpresa.append('accion', 'getCompanyContexts');
      pEmpresa.append('user_id', uid);

      const [resBolsa, resEmpresa] = await Promise.all([
        axios.post(`${API_BOLSA}?v=${ts}`, pBolsa),
        axios.post(`${API_EMPRESA}?v=${ts}`, pEmpresa)
      ]);

      let freshData = { professional: null, companies: [] };

      if (resBolsa.data.success && resBolsa.data.data && !Array.isArray(resBolsa.data.data)) {
        const profData = resBolsa.data.data;
        
        // AUTO-CURACIÓN: Si el nombre es genérico pero el frontend sabe más, lo corregimos
        const currentPath = window.location.pathname;
        const currentSearch = new URLSearchParams(window.location.search);
        
        // Si estamos en la página de perfil de este mismo usuario, el nombre debería estar en el header o URL
        if (profData.name && profData.name.includes('Usuario #')) {
           const cachedName = localStorage.getItem(`bolsa_name_backup_${uid}`);
           if (cachedName) {
             profData.name = cachedName;
           }
        } else if (profData.name && !profData.name.includes('Usuario #')) {
           // Si tenemos un nombre real, lo guardamos para el futuro
           localStorage.setItem(`bolsa_name_backup_${uid}`, profData.name);
        }

        freshData.professional = profData;
      } else {
        // Perfil vacío o inexistente
      }

      if (resEmpresa.data.success) {
        const companies = resEmpresa.data.companies || [];
        freshData.companies = companies;
      } else {
        // Endpoint falló
      }

      setUserContexts(freshData);
      
      try {
        localStorage.setItem('bolsa_contexts_cache', JSON.stringify(freshData));
      } catch (storageError) {
        // Error de storage
      }
      
      if (activeContext) {
        if (activeContext.type === 'professional' && freshData.professional) {
          // Mantener el tipo professional pero con los datos frescos
          setActiveContext({ ...freshData.professional, type: 'professional' });
        } else if (activeContext.type === 'enterprise') {
          const currentCompany = freshData.companies.find(c => c.id === activeContext.id);
          if (currentCompany) {
            setActiveContext({ ...currentCompany, type: 'enterprise' });
          } else if (activeContext.id !== 0 && freshData.companies.length > 0) {
            setActiveContext({ ...freshData.companies[0], type: 'enterprise' });
          } else if (activeContext.id === 0 && freshData.companies.length > 0 && window.location.pathname !== '/editar-empresa') {
             setActiveContext({ ...freshData.companies[0], type: 'enterprise' });
          }
        }
      } else {
        if (freshData.companies.length > 0) {
          setActiveContext({ ...freshData.companies[0], type: 'enterprise' });
        } else if (freshData.professional) {
          setActiveContext({ ...freshData.professional, type: 'professional' });
        } else {
          setActiveContext({ id: 0, type: 'professional', name: 'Mi Perfil' });
        }
      }
    } catch (e) {
      localStorage.removeItem('bolsa_contexts_cache');
      localStorage.removeItem('bolsa_contexts_cache');
      setUserContexts({ professional: null, companies: [] });
      setActiveContext({ id: 0, type: 'professional', name: 'Mi Perfil (Modo Seguro)' });
    }
  }, [activeContext]);

  useEffect(() => {

  }, [activeContext]);

  useEffect(() => {
    cargarContextos();
  }, []);

  const [headerData, setHeaderData] = useState({
    title: 'Bolsa de Empleo',
    subtitle: 'Oportunidades y talento profesional',
    icon: 'briefcase',
    color: '#0a66c2'
  });

  const [mobileActions, setMobileActions] = useState([]);

  const contextValue = useMemo(() => ({
    activeContext, setActiveContext, userContexts, cargarContextos,
    view, setView, headerData, setHeaderData,
    mobileActions, setMobileActions
  }), [activeContext, setActiveContext, userContexts, cargarContextos,
      view, setView, headerData, setHeaderData,
      mobileActions, setMobileActions]);

  return (
    <SystemContext.Provider value={contextValue}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}
