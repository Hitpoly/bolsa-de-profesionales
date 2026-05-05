<?php
include_once __DIR__ . '/Conexion.php';

class BolsaModel
{
    private $acceso;
    private $db_bolsa = "duveroli_bolsa_profesionales"; // Cambiar si es otra

    public function __construct()
    {
        $db = new Conexion();
        $this->acceso = $db->pdo;
    }

    public function getProfile($user_id)
    {
        try {
            $sql = "SELECT * FROM {$this->db_bolsa}.user_bolsa_profile WHERE user_id = :id";
            $query = $this->acceso->prepare($sql);
            $query->execute([':id' => $user_id]);
            return $query->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en BolsaModel::getProfile: " . $e->getMessage());
            return null;
        }
    }

    public function saveStep($user_id, $data)
    {
        try {
            $profile = $this->getProfile($user_id);
            
            if (!$profile) {
                $sql = "INSERT INTO {$this->db_bolsa}.user_bolsa_profile (user_id, user_type, current_step) 
                        VALUES (:user_id, :user_type, :step)";
                $query = $this->acceso->prepare($sql);
                return $query->execute([
                    ':user_id' => $user_id,
                    ':user_type' => $data['user_type'],
                    ':step' => $data['step'] ?? 1
                ]);
            } else {
                $fields = [];
                $params = [':user_id' => $user_id];
                
                foreach ($data as $key => $value) {
                    if ($key === 'user_id' || $key === 'id') continue;
                    $fields[] = "$key = :$key";
                    $params[":$key"] = $value;
                }
                
                $sql = "UPDATE {$this->db_bolsa}.user_bolsa_profile SET " . implode(', ', $fields) . " WHERE user_id = :user_id";
                $query = $this->acceso->prepare($sql);
                return $query->execute($params);
            }
        } catch (PDOException $e) {
            error_log("Error en BolsaModel::saveStep: " . $e->getMessage());
            return false;
        }
    }

    public function finishOnboarding($user_id)
    {
        try {
            $sql = "UPDATE {$this->db_bolsa}.user_bolsa_profile SET onboarding_finished = 1, current_step = 3 WHERE user_id = :id";
            $query = $this->acceso->prepare($sql);
            return $query->execute([':id' => $user_id]);
        } catch (PDOException $e) {
            error_log("Error en BolsaModel::finishOnboarding: " . $e->getMessage());
            return false;
        }
    }
}
