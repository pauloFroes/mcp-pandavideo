function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(
      `Error: Missing required environment variable: ${name}\n` +
        "  PANDAVIDEO_API_KEY is required.\n" +
        "  Get your API key at: https://dashboard.pandavideo.com.br → Settings → API Keys"
    );
    process.exit(1);
  }
  return value;
}

export const API_KEY = getRequiredEnv("PANDAVIDEO_API_KEY");

// Main API (videos, lives, webhooks, analytics)
export const BASE_URL = "https://api-v2.pandavideo.com.br";

// Extended API (folders, playlists, profiles, AI, DRM)
export const BASE_URL_GLOBAL = "https://api-v2.pandavideo.com";

// Import server (upload via external URL / M3U8)
export const IMPORT_URL = "https://import.pandavideo.com:9443";
