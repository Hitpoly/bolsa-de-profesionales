// Tipos basados en el endpoint obtenerTodoElPerfil
export interface UsuarioPrincipal {
  nombre: string;
  apellido: string;
  avatar: string;
  id_cargo: number;
  nombre_cargo: string;
}

export interface ExperienciaLaboral {
  id: number;
  user_id: number;
  company_name: string;
  job_title: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
  es_destacado: number;
}

export interface Empleo {
  id: number;
  user_id: number;
  company_name: string;
  position: string;
  description: string;
  city: string;
  start_date: string;
}

export interface Educacion {
  id: number;
  user_id: number;
  institution_name: string;
  degree_type: string;
  specialization: string;
  start_year: string;
  end_year: string | null;
}

export interface Contacto {
  contact_type: string;
  contact_value: string;
  privacy: string;
}

export interface Link {
  url: string;
  label: string;
}

export interface Idioma {
  idioma: string;
  nivel: string;
}

export interface SobreMi {
  about_text: string;
  favorite_quotes: string;
}

export interface DatosPersonales {
  relationship_status: string;
  gender: string;
  pronouns: string;
  birth_date: string;
  country: string;
  city: string;
  address: string;
  zip_code: string;
  identification_doc: string;
}

export interface Hobby {
  hobby_name: string;
}

export interface PerfilCompleto {
  usuario_principal: UsuarioPrincipal;
  perfil_general: {
    bio: string;
    cover_photo: string;
    cover_photo_position_x: number;
    cover_photo_position_y: number;
  };
  datos_personales: DatosPersonales;
  perfil_nombres: {
    pronunciation: string;
    nicknames: string;
    last_name_2: string;
  };
  sobre_mi: SobreMi;
  experiencia_laboral: ExperienciaLaboral[];
  empleo: Empleo[];
  educacion: Educacion[];
  contacto: Contacto[];
  familia: any[];
  hobbies: Hobby[];
  viajes: any[];
  intereses: any[];
  links: Link[];
  idiomas_lista: Idioma[];
  total_amigos: number;
  amigos_preview: any[];
}
