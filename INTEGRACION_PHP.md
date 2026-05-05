# 🔌 Guía de Integración con tu API PHP

## 📋 Resumen

Tu sistema React ya está configurado para conectarse con tu API en:
`https://apiweb.hitpoly.com/ajax/PerfilControlador.php`

## ✅ Lo que ya tienes funcionando

Tu endpoint actual maneja:
- ✅ `guardarPerfilCompleto` - Para guardar/actualizar perfiles
- ✅ `actualizarDatosPersonales` - Para actualizar datos personales

## 🔧 Funciones que necesitas agregar a tu PHP

Necesitas agregar 3 nuevas funciones a tu `PerfilControlador.php`:

### 1. `obtenerPerfil` - Obtener un perfil específico

```php
case 'obtenerPerfil':
    if (!$user_id) throw new Exception("Falta el parámetro user_id");
    
    include_once '../modelos/ConsultaPerfil.php';
    $consulta = new ConsultaPerfil();
    $perfil = $consulta->obtenerTodoElPerfil($user_id);
    
    $response = [
        'success' => true, 
        'data' => $perfil
    ];
    break;
```

### 2. `obtenerTodosProfesionales` - Listar todos los profesionales

```php
case 'obtenerTodosProfesionales':
    include_once '../modelos/ConsultaPerfil.php';
    $consulta = new ConsultaPerfil();
    
    // Query para obtener todos los usuarios profesionales (id_rol = 3)
    $stmt = $consulta->acceso->prepare("
        SELECT id FROM usuarios 
        WHERE id_rol = 3 
        AND estado = 'activo'
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $profesionales = [];
    foreach ($userIds as $uid) {
        $profesionales[] = $consulta->obtenerTodoElPerfil($uid);
    }
    
    $response = [
        'success' => true,
        'data' => $profesionales
    ];
    break;
```

### 3. `buscarProfesionales` - Buscar con filtros

```php
case 'buscarProfesionales':
    $query = $data['query'] ?? '';
    $cargo_id = $data['cargo_id'] ?? null;
    
    include_once '../modelos/ConsultaPerfil.php';
    $consulta = new ConsultaPerfil();
    
    // Construir query con filtros
    $sql = "SELECT DISTINCT u.id FROM usuarios u
            LEFT JOIN user_about_me am ON u.id = am.user_id
            WHERE u.id_rol = 3 AND u.estado = 'activo'";
    
    $params = [];
    
    if ($cargo_id) {
        $sql .= " AND u.id_cargo = ?";
        $params[] = $cargo_id;
    }
    
    if ($query) {
        $sql .= " AND (
            CONCAT(u.nombre, ' ', u.apellido) LIKE ? OR
            am.about_text LIKE ?
        )";
        $searchTerm = "%{$query}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    $sql .= " ORDER BY u.created_at DESC LIMIT 50";
    
    $stmt = $consulta->acceso->prepare($sql);
    $stmt->execute($params);
    $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $profesionales = [];
    foreach ($userIds as $uid) {
        $profesionales[] = $consulta->obtenerTodoElPerfil($uid);
    }
    
    $response = [
        'success' => true,
        'data' => $profesionales
    ];
    break;
```

## 📝 Código completo para agregar a PerfilControlador.php

Agrega esto en tu `switch ($funcion)` después de tus casos existentes:

```php
<?php
// ... tu código existente ...

try {
    switch ($funcion) {
        // ... tus casos existentes (guardarPerfilCompleto, actualizarDatosPersonales) ...
        
        case 'obtenerPerfil':
            if (!$user_id) throw new Exception("Falta el parámetro user_id");
            
            include_once '../modelos/ConsultaPerfil.php';
            $consulta = new ConsultaPerfil();
            $perfil = $consulta->obtenerTodoElPerfil($user_id);
            
            $response = [
                'success' => true, 
                'data' => $perfil
            ];
            break;

        case 'obtenerTodosProfesionales':
            include_once '../modelos/ConsultaPerfil.php';
            $consulta = new ConsultaPerfil();
            
            // Obtener todos los usuarios profesionales (id_rol = 3)
            $stmt = $consulta->acceso->prepare("
                SELECT id FROM usuarios 
                WHERE id_rol = 3 
                ORDER BY created_at DESC
                LIMIT 100
            ");
            $stmt->execute();
            $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $profesionales = [];
            foreach ($userIds as $uid) {
                $profesionales[] = $consulta->obtenerTodoElPerfil($uid);
            }
            
            $response = [
                'success' => true,
                'data' => $profesionales,
                'total' => count($profesionales)
            ];
            break;

        case 'buscarProfesionales':
            $query = $data['query'] ?? '';
            $cargo_id = $data['cargo_id'] ?? null;
            
            include_once '../modelos/ConsultaPerfil.php';
            $consulta = new ConsultaPerfil();
            
            // Construir query con filtros
            $sql = "SELECT DISTINCT u.id FROM usuarios u
                    LEFT JOIN user_about_me am ON u.id = am.user_id
                    WHERE u.id_rol = 3";
            
            $params = [];
            
            if ($cargo_id) {
                $sql .= " AND u.id_cargo = ?";
                $params[] = $cargo_id;
            }
            
            if ($query) {
                $sql .= " AND (
                    CONCAT(u.nombre, ' ', u.apellido) LIKE ? OR
                    am.about_text LIKE ?
                )";
                $searchTerm = "%{$query}%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }
            
            $sql .= " ORDER BY u.created_at DESC LIMIT 50";
            
            $stmt = $consulta->acceso->prepare($sql);
            $stmt->execute($params);
            $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $profesionales = [];
            foreach ($userIds as $uid) {
                $profesionales[] = $consulta->obtenerTodoElPerfil($uid);
            }
            
            $response = [
                'success' => true,
                'data' => $profesionales,
                'total' => count($profesionales)
            ];
            break;

        default:
            throw new Exception("La función '$funcion' no existe en el controlador");
            break;
    }
} catch (Exception $e) {
    $response = [
        'success' => false, 
        'error' => $e->getMessage()
    ];
}

// ... resto de tu código ...
```

## 🚀 Activar la integración

Una vez agregadas las funciones PHP:

1. Ve a `/src/app/services/api.ts`
2. Cambia `useMockData = true` a `useMockData = false`
3. ¡Listo! Tu aplicación React se conectará con tu API real

## 🔍 Notas importantes

- ✅ El CORS ya está configurado en tu PHP
- ✅ Tu clase `ConsultaPerfil` ya tiene el método `obtenerTodoElPerfil()`
- ⚠️ Asegúrate de que tu tabla `usuarios` tenga la columna `id_rol` para filtrar profesionales
- ⚠️ Si no existe `created_at`, cámbialo por otra columna de fecha o quita el ORDER BY
- 💡 Puedes ajustar el LIMIT según necesites (actualmente 100 profesionales máximo)

## 📞 Estructura de las peticiones

**Frontend envía:**
```json
{
  "funcion": "obtenerPerfil",
  "user_id": 123
}
```

**Backend responde:**
```json
{
  "success": true,
  "data": {
    "usuario_principal": {...},
    "experiencia_laboral": [...],
    "educacion": [...],
    ...
  }
}
```
