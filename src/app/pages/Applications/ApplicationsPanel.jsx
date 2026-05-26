import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Send, Inbox, ChevronRight, ChevronDown, Clock, CheckCircle, XCircle, Filter, Search, Briefcase, User, Target, CheckCircle2, Wrench } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../data/SystemContext';

const API_POSTULACIONES = 'https://apibolsaprofesionales.hitpoly.com/ajax/postulaciones.php';

export function ApplicationsPanel() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { activeContext, userContexts } = useSystem();
    
    // Búsqueda agresiva del ID
    const effectiveUserId = useMemo(() => {
        const queryParams = new URLSearchParams(location.search);
        const fromRouter = queryParams.get('userId');
        const fromWindow = new URLSearchParams(window.location.search).get('userId');
        const fromStorage = localStorage.getItem('bolsa_userId') || sessionStorage.getItem('bolsa_last_userId');
        return user?.id || fromRouter || fromWindow || fromStorage;
    }, [user?.id, location.search]);

    const [viewMode, setViewMode] = useState(activeContext?.type === 'enterprise' ? 'enterprise' : 'professional');
    const [postulaciones, setPostulaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [adFilter, setAdFilter] = useState('all');

    const isEnterpriseView = viewMode === 'enterprise';

    // Lista única de anuncios para el filtro
    const adsList = useMemo(() => {
        const ads = postulaciones.map(p => p.anuncio_titulo).filter(Boolean);
        return ['all', ...new Set(ads)];
    }, [postulaciones]);

    useEffect(() => {
        const fetchPostulaciones = async () => {
            let empresaId = userContexts.enterprise?.id || activeContext?.id;


            
            if (!effectiveUserId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const accion = isEnterpriseView ? 'getPostulacionesByEmpresa' : 'getPostulacionesByUser';


                const res = await axios.post(API_POSTULACIONES, { 
                    accion: accion, 
                    user_id: effectiveUserId,
                    empresa_id: empresaId
                });
                


                if (res.data.success) {
                    setPostulaciones(res.data.data);
                }
            } catch (e) {

            } finally {
                setLoading(false);
            }
        };
        fetchPostulaciones();
    }, [effectiveUserId, viewMode, userContexts.enterprise?.id]);

    const filteredList = useMemo(() => {
        return postulaciones.filter(p => {
            const matchesStatus = filter === 'all' || p.estado === filter;
            const matchesAd = adFilter === 'all' || p.anuncio_titulo === adFilter;
            return matchesStatus && matchesAd;
        });
    }, [postulaciones, filter, adFilter]);

    const getStatusStyle = (estado) => {
        switch (estado) {
            case 'aceptado': return 'bg-green-50 text-green-700 border-green-100';
            case 'rechazado': return 'bg-red-50 text-red-700 border-red-100';
            case 'visto': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-400 font-bold animate-pulse">Sincronizando tus postulaciones...</div>;

    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            {/* Selector de Modo (Elite) */}
            {!activeContext && (
                <div className="flex gap-4 mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit">
                    <button 
                        onClick={() => setViewMode('professional')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'professional' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Send className="w-4 h-4" /> Mis Propuestas
                    </button>
                    {userContexts.enterprise && (
                        <button 
                            onClick={() => setViewMode('enterprise')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'enterprise' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Inbox className="w-4 h-4" /> Candidatos Recibidos
                        </button>
                    )}
                </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        {isEnterpriseView ? 'Gestión de Candidatos' : 'Seguimiento de Propuestas'}
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        {isEnterpriseView ? 'Personas que se han postulado a tus anuncios de Hitpoly.' : 'Propuestas que has enviado a empresas de la bolsa.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                        {['all', 'pendiente', 'aceptado', 'rechazado'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {f === 'all' ? 'Todo' : f}
                            </button>
                        ))}
                        
                        {isEnterpriseView && adsList.length > 1 && (
                            <div className="relative group ml-1 border-l border-gray-200 pl-1">
                                <select 
                                    value={adFilter}
                                    onChange={(e) => setAdFilter(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    title="Filtrar por anuncio"
                                >
                                    <option value="all">Todos los anuncios</option>
                                    {adsList.filter(a => a !== 'all').map(ad => (
                                        <option key={ad} value={ad}>{ad}</option>
                                    ))}
                                </select>
                                <button className={`p-2 rounded-xl transition-all ${adFilter !== 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                                    <Filter className="w-5 h-5" />
                                </button>
                                {adFilter !== 'all' && (
                                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border border-white"></div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {filteredList.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Filter className="text-gray-300 w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay nada por aquí</h3>
                    <p className="text-gray-500">Todavía no tienes postulaciones con estos criterios.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredList.map((p) => (
                        <div 
                            key={p.id}
                            onClick={() => navigate(`/postulacion/${p.id}` + window.location.search)}
                            className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            {/* Estado en esquina superior para móviles, en línea para desktop */}
                            <div className="absolute top-4 right-4 md:static md:flex md:items-center md:order-last">
                                <span className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(p.estado)}`}>
                                    {p.estado}
                                </span>
                            </div>

                            <div className="flex items-start md:items-center gap-4 md:gap-6 mt-6 md:mt-0">
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 ${isEnterpriseView ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                    {isEnterpriseView ? (
                                        p.postulante_avatar ? <img src={p.postulante_avatar} className="w-full h-full object-cover" alt="" /> : <User className="w-6 h-6 md:w-7 md:h-7" />
                                    ) : (
                                        p.empresa_logo ? <img src={p.empresa_logo} className="w-full h-full object-cover" alt={p.empresa_nombre || "Empresa"} /> : <Briefcase className="w-6 h-6 md:w-7 md:h-7" />
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {isEnterpriseView ? (p.postulante_nombre || 'Candidato') : p.anuncio_titulo}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1.5">
                                        {isEnterpriseView && (
                                            <p className="text-xs md:text-sm text-blue-600 font-bold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-lg">
                                                <Briefcase className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                {p.anuncio_titulo}
                                            </p>
                                        )}
                                        {!isEnterpriseView && p.empresa_nombre && (
                                            <p className="text-xs md:text-sm text-blue-600 font-bold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-lg">
                                                <Briefcase className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                {p.empresa_nombre}
                                            </p>
                                        )}
                                        <p className="text-xs md:text-sm text-gray-500 font-medium flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(p.fecha_creacion).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs md:text-sm font-black text-green-600 bg-green-50/50 px-2 py-0.5 rounded-lg border border-green-100">
                                            {p.propuesta_pago ? `USD ${Number(p.propuesta_pago).toLocaleString()}` : 'Sin propuesta'}
                                        </p>
                                        {(() => {
                                            const propuesta = parseFloat(p.propuesta_pago);
                                            const base = parseFloat(p.anuncio_salario_max) || parseFloat(p.anuncio_salario_min);
                                            if (!propuesta || !base) return null;
                                            const diferencia = propuesta - base;
                                            if (diferencia === 0) return null;
                                            const porcentaje = Math.abs((diferencia / base) * 100).toFixed(1);
                                            const esAhorro = diferencia < 0;
                                            return (
                                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] md:text-[10px] font-black ${esAhorro ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                    {esAhorro ? '💰' : '⚠️'} {esAhorro ? '-' : '+'}{porcentaje}% · {esAhorro ? '-' : '+'}USD {Math.abs(diferencia).toLocaleString()}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Chevron / Ver más abajo en móviles */}
                            <div className="flex items-center justify-end md:order-last mt-2 md:mt-0 pt-2 md:pt-0 border-t border-gray-50 md:border-t-0">
                                <span className="md:hidden text-xs font-bold text-blue-500 mr-2 group-hover:text-blue-600">Ver postulación</span>
                                <ChevronRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all w-5 h-5" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
