import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";
import { BASE_URL_GLOBAL } from "../auth.js";
export function registerPlaylistTools(server) {
    server.registerTool("list_playlists", {
        title: "List Playlists",
        description: "List all playlists in your PandaVideo account.",
        inputSchema: {},
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async () => {
        try {
            const data = await apiRequest("/playlists", "GET", undefined, undefined, BASE_URL_GLOBAL);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to list playlists: ${error.message}`);
        }
    });
    server.registerTool("get_playlist", {
        title: "Get Playlist Details",
        description: "Get details of a specific playlist including its metadata and video count.",
        inputSchema: {
            playlist_id: z.string().uuid().describe("Playlist UUID"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ playlist_id }) => {
        try {
            const data = await apiRequest(`/playlists/${playlist_id}`, "GET", undefined, undefined, BASE_URL_GLOBAL);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get playlist: ${error.message}`);
        }
    });
    server.registerTool("create_playlist", {
        title: "Create Playlist",
        description: "Create a new video playlist with access control settings.",
        inputSchema: {
            name: z.string().min(1).max(255).describe("Playlist name"),
            access_type: z
                .enum(["public", "private", "anyone_with_password"])
                .describe("Access type: public, private, or anyone_with_password"),
            creator_name: z.string().min(1).max(255).describe("Creator/author name displayed on the playlist"),
            description: z.string().max(1000).optional().describe("Playlist description (max 1000 chars)"),
            password: z
                .string()
                .min(6)
                .optional()
                .describe("Password (required when access_type is anyone_with_password, min 6 chars)"),
            hide_views: z.boolean().optional().describe("Hide view count from viewers (default: false)"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ name, access_type, creator_name, description, password, hide_views }) => {
        try {
            const body = { name, access_type, creator_name };
            if (description !== undefined)
                body.description = description;
            if (password !== undefined)
                body.password = password;
            if (hide_views !== undefined)
                body.hide_views = hide_views;
            const data = await apiRequest("/playlists", "POST", body, undefined, BASE_URL_GLOBAL);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to create playlist: ${error.message}`);
        }
    });
    server.registerTool("update_playlist", {
        title: "Update Playlist",
        description: "Update playlist properties like name, access type, description, or password.",
        inputSchema: {
            playlist_id: z.string().uuid().describe("Playlist UUID to update"),
            name: z.string().min(1).max(255).optional().describe("New playlist name"),
            access_type: z
                .enum(["public", "private", "anyone_with_password"])
                .optional()
                .describe("New access type"),
            creator_name: z.string().min(1).max(255).optional().describe("New creator name"),
            description: z.string().max(1000).optional().describe("New description"),
            password: z.string().min(6).optional().describe("New password (for password-protected playlists)"),
            hide_views: z.boolean().optional().describe("Hide view count from viewers"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ playlist_id, name, access_type, creator_name, description, password, hide_views }) => {
        try {
            const body = {};
            if (name !== undefined)
                body.name = name;
            if (access_type !== undefined)
                body.access_type = access_type;
            if (creator_name !== undefined)
                body.creator_name = creator_name;
            if (description !== undefined)
                body.description = description;
            if (password !== undefined)
                body.password = password;
            if (hide_views !== undefined)
                body.hide_views = hide_views;
            const data = await apiRequest(`/playlists/${playlist_id}`, "PUT", body, undefined, BASE_URL_GLOBAL);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to update playlist: ${error.message}`);
        }
    });
    server.registerTool("delete_playlist", {
        title: "Delete Playlist",
        description: "Permanently delete a playlist. This action cannot be undone (not a soft delete).",
        inputSchema: {
            playlist_id: z.string().uuid().describe("Playlist UUID to delete"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
        },
    }, async ({ playlist_id }) => {
        try {
            await apiRequest(`/playlists/${playlist_id}`, "DELETE", undefined, undefined, BASE_URL_GLOBAL);
            return toolResult({ deleted: true, id: playlist_id });
        }
        catch (error) {
            return toolError(`Failed to delete playlist: ${error.message}`);
        }
    });
    server.registerTool("get_playlist_videos", {
        title: "Get Playlist Videos",
        description: "Get all videos in a specific playlist.",
        inputSchema: {
            playlist_id: z.string().uuid().describe("Playlist UUID"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ playlist_id }) => {
        try {
            const data = await apiRequest(`/playlists/${playlist_id}/videos`, "GET", undefined, undefined, BASE_URL_GLOBAL);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get playlist videos: ${error.message}`);
        }
    });
}
