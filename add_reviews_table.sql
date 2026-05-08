-- SQL para crear la tabla de reseñas en la base de datos de la Bolsa
CREATE TABLE IF NOT EXISTS bolsa_profile_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professional_id INT NOT NULL, -- ID del profesional que recibe la reseña (user_id de users en holding)
    reviewer_id INT NOT NULL,     -- ID del usuario que deja la reseña (user_id de users en holding)
    reviewer_name VARCHAR(255),    -- Nombre del que reseña (opcional, para cache)
    reviewer_avatar VARCHAR(500),  -- Avatar del que reseña (opcional)
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opcional: Índice para búsquedas rápidas
CREATE INDEX idx_professional_reviews ON bolsa_profile_reviews(professional_id);
