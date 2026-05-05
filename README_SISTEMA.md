# 🎯 Sistema de Búsqueda de Profesionales - Tipo Fiverr

## 📱 ¿Qué hace esta aplicación?

Es un marketplace estilo Fiverr para encontrar profesionales. Incluye:

- ✅ **Búsqueda y filtros** por cargo/especialidad
- ✅ **Tarjetas de profesionales** con información clave
- ✅ **Perfiles detallados** con experiencia, educación, idiomas, etc.
- ✅ **Integración lista** con tu API de PHP
- ✅ **Datos de ejemplo** para probar sin backend

## 🗂️ Estructura del Proyecto

```
/src/app/
├── components/          # Componentes React reutilizables
│   ├── ProfessionalCard.tsx    # Tarjeta de profesional
│   ├── SearchBar.tsx           # Barra de búsqueda
│   └── FilterBar.tsx           # Filtros por cargo
├── pages/              # Páginas principales
│   ├── Marketplace.tsx         # Página de búsqueda (home)
│   └── ProfileDetail.tsx       # Detalle del perfil
├── services/           # Servicios para API
│   └── api.ts                  # Conexión con tu PHP
├── types/              # Tipos TypeScript
│   └── profile.ts              # Estructura de datos
├── data/               # Datos de ejemplo
│   └── mockProfiles.ts         # 6 perfiles de prueba
├── routes.tsx          # Configuración de rutas
└── App.tsx             # Componente principal
```

## 🎨 Páginas

### 1. Marketplace (/) - Búsqueda de profesionales

**Características:**
- Barra de búsqueda en tiempo real
- Filtros por cargo (Frontend, Backend, SEO, etc.)
- Grid responsive de tarjetas
- Contador de resultados
- Estados de carga

**Tarjetas muestran:**
- Avatar y nombre
- Cargo profesional
- Ubicación
- Descripción breve
- Empresa actual
- Idiomas
- Precio por hora (simulado)
- Rating (simulado)

### 2. Detalle de Perfil (/perfil/:userId)

**Sidebar izquierdo:**
- Avatar grande
- Nombre y cargo
- Ubicación
- Botón de contacto
- Información de contacto (email, teléfono)
- Idiomas con nivel
- Enlaces (LinkedIn, GitHub, etc.)
- Intereses/hobbies

**Contenido principal:**
- Sobre mí (biografía)
- Frase favorita
- Experiencia laboral completa
  - Empresa
  - Cargo
  - Ubicación
  - Fechas
  - Descripción
- Educación
  - Institución
  - Título
  - Especialización
  - Años

## 🔌 Conexión con tu API

### Estado actual: DATOS DE EJEMPLO

La aplicación usa `mockProfiles` (6 profesionales de ejemplo) porque `useMockData = true`

### Para conectar con tu API real:

**1. Asegúrate de agregar las funciones PHP (ver INTEGRACION_PHP.md)**

**2. En `/src/app/services/api.ts`:**
```typescript
const useMockData = false; // Cambia esto
```

**3. Verifica que tu API responda en:**
```
https://apiweb.hitpoly.com/ajax/PerfilControlador.php
```

## 📊 Estructura de Datos

Los datos vienen de tu endpoint `obtenerTodoElPerfil($user_id)`:

```typescript
{
  usuario_principal: {
    nombre: string
    apellido: string
    avatar: string
    id_cargo: number
    nombre_cargo: string
  }
  experiencia_laboral: [...]
  empleo: [...]
  educacion: [...]
  contacto: [...]
  idiomas_lista: [...]
  links: [...]
  hobbies: [...]
  sobre_mi: {...}
  datos_personales: {...}
}
```

## 🎯 Cargos Disponibles

Basados en tu tabla `cargos` (id_tipo: 3):

- **Desarrollo:**
  - Front-end Developer (141)
  - Back-end Developer (142)
  - Full Stack Developer (143)
  - Software Engineer (147)

- **Marketing:**
  - Especialista SEO (134)
  - Community Manager (136)
  - Copywriter (138)

- **Gestión:**
  - Analista de Datos (146)
  - Project Manager (148)

## 🚀 Cómo Probar

### Modo desarrollo (datos mock):
```bash
# Ya está funcionando con datos de ejemplo
# Solo abre la aplicación y navega
```

### Modo producción (API real):

1. ✅ Agrega las 3 funciones a `PerfilControlador.php`
2. ✅ Cambia `useMockData = false` en `api.ts`
3. ✅ Abre la aplicación
4. ✅ Debería cargar profesionales reales de tu base de datos

## 🔍 Funcionalidades de Búsqueda

**Búsqueda por texto:**
- Busca en nombre completo
- Busca en nombre del cargo
- Busca en descripción "sobre mí"

**Filtros:**
- Por cargo específico
- Botón "Todos" para limpiar filtros
- Combinable con búsqueda de texto

**Performance:**
- Debounce de 300ms en búsqueda
- Estados de carga
- Manejo de errores

## 📝 Datos de Ejemplo Incluidos

6 profesionales con perfiles completos:

1. **María González** - Front-end Developer (México)
2. **Carlos Rodríguez** - Full Stack Developer (Colombia)
3. **Ana Chen** - Especialista SEO (Perú)
4. **Sofía Martínez** - Copywriter (Argentina)
5. **Rajesh Kumar** - Back-end Developer (Chile)
6. **Laura Vega** - Community Manager (España)

Cada uno tiene:
- ✅ Experiencia laboral completa
- ✅ Educación universitaria
- ✅ 2-3 idiomas
- ✅ Links profesionales
- ✅ Hobbies
- ✅ Contacto

## 🎨 Diseño

- **Framework:** Tailwind CSS
- **Iconos:** Lucide React
- **Diseño:** Limpio, estilo Fiverr/LinkedIn
- **Responsive:** Mobile, tablet y desktop
- **Colores:**
  - Primario: Azul (#2563EB)
  - Texto: Grises (#111827, #6B7280)
  - Fondo: Gris claro (#F9FAFB)

## 🔧 Personalización Fácil

### Cambiar colores:
Busca `blue-600` y reemplaza por tu color preferido:
- `emerald-600` (verde)
- `purple-600` (morado)
- `rose-600` (rosa)

### Agregar más cargos:
Edita `/src/app/data/mockProfiles.ts`:
```typescript
export const cargosDisponibles = [
  { id: 150, name: "UX Designer" }, // Nuevo
  // ... los demás
];
```

### Cambiar API URL:
En `/src/app/services/api.ts`:
```typescript
const API_BASE_URL = 'tu-nueva-url-aqui';
```

## 📞 Flujo de Datos

```
Usuario busca → Marketplace
                   ↓
            buscarProfesionales()
                   ↓
        useMockData = true? → Filtra mockProfiles
                   ↓
        useMockData = false? → POST a PHP
                   ↓
            Muestra resultados
                   ↓
    Usuario hace clic en perfil
                   ↓
            ProfileDetail
                   ↓
        obtenerTodoElPerfil(userId)
                   ↓
        useMockData = true? → Retorna mock
                   ↓
        useMockData = false? → POST a PHP
                   ↓
        Muestra perfil completo
```

## ⚠️ Cosas Importantes

1. **CORS**: Tu PHP ya tiene configurado CORS (Access-Control-Allow-Origin: *)
2. **Método**: Tu API usa POST, no GET
3. **Formato**: Envía `{ "funcion": "nombre", ...params }`
4. **Respuesta**: Espera `{ "success": true, "data": {...} }`
5. **Errores**: Maneja `{ "success": false, "error": "mensaje" }`

## 🐛 Troubleshooting

**No se conecta con la API:**
- ✅ Verifica que `useMockData = false`
- ✅ Abre DevTools → Network → Ve las peticiones
- ✅ Verifica que tu PHP responda correctamente
- ✅ Revisa la consola de errores

**No aparecen profesionales:**
- ✅ Verifica que tengas usuarios con `id_rol = 3`
- ✅ Revisa que `obtenerTodosProfesionales` retorne datos
- ✅ Mira la consola del navegador

**Error de CORS:**
- ✅ Tu PHP ya lo tiene configurado
- ✅ Asegúrate de que responda al método OPTIONS

## 💡 Próximos Pasos Sugeridos

- [ ] Agregar sistema de favoritos
- [ ] Implementar sistema de contacto/mensajería
- [ ] Agregar sistema de ratings real (ahora es simulado)
- [ ] Paginación para muchos profesionales
- [ ] Filtros avanzados (ubicación, precio, idiomas)
- [ ] Panel de administración
- [ ] Sistema de autenticación
- [ ] Perfiles de empresa (para contratar)
