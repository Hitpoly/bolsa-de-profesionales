import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, DollarSign, Clock, MessageSquare, Briefcase, User, CheckCircle, XCircle, Target, CheckCircle2, Wrench, Eye, Save, CheckCircle as CheckIcon, Link, CalendarDays, Banknote } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../data/SystemContext';

const API_POSTULACIONES = 'https://apibolsaprofesionales.hitpoly.com/ajax/postulaciones.php';

export function ApplicationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeContext } = useSystem();

    const [p, setPostulacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [detalle, setDetalle] = useState({ mayor_logro: '', resolucion_problema: '', trabajo_bajo_presion: 1, tipo_liderazgo: '', habilidades_blandas: [], experiencia_anos: '', trabajo_remoto_experiencia: 0, objetivo_corto_plazo: '', referencias_disponibles: 1 });

    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef(null);
    const tooltipTimeout = useRef(null);

    const isEnterprise = activeContext?.type === 'enterprise';

    const handleTooltipEnter = () => {
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
        setShowTooltip(true);
    };

    const handleTooltipLeave = () => {
        tooltipTimeout.current = setTimeout(() => {
            setShowTooltip(false);
        }, 1000);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setShowTooltip(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
        };
    }, []);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.post(API_POSTULACIONES, { accion: 'getPostulacionById', id });
                if (res.data.success) {
                    const data = res.data.data;
                    setPostulacion(data);
                    // Precargar el formulario de detalles con datos existentes
                    setDetalle({
                        mayor_logro: data.mayor_logro ?? '',
                        resolucion_problema: data.resolucion_problema ?? '',
                        trabajo_bajo_presion: data.trabajo_bajo_presion ?? 1,
                        tipo_liderazgo: data.tipo_liderazgo ?? '',
                        habilidades_blandas: data.habilidades_blandas ? (typeof data.habilidades_blandas === 'string' ? JSON.parse(data.habilidades_blandas) : data.habilidades_blandas) : [],
                        experiencia_anos: data.experiencia_anos ?? '',
                        trabajo_remoto_experiencia: data.trabajo_remoto_experiencia ?? 0,
                        objetivo_corto_plazo: data.objetivo_corto_plazo ?? '',
                        referencias_disponibles: data.referencias_disponibles ?? 1
                    });
                }
            } catch (e) {
                console.error("Error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const updateEstado = async (nuevoEstado) => {
        setUpdating(true);
        try {
            const res = await axios.post(API_POSTULACIONES, { accion: 'updateEstadoPostulacion', id, estado: nuevoEstado });
            if (res.data.success) {
                setPostulacion({ ...p, estado: nuevoEstado });
            }
        } catch (e) {
            alert("Error al actualizar");
        } finally {
            setUpdating(false);
        }
    };



    if (loading) return <div className="p-20 text-center animate-pulse">Cargando detalles...</div>;
    if (!p) return <div className="p-20 text-center">No se encontró la postulación</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col">
                {/* Cabecera (Hero) - Ocupa TODO el ancho */}
                <div className="bg-[#0a66c2] p-8 md:p-12 text-white shrink-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <span className="px-3 py-1 bg-blue-400/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                                Detalles de Postulación
                            </span>
                            <h1 className="text-3xl md:text-4xl font-black">{p.anuncio_titulo}</h1>
                            <div className="mt-4 flex flex-col gap-3 text-blue-100 font-medium">
                                {/* Fila superior: Perfil y Botón de Mensaje */}
                                <div className="flex flex-wrap items-center gap-4">
                                    {isEnterprise ? (
                                        <>
                                            <div className="relative" ref={tooltipRef}>
                                                <div
                                                    className="flex items-center gap-3 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-all"
                                                    onMouseEnter={handleTooltipEnter}
                                                    onMouseLeave={handleTooltipLeave}
                                                >
                                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
                                                        {p.postulante_avatar ? (
                                                            <img src={p.postulante_avatar} className="w-full h-full object-cover" alt="" />
                                                        ) : <User className="w-4 h-4" />}
                                                    </div>
                                                    <span className="font-bold text-white">{p.postulante_nombre || 'Candidato'}</span>
                                                </div>

                                                {/* Tooltip con botón al perfil */}
                                                {showTooltip && (
                                                    <div
                                                        className="absolute top-full left-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                                                        onMouseEnter={handleTooltipEnter}
                                                        onMouseLeave={handleTooltipLeave}
                                                    >
                                                        <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-2xl border border-gray-100 min-w-[200px]">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Acción Rápida</p>
                                                            <button
                                                                onClick={() => navigate(`/perfil/${p.user_id}${window.location.search}`)}
                                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0a66c2] text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                                                            >
                                                                <Eye className="w-4 h-4" /> VER PERFIL COMPLETO
                                                            </button>
                                                        </div>
                                                        <div className="absolute top-[-6px] left-8 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-100"></div>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Botón de mensaje */}
                                            <button 
                                                onClick={() => {
                                                    const partnerId = p.postulante_profile_id;
                                                    const partnerName = p.postulante_nombre;
                                                    const partnerAvatar = p.postulante_avatar;
                                                    
                                                    if (window.parent !== window) {
                                                        window.parent.postMessage({ 
                                                            type: 'OPEN_FLOATING_CHAT', 
                                                            myId: p.empresa_id,
                                                            partner: {
                                                                id: partnerId,
                                                                name: partnerName,
                                                                avatar: partnerAvatar,
                                                                type: 'professional'
                                                            }
                                                        }, '*');
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold text-sm transition-all backdrop-blur-sm"
                                            >
                                                <MessageSquare className="w-4 h-4" /> Mensaje
                                            </button>
                                        </>
                                    ) : p.empresa_nombre ? (
                                        <>
                                            <div className="flex items-center gap-3 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
                                                    {p.empresa_logo ? (
                                                        <img src={p.empresa_logo} className="w-full h-full object-cover bg-white" alt="" />
                                                    ) : <Briefcase className="w-4 h-4" />}
                                                </div>
                                                <span className="font-bold text-white">{p.empresa_nombre}</span>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const partnerId = p.empresa_id;
                                                    const partnerName = p.empresa_nombre;
                                                    const partnerAvatar = p.empresa_logo;
                                                    
                                                    if (window.parent !== window) {
                                                        window.parent.postMessage({ 
                                                            type: 'OPEN_FLOATING_CHAT', 
                                                            myId: p.postulante_profile_id,
                                                            partner: {
                                                                id: partnerId,
                                                                name: partnerName,
                                                                avatar: partnerAvatar,
                                                                type: 'enterprise'
                                                            }
                                                        }, '*');
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold text-sm transition-all backdrop-blur-sm"
                                            >
                                                <MessageSquare className="w-4 h-4" /> Mensaje
                                            </button>
                                        </>
                                    ) : null}
                                </div>

                                {/* Fila inferior: Fecha de postulación */}
                                <p className="flex items-center gap-2 text-sm mt-1">
                                    <Clock className="w-4 h-4" /> Postulado el {new Date(p.fecha_creacion).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                            {/* Badge de estado */}
                            <div className="bg-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/20 w-full flex items-center justify-end gap-3">
                                <span className="text-xs font-black uppercase tracking-wider opacity-70">Estado Actual:</span>
                                <span className="text-lg font-black capitalize text-white">{p.estado}</span>
                            </div>
                            {/* Botones de acción para empresa (en header) */}
                            {isEnterprise && p.estado === 'pendiente' && (
                                <div className="flex gap-2 w-full justify-end">
                                    <button
                                        disabled={updating}
                                        onClick={() => updateEstado('aceptado')}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white font-black rounded-xl transition-all text-sm shadow-lg shadow-green-900/30 disabled:opacity-50"
                                    >
                                        <CheckCircle className="w-4 h-4" /> ACEPTAR
                                    </button>
                                    <button
                                        disabled={updating}
                                        onClick={() => updateEstado('rechazado')}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black rounded-xl transition-all text-sm backdrop-blur-sm disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" /> RECHAZAR
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contenedor Inferior Dividido */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12 p-8 md:p-12 min-h-[600px] flex-1 bg-gray-50/50">

                    {/* Columna 1: Propuesta Económica */}
                    <div className="bg-white p-6 rounded-3xl border-2 border-gray-50 space-y-8 flex flex-col h-full">
                        <section>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Propuesta Económica
                            </h3>
                            <p className="text-4xl font-black text-gray-900">
                                {p.propuesta_pago ? `USD ${Number(p.propuesta_pago).toLocaleString()}` : 'No especificada'}
                            </p>
                        </section>

                        {/* Bloque de Análisis de Compensación */}
                        {(() => {
                            const propuesta = parseFloat(p.propuesta_pago);
                            const base = parseFloat(p.anuncio_salario_max) || parseFloat(p.anuncio_salario_min);
                            if (!propuesta || !base) return null;

                            const diferencia = propuesta - base;
                            const porcentaje = ((diferencia / base) * 100).toFixed(1);
                            const esAhorro = diferencia < 0;
                            const esIgual = diferencia === 0;

                            return (
                                <section className="bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Análisis de Compensación</p>

                                    {/* Fila: Precio base empresa */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                            <span className="text-xs font-bold text-gray-500">Precio base empresa</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-800">
                                            USD {base.toLocaleString()}
                                            {p.anuncio_salario_max && parseFloat(p.anuncio_salario_max) !== base && (
                                                <span className="text-gray-400 font-medium"> – {Number(p.anuncio_salario_max).toLocaleString()}</span>
                                            )}
                                        </span>
                                    </div>

                                    {/* Fila: Propuesta del candidato */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            <span className="text-xs font-bold text-gray-500">Propuesta del candidato</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-800">USD {propuesta.toLocaleString()}</span>
                                    </div>

                                    {/* Divisor */}
                                    <div className="border-t border-slate-200"></div>

                                    {/* Resultado: % y monto */}
                                    {esIgual ? (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-gray-500 uppercase">Diferencia</span>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-black">Sin diferencia</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-[10px] sm:text-xs font-black text-gray-500 uppercase mt-1 shrink min-w-0 truncate">
                                                    {esAhorro ? '💰 Ahorro para la empresa' : '⚠️ Excede el presupuesto'}
                                                </span>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black ${esAhorro ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {esAhorro ? '' : '+'}{porcentaje}%
                                                    </span>
                                                    <span className={`text-[10px] sm:text-xs font-black ${esAhorro ? 'text-green-700' : 'text-red-600'}`}>
                                                        {esAhorro ? '-' : '+'}USD {Math.abs(diferencia).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Barra visual de comparación */}
                                            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`absolute left-0 h-full rounded-full transition-all ${esAhorro ? 'bg-green-400' : 'bg-red-400'}`}
                                                    style={{ width: `${Math.min((propuesta / (esAhorro ? base : propuesta)) * 100, 100)}%` }}
                                                ></div>
                                                {!esAhorro && (
                                                    <div
                                                        className="absolute h-full bg-blue-300 rounded-full"
                                                        style={{ width: `${(base / propuesta) * 100}%` }}
                                                    ></div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </section>
                            );
                        })()}

                        <section>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Mensaje / Carta de Presentación
                            </h3>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic text-gray-700 leading-relaxed">
                                "{p.mensaje || 'Sin mensaje'}"
                            </div>
                        </section>

                    </div>

                    {/* Columna 2: Condiciones y Acciones */}
                    <div className="space-y-8 flex flex-col h-full">
                        {/* Nueva Sección: Evaluación de Perfil / Match */}
                        {p.respuestas_cuestionario && (
                            <section className="bg-white p-6 rounded-3xl border-2 border-gray-50 space-y-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-4 h-4 text-blue-600" /> Evaluación de Perfil
                                </h3>

                                {/* Requisitos */}
                                {p.respuestas_cuestionario.requisitos && Object.keys(p.respuestas_cuestionario.requisitos).length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Requisitos Técnicos</p>
                                        {Object.entries(p.respuestas_cuestionario.requisitos).map(([req, match], idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                {match ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <XCircle className="w-4 h-4 text-gray-300 shrink-0" />}
                                                <span className={`text-xs font-bold ${match ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{req}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Responsabilidades */}
                                {p.respuestas_cuestionario.responsabilidades && Object.keys(p.respuestas_cuestionario.responsabilidades).length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Compromisos de Rol</p>
                                        {Object.entries(p.respuestas_cuestionario.responsabilidades).map(([res, match], idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                {match ? <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> : <XCircle className="w-4 h-4 text-gray-300 shrink-0" />}
                                                <span className={`text-xs font-bold ${match ? 'text-gray-800' : 'text-gray-400'}`}>{res}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Herramientas */}
                                {p.respuestas_cuestionario.herramientas && Object.keys(p.respuestas_cuestionario.herramientas).length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Herramientas Dominadas</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(p.respuestas_cuestionario.herramientas).map(([her, match], idx) => (
                                                match && (
                                                    <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg border border-indigo-100 flex items-center gap-1">
                                                        <Wrench className="w-3 h-3" /> {her}
                                                    </span>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        <section>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> Disponibilidad / Condiciones
                            </h3>
                            <p className="text-gray-900 font-bold bg-blue-50 p-4 rounded-xl inline-block border border-blue-100 w-full">
                                {p.condiciones || 'Sin condiciones especiales'}
                            </p>
                        </section>





                        {!isEnterprise && (
                            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                                <p className="text-blue-800 text-sm font-medium leading-relaxed">
                                    Tu postulación está siendo revisada por la empresa. También puedes <span className="font-black">enviar un mensaje directo a la empresa</span> usando el chat de la derecha y esperar su respuesta.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Columna 3: Información Adicional del Profesional */}
                    <div className="flex flex-col h-full">
                        <div className="bg-white p-6 rounded-3xl border-2 border-gray-50 space-y-5 overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" /> Perfil Profundo del Candidato
                                </h3>
                            </div>

                            {/* Años de experiencia + trabajo remoto */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">⏳ Años de exp. relevante</p>
                                    <p className="text-sm font-bold text-gray-800 bg-gray-50 rounded-xl px-3 py-2.5">{detalle.experiencia_anos || '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🌐 Exp. en remoto</p>
                                    <p className={`text-sm font-bold rounded-xl px-3 py-2.5 ${detalle.trabajo_remoto_experiencia == 1 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                                        {detalle.trabajo_remoto_experiencia == 1 ? 'Sí' : 'No'}
                                    </p>
                                </div>
                            </div>

                            {/* Trabajo bajo presión */}
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🔥 ¿Trabaja bien bajo presión?</p>
                                <p className={`text-sm font-bold rounded-xl px-3 py-2.5 ${detalle.trabajo_bajo_presion == 1 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {detalle.trabajo_bajo_presion == 1 ? '✅ Sí, con facilidad' : '🔄 Prefiere ritmo estable'}
                                </p>
                            </div>

                            {/* Tipo de liderazgo */}
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">👥 Estilo de liderazgo / rol en equipo</p>
                                <p className="text-sm font-bold text-purple-700 bg-purple-50 rounded-xl px-3 py-2.5">
                                    {detalle.tipo_liderazgo || '—'}
                                </p>
                            </div>

                            {/* Habilidades blandas — solo las seleccionadas */}
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">💡 Habilidades blandas destacadas</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(detalle.habilidades_blandas || []).length > 0
                                        ? (detalle.habilidades_blandas || []).map(h => (
                                            <span key={h} className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-600 text-white border border-blue-600">{h}</span>
                                        ))
                                        : <span className="text-xs text-gray-400 italic">Sin habilidades seleccionadas</span>
                                    }
                                </div>
                            </div>

                            {/* Mayor logro */}
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🏆 Mayor logro profesional</p>
                                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 leading-relaxed min-h-[40px]">
                                    {detalle.mayor_logro || <span className="text-gray-400 italic">Sin respuesta</span>}
                                </div>
                            </div>

                            {/* Resolución de problema */}
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🧩 Cómo resolvió un problema difícil</p>
                                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 leading-relaxed min-h-[40px]">
                                    {detalle.resolucion_problema || <span className="text-gray-400 italic">Sin respuesta</span>}
                                </div>
                            </div>

                            {/* Objetivo corto plazo */}
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🎯 Objetivo profesional a corto plazo</p>
                                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 leading-relaxed min-h-[40px]">
                                    {detalle.objetivo_corto_plazo || <span className="text-gray-400 italic">Sin respuesta</span>}
                                </div>
                            </div>

                            {/* Referencias */}
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">📞 Referencias profesionales</p>
                                <p className={`text-sm font-bold rounded-xl px-3 py-2.5 ${detalle.referencias_disponibles == 1 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                    {detalle.referencias_disponibles == 1 ? '✅ Sí, puede presentarlas' : '❌ No por el momento'}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
