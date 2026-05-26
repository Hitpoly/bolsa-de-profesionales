// =============================================
// TIPOS PARA SISTEMA DE VENTAS DE SERVICIOS
// Bolsa de Profesionales - Hitpoly
// =============================================

// ===== INTERFACES DE SERVICIOS =====

export interface Service {
  id: number;
  user_id: number;
  titulo: string;
  subtitulo?: string;
  descripcion: string;
  tipo: 'hora' | 'proyecto';
  precio_base: number;
  precio_oferta?: number;
  porcentaje_oferta?: number;
  moneda: string;
  imagen?: string;
  herramientas?: ToolItem[] | string;
  entregables?: DeliverableItem[] | string;
  
  // Nuevos campos para página de ventas
  beneficios?: BenefitItem[] | string;
  faqs?: FAQItem[] | string;
  requisitos_cliente?: string[] | string;
  proceso_trabajo?: ProcessStep[] | string;
  portfolio_items?: PortfolioItem[] | string;
  disponibilidad_horas?: number;
  tiempo_respuesta?: string;
  garantia_dias?: number;
  revisiones_incluidas?: number;
  
  tiempo_total?: string;
  oferta_fin?: string;
  estado: 'activo' | 'pausado' | 'eliminado';
  
  // Campos calculados
  avg_rating?: number;
  total_reviews?: number;
  
  created_at?: string;
  updated_at?: string;
}

export interface BenefitItem {
  icon?: string;
  titulo: string;
  descripcion: string;
}

export interface FAQItem {
  pregunta: string;
  respuesta: string;
}

export interface ProcessStep {
  orden: number;
  titulo: string;
  descripcion: string;
  duracion_estimada?: string;
}

export interface PortfolioItem {
  titulo: string;
  descripcion?: string;
  imagen_url?: string;
  enlace?: string;
}

export interface DeliverableItem {
  titulo: string;
  descripcion?: string;
  valor_individual?: number;
  tiempo_limite?: string;
}

export interface ToolItem {
  nombre?: string;
  name?: string;
  herramienta?: string;
  uso?: string;
}

// ===== INTERFACES DE RESEÑAS =====

export interface ServiceReview {
  id: number;
  service_id: number;
  user_id: number;
  professional_id: number;
  rating: number;
  comentario?: string;
  entregables_cumplidos: boolean;
  recomienda: boolean;
  usuario?: {
    nombre: string;
    apellido: string;
    foto?: string;
  };
  created_at: string;
}

// ===== INTERFACES DE ÓRDENES =====

export interface ServiceOrder {
  id: number;
  service_id: number;
  cliente_id: number;
  professional_id: number;
  tipo: 'hora' | 'proyecto';
  estado: 'pendiente' | 'aceptado' | 'en_progreso' | 'entregado' | 'revision' | 'completado' | 'cancelado';
  horas_contratadas?: number;
  precio_acordado: number;
  moneda: string;
  fecha_inicio?: string;
  fecha_entrega?: string;
  notas_cliente?: string;
  notas_profesional?: string;
  milestones?: ServiceMilestone[];
  created_at: string;
  updated_at?: string;
}

export interface ServiceMilestone {
  id: number;
  order_id: number;
  titulo: string;
  descripcion?: string;
  orden: number;
  porcentaje_pago: number;
  fecha_limite?: string;
  estado: 'pendiente' | 'en_progreso' | 'completado';
  created_at?: string;
}

// ===== INTERFACES PARA EDICIÓN =====

export interface ServiceEditorData {
  titulo: string;
  subtitulo?: string;
  descripcion: string;
  tipo: 'hora' | 'proyecto';
  precio_base: number;
  precio_oferta?: number;
  porcentaje_oferta?: number;
  moneda?: string;
  imagen?: string;
  herramientas: ToolItem[];
  entregables: DeliverableItem[];
  beneficios: BenefitItem[];
  faqs: FAQItem[];
  requisitos_cliente: string[];
  proceso_trabajo: ProcessStep[];
  portfolio_items: PortfolioItem[];
  disponibilidad_horas?: number;
  tiempo_respuesta?: string;
  garantia_dias?: number;
  revisiones_incluidas?: number;
  tiempo_total?: string;
  oferta_fin?: string;
}

// ===== TIPOS AUXILIARES =====

export type ServiceType = 'hora' | 'proyecto';
export type ServiceStatus = 'activo' | 'pausado' | 'eliminado';
export type OrderStatus = 'pendiente' | 'aceptado' | 'en_progreso' | 'entregado' | 'revision' | 'completado' | 'cancelado';
export type MilestoneStatus = 'pendiente' | 'en_progreso' | 'completado';

// ===== PROPS DE COMPONENTES =====

export interface ServiceDetailProps {
  service: Service;
  profile?: any;
}

export interface ServiceEditorModalProps {
  service?: Service;
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: ServiceEditorData) => void;
  isOwnProfile?: boolean;
}

export interface ServiceCheckoutModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderData: {
    horas?: number;
    fecha_entrega?: string;
    notas?: string;
  }) => void;
}

export interface ServiceReviewsProps {
  serviceId: number;
  professionalId: number;
  reviews: ServiceReview[];
  avgRating: number;
  totalReviews: number;
  canReview?: boolean;
  onAddReview?: (rating: number, comentario: string) => void;
}
