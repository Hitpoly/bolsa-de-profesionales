-- ================================================================
-- REESCRITURA COMPLETA DE TABLAS
-- Ejecutar en: duveroli_bolsa_profesionales
-- ================================================================

-- Desactivar foreign key checks para poder borrar en orden
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS empresa_profesionales_buscados;
DROP TABLE IF EXISTS profesional_tipos;
DROP TABLE IF EXISTS tipos_profesionales;

SET FOREIGN_KEY_CHECKS = 1;


-- ================================================================
-- TABLA: tipos_profesionales
-- ================================================================

CREATE TABLE tipos_profesionales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'Work'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tipos_profesionales (categoria, nombre, descripcion, icono) VALUES
('Tecnología', 'Desarrollador Frontend', 'React, Vue, Angular, HTML/CSS', 'Code'),
('Tecnología', 'Desarrollador Backend', 'Node.js, PHP, Python, Java', 'Storage'),
('Tecnología', 'Desarrollador Full Stack', 'Frontend + Backend completo', 'DeveloperMode'),
('Tecnología', 'Desarrollador Mobile', 'iOS, Android, React Native, Flutter', 'PhoneIphone'),
('Tecnología', 'DevOps / Cloud Engineer', 'AWS, GCP, Docker, Kubernetes', 'Cloud'),
('Tecnología', 'Data Scientist', 'Machine Learning, Python, Análisis de datos', 'DataObject'),
('Tecnología', 'Data Analyst', 'SQL, Power BI, Tableau, Excel avanzado', 'BarChart'),
('Tecnología', 'QA / Tester', 'Pruebas manuales y automatizadas', 'BugReport'),
('Tecnología', 'Arquitecto de Software', 'Diseño de sistemas y arquitecturas', 'AccountTree'),
('Tecnología', 'Ciberseguridad', 'Pentesting, seguridad de redes', 'Security'),
('Tecnología', 'Inteligencia Artificial', 'LLMs, Computer Vision, NLP', 'Psychology'),
('Diseño', 'Diseñador UI/UX', 'Figma, Adobe XD, experiencia de usuario', 'Palette'),
('Diseño', 'Diseñador Gráfico', 'Illustrator, Photoshop, branding', 'Draw'),
('Diseño', 'Motion Designer', 'After Effects, animaciones, video', 'MovieFilter'),
('Diseño', 'Diseñador de Producto', 'Product thinking, prototipos', 'Widgets'),
('Diseño', 'Ilustrador Digital', 'Procreate, dibujo digital', 'Brush'),
('Diseño', 'Diseñador 3D', 'Blender, Cinema 4D, renderizado', 'ViewInAr'),
('Marketing', 'Especialista en SEO', 'Posicionamiento orgánico en buscadores', 'TravelExplore'),
('Marketing', 'Especialista en SEM / Ads', 'Google Ads, Meta Ads, campañas de pago', 'Ads'),
('Marketing', 'Community Manager', 'Gestión de redes sociales y comunidades', 'Groups'),
('Marketing', 'Content Creator', 'Creación de contenido para redes y blogs', 'Create'),
('Marketing', 'Email Marketing', 'Automatización, secuencias, newsletters', 'Email'),
('Marketing', 'Marketing de Afiliados', 'Performance marketing, conversiones', 'Percent'),
('Marketing', 'Estratega de Marketing', 'Planificación y ejecución de estrategias', 'Lightbulb'),
('Marketing', 'Growth Hacker', 'Crecimiento acelerado, experimentación', 'TrendingUp'),
('Ventas', 'Closer de Ventas', 'Cierre de ventas, manejo de objeciones', 'Handshake'),
('Ventas', 'SDR / Prospector', 'Generación de leads y prospección', 'PersonSearch'),
('Ventas', 'Account Manager', 'Gestión de cuentas y retención', 'ManageAccounts'),
('Ventas', 'Vendedor Telefónico', 'Cold calling, ventas por teléfono', 'SupportAgent'),
('Ventas', 'Key Account Manager', 'Clientes estratégicos y corporativos', 'Stars'),
('Negocios', 'Product Manager', 'Gestión de producto, roadmap, priorización', 'Inventory'),
('Negocios', 'Project Manager', 'Gestión de proyectos, metodologías ágiles', 'Assignment'),
('Negocios', 'Consultor de Negocios', 'Estrategia empresarial y optimización', 'BusinessCenter'),
('Negocios', 'Analista Financiero', 'Finanzas corporativas, modelos financieros', 'AccountBalance'),
('Negocios', 'Emprendedor / Founder', 'Fundador con experiencia en startups', 'Rocket'),
('Negocios', 'Scrum Master', 'Agilidad, facilitación de equipos', 'Speed'),
('Educación', 'Instructor Online', 'Creación de cursos y formación online', 'School'),
('Educación', 'Coach de Negocios', 'Mentoría empresarial y personal', 'EmojiPeople'),
('Educación', 'Copywriter', 'Escritura persuasiva, textos de venta', 'EditNote'),
('Operaciones', 'Asistente Virtual', 'Soporte administrativo remoto', 'AdminPanelSettings'),
('Operaciones', 'Customer Success', 'Éxito del cliente, retención y onboarding', 'Favorite'),
('Operaciones', 'Soporte Técnico', 'Helpdesk, soporte N1/N2', 'HeadsetMic'),
('Operaciones', 'Recursos Humanos', 'Selección, clima organizacional', 'People'),
('Operaciones', 'Contabilidad / Finanzas', 'Contabilidad, facturación, impuestos', 'Receipt');


-- ================================================================
-- TABLA: empresa_profesionales_buscados
-- Usa empresa_id porque un usuario puede tener VARIAS empresas
-- ================================================================

CREATE TABLE empresa_profesionales_buscados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    tipo_profesional_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unico_empresa_tipo (empresa_id, tipo_profesional_id),
    FOREIGN KEY (tipo_profesional_id) REFERENCES tipos_profesionales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ================================================================
-- TABLA: profesional_tipos
-- Un profesional puede tener varias habilidades pero se registra
-- solo una vez (la restriccion esta en bolsa_perfiles.user_id UNIQUE)
-- ================================================================

CREATE TABLE profesional_tipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tipo_profesional_id INT NOT NULL,
    nivel ENUM('junior', 'semi-senior', 'senior', 'experto') DEFAULT 'junior',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unico_tipo (user_id, tipo_profesional_id),
    FOREIGN KEY (tipo_profesional_id) REFERENCES tipos_profesionales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
