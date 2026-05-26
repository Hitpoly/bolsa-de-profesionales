import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Rocket, DollarSign, Send, ChevronLeft, CheckCircle2, ListChecks, Briefcase, Target, Wrench, List, User, Clock, MessageSquare, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../data/SystemContext';

const API_ANUNCIOS = 'https://apibolsaprofesionales.hitpoly.com/ajax/anuncios.php';
const API_POSTULACIONES = 'https://apibolsaprofesionales.hitpoly.com/ajax/postulaciones.php';

export function ApplicationForm() {
    const { adId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { userContexts } = useSystem();
    
    // Búsqueda agresiva del ID: Contexto > URL (React Router) > URL (Window) > LocalStorage
    const effectiveUserId = useMemo(() => {
        const queryParams = new URLSearchParams(location.search);
        const fromRouter = queryParams.get('userId');
        const fromWindow = new URLSearchParams(window.location.search).get('userId');
        const fromStorage = localStorage.getItem('bolsa_userId') || sessionStorage.getItem('bolsa_last_userId');
        
        return user?.id || fromRouter || fromWindow || fromStorage;
    }, [user?.id, location.search]);

    // Obtener datos del perfil profesional para la postulación
    const profProfile = userContexts.professional;
    
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        propuesta_pago: '',
        condiciones: '',
        mensaje: '',
        match_requisitos: {},
        match_responsabilidades: {},
        match_herramientas: {},
        // Perfil Profundo
        experiencia_anos: '',
        trabajo_remoto_experiencia: 0,
        trabajo_bajo_presion: 1,
        tipo_liderazgo: '',
        habilidades_blandas: [],
        mayor_logro: '',
        resolucion_problema: '',
        objetivo_corto_plazo: '',
        referencias_disponibles: 1
    });

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const res = await axios.post(API_ANUNCIOS, { accion: 'getAnuncioById', id: adId });
                if (res.data.success) {
                    const adData = res.data.data;
                    setAd(adData);
                    setFormData(prev => ({ 
                        ...prev, 
                        propuesta_pago: adData.salario_max,
                        match_requisitos: (adData.requisitos || []).reduce((acc, cur) => ({ ...acc, [cur]: false }), {}),
                        match_responsabilidades: (adData.responsabilidades || []).reduce((acc, cur) => ({ ...acc, [cur]: false }), {}),
                        match_herramientas: (adData.herramientas || []).reduce((acc, cur) => ({ ...acc, [cur]: false }), {})
                    }));
                }
            } catch (e) {
                console.error("Error cargando anuncio:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAd();
    }, [adId]);

    const handleToggleMatch = (section, item) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [item]: !prev[section][item]
            }
        }));
    };

    // Pre-calcular identidad para mostrarla en el frontend antes de enviar
    const identity = useMemo(() => {
        // PRIORIZAR EL PERFIL PROFESIONAL SOBRE EL PRINCIPAL
        const avatarCandidates = [profProfile?.custom_avatar, profProfile?.avatar, profProfile?.foto, user?.avatar, user?.foto];
        // Relajamos la restricción: Permitimos HTTP y Data URIs (base64)
        const validAvatar = avatarCandidates.find(url => typeof url === 'string' && (url.startsWith('http') || url.startsWith('data:image')));
        
        return {
            postulante_nombre: profProfile?.name || profProfile?.nombre || user?.name || 'Candidato',
            postulante_avatar: validAvatar || null
        };
    }, [user, profProfile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log("=== INICIANDO SUBMIT DE POSTULACIÓN ===");
        console.log("Usuario de AuthContext (user):", user);
        console.log("ID de usuario efectivo (effectiveUserId):", effectiveUserId);
        console.log("Perfil Profesional (profProfile):", profProfile);
        
        if (!user) {
            console.warn("Intento de postulación bloqueado: No hay usuario autenticado (user es null/undefined)");
            return alert("Debes iniciar sesión para postularte");
        }

        if (!profProfile || !profProfile.id) {
            console.warn("Intento de postulación bloqueado: No existe un perfil profesional válido.");
            return alert("Solo los perfiles profesionales pueden postularse a vacantes. Por favor, asegúrate de haber creado tu Perfil Profesional primero.");
        }
        
        setSending(true);

        const payload = {
            accion: 'postularse',
            anuncio_id: adId,
            user_id: effectiveUserId, // Referencia al usuario principal (1500)
            profesional_id: profProfile.id, // ID real del perfil profesional (ej: 2)
            postulante_nombre: identity.postulante_nombre,
            postulante_avatar: identity.postulante_avatar,
            empresa_id: ad.empresa_id,
            propuesta_pago: formData.propuesta_pago,
            condiciones: formData.condiciones,
            mensaje: formData.mensaje,
            respuestas_cuestionario: {
                requisitos: formData.match_requisitos,
                responsabilidades: formData.match_responsabilidades,
                herramientas: formData.match_herramientas
            },
            perfil_profundo: {
                experiencia_anos: formData.experiencia_anos,
                trabajo_remoto_experiencia: formData.trabajo_remoto_experiencia,
                trabajo_bajo_presion: formData.trabajo_bajo_presion,
                tipo_liderazgo: formData.tipo_liderazgo,
                habilidades_blandas: formData.habilidades_blandas,
                mayor_logro: formData.mayor_logro,
                resolucion_problema: formData.resolucion_problema,
                objetivo_corto_plazo: formData.objetivo_corto_plazo,
                referencias_disponibles: formData.referencias_disponibles
            }
        };

        // Clon para logs sin el avatar base64 completo para no saturar la consola
        const logPayload = { ...payload };
        if (logPayload.postulante_avatar && logPayload.postulante_avatar.length > 100) {
            logPayload.postulante_avatar = logPayload.postulante_avatar.substring(0, 100) + "... [TRUNCADO]";
        }
        console.log("Payload enviado a la API (API_POSTULACIONES = " + API_POSTULACIONES + "):", logPayload);

        try {
            const res = await axios.post(API_POSTULACIONES, payload);
            console.log("Respuesta recibida de la API:", res.data);
            
            if (res.data.success) {
                console.log("Postulación completada con éxito. ID:", res.data.id);
                setSubmitted(true);
                // Actualizar caché local de postulaciones para que el label aparezca de inmediato al volver
                try {
                    const cacheKey = `bolsa_user_apps_${effectiveUserId}`;
                    const cached = localStorage.getItem(cacheKey);
                    const apps = cached ? JSON.parse(cached) : [];
                    if (!apps.includes(parseInt(adId))) {
                        apps.push(parseInt(adId));
                        localStorage.setItem(cacheKey, JSON.stringify(apps));
                    }
                } catch (cacheErr) { 
                    console.error("Error actualizando caché de postulaciones:", cacheErr); 
                }
            } else {
                console.error("La API retornó success=false:", res.data.error);
                alert("Error de la API: " + res.data.error);
            }
        } catch (err) {
            console.error("!!! ERROR CRÍTICO AL POSTULARSE (CATCH) !!!");
            console.error("Objeto de error completo:", err);
            if (err.response) {
                console.error("Respuesta del servidor (Status " + err.response.status + "):", err.response.data);
            }
            alert("Error de conexión: " + (err.response?.data?.error || err.message || JSON.stringify(err)));
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Rocket className="animate-spin text-blue-600" /></div>;
    if (!ad) return <div className="p-10 text-center">Anuncio no encontrado</div>;

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-6 text-center animate-in zoom-in">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">¡Postulación Enviada!</h2>
                <p className="text-gray-600 mb-10 text-lg">
                    Tu propuesta para <strong>{ad.titulo}</strong> ha sido enviada con éxito.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                        onClick={() => navigate('/' + window.location.search)}
                        className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        Seguir buscando
                    </button>
                    <button 
                        onClick={() => navigate('/mis-postulaciones' + window.location.search)}
                        className="px-8 py-4 bg-[#0a66c2] text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                    >
                        Ver mis postulaciones
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Panel lateral: Resumen del anuncio */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden">
                                {ad.empresa_logo ? <img src={ad.empresa_logo} className="w-full h-full object-contain" alt="" /> : <Briefcase className="text-gray-300 w-8 h-8" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{ad.empresa_nombre}</p>
                                <h3 className="font-bold text-gray-900 leading-tight">{ad.titulo}</h3>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <span>Presupuesto: <strong>{ad.moneda} {ad.salario_max}</strong></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 capitalize">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                                <span>{ad.tipo_contrato?.replace('_', ' ')}</span>
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-gray-50">
                            <p className="text-xs text-gray-400 font-medium italic">
                                "Demuestra cómo tus habilidades encajan con lo que el cliente necesita."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulario Principal */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                        
                        {/* SECCIÓN 1: REQUISITOS (Checklist) */}
                        {ad.requisitos?.length > 0 && (
                            <section className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <ListChecks className="text-orange-500" /> ¿Cumples con los requisitos?
                                </h4>
                                <div className="space-y-3">
                                    {ad.requisitos.map((req, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => handleToggleMatch('match_requisitos', req)}
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.match_requisitos[req] ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <span className={`text-sm font-bold ${formData.match_requisitos[req] ? 'text-green-700' : 'text-gray-600'}`}>{req}</span>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.match_requisitos[req] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                {formData.match_requisitos[req] && <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* SECCIÓN 2: RESPONSABILIDADES */}
                        {ad.responsabilidades?.length > 0 && (
                            <section className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <Target className="text-blue-500" /> ¿Estás listo para estas tareas?
                                </h4>
                                <div className="space-y-3">
                                    {ad.responsabilidades.map((res, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => handleToggleMatch('match_responsabilidades', res)}
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.match_responsabilidades[res] ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <span className={`text-sm font-bold ${formData.match_responsabilidades[res] ? 'text-blue-700' : 'text-gray-600'}`}>{res}</span>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.match_responsabilidades[res] ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                {formData.match_responsabilidades[res] && <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* SECCIÓN 3: HERRAMIENTAS */}
                        {ad.herramientas?.length > 0 && (
                            <section className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <Wrench className="text-indigo-500" /> ¿Qué herramientas dominas?
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {ad.herramientas.map((her, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => handleToggleMatch('match_herramientas', her)}
                                            className={`px-6 py-3 rounded-xl border-2 transition-all cursor-pointer font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${formData.match_herramientas[her] ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                        >
                                            {her}
                                            {formData.match_herramientas[her] && <CheckCircle2 className="w-3 h-3" />}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* SECCIÓN 4: PERFIL PROFUNDO DEL CANDIDATO */}
                        <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-200 shadow-sm">
                            <h4 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
                                <User className="text-purple-500" /> Perfil Profundo del Candidato
                            </h4>
                            <p className="text-xs text-gray-400 mb-8">Esta información ayuda al tomador de decisiones a conocerte mejor como profesional y persona.</p>

                            <div className="space-y-6">
                                {/* Años de exp + Remoto */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">⏳ Años de exp. relevante</label>
                                        <input type="number" min="0" max="40" placeholder="Ej: 4" value={formData.experiencia_anos}
                                            onChange={e => setFormData({...formData, experiencia_anos: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-3 text-sm font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🌐 Experiencia en remoto</label>
                                        <div className="flex gap-2">
                                            {[{v:1,l:'Sí'},{v:0,l:'No'}].map(({v,l}) => (
                                                <button key={v} type="button" onClick={() => setFormData({...formData, trabajo_remoto_experiencia: v})}
                                                    className={`flex-1 py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                                                        formData.trabajo_remoto_experiencia == v ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                                    }`}>{l}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Trabajo bajo presión */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🔥 ¿Trabajas bien bajo presión?</label>
                                    <div className="flex gap-2">
                                        {[{v:1,l:'✅ Sí, con facilidad'},{v:0,l:'🔄 Prefiero ritmo estable'}].map(({v,l}) => (
                                            <button key={v} type="button" onClick={() => setFormData({...formData, trabajo_bajo_presion: v})}
                                                className={`flex-1 py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                                                    formData.trabajo_bajo_presion == v ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                                }`}>{l}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tipo de liderazgo */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">👥 Estilo de liderazgo / rol en equipo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Líder natural','Colaborador clave','Ejecutor autónomo','Mentor/Coach'].map(tipo => (
                                            <button key={tipo} type="button" onClick={() => setFormData({...formData, tipo_liderazgo: tipo})}
                                                className={`py-3 px-3 rounded-2xl text-sm font-black border-2 transition-all text-left ${
                                                    formData.tipo_liderazgo === tipo ? 'bg-purple-50 border-purple-400 text-purple-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                                }`}>{tipo}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Habilidades blandas */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">💡 Habilidades blandas destacadas <span className="text-gray-300">(selecciona las que apliquen)</span></label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Comunicación','Empatía','Resolución de conflictos','Adaptabilidad','Pensamiento crítico','Proactividad','Gestión del tiempo','Creatividad','Trabajo en equipo','Resiliencia'].map(h => {
                                            const sel = (formData.habilidades_blandas || []).includes(h);
                                            return (
                                                <button key={h} type="button"
                                                    onClick={() => setFormData({...formData, habilidades_blandas: sel ? formData.habilidades_blandas.filter(x => x !== h) : [...(formData.habilidades_blandas||[]), h]})}
                                                    className={`px-4 py-2 rounded-full text-xs font-black border-2 transition-all ${
                                                        sel ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300'
                                                    }`}>{h}</button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Mayor logro */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🏆 Mayor logro profesional</label>
                                    <textarea rows={3} placeholder="Ej: Reduje el tiempo de carga del sistema en un 40% optimizando queries SQL, aumentando la retención de usuarios un 15%..."
                                        value={formData.mayor_logro}
                                        onChange={e => setFormData({...formData, mayor_logro: e.target.value})}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all resize-none"
                                    />
                                </div>

                                {/* Resolución de problema */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🧩 Describe cómo resolviste un problema difícil</label>
                                    <textarea rows={3} placeholder="Explica el contexto, el problema, tu enfoque y el resultado obtenido..."
                                        value={formData.resolucion_problema}
                                        onChange={e => setFormData({...formData, resolucion_problema: e.target.value})}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all resize-none"
                                    />
                                </div>

                                {/* Objetivo corto plazo */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">🎯 Objetivo profesional a corto plazo (1-2 años)</label>
                                    <textarea rows={2} placeholder="¿Hacia dónde quieres crecer profesionalmente?"
                                        value={formData.objetivo_corto_plazo}
                                        onChange={e => setFormData({...formData, objetivo_corto_plazo: e.target.value})}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all resize-none"
                                    />
                                </div>

                                {/* Referencias */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">📞 ¿Tiene referencias profesionales disponibles?</label>
                                    <div className="flex gap-2">
                                        {[{v:1,l:'✅ Sí, puedo presentarlas'},{v:0,l:'❌ No por el momento'}].map(({v,l}) => (
                                            <button key={v} type="button" onClick={() => setFormData({...formData, referencias_disponibles: v})}
                                                className={`flex-1 py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                                                    formData.referencias_disponibles == v ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                                }`}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECCIÓN 5: DETALLES DE LA PROPUESTA */}
                        <section className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-200 shadow-xl shadow-gray-100">
                            <h4 className="text-xl font-black text-gray-900 mb-8">Mi Propuesta Final</h4>
                            
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        Contrapropuesta económica ({ad.moneda})
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{ad.moneda}</span>
                                        <input 
                                            type="number"
                                            required
                                            value={formData.propuesta_pago}
                                            onChange={(e) => setFormData({...formData, propuesta_pago: e.target.value})}
                                            className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all font-bold text-lg"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-3">¿Por qué tú?</label>
                                    <textarea 
                                        required
                                        rows="4"
                                        value={formData.mensaje}
                                        onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all"
                                        placeholder="Convence al cliente..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-3">Condiciones o disponibilidad</label>
                                    <input 
                                        type="text"
                                        value={formData.condiciones}
                                        onChange={(e) => setFormData({...formData, condiciones: e.target.value})}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all"
                                        placeholder="Ej: Inmediata, lunes a viernes..."
                                    />
                                </div>
                            </div>

                            {/* Previsualización del perfil que se enviará */}
                            <div className="mt-8 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
                                        {identity.postulante_avatar ? (
                                            <img src={identity.postulante_avatar} alt="Tu Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Te postularás como:</p>
                                        <p className="text-sm font-black text-gray-900">{identity.postulante_nombre}</p>
                                    </div>
                                </div>
                                {!identity.postulante_avatar && (
                                    <p className="text-[10px] text-red-500 font-bold max-w-[150px] text-right leading-tight">
                                        ⚠️ Sin avatar detectado. Sube una foto en tu perfil.
                                    </p>
                                )}
                            </div>

                            <button 
                                type="submit"
                                disabled={sending}
                                className="w-full mt-10 px-8 py-5 bg-[#0a66c2] text-white font-black rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-100"
                            >
                                {sending ? <Rocket className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> ENVIAR POSTULACIÓN MÁXIMA</>}
                            </button>
                        </section>
                    </form>
                </div>
            </div>
        </div>
    );
}
