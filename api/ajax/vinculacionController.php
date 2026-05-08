<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = ['http://localhost:3000', 'http://localhost:3001', 'https://hitpoly.com', 'https://www.hitpoly.com'];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:3000");
}

header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit;
}

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
