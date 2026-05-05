<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit;

include_once '../modelos/BolsaModel.php';

$bolsa = new BolsaModel();
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$accion = $data['accion'] ?? '';

switch ($accion) {
    case 'getProfileStatus':
        $user_id = $data['user_id'];
        $profile = $bolsa->getProfile($user_id);
        echo json_encode(['success' => true, 'data' => $profile]);
        break;

    case 'saveStep':
        $user_id = $data['user_id'];
        $stepData = $data['step_data'];
        $res = $bolsa->saveStep($user_id, $stepData);
        echo json_encode(['success' => $res]);
        break;

    case 'finishOnboarding':
        $user_id = $data['user_id'];
        $res = $bolsa->finishOnboarding($user_id);
        echo json_encode(['success' => $res]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
        break;
}
