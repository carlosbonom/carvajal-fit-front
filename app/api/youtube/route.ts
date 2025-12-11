import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

export interface YouTubeVideo {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  thumbnail?: string;
  description?: string;
}

// Función para extraer el ID del video de YouTube desde el link o guid
function extractVideoId(link: string, guid?: string): string | null {
  // Intentar extraer del link
  let match = link?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return match[1];
  
  // Intentar extraer del guid (formato: yt:video:VIDEO_ID)
  if (guid) {
    match = guid.match(/yt:video:([^:]+)/);
    if (match) return match[1];
  }
  
  // Intentar extraer del link completo
  match = link?.match(/\/watch\?v=([^&\s]+)/);
  if (match) return match[1];
  
  return null;
}

// Función para obtener el thumbnail de YouTube
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export async function GET() {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!channelId) {
      return NextResponse.json(
        { error: "YouTube Channel ID no configurado" },
        { status: 500 }
      );
    }

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const feed = await parser.parseURL(feedUrl);

    // Filtrar shorts y procesar solo videos normales
    const videos: YouTubeVideo[] = feed.items
      .filter((item) => {
        // Filtrar shorts: no incluir videos que tengan "#shorts" o "/shorts/" en el link o título
        const link = item.link || "";
        const title = item.title || "";
        const isShort = 
          link.includes("/shorts/") || 
          link.includes("#shorts") ||
          title.toLowerCase().includes("#shorts") ||
          title.toLowerCase().includes("shorts");
        
        return !isShort;
      })
      .slice(0, 5) // Tomar solo los primeros 5 videos (ya filtrados)
      .map((item) => {
        const videoId = extractVideoId(item.link || "", item.guid);
        const thumbnail = videoId ? getYouTubeThumbnail(videoId) : undefined;
        
        // Construir el link de YouTube si no existe
        const videoLink = item.link || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "");

        return {
          id: videoId || item.guid?.replace("yt:video:", "") || "",
          title: item.title || "",
          link: videoLink,
          pubDate: item.pubDate || item.isoDate || "",
          thumbnail,
          description: item.contentSnippet || item.content || undefined,
        };
      });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return NextResponse.json(
      { error: "Error al obtener videos de YouTube" },
      { status: 500 }
    );
  }
}

