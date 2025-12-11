# API de Videos de YouTube

Esta API obtiene los últimos 5 videos de un canal de YouTube usando el feed RSS público (sin necesidad de API Key).

## Configuración

### 1. Obtener el Channel ID de YouTube

Para obtener el Channel ID de tu canal de YouTube:

1. Ve a tu canal de YouTube
2. En la URL, busca el ID después de `/channel/` o `/c/`
3. También puedes usar herramientas como: https://commentpicker.com/youtube-channel-id.php

**Ejemplo de URL de canal:**
- `https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxx` → El ID es `UCxxxxxxxxxxxxxxxxxxxxx`
- `https://www.youtube.com/c/NombreDelCanal` → Necesitas obtener el ID real

### 2. Configurar la Variable de Entorno

Agrega la siguiente variable a tu archivo `.env.local`:

```env
YOUTUBE_CHANNEL_ID=TU_CHANNEL_ID_AQUI
```

**Ejemplo:**
```env
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxx
```

### 3. Reiniciar el Servidor

Después de agregar la variable de entorno, reinicia tu servidor de desarrollo:

```bash
npm run dev
```

## Uso

### Endpoint

```
GET /api/youtube
```

### Respuesta Exitosa

```json
[
  {
    "id": "VIDEO_ID",
    "title": "Título del Video",
    "link": "https://www.youtube.com/watch?v=VIDEO_ID",
    "pubDate": "2024-01-15T10:00:00.000Z",
    "thumbnail": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
    "description": "Descripción del video..."
  }
]
```

### Respuesta de Error

```json
{
  "error": "YouTube Channel ID no configurado"
}
```

## Características

- ✅ No requiere API Key de YouTube
- ✅ Usa el feed RSS público de YouTube
- ✅ Obtiene los últimos 5 videos del canal
- ✅ Incluye thumbnails, títulos, descripciones y fechas
- ✅ Muy rápido y sin límites de cuota

## Notas

- El feed RSS de YouTube puede tener un pequeño retraso (algunos minutos) respecto a los videos publicados
- Si el canal no tiene videos públicos, la API retornará un array vacío
- El feed RSS solo funciona con canales públicos

