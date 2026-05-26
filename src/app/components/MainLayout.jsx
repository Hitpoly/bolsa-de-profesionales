import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Users, Building, User, ChevronDown, Settings, ArrowLeft, Sparkles, Briefcase, Eye, Save, Loader2, CheckCircle2, X, Plus, Send, Inbox, DollarSign } from 'lucide-react';
import { useSystem } from '../data/SystemContext';
import { ParentUrlSynchronizer } from './ParentUrlSynchronizer';
import ScrollToTop from './ScrollToTop';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeContext, setActiveContext, userContexts, setView, view, headerData, mobileActions, setMobileActions } = useSystem();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const renderIcon = () => {
    const props = { className: "w-5 h-5 text-white" };
    switch (headerData.icon) {
      case 'building': return <Building {...props} />;
      case 'sparkles': return <Sparkles {...props} />;
      case 'briefcase': return <Briefcase {...props} />;
      default: return <Users {...props} />;
    }
  };

  const renderMobileActionIcon = (action) => {
    const props = { className: "w-5 h-5" };
    switch (action.icon) {
      case 'eye': return <Eye {...props} />;
      case 'save': return <Save {...props} />;
      case 'loader': return <Loader2 {...props} className="w-5 h-5 animate-spin" />;
      case 'check': return <CheckCircle2 {...props} />;
      case 'arrow-left': return <ArrowLeft {...props} />;
      case 'x': return <X {...props} />;
      case 'dollar': return <DollarSign {...props} />;
      default: return null;
    }
  };

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const nonEditingRoutes = ['/', '/perfil/:userId'];
    const currentPath = location.pathname;

    const shouldClearActions = nonEditingRoutes.some(route => {
      if (route === '/') return currentPath === route;
      if (route.includes(':')) {
        const routePattern = new RegExp(`^${route.replace(/:\w+/g, '[^/]+')}$`);
        return routePattern.test(currentPath);
      }
      return false;
    });

    if (shouldClearActions) {
      setMobileActions([]);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [location.pathname, setMobileActions]);

  const getParentRoute = () => {
    const path = location.pathname;
    const userId = new URLSearchParams(window.location.search).get('userId') || sessionStorage.getItem('bolsa_last_userId');
    const suffix = userId ? `?userId=${userId}` : '';

    const effectiveType = activeContext?.type || sessionStorage.getItem('bolsa_last_context_type');
    const professionalTab = sessionStorage.getItem('bolsa_active_tab');
    const companyTab = sessionStorage.getItem('bolsa_company_active_tab');
    
    const profTabSuffix = professionalTab ? `&tab=${professionalTab}` : '';
    const compTabSuffix = companyTab ? `&tab=${companyTab}` : '';

    // Mapa de Jerarquía Estricto
    if (path.startsWith('/anuncio/')) return `/${suffix}`;
    if (path.startsWith('/postularme/')) {
        const adId = path.split('/')[2];
        return `/anuncio/${adId}${suffix}`;
    }
    if (path.startsWith('/postulacion/')) {
        return effectiveType === 'enterprise' ? `/editar-empresa${suffix}${compTabSuffix}` : `/editar-perfil${suffix}${profTabSuffix}`;
    }
    if (path === '/editar-perfil' || path === '/editar-empresa' || path.startsWith('/perfil/')) {
        return `/${suffix}`;
    }
    if (path.startsWith('/empresa/')) {
        const segments = path.split('/').filter(Boolean);
        if (segments.length >= 3 && segments[2] === 'vacantes') {
            return `/empresa/${segments[1]}${suffix}`;
        }
        return `/editar-empresa${suffix}${compTabSuffix}`;
    }
    if (path.startsWith('/servicio/')) {
        if (location.state?.fromProfile) return `/perfil/${location.state.fromProfile}${suffix}`;
        return `/${suffix}`;
    }
    if (path.startsWith('/editar-servicio/') || path.startsWith('/crear-servicio/')) {
        return `/editar-perfil${suffix}${profTabSuffix}`;
    }
    if (path === '/mis-postulaciones') {
        if (effectiveType === 'enterprise') {
            return `/editar-empresa${suffix}${compTabSuffix}`;
        }
        return `/${suffix}`;
    }

    return `/${suffix}`;
  };

  const handleBack = () => {
    if (typeof window.bolsaBackHandler === 'function') {
      window.bolsaBackHandler();
      return;
    }

    const parentRoute = getParentRoute();
    navigate(parentRoute);
  };

  const handleContextChange = (context) => {
    setActiveContext(context);
    setShowDropdown(false);
    
    // Al cambiar de contexto, reseteamos la pestaña activa para evitar inconsistencias
    sessionStorage.removeItem('bolsa_active_tab');

    const userId = new URLSearchParams(window.location.search).get('userId') || sessionStorage.getItem('bolsa_last_userId');
    const suffix = userId ? `?userId=${userId}` : '';
    const currentPath = location.pathname;

    // 1. Si estamos en cualquier página de edición o creación -> Ir a la raíz del nuevo editor
    if (currentPath.startsWith('/editar-') || 
        currentPath.startsWith('/crear-servicio/') || 
        currentPath.startsWith('/editar-servicio/')) {
      
      const targetBase = context.type === 'professional' ? '/editar-perfil' : '/editar-empresa';
      navigate(`${targetBase}${suffix}`);
      return;
    }

    // 2. Si estamos en una página de detalle (anuncio, postulación, perfil ajeno) -> Volver al Home con nuevo contexto
    if (currentPath !== '/') {
      navigate(`/${suffix}`);
      return;
    }

    // 3. Si ya estamos en el Home, forzamos navegación al Home con suffix para asegurar refresco de componentes
    navigate(`/${suffix}`);
  };

  const goToEditor = () => {
    if (!activeContext) {
      return;
    }
    const userId = new URLSearchParams(window.location.search).get('userId') || sessionStorage.getItem('bolsa_last_userId');
    const suffix = userId ? `?userId=${userId}` : '';
    const targetRoute = activeContext.type === 'professional' ? '/editar-perfil' : '/editar-empresa';
    if (activeContext.type === 'professional') {
      setView('profile');
    } else {
      setView('company');
    }
    navigate(`${targetRoute}${suffix}`);
    setShowDropdown(false);
  };

  const isEditingPage = 
    location.pathname.startsWith('/editar-servicio/') || 
    location.pathname.startsWith('/crear-servicio/') || 
    location.pathname === '/editar-perfil' || 
    location.pathname === '/editar-empresa';

  const isCompanyService = location.pathname.startsWith('/servicio/') && 
    (() => {
      try {
        const stored = JSON.parse(localStorage.getItem('last_active_company_service') || '{}');
        return location.state?.isCompanyService || stored.isCompanyService;
      } catch (e) {
        return false;
      }
    })();

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <ScrollToTop />
      <ParentUrlSynchronizer />
      {activeContext && !isEditingPage && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className={isCompanyService ? "w-full px-6 md:px-12 py-4" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {!isHomePage && (
                  <button
                    onClick={handleBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all items-center justify-center"
                    title="Volver"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                  </button>
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm shrink-0 ${!isHomePage ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    style={{ backgroundColor: headerData.color || '#0a66c2' }}
                    onClick={!isHomePage ? handleBack : undefined}
                  >
                    {renderIcon()}
                  </div>


                  <div
                    className={`flex flex-col min-w-0 relative ${!isHomePage ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    onClick={!isHomePage ? handleBack : undefined}
                  >
                    <h1 className="text-sm md:text-xl font-bold z-10 text-gray-900 tracking-tight leading-normal truncate max-w-[140px] md:max-w-none mb-[2px]">
                      {headerData.title}
                    </h1>
                    <p className="hidden md:block text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-none">
                      {headerData.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 sm:gap-2 mr-1">
                  {mobileActions.map(action => (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      title={action.title}
                      style={{ backgroundColor: action.color ? `${action.color}15` : 'transparent', color: action.color || '#6b7280' }}
                      className={`flex items-center gap-2 p-1.5 px-2 hover:bg-gray-100 rounded-full transition-all border border-transparent ${action.color ? 'border-current/10' : ''}`}
                    >
                      {renderMobileActionIcon(action)}
                      {action.title && (
                        <span className="hidden md:inline text-[10px] font-bold whitespace-nowrap uppercase tracking-wider">
                          {action.title}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="relative flex items-center gap-2" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all font-bold text-gray-700 text-xs shadow-sm ${showDropdown ? 'border-blue-400 ring-2 ring-blue-50' : ''}`}
                  >
                    {activeContext?.type === 'enterprise' ? <Building className="w-3.5 h-3.5 text-purple-600" /> : <User className="w-3.5 h-3.5 text-[#0a66c2]" />}
                    <span className="hidden md:inline max-w-[120px] truncate">
                      {activeContext?.name || 'Mi cuenta'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={goToEditor}
                    className="p-2 bg-gray-50 text-gray-400 hover:text-[#0a66c2] hover:bg-blue-50 rounded-full transition-all border border-gray-100"
                    title="Configurar perfil seleccionado"
                    style={{ zIndex: 10 }}
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="mb-2">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Empresas</div>
                        {userContexts.companies.map(company => (
                          <button
                            key={company.id}
                            onClick={() => handleContextChange({ ...company, type: 'enterprise' })}
                            className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2.5 rounded-lg transition-all ${activeContext?.id === company.id && activeContext?.type === 'enterprise' ? 'bg-blue-50 text-[#0a66c2] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            <div className={`p-1.5 rounded-md ${activeContext?.id === company.id && activeContext?.type === 'enterprise' ? 'bg-blue-100' : 'bg-gray-50'}`}>
                              <Building className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate flex-1">{company.name}</span>
                          </button>
                        ))}
                        
                        <button
                          onClick={() => {
                            setActiveContext({ type: 'enterprise', id: 0, name: 'Nueva Empresa' });
                            setView('company');
                            navigate('/editar-empresa');
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs flex items-center gap-2.5 rounded-lg transition-all text-[#0a66c2] hover:bg-blue-50 font-bold mt-1"
                        >
                          <div className="p-1.5 rounded-md bg-blue-50">
                            <span className="text-lg leading-none">+</span>
                          </div>
                          <span className="truncate flex-1">Crear Nueva Empresa</span>
                        </button>
                      </div>
                      {userContexts.professional && (
                        <div>
                          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personal</div>
                          <button
                            onClick={() => handleContextChange({ ...userContexts.professional, type: 'professional' })}
                            className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2.5 rounded-lg transition-all ${activeContext?.type === 'professional' ? 'bg-blue-50 text-[#0a66c2] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            <div className={`p-1.5 rounded-md ${activeContext?.type === 'professional' ? 'bg-blue-100' : 'bg-gray-50'}`}>
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate flex-1">
                              {userContexts.professional.name || userContexts.professional.nombre || 'Mi Perfil Personal'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}
