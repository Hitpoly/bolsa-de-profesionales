<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit;

include_once '../modelos/BolsaVinculacion.php';

$vinc = new BolsaVinculacion();
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$accion = $data['accion'] ?? '';
$user_id = $data['user_id'] ?? null;
$session_id = $data['session_id'] ?? null;

switch ($accion) {
    case 'registrarIngreso':
        if ($user_id) {
            $id = $vinc->registrarIngreso($user_id);
            echo json_encode(['success' => (bool)$id, 'session_id' => $id]);
        }
        break;

    case 'registrarSalida':
        if ($session_id) {
            $res = $vinc->registrarSalida($session_id);
            echo json_encode(['success' => $res]);
        }
        break;

    default:
        echo json_encode(['success' => false]);
        break;
}
