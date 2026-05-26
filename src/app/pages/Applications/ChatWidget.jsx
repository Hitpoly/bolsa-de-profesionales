import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, User, MessageSquare, X } from 'lucide-react';
import axios from 'axios';

const API_CHAT = 'https://apibolsaprofesionales.hitpoly.com/ajax/chatBolsaController.php';

export function ChatWidget({ postulacion, currentUser, isEnterprise, embedded = false, onHasMessages }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isOpenMobile, setIsOpenMobile] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const lastMessageCountRef = useRef(0);

    // Usamos los IDs de PERFIL, no el user_id global.
    // Así, aunque ambos perfiles pertenezcan al mismo usuario principal,
    // tendrán IDs distintos en el chat.
    // - Profesional: bolsa_user_profile.id (postulante_profile_id)
    // - Empresa: holding_empresas.id (empresa_id)
    const profesionalId = postulacion.postulante_profile_id;
    const empresaId = postulacion.empresa_id;

    const myId = isEnterprise ? empresaId : profesionalId;
    const otherId = isEnterprise ? profesionalId : empresaId;

    console.log("[CHAT WIDGET] IDs de perfil:");
    console.log("  - ¿Soy Empresa?:", isEnterprise);
    console.log("  - Mi ID (perfil):", myId, isEnterprise ? `[empresa_id=${empresaId}]` : `[bolsa_profile_id=${profesionalId}]`);
    console.log("  - Otro ID (perfil):", otherId);
    if (String(myId) === String(otherId)) {
        console.warn("[CHAT WIDGET] ⚠️ myId === otherId. Ambos perfiles comparten el mismo ID. Revisa que postulante_profile_id y empresa_id sean distintos.");
    }

    const scrollToBottom = (smooth = true) => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // 1. Iniciar sesión y obtener ID de conversación
    useEffect(() => {
        if (!myId || !otherId) {
            // No hay IDs válidos (ej: postulante sin perfil en bolsa_user_profile)
            console.warn("[CHAT WIDGET] myId o otherId no disponibles. myId:", myId, "otherId:", otherId);
            setLoading(false);
            return;
        }

        const initChat = async () => {
            try {
                const res = await axios.post(API_CHAT, {
                    accion: 'iniciar_sesion',
                    user_1_id: myId,
                    user_2_id: otherId,
                    context_type: 'bolsa_postulacion',
                    context_id: postulacion.id
                });

                if (res.data.success) {
                    setConversationId(res.data.conversation_id);
                } else {
                    console.error("Error iniciando chat:", res.data.error);
                    setLoading(false); // Evitar spinner infinito si falla
                }
            } catch (e) {
                console.error("Error de conexión:", e);
                setLoading(false); // Evitar spinner infinito si hay error de red
            }
        };

        initChat();
    }, [myId, otherId, postulacion.id]);

    // 2. Polling de mensajes una vez tenemos la conversación
    useEffect(() => {
        if (!conversationId) return;

        const fetchMessages = async (isInitial = false) => {
            try {
                const res = await axios.post(API_CHAT, {
                    accion: 'obtener_mensajes',
                    conversation_id: conversationId
                });
                if (res.data.success) {
                    const incoming = res.data.data;
                    const prevCount = lastMessageCountRef.current;
                    const newCount = incoming.length;

                    // Notificar al padre si hay mensajes
                    if (newCount > 0 && typeof onHasMessages === 'function') {
                        onHasMessages(true);
                    }

                    // Solo actualizar estado si hay mensajes nuevos o es la carga inicial
                    if (newCount !== prevCount || isInitial) {
                        lastMessageCountRef.current = newCount;
                        setMessages(incoming);
                        // Solo hacer scroll si llegaron mensajes nuevos
                        if (newCount > prevCount || isInitial) {
                            setTimeout(() => scrollToBottom(!isInitial), 50);
                        }
                    }
                }
            } catch (e) {
                // Silencioso en polling
            } finally {
                if (isInitial) setLoading(false);
            }
        };

        fetchMessages(true);
        // Polling cada 5 segundos
        const interval = setInterval(() => fetchMessages(false), 5000);
        return () => clearInterval(interval);
    }, [conversationId, onHasMessages]);

    // 3. Enviar mensaje
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId || sending) return;

        const textToSend = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistic update
        const tempMsg = {
            id: 'temp-' + Date.now(),
            sender_id: myId,
            message_text: textToSend,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            await axios.post(API_CHAT, {
                accion: 'guardar_mensaje',
                conversation_id: conversationId,
                sender_id: myId,
                message_text: textToSend
            });
            // Notificar al padre que ya hay contenido (mensajes)
            if (typeof onHasMessages === 'function') {
                onHasMessages(true);
            }
        } catch (e) {
            console.error("Error enviando:", e);
            // Podríamos remover el optimistic update si falla, pero para simplicidad lo dejamos así
        } finally {
            setSending(false);
        }
    };

    if (!otherId) {
        return (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 text-center h-[500px] flex flex-col items-center justify-center">
                <p className="text-gray-500 font-medium">Chat no disponible para esta empresa.</p>
            </div>
        );
    }

    return (
        <>
            {/* Botón Flotante para Móviles */}
            <button
                onClick={() => setIsOpenMobile(true)}
                className="xl:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#0a66c2] hover:bg-blue-700 rounded-full shadow-2xl flex items-center justify-center text-white z-40 transition-transform active:scale-95 border-4 border-white"
            >
                <MessageSquare className="w-6 h-6" />
            </button>

            {/* Contenedor del Chat (Pantalla completa en móvil, incrustado en escritorio) */}
            <div className={`
                ${isOpenMobile ? 'fixed inset-0 z-50 flex' : 'hidden xl:flex'} 
                flex-col bg-white overflow-hidden
                ${!isOpenMobile && embedded ? 'h-full' : ''} 
                ${!isOpenMobile && !embedded ? 'rounded-[2rem] border border-gray-100 shadow-xl h-[600px]' : ''}
            `}>
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: #cbd5e1;
                        border-radius: 20px;
                        border: 3px solid transparent;
                        background-clip: content-box;
                    }
                    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                        background-color: #94a3b8;
                    }
                `}</style>

                {/* Header del Chat */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center shrink-0">
                            {isEnterprise ? (
                                postulacion.postulante_avatar ? <img src={postulacion.postulante_avatar} className="w-full h-full rounded-full object-cover" alt="" /> : <User className="w-5 h-5" />
                            ) : (
                                postulacion.empresa_logo ? <img src={postulacion.empresa_logo} className="w-full h-full rounded-full object-cover bg-white" alt="" /> : <User className="w-5 h-5" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">
                                {isEnterprise ? (postulacion.postulante_nombre || 'Candidato') : (postulacion.empresa_nombre || 'Empresa')}
                            </h3>
                            <p className="text-xs text-green-600 font-black flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                Chat Directo
                            </p>
                        </div>
                    </div>
                    {/* Botón para cerrar en móviles */}
                    <button
                        onClick={() => setIsOpenMobile(false)}
                        className="xl:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Mensajes */}
                <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gray-50/50 space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                    ) : !conversationId ? (
                        <div className="flex flex-col justify-center items-center h-full text-center px-4">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <X className="w-6 h-6 text-red-400" />
                            </div>
                            <p className="text-red-600 font-bold text-sm">Error de conexión</p>
                            <p className="text-gray-500 text-xs mt-1">El candidato no ha completado su perfil profesional o hubo un error de red.</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-full text-center px-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Send className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium text-sm">No hay mensajes aún.</p>
                            <p className="text-gray-400 text-xs mt-1">Escribe algo para iniciar la conversación.</p>
                        </div>
                    ) : (
                        messages.map((m) => {
                            const isMe = Number(m.sender_id) === Number(myId);
                            return (
                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-[#0a66c2] text-white rounded-tr-sm shadow-md shadow-blue-100' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                                        <p className="whitespace-pre-wrap break-words">{m.message_text}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={conversationId ? "Escribe un mensaje..." : "Chat no disponible..."}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/30 focus:border-[#0a66c2] text-sm transition-all disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={sending || !conversationId}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending || !conversationId}
                            className="absolute right-2 w-8 h-8 flex items-center justify-center bg-[#0a66c2] hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-300 transition-colors"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
