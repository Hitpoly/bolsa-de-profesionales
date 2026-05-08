import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface HeaderData {
  title: string;
  subtitle: string;
  icon: 'users' | 'building' | 'sparkles' | 'briefcase';
  color?: string;
}

export interface MobileAction {
  id: string;
  icon: 'eye' | 'save' | 'check' | 'loader';
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  title?: string;
}

interface SystemContextType {
  activeContext: any;
  setActiveContext: (context: any) => void;
  userContexts: { professional: any; companies: any[] };
  cargarContextos: () => Promise<void>;
  view: string;
  setView: (view: string) => void;
  headerData: HeaderData;
  setHeaderData: (data: HeaderData) => void;
  mobileActions: MobileAction[];
  setMobileActions: (actions: MobileAction[]) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState('search');
  const [userContexts, setUserContexts] = useState<{
    professional: any | null;
    companies: any[];
  }>(() => {
    const saved = localStorage.getItem('bolsa_contexts_cache');
    return saved ? JSON.parse(saved) : { professional: null, companies: [] };
  });

  const [activeContext, setActiveContext] = useState<any>(() => {
    const saved = localStorage.getItem('bolsa_contexts_cache');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.companies && data.companies.length > 0) {
        return { ...data.companies[0], type: 'enterprise' };
      }
      if (data.professional) {
        return { ...data.professional, type: 'professional' };
      }
    }
    return null;
  });

  const cargarContextos = async () => {
    try {
      const uid = new URLSearchParams(window.location.search).get('userId') || new URLSearchParams(window.location.search).get('user_id');
      if (!uid) return;

      const response = await axios.post('https://apiweb.hitpoly.com/ajax/bolsaController.php', {
        accion: 'getUserContexts',
        userId: uid
      });

      if (response.data.success) {
        setUserContexts(response.data.data);
        localStorage.setItem('bolsa_contexts_cache', JSON.stringify(response.data.data));
        
        // Prioridad: Empresa > Profesional
        if (!activeContext) {
           if (response.data.data.companies.length > 0) {
             setActiveContext({ ...response.data.data.companies[0], type: 'enterprise' });
           } else if (response.data.data.professional) {
             setActiveContext({ ...response.data.data.professional, type: 'professional' });
           }
        }
      }
    } catch (e) {
      console.error("Error cargando contextos:", e);
    }
  };

  useEffect(() => {
    cargarContextos();
  }, []);

  const [headerData, setHeaderData] = useState<HeaderData>({
    title: 'Bolsa de Empleo',
    subtitle: 'Oportunidades y talento profesional',
    icon: 'briefcase',
    color: '#0a66c2'
  });

  const [mobileActions, setMobileActions] = useState<MobileAction[]>([]);

  return (
    <SystemContext.Provider value={{ 
      activeContext, setActiveContext, userContexts, cargarContextos, 
      view, setView, headerData, setHeaderData,
      mobileActions, setMobileActions 
    }}>
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
