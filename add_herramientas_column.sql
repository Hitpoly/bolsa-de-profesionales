ALTER TABLE bolsa_servicios 
ADD COLUMN herramientas JSON DEFAULT NULL COMMENT 'Almacena un array JSON de herramientas que se usarán en este servicio';
