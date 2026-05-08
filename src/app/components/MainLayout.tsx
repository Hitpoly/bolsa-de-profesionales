import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Users, Building, User, ChevronDown, Settings, ArrowLeft, Sparkles, Briefcase, Eye, Save, Loader2, CheckCircle2, X } from 'lucide-react';
import { useSystem, MobileAction } from '../data/SystemContext';
import { ParentUrlSynchronizer } from './ParentUrlSynchronizer';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeContext, setActiveContext, userContexts, setView, view, headerData, mobileActions, setMobileActions } = useSystem();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const renderIcon = () => {
    const props = { className: "w-5 h-5 text-white" };
    switch (headerData.icon) {
      case 'building': return <Building {...props} />;
      case 'sparkles': return <Sparkles {...props} />;
      case 'briefcase': return <Briefcase {...props} />;
      default: return <Users {...props} />;
    }
  };

  const renderMobileActionIcon = (action: MobileAction) => {
    const props = { className: "w-5 h-5" };
    switch (action.icon) {
      case 'eye': return <Eye {...props} />;
      case 'save': return <Save {...props} />;
      case 'loader': return <Loader2 {...props} className="w-5 h-5 animate-spin" />;
      case 'check': return <CheckCircle2 {...props} />;
      case 'x' as any: return <X {...props} />;
      default: return null;
    }
  };

  // Detectar si estamos en una página de perfil o en un editor (no en búsqueda)
  const isOnProfilePage = location.pathname.startsWith('/perfil/');
  const isNotOnSearch = view !== 'search' || isOnProfilePage;

  useEffect(() => {
    // Rutas donde los botones de edición NO deben aparecer
    const nonEditingRoutes = ['/', '/perfil/:userId'];
    const currentPath = location.pathname;

    const shouldClearActions = nonEditingRoutes.some(route => {
      if (route === '/') return currentPath === route;
      // Para rutas dinámicas como /perfil/:userId
      if (route.includes(':')) {
        const routePattern = new RegExp(`^${route.replace(/:\w+/g, '[^/]+')}$`);
        return routePattern.test(currentPath);
      }
      return false;
    });

    if (shouldClearActions) {
      setMobileActions([]);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [location.pathname, setMobileActions]); // Dependencia de location.pathname y setMobileActions

  const handleBack = () => {
    if (typeof (window as any).bolsaBackHandler === 'function') {
      (window as any).bolsaBackHandler();
      return;
    }
    setView('search');
    navigate('/');
  };

  const handleContextChange = (context: any) => {
    setActiveContext(context);
    setShowDropdown(false);
    
    // Si ya estamos en modo edición, cambiamos al editor del nuevo contexto
    if (view !== 'search') {
      if (context.type === 'professional') {
        setView('profile');
      } else {
        setView('company');
      }
      navigate('/');
    }
  };

  const goToEditor = () => {
    if (!activeContext) return;
    if (activeContext.type === 'professional') {
      setView('profile');
    } else {
      setView('company');
    }
    navigate('/');
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <ParentUrlSynchronizer />
      {activeContext && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {/* Escritorio: flecha ANTES del icono azul (solo cuando no estamos en búsqueda) */}
                {isNotOnSearch && (
                  <button
                    onClick={handleBack}
                    className="hidden md:flex p-2 hover:bg-gray-100 rounded-full transition-all items-center justify-center"
                    title="Volver"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                  </button>
                )}

                <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
                  {/* Móvil: la flecha REEMPLAZA al icono azul cuando NO estamos en búsqueda */}
                  {isNotOnSearch ? (
                    <div className="md:hidden w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </div>
                  ) : null}
                  {/* Icono azul: siempre visible en escritorio, solo en búsqueda en móvil */}
                  <div 
                    className={`w-10 h-10 rounded-lg items-center justify-center shadow-sm ${isNotOnSearch ? 'hidden md:flex' : 'flex'}`}
                    style={{ backgroundColor: headerData.color || '#0a66c2' }}
                  >
                    {renderIcon()}
                  </div>
                  {/* Texto: visible en escritorio y móvil (versión compacta) */}
                  <div className="flex flex-col min-w-0">
                    <h1 className="text-sm md:text-xl font-bold text-gray-900 tracking-tight leading-none truncate max-w-[140px] md:max-w-none">
                      {headerData.title}
                    </h1>
                    <p className="hidden md:block text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider">
                      {headerData.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Botones de acción específicos */}
                <div className="flex items-center gap-1 sm:gap-2 mr-1">
                    {mobileActions.map(action => (
                        <button
                            key={action.id}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            title={action.title}
                            style={{ backgroundColor: action.color ? `${action.color}15` : 'transparent', color: action.color || '#6b7280' }}
                            className={`flex items-center gap-2 p-2 px-3 hover:bg-gray-100 rounded-full transition-all border border-transparent ${action.color ? 'border-current/10' : ''}`}
                        >
                            {renderMobileActionIcon(action)}
                            {action.title && (
                                <span className="hidden md:inline text-xs font-bold whitespace-nowrap">
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
                    <span className="hidden md:inline max-w-[120px] truncate">{activeContext?.name || 'Mi cuenta'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <button 
                    onClick={goToEditor}
                    className="p-2 bg-gray-50 text-gray-400 hover:text-[#0a66c2] hover:bg-blue-50 rounded-full transition-all border border-gray-100"
                    title="Configurar perfil seleccionado"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {userContexts.companies.length > 0 && (
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
                          </div>
                        )}

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
                              <span className="truncate flex-1">{userContexts.professional.name}</span>
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
