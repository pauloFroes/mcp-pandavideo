import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";
import { IMPORT_URL } from "../auth.js";
export function registerVideoTools(server) {
    server.registerTool("list_videos", {
        title: "List Videos",
        description: "List all videos in your PandaVideo library. Supports pagination, filtering by folder, status, and title search.",
        inputSchema: {
            page: z.string().optional().describe("Page number for pagination"),
            limit: z.string().optional().describe("Number of videos per page"),
            title: z.string().optional().describe("Filter videos by title (partial match)"),
            status: z
                .string()
                .optional()
                .describe("Filter by status: DRAFT, CONVERTING, CONVERTED, FAILED, DELETING"),
            folder_id: z.string().optional().describe("Filter by folder UUID"),
            root_folder: z
                .string()
                .optional()
                .describe("Set to '1' to return only videos in the root folder (no folder)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ page, limit, title, status, folder_id, root_folder }) => {
        try {
            const data = await apiRequest("/videos", "GET", undefined, {
                page,
                limit,
                title,
                status,
                folder_id,
                root_folder,
            });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to list videos: ${error.message}`);
        }
    });
    server.registerTool("get_video", {
        title: "Get Video Details",
        description: "Get complete details of a specific video including title, description, status, storage size, duration, player URL, HLS URL, and thumbnail.",
        inputSchema: {
            video_id: z.string().uuid().describe("Video UUID"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ video_id }) => {
        try {
            const data = await apiRequest(`/videos/${video_id}`);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get video: ${error.message}`);
        }
    });
    server.registerTool("update_video", {
        title: "Update Video",
        description: "Update video properties such as title, description, folder, or playback qualities.",
        inputSchema: {
            video_id: z.string().uuid().describe("Video UUID to update"),
            title: z.string().optional().describe("New video title"),
            description: z.string().optional().describe("New video description"),
            folder_id: z.string().optional().describe("Move video to this folder UUID"),
            playback: z
                .array(z.enum(["240p", "480p", "720p", "1080p", "1440p", "2160p"]))
                .optional()
                .describe("Allowed playback qualities"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ video_id, title, description, folder_id, playback }) => {
        try {
            const body = {};
            if (title !== undefined)
                body.title = title;
            if (description !== undefined)
                body.description = description;
            if (folder_id !== undefined)
                body.folder_id = folder_id;
            if (playback !== undefined)
                body.playback = playback;
            const data = await apiRequest(`/videos/${video_id}`, "PUT", body);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to update video: ${error.message}`);
        }
    });
    server.registerTool("delete_video", {
        title: "Delete Video",
        description: "Soft-delete a video. The video will have status DELETING and can be recovered within 30 days using recover_video.",
        inputSchema: {
            video_id: z.string().uuid().describe("Video UUID to delete"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
        },
    }, async ({ video_id }) => {
        try {
            await apiRequest(`/videos/${video_id}`, "DELETE");
            return toolResult({ deleted: true, id: video_id });
        }
        catch (error) {
            return toolError(`Failed to delete video: ${error.message}`);
        }
    });
    server.registerTool("recover_video", {
        title: "Recover Deleted Video",
        description: "Recover a previously deleted video (within 30-day retention window).",
        inputSchema: {
            video_id: z.string().uuid().describe("Video UUID to recover"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ video_id }) => {
        try {
            const data = await apiRequest(`/videos/${video_id}/recover`, "POST", {});
            return toolResult({ recovered: true, id: video_id, ...(data || {}) });
        }
        catch (error) {
            return toolError(`Failed to recover video: ${error.message}`);
        }
    });
    server.registerTool("upload_video_from_url", {
        title: "Upload Video from URL",
        description: "Import a video from an external URL (must be hosted on a cloud server). Returns a websocket URL to track upload progress.",
        inputSchema: {
            url: z.string().url().describe("External video URL to import (must be on a cloud server)"),
            title: z.string().optional().describe("Video title"),
            description: z.string().optional().describe("Video description"),
            folder_id: z.string().optional().describe("Target folder UUID"),
            video_id: z.string().uuid().optional().describe("Custom UUID v4 for the video"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ url, title, description, folder_id, video_id }) => {
        try {
            const body = { url };
            if (title !== undefined)
                body.title = title;
            if (description !== undefined)
                body.description = description;
            if (folder_id !== undefined)
                body.folder_id = folder_id;
            if (video_id !== undefined)
                body.video_id = video_id;
            const data = await apiRequest("/videos/", "POST", body, undefined, IMPORT_URL);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to upload video from URL: ${error.message}`);
        }
    });
    server.registerTool("upload_video_from_m3u8", {
        title: "Upload Video from M3U8",
        description: "Import a video from an M3U8/HLS stream URL. Processing is asynchronous.",
        inputSchema: {
            url: z.string().url().describe("M3U8 stream URL to import"),
            title: z.string().describe("Video title (required)"),
            description: z.string().optional().describe("Video description"),
            folder_id: z.string().optional().describe("Target folder UUID"),
            video_id: z.string().uuid().optional().describe("Custom UUID v4 for the video"),
            hls_encryption: z
                .boolean()
                .optional()
                .describe("Enable HLS encryption on the imported video"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ url, title, description, folder_id, video_id, hls_encryption }) => {
        try {
            const body = { url, title };
            if (description !== undefined)
                body.description = description;
            if (folder_id !== undefined)
                body.folder_id = folder_id;
            if (video_id !== undefined)
                body.video_id = video_id;
            if (hls_encryption !== undefined)
                body.hls_encryption = hls_encryption;
            const data = await apiRequest("/videos/m3u8", "POST", body, undefined, IMPORT_URL);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to upload video from M3U8: ${error.message}`);
        }
    });
}
