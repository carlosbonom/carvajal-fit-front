# Configuración de Supabase

## Pasos para configurar la base de datos

### 1. Crear la tabla de perfiles

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Enum para roles (opcional, recomendado)
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'vendor', 'user');

-- Enum para estado del usuario
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  name text,
  email text UNIQUE,
  prefix text,
  phone text,
  avatar_url text,
  role user_role DEFAULT 'user' NOT NULL,
  status user_status DEFAULT 'active' NOT NULL,
  timezone text DEFAULT 'America/Santiago',
  locale text DEFAULT 'es-CL',
  currency text DEFAULT 'CLP',
  -- Datos para auditoría
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
```

### 2. Crear el trigger para crear perfiles automáticamente

Ejecuta el SQL del archivo `supabase/migrations/001_create_profile_trigger.sql` en el SQL Editor de Supabase.

Este trigger:
- Crea automáticamente un perfil cuando se registra un nuevo usuario
- Extrae los datos de `full_name` y `phone` del metadata del usuario
- Establece valores por defecto (role: 'user', status: 'active', timezone: 'America/Santiago', etc.)

### 3. Configurar Row Level Security (RLS)

El archivo de migración también incluye las políticas RLS necesarias:
- Los usuarios pueden ver su propio perfil
- Los usuarios pueden actualizar su propio perfil

### 4. Variables de entorno

Asegúrate de tener configurado tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
```

## Funcionalidades implementadas

- ✅ Registro de usuarios con creación automática de perfil
- ✅ Login de usuarios
- ✅ Hook `useProfile()` para obtener el perfil del usuario
- ✅ Funciones helper para trabajar con perfiles (`getProfile()`, `updateProfile()`)
- ✅ Protección de rutas con middleware
- ✅ Row Level Security configurado

## Uso

### Obtener el perfil del usuario

```typescript
import { useProfile } from '@/lib/hooks/use-profile'

function MyComponent() {
  const { profile, loading } = useProfile()
  
  if (loading) return <div>Cargando...</div>
  if (!profile) return <div>No hay perfil</div>
  
  return <div>Hola, {profile.name}</div>
}
```

### Actualizar el perfil

```typescript
import { updateProfile } from '@/lib/supabase/profile'

await updateProfile({
  display_name: 'Nuevo nombre',
  phone: '+56 9 1234 5678'
})
```













