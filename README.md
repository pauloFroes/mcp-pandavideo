# mcp-pandavideo

MCP server that wraps the [PandaVideo API](https://docs.pandavideo.com) as semantic tools for LLM agents.

Works with **Claude Code**, **Codex**, **Claude Desktop**, **Cursor**, **VS Code**, **Windsurf**, and any MCP-compatible client.

---

## Prerequisites

- Node.js 18+
- PandaVideo API key ([get it here](https://dashboard.pandavideo.com.br))

| Variable | Where to find |
| -------- | ------------- |
| `PANDAVIDEO_API_KEY` | Dashboard → Settings → API Keys |

## Installation

### Claude Code

Three installation scopes are available:

| Scope | Flag | Config file | Use case |
|-------|------|-------------|----------|
| **local** | `-s local` | `.mcp.json` | This project only (default) |
| **project** | `-s project` | `.claude/mcp.json` | Shared with team via git |
| **user** | `-s user` | `~/.claude/mcp.json` | All your projects |

**Quick setup (inline env vars):**

```bash
claude mcp add pandavideo -s user \
  -e PANDAVIDEO_API_KEY=your-key \
  -- npx -y github:pauloFroes/mcp-pandavideo
```

> Replace `-s user` with `-s local` or `-s project` as needed.

**Persistent setup (.env file):**

Add to your `.mcp.json`:

```json
{
  "pandavideo": {
    "command": "npx",
    "args": ["-y", "github:pauloFroes/mcp-pandavideo"],
    "env": {
      "PANDAVIDEO_API_KEY": "${PANDAVIDEO_API_KEY}"
    }
  }
}
```

Then define the values in your `.env` file:

```
PANDAVIDEO_API_KEY=your-api-key
```

> See `.env.example` for all required variables.

### Codex

Add to your Codex configuration:

```toml
[mcp_servers.pandavideo]
command = "npx"
args = ["-y", "github:pauloFroes/mcp-pandavideo"]
env_vars = ["PANDAVIDEO_API_KEY"]
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pandavideo": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-pandavideo"],
      "env": {
        "PANDAVIDEO_API_KEY": "your-key"
      }
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "pandavideo": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-pandavideo"],
      "env": {
        "PANDAVIDEO_API_KEY": "your-key"
      }
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "pandavideo": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-pandavideo"],
      "env": {
        "PANDAVIDEO_API_KEY": "your-key"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "pandavideo": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-pandavideo"],
      "env": {
        "PANDAVIDEO_API_KEY": "your-key"
      }
    }
  }
}
```

## Available Tools

### Videos

| Tool | Description |
|------|-------------|
| `list_videos` | List videos with pagination, filter by folder, status, or title |
| `get_video` | Get complete video details (title, status, duration, player URL, HLS, thumbnail) |
| `update_video` | Update video title, description, folder, or playback qualities |
| `delete_video` | Soft-delete a video (recoverable within 30 days) |
| `recover_video` | Recover a previously deleted video |
| `upload_video_from_url` | Import video from external URL |
| `upload_video_from_m3u8` | Import video from M3U8/HLS stream |

### Folders

| Tool | Description |
|------|-------------|
| `list_folders` | List folders with optional parent folder and status filters |
| `get_folder` | Get folder details including associated videos and funnels |
| `create_folder` | Create a new folder (supports nesting) |
| `update_folder` | Update folder name, parent, or status |
| `delete_folder` | Soft-delete a folder |

### Webhooks

| Tool | Description |
|------|-------------|
| `get_webhook` | Get current webhook configuration |
| `create_webhook` | Create/replace webhook endpoint |
| `update_webhook` | Update webhook URL |
| `delete_webhook` | Remove webhook configuration |

### Playlists

| Tool | Description |
|------|-------------|
| `list_playlists` | List all playlists |
| `get_playlist` | Get playlist details |
| `create_playlist` | Create playlist with access control (public/private/password) |
| `update_playlist` | Update playlist properties |
| `delete_playlist` | Permanently delete a playlist |
| `get_playlist_videos` | Get all videos in a playlist |

## Authentication

The API key is passed directly in the `Authorization` header (no Bearer prefix). All tools use the same API key configured via the `PANDAVIDEO_API_KEY` environment variable.

PandaVideo uses multiple base URLs:
- **Main API** (`api-v2.pandavideo.com.br`): Videos, Lives, Webhooks
- **Global API** (`api-v2.pandavideo.com`): Folders, Playlists, AI, Analytics, Profiles
- **Import** (`import.pandavideo.com:9443`): Video imports from external URLs

## License

MIT
