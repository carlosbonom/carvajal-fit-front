# Colección de Postman

## Importar la Colección

1. Abre Postman
2. Clic en "Import" (esquina superior izquierda)
3. Selecciona el archivo `Carvajal-Fit-API.postman_collection.json`
4. La colección se importará con todas las requests preconfiguradas

## Configurar Variables

1. En Postman, selecciona la colección "Carvajal Fit API"
2. Ve a la pestaña "Variables"
3. Ajusta la variable `base_url` según tu entorno:
   - Desarrollo: `http://localhost:3000`
   - Producción: `https://tu-dominio.com`

## Requests Incluidas

### 1. Register User
Registro completo con todos los campos del perfil.

### 2. Register User - Basic
Registro básico solo con email y contraseña (campos mínimos requeridos).

### 3. Register User - Admin
Registro de usuario con rol de administrador.

### 4. Register User - Vendor
Registro de usuario con rol de vendedor.

## Uso

1. Selecciona cualquier request de la colección
2. Ajusta los valores en el body si es necesario
3. Clic en "Send"
4. Revisa la respuesta en la sección inferior

## Notas

- Asegúrate de que tu servidor Next.js esté corriendo (`npm run dev`)
- Verifica que las variables de entorno de Supabase estén configuradas
- Los emails deben ser únicos (no puedes registrar el mismo email dos veces)















