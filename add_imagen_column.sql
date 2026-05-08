-- Ejecutar en la base de datos: duveroli_bolsa_profesionales
-- Agrega la columna 'imagen' a la tabla de servicios para guardar la portada del servicio
ALTER TABLE bolsa_servicios ADD COLUMN imagen VARCHAR(500) DEFAULT NULL AFTER moneda;
