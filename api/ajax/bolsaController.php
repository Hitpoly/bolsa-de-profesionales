<?php
header("Access-Control-Allow-Origin: " . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../modelos/BolsaModel.php';

$bolsa = new BolsaModel();
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$accion = $data['accion'] ?? $_POST['accion'] ?? '';

switch ($accion) {
    case 'getSectors':
        echo json_encode(['success' => true, 'data' => $bolsa->getSectors()]);
        break;

    case 'getTiposProfesionales':
        echo json_encode(['success' => true, 'data' => $bolsa->getTiposProfesionales()]);
        break;

    case 'getProfile':
        $user_id = (int)($data['user_id'] ?? 0);
        $profile = $bolsa->getProfile($user_id);
        echo json_encode(['success' => true, 'data' => $profile]);
        break;

    case 'saveStep':
        $user_id = (int)($data['user_id'] ?? 0);
        $stepData = $data['step_data'] ?? [];
        if (!$user_id) {
            echo json_encode(['success' => false, 'error' => 'user_id requerido']);
            break;
        }
        $res = $bolsa->saveStep($user_id, $stepData);
        echo json_encode(['success' => $res]);
        break;

    case 'getServices':
        $user_id = (int)($data['user_id'] ?? 0);
        if (!$user_id) {
            echo json_encode(['success' => false, 'error' => 'user_id requerido']);
            break;
        }
        $services = $bolsa->getServices($user_id);
        echo json_encode(['success' => true, 'data' => $services]);
        break;

    case 'saveService':
        $user_id = (int)($data['user_id'] ?? 0);
        $serviceData = $data['service_data'] ?? [];
        if (!$user_id || empty($serviceData)) {
            echo json_encode(['success' => false, 'error' => 'Datos insuficientes']);
            break;
        }
        $res = $bolsa->saveService($user_id, $serviceData);
        echo json_encode($res);
        break;

    case 'deleteService':
        $user_id = (int)($data['user_id'] ?? 0);
        $service_id = (int)($data['service_id'] ?? 0);
        if (!$user_id || !$service_id) {
            echo json_encode(['success' => false, 'error' => 'Datos insuficientes']);
            break;
        }
        $res = $bolsa->deleteService($service_id, $user_id);
        echo json_encode(['success' => $res]);
        break;
    
    case 'getReviews':
        $professional_id = (int)($data['professional_id'] ?? 0);
        if (!$professional_id) {
            echo json_encode(['success' => false, 'error' => 'professional_id requerido']);
            break;
        }
        $reviewsData = $bolsa->getReviews($professional_id);
        echo json_encode(['success' => true, 'data' => $reviewsData]);
        break;

    case 'saveReview':
        $res = $bolsa->saveReview($data['review_data'] ?? []);
        echo json_encode($res);
        break;

    case 'getMasterTools':
        echo json_encode(['success' => true, 'data' => $bolsa->getMasterTools()]);
        break;

    case 'addMasterTool':
        $toolData = $data['tool_data'] ?? [];
        if (empty($toolData['nombre'])) {
            echo json_encode(['success' => false, 'error' => 'Nombre requerido']);
            break;
        }
        $res = $bolsa->addMasterTool($toolData);
        echo json_encode($res);
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Acción no válida en el controlador de la Bolsa']);
        break;
}
