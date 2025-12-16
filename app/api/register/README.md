# API de Registro de Usuarios

## Endpoint

```
POST /api/register
```

## Descripción

Esta API permite registrar nuevos usuarios en el sistema. Crea tanto el usuario en Supabase Auth como su perfil en la tabla `profiles`.

## Headers

```
Content-Type: application/json
```

## Body (JSON)

### Campos Requeridos

- `email` (string): Correo electrónico del usuario
- `password` (string): Contraseña (mínimo 6 caracteres)

### Campos Opcionales

- `display_name` (string): Nombre para mostrar
- `name` (string): Nombre completo
- `prefix` (string): Prefijo (ej: "Sr.", "Sra.", "Dr.")
- `phone` (string): Número de teléfono
- `avatar_url` (string): URL del avatar
- `role` (enum): Rol del usuario - `'owner' | 'admin' | 'vendor' | 'user'` (default: `'user'`)
- `status` (enum): Estado del usuario - `'active' | 'inactive' | 'banned'` (default: `'active'`)
- `timezone` (string): Zona horaria (default: `'America/Santiago'`)
- `locale` (string): Locale (default: `'es-CL'`)
- `currency` (string): Moneda (default: `'CLP'`)

## Ejemplo de Request (Postman)

### Request Básico

```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

### Request Completo

```json
{
  "email": "juan.perez@ejemplo.com",
  "password": "miPasswordSegura123",
  "display_name": "Juan Pérez",
  "name": "Juan Carlos Pérez González",
  "prefix": "Sr.",
  "phone": "+56 9 1234 5678",
  "avatar_url": "https://ejemplo.com/avatar.jpg",
  "role": "user",
  "status": "active",
  "timezone": "America/Santiago",
  "locale": "es-CL",
  "currency": "CLP"
}
```

## Respuestas

### Éxito (201 Created)

```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com"
  },
  "profile": {
    "id": "uuid-del-usuario",
    "display_name": "Juan Pérez",
    "name": "Juan Carlos Pérez González",
    "email": "juan.perez@ejemplo.com",
    "prefix": "Sr.",
    "phone": "+56 9 1234 5678",
    "avatar_url": "https://ejemplo.com/avatar.jpg",
    "role": "user",
    "status": "active",
    "timezone": "America/Santiago",
    "locale": "es-CL",
    "currency": "CLP",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error - Campos Requeridos Faltantes (400 Bad Request)

```json
{
  "error": "Email y contraseña son requeridos"
}
```

### Error - Email Inválido (400 Bad Request)

```json
{
  "error": "Email inválido"
}
```

### Error - Contraseña Muy Corta (400 Bad Request)

```json
{
  "error": "La contraseña debe tener al menos 6 caracteres"
}
```

### Error - Usuario Ya Existe (400 Bad Request)

```json
{
  "error": "User already registered"
}
```

### Error - Error del Servidor (500 Internal Server Error)

```json
{
  "error": "Error interno del servidor",
  "details": "Mensaje de error detallado"
}
```

## Configuración en Postman

### Paso 1: Crear Nueva Request

1. Abre Postman
2. Clic en "New" → "HTTP Request"
3. Selecciona método `POST`
4. Ingresa la URL: `http://localhost:3000/api/register` (o tu URL de producción)

### Paso 2: Configurar Headers

1. Ve a la pestaña "Headers"
2. Agrega:
   - Key: `Content-Type`
   - Value: `application/json`

### Paso 3: Configurar Body

1. Ve a la pestaña "Body"
2. Selecciona "raw"
3. Selecciona "JSON" en el dropdown
4. Pega el JSON del ejemplo

### Paso 4: Enviar Request

1. Clic en "Send"
2. Revisa la respuesta en la sección inferior

## Ejemplos de Uso

### Ejemplo 1: Usuario Básico

```json
{
  "email": "test@ejemplo.com",
  "password": "test123"
}
```

### Ejemplo 2: Usuario con Información Completa

```json
{
  "email": "admin@ejemplo.com",
  "password": "admin123",
  "display_name": "Administrador",
  "name": "Administrador del Sistema",
  "prefix": "Sr.",
  "phone": "+56 9 9876 5432",
  "avatar_url": "https://i.pravatar.cc/150?img=1",
  "role": "admin",
  "status": "active",
  "timezone": "America/Santiago",
  "locale": "es-CL",
  "currency": "CLP"
}
```

### Ejemplo 3: Vendedor

```json
{
  "email": "vendedor@ejemplo.com",
  "password": "vendor123",
  "display_name": "Vendedor Principal",
  "name": "María González",
  "phone": "+56 9 5555 1234",
  "role": "vendor",
  "status": "active"
}
```

## Notas

- El trigger de la base de datos creará automáticamente un perfil si no se crea manualmente
- Si el perfil ya existe (por el trigger), la API intentará actualizarlo con los datos proporcionados
- El email debe ser único en la tabla `profiles`
- La contraseña se almacena de forma segura en Supabase Auth
- Todos los campos opcionales tienen valores por defecto según la estructura de la tabla













