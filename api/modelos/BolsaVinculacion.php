<?php
include_once __DIR__ . '/Conexion.php';

class BolsaVinculacion {
    private $acceso;
    private $db_holding = "duveroli_holdinghitpoly";

    public function __construct() {
        $db = new Conexion();
        $this->acceso = $db->pdo;
    }

    public function registrarIngreso($userId) {
        try {
            // Verifica si ya hay una sesión abierta
            $sqlCheck = "SELECT id FROM {$this->db_holding}.bolsa_vinculacion 
                         WHERE user_id = :user_id AND fecha_salida IS NULL LIMIT 1";
            $queryCheck = $this->acceso->prepare($sqlCheck);
            $queryCheck->execute([':user_id' => $userId]);
            $exists = $queryCheck->fetch(PDO::FETCH_ASSOC);

            if ($exists) {
                return $exists['id'];
            }

            // Inserta una nueva sesión
            $sql = "INSERT INTO {$this->db_holding}.bolsa_vinculacion (user_id, fecha_ingreso) 
                    VALUES (:user_id, CURRENT_TIMESTAMP)";
            $query = $this->acceso->prepare($sql);
            $query->execute([':user_id' => $userId]);
            
            return $this->acceso->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error en Bolsa registrarIngreso: " . $e->getMessage());
            return false;
        }
    }

    public function registrarSalida($sessionId) {
        try {
            $sql = "UPDATE {$this->db_holding}.bolsa_vinculacion 
                    SET fecha_salida = CURRENT_TIMESTAMP, 
                        tiempo_total_minutos = TIMESTAMPDIFF(MINUTE, fecha_ingreso, CURRENT_TIMESTAMP)
                    WHERE id = :id AND fecha_salida IS NULL";
            $query = $this->acceso->prepare($sql);
            return $query->execute([':id' => $sessionId]);
        } catch (PDOException $e) {
            error_log("Error en Bolsa registrarSalida: " . $e->getMessage());
            return false;
        }
    }
}
?>
