<?php
require_once __DIR__ . '/modelos/Conexion.php';

header('Content-Type: application/json');

try {
    $con = new Conexion();
    $pdo = $con->pdo;
    
    // 1. Probar conexión
    $stmt = $pdo->query("SELECT DATABASE() as db");
    $dbData = $stmt->fetch();
    $dbName = is_object($dbData) ? $dbData->db : ($dbData['db'] ?? 'unknown');
    
    // 2. Contar sectores
    $stmtCount = $pdo->query("SELECT COUNT(*) as total FROM sectores");
    $countData = $stmtCount->fetch();
    $totalSectores = is_object($countData) ? ($countData->total ?? 0) : ($countData['total'] ?? 0);
    
    // 3. Ver una muestra
    $stmtSample = $pdo->query("SELECT * FROM sectores LIMIT 3");
    $sample = $stmtSample->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "database" => $dbName,
        "total_sectores" => $totalSectores,
        "muestra" => $sample
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
