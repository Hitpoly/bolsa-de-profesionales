import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  X, Plus, Trash2, Sparkles, Zap, HelpCircle,
  ListOrdered, Image, Link, Clock, ShieldCheck, Save, Loader2,
  ArrowLeft, Camera, Star, Rocket, Award, TrendingUp, Heart, Smile,
  Target, CheckCircle2, Layout, Code, Briefcase, Users, Smartphone,
  Laptop, Globe, Search, MessageCircle, FileText, ChevronDown, Check,
  Monitor, Tablet, Phone, RotateCw, Info, FileQuestion, Play, Tag, History, Timer, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useSystem } from '../data/SystemContext';
import { uploadToImageKit } from '../services/imageKitService';
import { ServiceDetail } from './ServiceDetail';
import { EnterpriseEditorPanels } from './EnterpriseEditorPanels';

const API_BOLSA = 'https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php';
const API_HOLDING = 'https://apiweb.hitpoly.com/ajax/servicesController.php';

const AVAILABLE_ICONS = [
  { id: 'Zap', label: 'Rápido', icon: Zap },
  { id: 'ShieldCheck', label: 'Seguro', icon: ShieldCheck },
  { id: 'Star', label: 'Calidad', icon: Star },
  { id: 'Rocket', label: 'Veloz', icon: Rocket },
  { id: 'Clock', label: 'Puntual', icon: Clock },
  { id: 'Award', label: 'Premium', icon: Award },
  { id: 'TrendingUp', label: 'Mejora', icon: TrendingUp },
  { id: 'Heart', label: 'Cuidado', icon: Heart },
  { id: 'Smile', label: 'Felicidad', icon: Smile },
  { id: 'Target', label: 'Enfoque', icon: Target },
  { id: 'Sparkles', label: 'Especial', icon: Sparkles },
  { id: 'CheckCircle2', label: 'Listo', icon: CheckCircle2 },
  { id: 'Code', label: 'Código', icon: Code },
  { id: 'Layout', label: 'Diseño', icon: Layout },
  { id: 'Briefcase', label: 'Negocios', icon: Briefcase },
  { id: 'Users', label: 'Equipo', icon: Users },
  { id: 'MessageCircle', label: 'Soporte', icon: MessageCircle },
  { id: 'Smartphone', label: 'Mobile', icon: Smartphone },
  { id: 'Laptop', label: 'Desktop', icon: Laptop },
  { id: 'Globe', label: 'Global', icon: Globe },
  { id: 'Search', label: 'SEO', icon: Search },
  { id: 'FileText', label: 'Reportes', icon: FileText }
];

const MASTER_TOOLS = [
  { nombre: 'Figma', categoria: 'Diseño' },
  { nombre: 'Adobe Photoshop', categoria: 'Diseño' },
  { nombre: 'React', categoria: 'Desarrollo' },
  { nombre: 'Node.js', categoria: 'Desarrollo' },
  { nombre: 'Python', categoria: 'Desarrollo' },
  { nombre: 'PHP', categoria: 'Desarrollo' },
  { nombre: 'MySQL', categoria: 'Base de Datos' },
  { nombre: 'Google Ads', categoria: 'Marketing' },
  { nombre: 'SEO', categoria: 'Marketing' },
  { nombre: 'Microsoft Excel', categoria: 'Productividad' },
];

export function ServiceEditor() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setHeaderData, setMobileActions } = useSystem();

  const handleBack = () => {
    const suffix = userId ? `?userId=${userId}` : '';
    const profTabSuffix = sessionStorage.getItem('bolsa_active_tab') ? `&tab=${sessionStorage.getItem('bolsa_active_tab')}` : '';
    const compTabSuffix = sessionStorage.getItem('bolsa_company_active_tab') ? `&tab=${sessionStorage.getItem('bolsa_company_active_tab')}` : '';
    
    if (type === 'enterprise') {
      navigate(`/editar-empresa${suffix}${compTabSuffix}`);
    } else {
      navigate(`/editar-perfil${suffix}${profTabSuffix}`);
    }
  };

  const serviceId = params.serviceId;
  const tipoParam = params.tipo;
  const isEditing = !!serviceId && !serviceId.startsWith('new_');

  const location = useLocation();

  // Determinar modo: Empresa (Enterprise) o Profesional
  const isEnterpriseRoute = location.pathname.includes('-empresa');
  const type = isEnterpriseRoute ? 'enterprise' : (searchParams.get('type') || 'professional');
  const companyId = searchParams.get('companyId');
  const userId = searchParams.get('userId') || sessionStorage.getItem('bolsa_last_userId');

  // Estados de layout responsive
  const [deviceView, setDeviceView] = useState('desktop'); // desktop, tablet, mobile
  const [deviceOrientation, setDeviceOrientation] = useState('landscape'); // landscape, portrait

  // Estados de control general
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activePanel, setActivePanel] = useState('basica');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [enterpriseTab, setEnterpriseTab] = useState('landing');
  const [openAccordion, setOpenAccordion] = useState('info');
  const toggleAccordion = (id) => setOpenAccordion(prev => prev === id ? null : id);

  // Estado para servicio Profesional
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    descripcion: '',
    tipo: tipoParam || 'proyecto',
    precio_base: 0,
    precio_oferta: undefined,
    porcentaje_oferta: 0,
    moneda: 'USD',
    imagen: '',
    herramientas: [],
    entregables: [],
    beneficios: [],
    faqs: [],
    requisitos_cliente: [],
    proceso_trabajo: [],
    disponibilidad_horas: undefined,
    tiempo_respuesta: '24 horas',
    garantia_dias: 0,
    revisiones_incluidas: 1,
    tiempo_total: '',
    oferta_fin: '',
    categoria: 'Servicio Profesional',
    modalidad: 'Remoto',
    idiomas: 'Español'
  });

  // Estado para servicio de Empresa (Corporate)
  const [enterpriseData, setEnterpriseData] = useState({
    id: isEditing ? serviceId : null,
    empresa_id: companyId,
    title: '',
    slug: '',
    description: '',
    image: '',
    estado: 'activo',
    page_data: {
      portada_props: {
        title: 'Servicio Corporativo Especializado',
        subtitle: 'Soluciones de alto rendimiento diseñadas a la medida de tu compañía con total garantía de cumplimiento.',
        imgSrc: '',
        imgAlt: 'Portada del servicio',
        href: '',
        to: ''
      },
      menu_items: [
        { label: 'Introducción', sectionId: 'seccio1' },
        { label: 'Estrategia', sectionId: 'seccio2' },
        { label: 'Beneficios', sectionId: 'seccio3' },
        { label: 'Resultados', sectionId: 'seccio4' },
        { label: 'Detalles', sectionId: 'seccio5' },
        { label: 'Reseñas', sectionId: 'seccio6' },
        { label: 'Preguntas', sectionId: 'seccio8' },
        { label: 'Contratar', sectionId: 'seccio9' }
      ],
      section_video_props: {
        title: 'Presentación de Metodología',
        subtitle: 'Conoce a fondo cómo optimizamos cada etapa del servicio para asegurar el éxito operativo.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        linkUrl: '',
        linkText: ''
      },
      acordeon_inteligente_props: {
        title: 'Compromiso y Garantías Elite',
        subtitle: 'Garantizamos respuesta ágil y soluciones de soporte ante incidencias.',
        panelsData: [
          { id: 'panel1', title: 'Disponibilidad Absoluta (SLA)', content: 'Garantizamos respuesta ágil y soluciones de soporte ante incidencias.' },
          { id: 'panel2', title: 'Privacidad e Integridad', content: 'Estrictos acuerdos de confidencialidad y resguardo blindado de datos corporativos.' }
        ],
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      },
      acordeon_inteligente_imagen_props: {
        title: 'Metodología Integrada',
        subtitle: 'Diseñamos la hoja de ruta adaptada a las metas de tu empresa.',
        panelsData: [
          { id: 'panel1', title: 'Planificación Estratégica', content: 'Diseñamos la hoja de ruta adaptada a las metas de tu empresa.' },
          { id: 'panel2', title: 'Ejecución y Monitoreo', content: 'Implementación fluida con reportes constantes de métricas.' }
        ],
        imgSrc: '',
        imgAlt: 'Metodología'
      },
      cartas_resultados_props: {
        title: 'Resultados y Métricas Clave',
        subtitle: 'Nuestros números avalan la calidad del servicio.',
        benefits: [
          { image: '', title: 'Eficiencia', description: 'Mejora en los flujos internos corporativos.', imageHeight: 110, imageWidth: '100%', cardStyles: { borderRadius: '8px', height: '400px', width: '450px' }, titleStyles: { color: '#211E26', fontWeight: 'bold' }, descriptionStyles: { color: '#666' } }
        ]
      },
      seccion_cuerpo_imagen_data: [
        { imgSrc: '', imgAlt: 'Innovación', iconText: 'Paso 1', title: 'Innovación Tecnológica Continua', subtitle: 'Implementamos la última tecnología disponible en la nube para automatizar y optimizar tus proyectos.', linkUrl: '', linkText: '', titleVariant: 'h4', subtitleVariant: 'body1', titleColor: '#211E26', subtitleColor: 'text.secondary', order: 'text-last' }
      ],
      datos_testimonios: {
        titulo: 'Conoce a nuestro equipo de expertos',
        datos: [
          { nombre: 'Laura Rivas', cargo: 'Directora de Operaciones', descripcion: 'Excelente experiencia de integración. Logramos duplicar el rendimiento y los tiempos de despliegue.', imgSrc: '', enlace: '' }
        ],
        verMasTexto: 'Conoce más sobre nosotros'
      },
      adicionales_cartas_resultados_props: {
        title: 'Impacto en tu Negocio',
        subtitle: 'Reducción de fricción mediante automatización inteligente.',
        benefits: [
          { image: '', title: 'Costes Operativos', description: 'Reducción de fricción mediante automatización inteligente.', imageHeight: 110, imageWidth: '100%', cardStyles: { borderRadius: '8px', height: '400px', width: '100%' }, titleStyles: { color: '#211E26', fontWeight: 'bold' }, descriptionStyles: { color: '#666' }, linkUrl: '' }
        ]
      },
      seccion_con_titulo_y_acordeon_props: {
        title: 'Preguntas Frecuentes',
        subtitle: 'Resuelve tus dudas generales sobre nuestro servicio corporativo.',
        titleColor: '#211E26',
        subtitleColor: 'text.secondary',
        questions: [
          { question: 'Â¿Cuáles son los plazos mínimos de contratación?', answer: 'Trabajamos con plazos flexibles basados en la complejidad de las secciones.' }
        ]
      },
      llamado_ala_accion_props: {
        title: 'Optimiza tus Operaciones Hoy',
        firstButton: { text: 'Agendar Reunión Gratis', to: '' },
        secondButton: { text: 'Saber Más', to: '' }
      }
    }
  });

  // Configuración dinámica del Header del sistema
  const updateGlobalHeader = useCallback(() => {
    setHeaderData({
      title: type === 'enterprise' ? 'Editor de Landing Corporativa' : 'Editor de Servicio Profesional',
      subtitle: type === 'enterprise'
        ? (enterpriseData.title ? `Real-Time: ${enterpriseData.title}` : 'Diseñando Página de Empresa')
        : (formData.titulo ? `Real-Time: ${formData.titulo}` : 'Diseñando tu Oferta de Servicio'),
      icon: 'pencil',
      color: type === 'enterprise' ? '#0891b2' : '#0a66c2'
    });

    window.bolsaBackHandler = () => {
      if (type === 'enterprise') {
        navigate(`/editar-empresa?userId=${userId}`);
      } else {
        navigate(`/editar-perfil?userId=${userId}`);
      }
    };

    return () => {
      setHeaderData({
        title: 'Bolsa de Empleo',
        subtitle: 'Oportunidades y talento profesional',
        icon: 'briefcase',
        color: '#0a66c2'
      });
      window.bolsaBackHandler = null;
    };
  }, [type, enterpriseData.title, formData.titulo, setHeaderData, navigate, userId]);

  useEffect(() => {
    updateGlobalHeader();
  }, [updateGlobalHeader]);

  // Sincronizar previsualización del iframe en tiempo real (holding)
  useEffect(() => {
    if (type === 'enterprise' && enterpriseData?.page_data) {
      const iframe = document.getElementById('holding-preview');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'UPDATE_SERVICE_PREVIEW',
          payload: enterpriseData.page_data
        }, '*');
      }
    }
  }, [enterpriseData, type]);

  // Carga inicial de datos
  useEffect(() => {
    if (!isEditing) return;

    const loadData = async () => {
      setLoading(true);
      try {
        if (type === 'enterprise') {
          // 1. Obtener la lista de servicios de la empresa para ubicar el slug
          const listRes = await axios.post(API_HOLDING, {
            accion: 'get_services_list',
            empresa_id: companyId
          });

          if (listRes.data.success && Array.isArray(listRes.data.data)) {
            const svc = listRes.data.data.find(s => String(s.id) === String(serviceId));
            if (svc) {
              // 2. Cargar el contenido de la landing page usando el slug
              const landingRes = await axios.post(API_HOLDING, {
                accion: 'get_service_landing',
                empresa_id: companyId,
                slug: svc.slug
              });

              let page_data = enterpriseData.page_data;
              if (landingRes.data.success && landingRes.data.data) {
                const fetched = landingRes.data.data;
                
                // Mezclar y sanitizar datos JSON recibidos de la API
                page_data = {
                  portada_props: fetched.portada_props || page_data.portada_props,
                  menu_items: fetched.menu_items || page_data.menu_items,
                  section_video_props: fetched.section_video_props || page_data.section_video_props,
                  acordeon_inteligente_props: fetched.acordeon_inteligente_props || page_data.acordeon_inteligente_props,
                  acordeon_inteligente_imagen_props: fetched.acordeon_inteligente_imagen_props || page_data.acordeon_inteligente_imagen_props,
                  cartas_resultados_props: fetched.cartas_resultados_props || page_data.cartas_resultados_props,
                  seccion_cuerpo_imagen_data: fetched.seccion_cuerpo_imagen_data || page_data.seccion_cuerpo_imagen_data,
                  datos_testimonios: fetched.datos_testimonios || page_data.datos_testimonios,
                  adicionales_cartas_resultados_props: fetched.adicionales_cartas_resultados_props || page_data.adicionales_cartas_resultados_props,
                  seccion_con_titulo_y_acordeon_props: fetched.seccion_con_titulo_y_acordeon_props || page_data.seccion_con_titulo_y_acordeon_props,
                  llamado_ala_accion_props: fetched.llamado_ala_accion_props || page_data.llamado_ala_accion_props,
                  pricing: fetched.pricing_data || page_data.pricing
                };
              }

              setEnterpriseData({
                id: svc.id,
                empresa_id: companyId,
                title: svc.title || '',
                slug: svc.slug || '',
                description: svc.description || '',
                image: svc.image || '',
                estado: svc.estado || 'activo',
                page_data
              });
            }
          }
        } else {
          // Carga del servicio profesional
          const res = await axios.post(API_BOLSA, {
            accion: 'getServiceDetail',
            service_id: serviceId,
            user_id: userId
          });

          if (res.data.success && res.data.data) {
            const svc = res.data.data;
            const parseField = (field) => {
              if (!svc[field]) return [];
              if (typeof svc[field] === 'string') {
                try {
                  const parsed = JSON.parse(svc[field]);
                  return Array.isArray(parsed) ? parsed : Object.values(parsed);
                } catch (e) { return []; }
              }
              return Array.isArray(svc[field]) ? svc[field] : Object.values(svc[field]);
            };

            setFormData({
              titulo: svc.titulo || '',
              subtitulo: svc.subtitulo || '',
              descripcion: svc.descripcion || '',
              tipo: svc.tipo || 'proyecto',
              precio_base: Number(svc.precio_base) || 0,
              precio_oferta: svc.precio_oferta ? Number(svc.precio_oferta) : undefined,
              porcentaje_oferta: Number(svc.porcentaje_oferta) || 0,
              moneda: svc.moneda || 'USD',
              imagen: svc.imagen || '',
              herramientas: parseField('herramientas'),
              entregables: parseField('entregables'),
              beneficios: parseField('beneficios'),
              faqs: parseField('faqs'),
              requisitos_cliente: parseField('requisitos_cliente'),
              proceso_trabajo: parseField('proceso_trabajo'),
              disponibilidad_horas: svc.disponibilidad_horas || undefined,
              tiempo_respuesta: svc.tiempo_respuesta || '24 horas',
              garantia_dias: Number(svc.garantia_dias) || 0,
              revisiones_incluidas: Number(svc.revisiones_incluidas) || 1,
              tiempo_total: svc.tiempo_total || '',
              oferta_fin: svc.oferta_fin || '',
              categoria: svc.categoria || 'Servicio Profesional',
              modalidad: svc.modalidad || 'Remoto',
              idiomas: svc.idiomas || 'Español'
            });
          }
        }
      } catch (e) {
        console.error('Error cargando servicio:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [serviceId, isEditing, type, companyId, userId]);

  // Autocalcular precio base y tiempo total según los entregables en modo profesional
  useEffect(() => {
    if (type !== 'enterprise' && formData.entregables && formData.entregables.length > 0) {
      let sumPrecio = 0;
      let sumTiempo = 0;

      formData.entregables.forEach(ent => {
        sumPrecio += parseFloat(ent.valor_individual) || 0;
        const tiempoStr = ent.tiempo_limite || '';
        const extractNum = tiempoStr.match(/\d+/);
        if (extractNum) {
          sumTiempo += parseInt(extractNum[0], 10);
        }
      });

      setFormData(prev => {
        const nuevoTiempo = sumTiempo > 0 ? `${sumTiempo} días` : prev.tiempo_total;
        if (prev.precio_base === sumPrecio && prev.tiempo_total === nuevoTiempo) {
          return prev;
        }
        return {
          ...prev,
          precio_base: sumPrecio,
          tiempo_total: nuevoTiempo
        };
      });
    }
  }, [formData.entregables, formData.tipo, type]);

  // Acciones de guardado
  const handleSave = useCallback(async () => {
    if (type === 'enterprise') {
      if (!enterpriseData.title || !enterpriseData.slug) {
        alert('Por favor, completa los campos obligatorios del servicio corporativo (Título y Slug).');
        return;
      }
    } else {
      if (!formData.titulo || !formData.descripcion || formData.precio_base <= 0) {
        alert('Por favor completa los campos obligatorios del servicio profesional: Título, Descripción y Precio.');
        return;
      }
    }

    setSaving(true);
    try {
      if (type === 'enterprise') {
        const payloadHolding = {
          accion: 'save_service',
          id: isEditing ? serviceId : null,
          empresa_id: companyId,
          slug: enterpriseData.slug,
          title: enterpriseData.title,
          description: enterpriseData.description,
          image: enterpriseData.image,
          estado: enterpriseData.estado,
          page_data: enterpriseData.page_data
        };
        console.log("[ServiceEditor Save Debug] Enviando servicio corporativo a:", API_HOLDING, payloadHolding);
        
        const res = await axios.post(API_HOLDING, payloadHolding);
        console.log("[ServiceEditor Save Debug] Respuesta de servicio corporativo:", res.data);

        if (res.data.success) {
          if (type === 'enterprise' && res.data.id) {
            setEnterpriseData(prev => ({ ...prev, id: res.data.id }));
          }
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          console.warn("[ServiceEditor Save Debug] El servidor reportó un fallo al guardar servicio corporativo:", res.data);
          alert('Error al guardar servicio corporativo: ' + (res.data.error || 'Desconocido'));
        }
      } else {
        const payloadBolsa = {
          accion: 'saveService',
          user_id: userId,
          service_data: {
            id: isEditing ? serviceId : null,
            ...formData,
            herramientas: JSON.stringify(formData.herramientas),
            entregables: formData.entregables.map((e, idx) => ({ ...e, orden: idx }))
          }
        };
        console.log("[ServiceEditor Save Debug] Enviando servicio profesional a:", API_BOLSA, payloadBolsa);

        const res = await axios.post(API_BOLSA, payloadBolsa);
        console.log("[ServiceEditor Save Debug] Respuesta de servicio profesional:", res.data);

        if (res.data.success) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          console.warn("[ServiceEditor Save Debug] El servidor reportó un fallo al guardar servicio profesional:", res.data);
          alert('Error al guardar servicio profesional: ' + (res.data.error || 'Desconocido'));
        }
      }
    } catch (e) {
      console.error("[ServiceEditor Save Debug] Error de red o del servidor durante el guardado:", e);
      if (e.response) {
        console.error("[ServiceEditor Save Debug] Respuesta de error del servidor (HTTP " + e.response.status + "):", e.response.data);
        const serverErrorMsg = (e.response.data && typeof e.response.data === 'object' && e.response.data.error)
          ? e.response.data.error
          : (typeof e.response.data === 'string' && e.response.data.length < 300 ? e.response.data : '');
        
        alert(`Error en el servidor (HTTP ${e.response.status}): ` + (serverErrorMsg || 'Internal Server Error. Revisa la consola o los logs del servidor para ver el detalle.'));
      } else {
        alert('Error en la comunicación con el servidor: ' + e.message);
      }
    } finally {
      setSaving(false);
    }
  }, [type, formData, enterpriseData, isEditing, serviceId, companyId, userId]);

  // Sincronizar botones de guardar para vista móvil
  useEffect(() => {
    const actions = [
      {
        id: 'save-service-visual',
        icon: saving ? 'loader' : (saved ? 'check' : 'save'),
        onClick: handleSave,
        disabled: saving,
        title: saving ? 'Guardando...' : (saved ? 'Â¡Guardado!' : 'Guardar en tiempo real'),
        color: saved ? '#10b981' : (type === 'enterprise' ? '#0891b2' : '#0a66c2')
      }
    ];
    setMobileActions(actions);
    return () => setMobileActions([]);
  }, [saving, saved, handleSave, type, setMobileActions]);

  // Manejo de carga de archivos multimedia usando ImageKit
  const handleImageKitUpload = async (file, onSuccess) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen cargada supera el límite máximo de 8MB. Por favor, redúcela.');
      return;
    }
    setUploadingImage(true);
    try {
      const folderPath = type === 'enterprise' ? `/holding/services/${companyId}` : `/bolsa/services/${userId}`;
      const uniqueId = type === 'enterprise' ? companyId : userId;
      const url = await uploadToImageKit(file, uniqueId, folderPath);
      
      if (onSuccess) {
        onSuccess(url);
      } else {
        if (type === 'enterprise') {
          setEnterpriseData(prev => ({
            ...prev,
            image: url,
            page_data: {
              ...prev.page_data,
              portada_props: {
                ...prev.page_data.portada_props,
                imgSrc: url
              }
            }
          }));
        } else {
          setFormData(prev => ({ ...prev, imagen: url }));
        }
      }
    } catch (e) {
      alert('Error cargando archivo a la nube');
    } finally {
      setUploadingImage(false);
    }
  };

  const renderImageUpload = (label, currentUrl, onChange) => {
    return (
      <div className="space-y-1 mt-2">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="relative group aspect-video max-h-36 rounded-xl overflow-hidden border border-dashed border-gray-200 hover:border-cyan-500 transition-colors bg-white flex items-center justify-center">
          {currentUrl ? (
            <>
              <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer bg-white text-gray-900 px-3 py-1.5 rounded-full text-[9px] font-bold shadow-xl hover:scale-105 transition-all">
                  Cambiar
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageKitUpload(e.target.files[0], onChange)} />
                </label>
              </div>
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-1.5 text-gray-400 hover:text-cyan-600 transition-colors">
              <Camera className="w-6 h-6 stroke-1" />
              <span className="text-[9px] font-black uppercase tracking-wider">Subir Imagen</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageKitUpload(e.target.files[0], onChange)} />
            </label>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="font-sans bg-[#f3f2ef] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#0a66c2] mx-auto" />
          <p className="text-sm font-bold text-gray-500">Cargando constructor en tiempo real...</p>
        </div>
      </div>
    );
  }

  // Dimensiones del frame responsive según las configuraciones del usuario
  const getCanvasWidth = () => {
    if (deviceView === 'mobile') return deviceOrientation === 'portrait' ? '375px' : '768px';
    if (deviceView === 'tablet') return deviceOrientation === 'portrait' ? '768px' : '1024px';
    return '100%';
  };

  const getCanvasHeight = () => {
    if (deviceView === 'mobile') return deviceOrientation === 'portrait' ? '760px' : '375px';
    if (deviceView === 'tablet') return deviceOrientation === 'portrait' ? '960px' : '768px';
    return '100%';
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-gray-50 text-gray-800">
      
      {/* 1. TOP TOOLBAR PRO */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shrink-0 shadow-sm">
        
        {/* Info de Modo */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-all text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 flex items-center justify-center shrink-0"
            title="Atrás"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider ${type === 'enterprise' ? 'bg-cyan-50 text-cyan-700 border border-cyan-155' : 'bg-blue-50 text-blue-700 border border-blue-155'}`}>
              {type === 'enterprise' ? 'Empresa' : 'Profesional'}
            </span>
            <span className="text-xs font-black text-gray-700 max-w-[200px] truncate">
              {type === 'enterprise' ? (enterpriseData.title || 'Sin Título') : (formData.titulo || 'Sin Título')}
            </span>
          </div>
          {type === 'enterprise' && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-gray-200/60 ml-2">
              <button
                onClick={() => setEnterpriseTab('landing')}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${enterpriseTab === 'landing' ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Landing
              </button>
              <button
                onClick={() => setEnterpriseTab('prices')}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${enterpriseTab === 'prices' ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Precios
              </button>
            </div>
          )}
        </div>

        {/* selectores responsivos del editor en tiempo real */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button 
            onClick={() => setDeviceView('desktop')}
            className={`p-2 rounded-xl transition-all ${deviceView === 'desktop' ? 'bg-white text-gray-900 shadow-md scale-105' : 'text-gray-500 hover:text-gray-900'}`}
            title="Vista de Escritorio"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDeviceView('tablet')}
            className={`p-2 rounded-xl transition-all ${deviceView === 'tablet' ? 'bg-white text-gray-900 shadow-md scale-105' : 'text-gray-500 hover:text-gray-900'}`}
            title="Vista de Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDeviceView('mobile')}
            className={`p-2 rounded-xl transition-all ${deviceView === 'mobile' ? 'bg-white text-gray-900 shadow-md scale-105' : 'text-gray-500 hover:text-gray-900'}`}
            title="Vista de Celular"
          >
            <Phone className="w-4 h-4" />
          </button>
          
          {deviceView !== 'desktop' && (
            <div className="flex items-center gap-1 ml-1 border-l border-gray-300 pl-2">
              <button 
                onClick={() => setDeviceOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white/50 transition-all"
                title="Rotar Pantalla"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-gray-400 capitalize px-1">{deviceOrientation}</span>
            </div>
          )}
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs text-white shadow-md transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 tracking-wider ${
              saved 
                ? 'bg-emerald-500 shadow-emerald-100 hover:bg-emerald-600' 
                : (type === 'enterprise' ? 'bg-cyan-600 shadow-cyan-100 hover:bg-cyan-700' : 'bg-[#0a66c2] shadow-blue-100 hover:bg-blue-700')
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4 stroke-[3px]" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'GUARDANDO...' : saved ? 'Â¡GUARDADO!' : 'GUARDAR CAMBIOS'}
          </button>
        </div>

      </div>

      {/* 2. SPLIT LAYOUT CONTENEDOR */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* BOTON TOGGLE SIDEBAR */}
        <div className={`absolute top-1/2 z-30 transition-all duration-300 ease-in-out`} style={{ left: isSidebarOpen ? '400px' : '0px', transform: 'translateY(-50%)' }}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white border border-gray-200 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)] rounded-r-xl rounded-l-none w-6 h-12 flex items-center justify-center hover:bg-gray-50 hover:w-7 transition-all group border-l-0"
            title={isSidebarOpen ? "Ocultar panel" : "Mostrar panel"}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-cyan-600 transition-colors" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-600 transition-colors" />
            )}
          </button>
        </div>
        
        {/* SIDEBAR DE EDICION (IZQUIERDA) */}
        <div className={`border-r border-gray-200 bg-white flex flex-col h-full z-20 shadow-md shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[400px]' : 'w-0 overflow-hidden border-none opacity-0'}`}>
          
          {/* Cabecera Sidebar */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
            {type === 'enterprise' ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Editor de Landing</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                {['basica','precio','estructura','detalles'].map(p => (
                  <button key={p} onClick={() => setActivePanel(p)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activePanel === p ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                    {p === 'basica' ? 'Básica' : p === 'precio' ? 'Precios' : p === 'estructura' ? 'Estructura' : 'FAQ'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
            
            {/* PANEL EDICIÓN: MODO EMPRESA (ENTERPRISE) */}
            {type === 'enterprise' && (
              <EnterpriseEditorPanels
                enterpriseData={enterpriseData}
                setEnterpriseData={setEnterpriseData}
                handleImageKitUpload={handleImageKitUpload}
                uploadingImage={uploadingImage}
                renderImageUpload={renderImageUpload}
                enterpriseTab={enterpriseTab}
              />
            )}

            {/* PANEL EDICIÓN: MODO PROFESIONAL */}
            {type !== 'enterprise' && (
              <>
                {/* 1. SECCIÓN BÃSICA PROFESIONAL */}
                {activePanel === 'basica' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <h4 className="text-xs font-black text-[#0a66c2] uppercase tracking-widest mb-4">Metadatos Principales</h4>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Título del Servicio</label>
                      <input 
                        type="text" 
                        value={formData.titulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Ej: Logotipo Profesional de Alta Gama"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Subtítulo / Lema</label>
                      <input 
                        type="text" 
                        value={formData.subtitulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, subtitulo: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Ej: Impulsa tu marca con un diseño moderno y minimalista"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Descripción Completa</label>
                      <textarea 
                        value={formData.descripcion}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all min-h-[120px]"
                        placeholder="Describe detalladamente qué incluye tu servicio, alcances y especialidades..."
                      />
                    </div>

                    {/* Carga del banner */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Banner del Servicio</label>
                      <div className="relative group aspect-video rounded-2xl overflow-hidden border border-dashed border-gray-200 hover:border-blue-500 transition-colors bg-white flex items-center justify-center">
                        {formData.imagen ? (
                          <>
                            <img src={formData.imagen} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-full text-[10px] font-bold shadow-xl hover:scale-105 transition-all">
                                Cambiar Banner
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageKitUpload(e.target.files[0])} />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Camera className="w-8 h-8 stroke-1" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Subir Banner</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageKitUpload(e.target.files[0])} />
                          </label>
                        )}
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PLAN Y PRECIO PROFESIONAL */}
                {activePanel === 'precio' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <h4 className="text-xs font-black text-[#0a66c2] uppercase tracking-widest mb-4">Esquema de Precios</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Moneda</label>
                        <select 
                          value={formData.moneda}
                          onChange={(e) => setFormData(prev => ({ ...prev, moneda: e.target.value }))}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (â‚¬)</option>
                          <option value="COP">COP ($)</option>
                          <option value="MXN">MXN ($)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Precio Base</label>
                        <input 
                          type="number" 
                          value={formData.precio_base}
                          onChange={(e) => setFormData(prev => ({ ...prev, precio_base: Number(e.target.value) }))}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-black outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Porcentaje Oferta (%)</label>
                        <input 
                          type="number" 
                          value={formData.porcentaje_oferta}
                          onChange={(e) => setFormData(prev => ({ ...prev, porcentaje_oferta: Number(e.target.value) }))}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                          max={100}
                          min={0}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Precio Final</label>
                        <div className="w-full bg-gray-100 rounded-xl px-3 py-2 text-xs font-black text-gray-600 border border-gray-200">
                          {formData.porcentaje_oferta > 0 
                            ? (formData.precio_base * (1 - formData.porcentaje_oferta / 100)).toFixed(2)
                            : formData.precio_base.toFixed(2)} {formData.moneda}
                        </div>
                      </div>
                    </div>

                    {/* Entregables */}
                    <div className="border-t border-gray-150 pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-black uppercase text-gray-600 tracking-wider">Lista de Entregables</h5>
                        <button 
                          onClick={() => {
                            const newEnt = { titulo: 'Entregable Nuevo', descripcion: 'Fases, archivos, códigos...', valor_individual: 0, tiempo_limite: '2 días' };
                            setFormData(prev => ({ ...prev, entregables: [...prev.entregables, newEnt] }));
                          }}
                          className="text-[10px] font-black text-blue-600 uppercase hover:scale-105 transition-all"
                        >
                          + AGREGAR
                        </button>
                      </div>

                      {formData.entregables.map((ent, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 relative group/item space-y-2 shadow-sm">
                          <button
                            onClick={() => {
                              const copy = [...formData.entregables];
                              copy.splice(idx, 1);
                              setFormData(prev => ({ ...prev, entregables: copy }));
                            }}
                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <input 
                            type="text"
                            value={ent.titulo}
                            onChange={(e) => {
                              const copy = [...formData.entregables];
                              copy[idx].titulo = e.target.value;
                              setFormData(prev => ({ ...prev, entregables: copy }));
                            }}
                            className="w-[90%] bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none"
                            placeholder="Nombre del entregable"
                          />
                          <textarea 
                            value={ent.descripcion || ''}
                            onChange={(e) => {
                              const copy = [...formData.entregables];
                              copy[idx].descripcion = e.target.value;
                              setFormData(prev => ({ ...prev, entregables: copy }));
                            }}
                            className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-1 text-[10px] outline-none resize-none transition-all focus:border-blue-400 focus:bg-white"
                            placeholder="Descripción del entregable (ej: Fases, archivos, códigos...)"
                            rows={2}
                          />
                          <input 
                            type="text"
                            value={ent.tiempo_limite}
                            onChange={(e) => {
                              const copy = [...formData.entregables];
                              copy[idx].tiempo_limite = e.target.value;
                              setFormData(prev => ({ ...prev, entregables: copy }));
                            }}
                            className="w-[45%] bg-slate-50 border border-gray-150 rounded px-1.5 py-0.5 text-[10px] outline-none mr-2"
                            placeholder="Tiempo límite (ej: 2 días)"
                          />
                          <input 
                            type="number"
                            value={ent.valor_individual}
                            onChange={(e) => {
                              const copy = [...formData.entregables];
                              copy[idx].valor_individual = Number(e.target.value);
                              setFormData(prev => ({ ...prev, entregables: copy }));
                            }}
                            className="w-[45%] bg-slate-50 border border-gray-150 rounded px-1.5 py-0.5 text-[10px] outline-none"
                            placeholder="Valor individual"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. ESTRUCTURA: BENEFICIOS Y PROCESOS */}
                {activePanel === 'estructura' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <h4 className="text-xs font-black text-[#0a66c2] uppercase tracking-widest mb-4">Estructura del Landing</h4>

                    {/* Beneficios */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-[10px] font-black uppercase text-gray-700 tracking-wider">Beneficios Destacados</span>
                        <button 
                          onClick={() => {
                            const newBen = { titulo: 'Beneficio Clave', descripcion: 'Â¿Por qué elegirte?', icono: 'Zap' };
                            setFormData(prev => ({ ...prev, beneficios: [...prev.beneficios, newBen] }));
                          }}
                          className="text-[9px] font-black text-blue-600 uppercase hover:scale-105 transition-all"
                        >
                          + AGREGAR
                        </button>
                      </div>

                      {formData.beneficios.map((ben, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl relative group/item space-y-2 border border-gray-100">
                          <button
                            onClick={() => {
                              const copy = [...formData.beneficios];
                              copy.splice(idx, 1);
                              setFormData(prev => ({ ...prev, beneficios: copy }));
                            }}
                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-2">
                            <select
                              value={ben.icono || 'Zap'}
                              onChange={(e) => {
                                const copy = [...formData.beneficios];
                                copy[idx].icono = e.target.value;
                                setFormData(prev => ({ ...prev, beneficios: copy }));
                              }}
                              className="text-[10px] font-bold bg-white border border-gray-200 rounded px-1.5 py-0.5 outline-none"
                            >
                              {AVAILABLE_ICONS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                            </select>
                            <input 
                              type="text"
                              value={ben.titulo}
                              onChange={(e) => {
                                const copy = [...formData.beneficios];
                                copy[idx].titulo = e.target.value;
                                setFormData(prev => ({ ...prev, beneficios: copy }));
                              }}
                              className="w-[70%] bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none"
                            />
                          </div>
                          <textarea
                            value={ben.descripcion}
                            onChange={(e) => {
                              const copy = [...formData.beneficios];
                              copy[idx].descripcion = e.target.value;
                              setFormData(prev => ({ ...prev, beneficios: copy }));
                            }}
                            className="w-full bg-transparent text-[11px] font-medium text-gray-500 outline-none resize-none"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Proceso de Trabajo */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-[10px] font-black uppercase text-gray-700 tracking-wider">Fases de Trabajo</span>
                        <button 
                          onClick={() => {
                            const newProc = { orden: formData.proceso_trabajo.length + 1, titulo: 'Nueva Fase', descripcion: 'Acciones clave de esta etapa...' };
                            setFormData(prev => ({ ...prev, proceso_trabajo: [...prev.proceso_trabajo, newProc] }));
                          }}
                          className="text-[9px] font-black text-blue-600 uppercase hover:scale-105 transition-all"
                        >
                          + AGREGAR
                        </button>
                      </div>

                      {formData.proceso_trabajo.map((proc, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl relative group/item space-y-2 border border-gray-100">
                          <button
                            onClick={() => {
                              const copy = [...formData.proceso_trabajo];
                              copy.splice(idx, 1);
                              setFormData(prev => ({ ...prev, proceso_trabajo: copy.map((p, i) => ({ ...p, orden: i + 1 })) }));
                            }}
                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <span className="bg-[#0a66c2] text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black">{idx + 1}</span>
                            <input 
                              type="text"
                              value={proc.titulo}
                              onChange={(e) => {
                                const copy = [...formData.proceso_trabajo];
                                copy[idx].titulo = e.target.value;
                                setFormData(prev => ({ ...prev, proceso_trabajo: copy }));
                              }}
                              className="w-[85%] bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none"
                            />
                          </div>
                          <textarea
                            value={proc.descripcion}
                            onChange={(e) => {
                              const copy = [...formData.proceso_trabajo];
                              copy[idx].descripcion = e.target.value;
                              setFormData(prev => ({ ...prev, proceso_trabajo: copy }));
                            }}
                            className="w-full bg-transparent text-[11px] font-medium text-gray-500 outline-none resize-none"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. CONFIG, TECH Y FAQS PROFESIONAL */}
                {activePanel === 'detalles' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <h4 className="text-xs font-black text-[#0a66c2] uppercase tracking-widest mb-4">Garantía & FAQ</h4>

                    <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-gray-200">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Garantía (Días)</label>
                        <input 
                          type="number" 
                          value={formData.garantia_dias}
                          onChange={(e) => setFormData(prev => ({ ...prev, garantia_dias: Number(e.target.value) }))}
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Revisiones</label>
                        <input 
                          type="number" 
                          value={formData.revisiones_incluidas}
                          onChange={(e) => setFormData(prev => ({ ...prev, revisiones_incluidas: Number(e.target.value) }))}
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-black outline-none"
                        />
                      </div>
                    </div>

                    {/* FAQs */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-[10px] font-black uppercase text-gray-700 tracking-wider">Preguntas Frecuentes</span>
                        <button 
                          onClick={() => {
                            const newFaq = { pregunta: 'Â¿Qué requieres para iniciar?', respuesta: 'Respuestas claras...' };
                            setFormData(prev => ({ ...prev, faqs: [...prev.faqs, newFaq] }));
                          }}
                          className="text-[9px] font-black text-blue-600 uppercase hover:scale-105 transition-all"
                        >
                          + AGREGAR
                        </button>
                      </div>

                      {formData.faqs.map((faq, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl relative group/item space-y-2 border border-gray-100">
                          <button
                            onClick={() => {
                              const copy = [...formData.faqs];
                              copy.splice(idx, 1);
                              setFormData(prev => ({ ...prev, faqs: copy }));
                            }}
                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <input 
                            type="text"
                            value={faq.pregunta}
                            onChange={(e) => {
                              const copy = [...formData.faqs];
                              copy[idx].pregunta = e.target.value;
                              setFormData(prev => ({ ...prev, faqs: copy }));
                            }}
                            className="w-[90%] bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none"
                          />
                          <textarea
                            value={faq.respuesta}
                            onChange={(e) => {
                              const copy = [...formData.faqs];
                              copy[idx].respuesta = e.target.value;
                              setFormData(prev => ({ ...prev, faqs: copy }));
                            }}
                            className="w-full bg-transparent text-[11px] font-medium text-gray-500 outline-none resize-none"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>

        {/* CONTENEDOR DEL CANVAS DE PREVISUALIZACIÓN (DERECHA) */}
        <div className={`flex-1 flex justify-center overflow-y-auto z-10 custom-scrollbar relative ${
          deviceView === 'desktop' ? 'items-start p-0 bg-white' : 'items-center p-8 bg-gray-100/60'
        }`}>
          
          {/* Frame de Dispositivo Virtual (Estilo Figma/Bionano) */}
          <div 
            style={{ 
              width: getCanvasWidth(), 
              height: deviceView === 'desktop' ? 'auto' : getCanvasHeight(),
              maxWidth: '100%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className={`transition-all duration-300 flex flex-col overflow-hidden ${
              deviceView === 'desktop' ? 'rounded-none w-full min-h-full bg-white border-none shadow-none' : 'bg-white shadow-2xl border border-gray-200 rounded-[32px] border-[10px] border-slate-900 shadow-slate-900/10 shrink-0'
            }`}
          >
            {/* Header decorativo del teléfono/tablet */}
            {deviceView !== 'desktop' && (
              <div className="h-6 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 text-[10px] font-bold select-none">
                <span>9:41 AM</span>
                <div className="w-20 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1" />
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white opacity-80" />
                  <span className="w-2.5 h-1.5 bg-white rounded-sm opacity-80" />
                </div>
              </div>
            )}

            {/* AREA RENDER EN TIEMPO REAL */}
            <div className={`bg-gray-50 select-none ${
              deviceView === 'desktop' ? 'w-full h-[calc(100vh-64px)]' : 'flex-1 min-h-0 overflow-y-auto custom-scrollbar'
            }`}>
              
              <div className={`w-full ${type === 'professional' ? 'pointer-events-none' : ''} ${
                deviceView === 'desktop' ? 'h-full' : 'h-full'
              }`}>
                {/* RENDER PREVIEW: MODO EMPRESA (ENTERPRISE - LayoutDynamicPage) */}
                {type === 'enterprise' ? (
                <div className="w-full text-[#333] bg-white h-full flex flex-col relative" style={{ minHeight: 'calc(100vh - 64px)' }}>
                  <iframe 
                    id="holding-preview"
                    src={enterpriseTab === 'prices'
                      ? (window.location.hostname === 'localhost'
                        ? `http://localhost:3000/servicios/${enterpriseData.empresa_id || formData.empresa_id || 1}/${enterpriseData.slug || 'nuevo'}/precios?preview=true`
                        : `https://hitpoly.com/servicios/${enterpriseData.empresa_id || formData.empresa_id || 1}/${enterpriseData.slug || 'nuevo'}/precios?preview=true`)
                      : (window.location.hostname === 'localhost'
                        ? `http://localhost:3000/servicios/${enterpriseData.empresa_id || formData.empresa_id || 1}/${enterpriseData.slug || 'nuevo'}?preview=true`
                        : `https://hitpoly.com/servicios/${enterpriseData.empresa_id || formData.empresa_id || 1}/${enterpriseData.slug || 'nuevo'}?preview=true`)}
                    title="Previsualización Holding"
                    className="w-full h-full border-0 absolute inset-0"
                  />
                </div>
              ) : (
                
                /* RENDER PREVIEW: MODO PROFESIONAL â€” Componente público real */
                <ServiceDetail isPreviewMode={true} previewService={formData} />
              )}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
