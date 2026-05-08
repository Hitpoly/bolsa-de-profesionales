<?php
/**
 * Migración: Añadir columnas porcentaje_oferta y tiempo_total a bolsa_servicios
 * Ejecutar UNA VEZ desde el navegador o CLI para actualizar la tabla.
 */
header("Content-Type: application/json");
include_once __DIR__ . '/modelos/Conexion.php';

try {
    $db = new Conexion();
    $pdo = $db->pdo;
    
    // Verificar qué columnas ya existen
    $stmt = $pdo->query("SHOW COLUMNS FROM bolsa_servicios");
    $existingColumns = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $existingColumns[] = $row['Field'];
    }
    
    $added = [];
    
    if (!in_array('porcentaje_oferta', $existingColumns)) {
        $pdo->exec("ALTER TABLE bolsa_servicios ADD COLUMN porcentaje_oferta INT DEFAULT 0 AFTER precio_base");
        $added[] = 'porcentaje_oferta';
    }
    
    if (!in_array('tiempo_total', $existingColumns)) {
        $pdo->exec("ALTER TABLE bolsa_servicios ADD COLUMN tiempo_total VARCHAR(100) DEFAULT NULL AFTER oferta_fin");
        $added[] = 'tiempo_total';
    }
    
    // Verificar que precio_oferta existe
    if (!in_array('precio_oferta', $existingColumns)) {
        $pdo->exec("ALTER TABLE bolsa_servicios ADD COLUMN precio_oferta DECIMAL(12,2) DEFAULT NULL AFTER porcentaje_oferta");
        $added[] = 'precio_oferta';
    }
    
    // Verificar que oferta_fin existe
    if (!in_array('oferta_fin', $existingColumns)) {
        $pdo->exec("ALTER TABLE bolsa_servicios ADD COLUMN oferta_fin DATETIME DEFAULT NULL AFTER precio_oferta");
        $added[] = 'oferta_fin';
    }

    // Mostrar estado final de la tabla
    $stmt2 = $pdo->query("SHOW COLUMNS FROM bolsa_servicios");
    $finalColumns = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => count($added) > 0 ? 'Columnas añadidas: ' . implode(', ', $added) : 'Todas las columnas ya existían.',
        'columns_added' => $added,
        'table_structure' => $finalColumns
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
