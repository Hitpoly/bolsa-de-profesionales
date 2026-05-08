<?php
include_once __DIR__ . '/Conexion.php';

/**
 * Modelo de Tarifario para la Bolsa de Profesionales.
 * Gestiona EXCLUSIVAMENTE servicios y entregables locales.
 * Base de datos: duveroli_bolsa_profesionales
 */
class BolsaModel
{
    private $acceso;

    public function __construct()
    {
        try {
            $db = new Conexion();
            $this->acceso = $db->pdo;
            if (!$this->acceso) {
                throw new Exception("No se pudo obtener la conexión PDO en la Bolsa");
            }
        } catch (Exception $e) {
            error_log("Error en constructor BolsaModel (Local): " . $e->getMessage());
            die(json_encode(['success' => false, 'error' => 'Fallo de conexión a la base de datos de la Bolsa']));
        }
    }

    // --- SISTEMA DE SERVICIOS LOCAL ---

    public function getServices($user_id)
    {
        try {
            $stmt = $this->acceso->prepare("SELECT * FROM bolsa_servicios WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([(int)$user_id]);
            $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($services as &$service) {
                $stmtEnt = $this->acceso->prepare("SELECT * FROM bolsa_entregables WHERE servicio_id = ? ORDER BY orden ASC");
                $stmtEnt->execute([$service['id']]);
                $service['entregables'] = $stmtEnt->fetchAll(PDO::FETCH_ASSOC);
            }
            return $services;
        } catch (Exception $e) {
            return [];
        }
    }

    public function saveService($user_id, $data)
    {
        try {
            $this->acceso->beginTransaction();
            
            // Detectar ID - soportar string o int
            $id = null;
            if (isset($data['id']) && $data['id'] !== '' && $data['id'] !== null && $data['id'] !== 'null') {
                $id = (int)$data['id'];
                if ($id === 0) $id = null; // protección extra
            }
            
            error_log("[BolsaModel] saveService - user_id: $user_id, id: " . var_export($id, true) . ", modo: " . ($id ? 'UPDATE' : 'INSERT'));
            
            $precio_base = (float)($data['precio_base'] ?? 0);
            $porcentaje = (int)($data['porcentaje_oferta'] ?? 0);
            $precio_oferta = ($porcentaje > 0) ? ($precio_base * (1 - ($porcentaje / 100))) : ($data['precio_oferta'] ?? null);

            if ($id) {
                $sql = "UPDATE bolsa_servicios SET 
                        tipo = ?, titulo = ?, descripcion = ?, especificaciones_tecnicas = ?, 
                        precio_base = ?, porcentaje_oferta = ?, precio_oferta = ?, oferta_fin = ?, tiempo_total = ?, moneda = ?, imagen = ?, herramientas = ?
                        WHERE id = ? AND user_id = ?";
                $stmt = $this->acceso->prepare($sql);
                $result = $stmt->execute([
                    $data['tipo'], $data['titulo'], $data['descripcion'] ?? null, 
                    $data['especificaciones_tecnicas'] ?? null, $precio_base, 
                    $porcentaje, $precio_oferta, $data['oferta_fin'] ?? null, 
                    $data['tiempo_total'] ?? null, $data['moneda'] ?? 'USD', $data['imagen'] ?? null, $data['herramientas'] ?? null, $id, (int)$user_id
                ]);
                error_log("[BolsaModel] UPDATE result: " . var_export($result, true) . ", rows: " . $stmt->rowCount());
            } else {
                $sql = "INSERT INTO bolsa_servicios 
                        (user_id, tipo, titulo, descripcion, especificaciones_tecnicas, precio_base, porcentaje_oferta, precio_oferta, oferta_fin, tiempo_total, moneda, imagen, herramientas)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $this->acceso->prepare($sql);
                $stmt->execute([
                    (int)$user_id, $data['tipo'], $data['titulo'], $data['descripcion'] ?? null, 
                    $data['especificaciones_tecnicas'] ?? null, $precio_base, 
                    $porcentaje, $precio_oferta, $data['oferta_fin'] ?? null, 
                    $data['tiempo_total'] ?? null, $data['moneda'] ?? 'USD', $data['imagen'] ?? null, $data['herramientas'] ?? null
                ]);
                $id = (int)$this->acceso->lastInsertId();
            }

            if (isset($data['entregables']) && is_array($data['entregables'])) {
                $this->acceso->prepare("DELETE FROM bolsa_entregables WHERE servicio_id = ?")->execute([$id]);
                $insEnt = $this->acceso->prepare("INSERT INTO bolsa_entregables (servicio_id, titulo, descripcion, valor_individual, tiempo_limite, orden) VALUES (?, ?, ?, ?, ?, ?)");
                foreach ($data['entregables'] as $idx => $ent) {
                    $insEnt->execute([$id, $ent['titulo'] ?? 'Sin título', $ent['descripcion'] ?? null, $ent['valor_individual'] ?? 0, $ent['tiempo_limite'] ?? null, $idx]);
                }
            }
                        $this->acceso->commit();
            error_log("[BolsaModel] SAVE SUCCESS: " . json_encode(array_merge(['id' => $id], $data)));
            // Return full data for front‑end sync
            return ['success' => true, 'id' => $id, 'service' => array_merge(['id' => $id], $data)];
        } catch (Exception $e) {
            if ($this->acceso->inTransaction()) $this->acceso->rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function deleteService($service_id, $user_id)
    {
        try {
            $stmt = $this->acceso->prepare("DELETE FROM bolsa_servicios WHERE id = ? AND user_id = ?");
            return $stmt->execute([(int)$service_id, (int)$user_id]);
        } catch (Exception $e) {
            return false;
        }
    }

    // --- SISTEMA DE RESEÑAS ---

    public function getReviews($professional_id)
    {
        try {
            $stmt = $this->acceso->prepare("SELECT * FROM bolsa_profile_reviews WHERE professional_id = ? ORDER BY created_at DESC");
            $stmt->execute([(int)$professional_id]);
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stmtAvg = $this->acceso->prepare("SELECT AVG(rating) as average, COUNT(*) as total FROM bolsa_profile_reviews WHERE professional_id = ?");
            $stmtAvg->execute([(int)$professional_id]);
            $stats = $stmtAvg->fetch(PDO::FETCH_ASSOC);

            return [
                'reviews' => $reviews,
                'average' => (float)($stats['average'] ?? 0),
                'total' => (int)($stats['total'] ?? 0)
            ];
        } catch (Exception $e) {
            return ['reviews' => [], 'average' => 0, 'total' => 0];
        }
    }

    public function saveReview($data)
    {
        try {
            $stmt = $this->acceso->prepare("INSERT INTO bolsa_profile_reviews (professional_id, reviewer_id, reviewer_name, reviewer_avatar, rating, comment) VALUES (?, ?, ?, ?, ?, ?)");
            $res = $stmt->execute([
                (int)$data['professional_id'],
                (int)$data['reviewer_id'],
                $data['reviewer_name'] ?? 'Usuario',
                $data['reviewer_avatar'] ?? null,
                (int)$data['rating'],
                $data['comment'] ?? ''
            ]);
            return ['success' => $res];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function getMasterTools()
    {
        try {
            $stmt = $this->acceso->query("SELECT * FROM bolsa_herramientas_maestro ORDER BY nombre ASC");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }

    public function addMasterTool($data)
    {
        try {
            $stmt = $this->acceso->prepare("INSERT IGNORE INTO bolsa_herramientas_maestro (nombre, categoria, icono) VALUES (?, ?, ?)");
            $stmt->execute([
                $data['nombre'], 
                $data['categoria'] ?? 'Otros', 
                $data['icono'] ?? 'Settings'
            ]);
            return ['success' => true, 'id' => $this->acceso->lastInsertId()];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
