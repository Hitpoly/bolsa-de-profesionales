import { PerfilCompleto } from '../types/profile';

// Datos de ejemplo basados en la estructura del endpoint obtenerTodoElPerfil
export const mockProfiles: PerfilCompleto[] = [
  {
    usuario_principal: {
      nombre: "María",
      apellido: "González",
      avatar: "https://images.unsplash.com/photo-1732210038531-9cefab37885a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGRldmVsb3BlciUyMGxhcHRvcHxlbnwxfHx8fDE3NzYzNTU0MjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      id_cargo: 141,
      nombre_cargo: "Front-end Developer"
    },
    perfil_general: {
      bio: "Desarrolladora front-end especializada en React y TypeScript",
      cover_photo: "",
      cover_photo_position_x: 0,
      cover_photo_position_y: 0
    },
    datos_personales: {
      relationship_status: "",
      gender: "Femenino",
      pronouns: "ella/she",
      birth_date: "1995-03-15",
      country: "México",
      city: "Ciudad de México",
      address: "",
      zip_code: "03100",
      identification_doc: ""
    },
    perfil_nombres: {
      pronunciation: "ma-REE-ah",
      nicknames: "Mary",
      last_name_2: "López"
    },
    sobre_mi: {
      about_text: "Desarrolladora front-end con 5 años de experiencia creando interfaces modernas y accesibles. Especializada en React, TypeScript y diseño responsivo. Me apasiona crear experiencias de usuario excepcionales.",
      favorite_quotes: "El código limpio siempre parece que fue escrito por alguien a quien le importa"
    },
    experiencia_laboral: [
      {
        id: 1,
        user_id: 1,
        company_name: "TechCorp México",
        job_title: "Senior Front-end Developer",
        location: "Ciudad de México",
        start_date: "2021-01-15",
        end_date: null,
        description: "Lideré el desarrollo de aplicaciones web con React y TypeScript. Implementé mejores prácticas y mentoría al equipo junior.",
        es_destacado: 1
      },
      {
        id: 2,
        user_id: 1,
        company_name: "Startup Digital",
        job_title: "Front-end Developer",
        location: "Remoto",
        start_date: "2019-06-01",
        end_date: "2020-12-31",
        description: "Desarrollo de interfaces de usuario y optimización de rendimiento.",
        es_destacado: 0
      }
    ],
    empleo: [
      {
        id: 1,
        user_id: 1,
        company_name: "TechCorp México",
        position: "Senior Front-end Developer",
        description: "Desarrollo de aplicaciones web escalables",
        city: "Ciudad de México",
        start_date: "2021-01-15"
      }
    ],
    educacion: [
      {
        id: 1,
        user_id: 1,
        institution_name: "Universidad Nacional Autónoma de México",
        degree_type: "Licenciatura",
        specialization: "Ingeniería en Computación",
        start_year: "2013",
        end_year: "2017"
      }
    ],
    contacto: [
      {
        contact_type: "EMAIL",
        contact_value: "maria.gonzalez@example.com",
        privacy: "public"
      },
      {
        contact_type: "PHONE",
        contact_value: "+52 55 1234 5678",
        privacy: "private"
      }
    ],
    familia: [],
    hobbies: [
      { hobby_name: "Fotografía" },
      { hobby_name: "Yoga" },
      { hobby_name: "Lectura técnica" }
    ],
    viajes: [],
    intereses: [],
    links: [
      { url: "https://linkedin.com/in/mariagonzalez", label: "LinkedIn" },
      { url: "https://github.com/mariagonzalez", label: "GitHub" }
    ],
    idiomas_lista: [
      { idioma: "Español", nivel: "Nativo" },
      { idioma: "Inglés", nivel: "Avanzado" }
    ],
    total_amigos: 145,
    amigos_preview: []
  },
  {
    usuario_principal: {
      nombre: "Carlos",
      apellido: "Rodríguez",
      avatar: "https://images.unsplash.com/photo-1656313826909-1f89d1702a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBibGFjayUyMG1hbiUyMGNyZWF0aXZlfGVufDF8fHx8MTc3NjM1NTQyNXww&ixlib=rb-4.1.0&q=80&w=1080",
      id_cargo: 143,
      nombre_cargo: "Full Stack Developer"
    },
    perfil_general: {
      bio: "Desarrollador full stack con enfoque en Node.js y React",
      cover_photo: "",
      cover_photo_position_x: 0,
      cover_photo_position_y: 0
    },
    datos_personales: {
      relationship_status: "",
      gender: "Masculino",
      pronouns: "él/he",
      birth_date: "1992-08-20",
      country: "Colombia",
      city: "Bogotá",
      address: "",
      zip_code: "110111",
      identification_doc: ""
    },
    perfil_nombres: {
      pronunciation: "CAR-los",
      nicknames: "",
      last_name_2: "Martínez"
    },
    sobre_mi: {
      about_text: "Desarrollador full stack con más de 6 años de experiencia en desarrollo de aplicaciones web y móviles. Experto en arquitecturas escalables y buenas prácticas de desarrollo.",
      favorite_quotes: "Primero hazlo funcionar, luego hazlo correcto, después hazlo rápido"
    },
    experiencia_laboral: [
      {
        id: 3,
        user_id: 2,
        company_name: "Globant",
        job_title: "Full Stack Developer",
        location: "Bogotá, Colombia",
        start_date: "2020-03-01",
        end_date: null,
        description: "Desarrollo de soluciones web completas usando Node.js, React y MongoDB.",
        es_destacado: 1
      }
    ],
    empleo: [
      {
        id: 2,
        user_id: 2,
        company_name: "Globant",
        position: "Full Stack Developer",
        description: "Desarrollo de aplicaciones empresariales",
        city: "Bogotá",
        start_date: "2020-03-01"
      }
    ],
    educacion: [
      {
        id: 2,
        user_id: 2,
        institution_name: "Universidad de los Andes",
        degree_type: "Ingeniería",
        specialization: "Ingeniería de Sistemas",
        start_year: "2010",
        end_year: "2015"
      }
    ],
    contacto: [
      {
        contact_type: "EMAIL",
        contact_value: "carlos.rodriguez@example.com",
        privacy: "public"
      }
    ],
    familia: [],
    hobbies: [
      { hobby_name: "Gaming" },
      { hobby_name: "Ciclismo" }
    ],
    viajes: [],
    intereses: [],
    links: [
      { url: "https://linkedin.com/in/carlosrodriguez", label: "LinkedIn" }
    ],
    idiomas_lista: [
      { idioma: "Español", nivel: "Nativo" },
      { idioma: "Inglés", nivel: "Intermedio" }
    ],
    total_amigos: 89,
    amigos_preview: []
  },
  {
    usuario_principal: {
      nombre: "Ana",
      apellido: "Chen",
      avatar: "https://images.unsplash.com/photo-1758873268238-0b93e41fdcf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhc2lhbiUyMHdvbWFuJTIwZW50cmVwcmVuZXVyfGVufDF8fHx8MTc3NjM1NTQyNXww&ixlib=rb-4.1.0&q=80&w=1080",
      id_cargo: 134,
      nombre_cargo: "Especialista SEO"
    },
    perfil_general: {
      bio: "Especialista en SEO y marketing digital",
      cover_photo: "",
      cover_photo_position_x: 0,
      cover_photo_position_y: 0
    },
    datos_personales: {
      relationship_status: "",
      gender: "Femenino",
      pronouns: "ella/she",
      birth_date: "1994-11-10",
      country: "Perú",
      city: "Lima",
      address: "",
      zip_code: "15001",
      identification_doc: ""
    },
    perfil_nombres: {
      pronunciation: "AH-nah",
      nicknames: "",
      last_name_2: "Wang"
    },
    sobre_mi: {
      about_text: "Especialista en SEO con 4 años de experiencia ayudando a empresas a mejorar su visibilidad online. Certificada en Google Analytics y SEMrush.",
      favorite_quotes: "El contenido es el rey, pero el SEO es la reina"
    },
    experiencia_laboral: [
      {
        id: 4,
        user_id: 3,
        company_name: "AgenciaSEO",
        job_title: "SEO Specialist",
        location: "Lima, Perú",
        start_date: "2022-01-10",
        end_date: null,
        description: "Optimización de sitios web para motores de búsqueda, análisis de keywords y estrategias de contenido.",
        es_destacado: 1
      }
    ],
    empleo: [
      {
        id: 3,
        user_id: 3,
        company_name: "AgenciaSEO",
        position: "SEO Specialist",
        description: "Estrategias de posicionamiento web",
        city: "Lima",
        start_date: "2022-01-10"
      }
    ],
    educacion: [
      {
        id: 3,
        user_id: 3,
        institution_name: "Pontificia Universidad Católica del Perú",
        degree_type: "Licenciatura",
        specialization: "Marketing",
        start_year: "2012",
        end_year: "2016"
      }
    ],
    contacto: [
      {
        contact_type: "EMAIL",
        contact_value: "ana.chen@example.com",
        privacy: "public"
      }
    ],
    familia: [],
    hobbies: [
      { hobby_name: "Blogging" },
      { hobby_name: "Fotografía gastronómica" }
    ],
    viajes: [],
    intereses: [],
    links: [
      { url: "https://linkedin.com/in/anachen", label: "LinkedIn" }
    ],
    idiomas_lista: [
      { idioma: "Español", nivel: "Nativo" },
      { idioma: "Inglés", nivel: "Avanzado" },
      { idioma: "Chino", nivel: "Intermedio" }
    ],
    total_amigos: 234,
    amigos_preview: []
  },
  {
    usuario_principal: {
      nombre: "Sofía",
      apellido: "Martínez",
      avatar: "https://images.unsplash.com/photo-1646032540224-4ab44f77e6f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBsYXRpbmElMjB3b21hbiUyMGJ1c2luZXNzfGVufDF8fHx8MTc3NjI1MDIyMnww&ixlib=rb-4.1.0&q=80&w=1080",
      id_cargo: 138,
      nombre_cargo: "Copywriter"
    },
    perfil_general: {
      bio: "Copywriter creativa especializada en contenido para marcas",
      cover_photo: "",
      cover_photo_position_x: 0,
      cover_photo_position_y: 0
    },
    datos_personales: {
      relationship_status: "",
      gender: "Femenino",
      pronouns: "ella/she",
      birth_date: "1996-05-25",
      country: "Argentina",
      city: "Buenos Aires",
      address: "",
      zip_code: "C1001",
      identification_doc: ""
    },
    perfil_nombres: {
      pronunciation: "so-FEE-ah",
      nicknames: "Sofi",
      last_name_2: "Fernández"
    },
    sobre_mi: {
      about_text: "Copywriter especializada en crear contenido persuasivo para marcas. Trabajo con empresas para comunicar su mensaje de forma clara y efectiva.",
      favorite_quotes: "Las palabras tienen poder"
    },
    experiencia_laboral: [
      {
        id: 5,
        user_id: 4,
        company_name: "Agencia Creativa BA",
        job_title: "Senior Copywriter",
        location: "Buenos Aires, Argentina",
        start_date: "2021-05-01",
        end_date: null,
        description: "Creación de contenido publicitario para campañas digitales y tradicionales.",
        es_destacado: 1
      }
    ],
    empleo: [
      {
        id: 4,
        user_id: 4,
        company_name: "Agencia Creativa BA",
        position: "Senior Copywriter",
        description: "Redacción publicitaria y estrategia de contenido",
        city: "Buenos Aires",
        start_date: "2021-05-01"
      }
    ],
    educacion: [
      {
        id: 4,
        user_id: 4,
        institution_name: "Universidad de Buenos Aires",
        degree_type: "Licenciatura",
        specialization: "Comunicación Social",
        start_year: "2014",
        end_year: "2018"
      }
    ],
    contacto: [
      {
        contact_type: "EMAIL",
        contact_value: "sofia.martinez@example.com",
        privacy: "public"
      }
    ],
    familia: [],
    hobbies: [
      { hobby_name: "Escritura creativa" },
      { hobby_name: "Teatro" }
    ],
    viajes: [],
    intereses: [],
    links: [
      { url: "https://linkedin.com/in/sofiamartinez", label: "LinkedIn" },
      { url: "https://behance.net/sofiamartinez", label: "Behance" }
    ],
    idiomas_lista: [
      { idioma: "Español", nivel: "Nativo" },
      { idioma: "Inglés", nivel: "Avanzado" },
      { idioma: "Portugués", nivel: "Básico" }
    ],
    total_amigos: 178,
    amigos_preview: []
  },
  {
    usuario_principal: {
      nombre: "Rajesh",
      apellido: "Kumar",
      avatar: "https://images.unsplash.com/photo-1659355894218-47ead670f7f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBpbmRpYW4lMjBtYW4lMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3NjM1NTQyNXww&ixlib=rb-4.1.0&q=80&w=1080",
      id_cargo: 142,
      nombre_cargo: "Back-end Developer"
    },
    perfil_general: {
      bio: "Desarrollador back-end especializado en Python y microservicios",
      cover_photo: "",
      cover_photo_position_x: 0,
      cover_photo_position_y: 0
    },
    datos_personales: {
      relationship_status: "",
      gender: "Masculino",
      pronouns: "él/he",
      birth_date: "1990-02-14",
      country: "Chile",
      city: "Santiago",
      address: "",
      zip_code: "8320000",
      identification_doc: ""
    },
    perfil_nombres: {
      pronunciation: "ra-JESH",
      nicknames: "Raj",
      last_name_2: "Singh"
    },
    sobre_mi: {
      about_text: "Desarrollador back-end con amplia experiencia en Python, Django y arquitecturas de microservicios. Apasionado por la optimización y el código limpio.",
      favorite_quotes: "La simplicidad es la máxima sofisticación"
    },
    experiencia_laboral: [
      {
        id: 6,
        user_id: 5,
        company_name: "FinTech Solutions",
        job_title: "Senior Backend Developer",
        location: "Santiago, Chile",
        start_date: "2019-08-01",
        end_date: null,
        description: "Desarrollo de APIs REST y microservicios para plataforma financiera.",
        es_destacado: 1
      }
    ],
    empleo: [
      {
        id: 5,
        user_id: 5,
        company_name: "FinTech Solutions",
        position: "Senior Backend Developer",
        description: "Arquitectura de sistemas escalables",
        city: "Santiago",
        start_date: "2019-08-01"
      }
    ],
    educacion: [
      {
        id: 5,
        user_id: 5,
        institution_name: "Universidad de Chile",
        degree_type: "Ingeniería",
        specialization: "Ingeniería Civil en Computación",
        start_year: "2008",
        end_year: "2013"
      }
    ],
    contacto: [
      {
        contact_type: "EMAIL",
        contact_value: "rajesh.kumar@example.com",
        privacy: "public"
      }
    ],
    familia: [],
    hobbies: [
      { hobby_name: "Ajedrez" },
      { hobby_name: "Montañismo" }
    ],
    viajes: [],
    intereses: [],
    links: [
      { url: "https://linkedin.com/in/rajeshkumar", label: "LinkedIn" },
      { url: "https://github.com/rajeshkumar", label: "GitHub" }
    ],
    idiomas_lista: [
      { idioma: "Español", nivel: "Nativo" },
      { idioma: "Inglés", nivel: "Avanzado" },
      { idioma: "Hindi", nivel: "Nativo" }
    ],
    total_amigos: 267,
    amigos_preview: []
  },
  {
    usuario_principal: {
      nombre: "Laura",
      apellido: "Vega",
      avatar: "https://images.unsplash.com/photo-1732210038531-9cefab37885a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGRldmVsb3BlciUyMGxhcHRvcHxlbnwxfHx8fDE3NzYzNTU0MjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      id_cargo: 136,
      nombre_cargo: "Community Manager"
    },
    perfil_general: {
      bio: "Community Manager creativa con enfoque en estrategia digital",
      cover_photo: "",
      cover_photo_position_x: 0,
      cover_photo_position_y: 0
    },
    datos_personales: {
      relationship_status: "",
      gender: "Femenino",
      pronouns: "ella/she",
      birth_date: "1997-09-03",
      country: "España",
      city: "Madrid",
      address: "",
      zip_code: "28001",
      identification_doc: ""
    },
    perfil_nombres: {
      pronunciation: "LAU-rah",
      nicknames: "Lau",
      last_name_2: "Ruiz"
    },
    sobre_mi: {
      about_text: "Community Manager especializada en crear comunidades digitales comprometidas. Experiencia en redes sociales, contenido viral y análisis de métricas.",
      favorite_quotes: "Las redes sociales no son medios, son relaciones"
    },
    experiencia_laboral: [
      {
        id: 7,
        user_id: 6,
        company_name: "Social Media Agency",
        job_title: "Community Manager Senior",
        location: "Madrid, España",
        start_date: "2020-11-01",
        end_date: null,
        description: "Gestión de redes sociales para múltiples marcas, creación de contenido y análisis de resultados.",
        es_destacado: 1
      }
    ],
    empleo: [
      {
        id: 6,
        user_id: 6,
        company_name: "Social Media Agency",
        position: "Community Manager Senior",
        description: "Estrategia de redes sociales",
        city: "Madrid",
        start_date: "2020-11-01"
      }
    ],
    educacion: [
      {
        id: 6,
        user_id: 6,
        institution_name: "Universidad Complutense de Madrid",
        degree_type: "Licenciatura",
        specialization: "Publicidad y Relaciones Públicas",
        start_year: "2015",
        end_year: "2019"
      }
    ],
    contacto: [
      {
        contact_type: "EMAIL",
        contact_value: "laura.vega@example.com",
        privacy: "public"
      }
    ],
    familia: [],
    hobbies: [
      { hobby_name: "Fotografía" },
      { hobby_name: "Viajar" },
      { hobby_name: "Podcasts" }
    ],
    viajes: [],
    intereses: [],
    links: [
      { url: "https://linkedin.com/in/lauravega", label: "LinkedIn" },
      { url: "https://instagram.com/lauravega", label: "Instagram" }
    ],
    idiomas_lista: [
      { idioma: "Español", nivel: "Nativo" },
      { idioma: "Inglés", nivel: "Avanzado" },
      { idioma: "Francés", nivel: "Intermedio" }
    ],
    total_amigos: 512,
    amigos_preview: []
  }
];

// Lista de cargos disponibles (basado en tu tabla cargos con id_tipo: 3)
export const cargosDisponibles = [
  { id: 134, name: "Especialista SEO" },
  { id: 136, name: "Community Manager" },
  { id: 138, name: "Copywriter" },
  { id: 141, name: "Front-end Developer" },
  { id: 142, name: "Back-end Developer" },
  { id: 143, name: "Full Stack Developer" },
  { id: 146, name: "Analista de Datos" },
  { id: 147, name: "Software Engineer" },
  { id: 148, name: "Project Manager" }
];
