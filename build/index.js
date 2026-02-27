#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerVideoTools } from "./tools/videos.js";
import { registerFolderTools } from "./tools/folders.js";
import { registerWebhookTools } from "./tools/webhooks.js";
import { registerPlaylistTools } from "./tools/playlists.js";
const server = new McpServer({
    name: "mcp-pandavideo",
    version: "1.0.0",
});
registerVideoTools(server);
registerFolderTools(server);
registerWebhookTools(server);
registerPlaylistTools(server);
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("mcp-pandavideo server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
