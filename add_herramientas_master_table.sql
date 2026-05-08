CREATE TABLE IF NOT EXISTS bolsa_herramientas_maestro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(50),
    icono VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunas herramientas comunes iniciales
INSERT IGNORE INTO bolsa_herramientas_maestro (nombre, categoria, icono) VALUES
('Figma', 'Diseño', 'PenTool'),
('Adobe Photoshop', 'Diseño', 'Image'),
('Adobe Illustrator', 'Diseño', 'Layers'),
('React', 'Desarrollo', 'Code'),
('Node.js', 'Desarrollo', 'Server'),
('Python', 'Desarrollo', 'Terminal'),
('PHP', 'Desarrollo', 'Code'),
('MySQL', 'Base de Datos', 'Database'),
('Google Ads', 'Marketing', 'TrendingUp'),
('Facebook Ads', 'Marketing', 'Users'),
('SEO', 'Marketing', 'Search'),
('Microsoft Excel', 'Productividad', 'Table'),
('Notion', 'Productividad', 'BookOpen'),
('Slack', 'Comunicación', 'MessageSquare'),
('Trello', 'Gestión', 'Layout'),
('Asana', 'Gestión', 'ClipboardList');
