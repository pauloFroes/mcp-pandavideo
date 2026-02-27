import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";
export function registerWebhookTools(server) {
    server.registerTool("get_webhook", {
        title: "Get Webhook Configuration",
        description: "Get the current webhook configuration. PandaVideo sends events for video.changeStatus (DRAFT, CONVERTING, CONVERTED, FAILED) and live.changeStatus (ONLINE, FINISHED, FINISHED_IMPORTED).",
        inputSchema: {},
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async () => {
        try {
            const data = await apiRequest("/webhooks");
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get webhook: ${error.message}`);
        }
    });
    server.registerTool("create_webhook", {
        title: "Create Webhook",
        description: "Create or replace the webhook endpoint. PandaVideo will POST events to this URL. Events: video.changeStatus, live.changeStatus. Your endpoint must return 2xx status.",
        inputSchema: {
            url: z.string().url().describe("Webhook endpoint URL that will receive POST events"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ url }) => {
        try {
            const data = await apiRequest("/webhooks", "POST", { url });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to create webhook: ${error.message}`);
        }
    });
    server.registerTool("update_webhook", {
        title: "Update Webhook",
        description: "Update the webhook endpoint URL.",
        inputSchema: {
            url: z.string().url().describe("New webhook endpoint URL"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ url }) => {
        try {
            const data = await apiRequest("/webhooks", "PUT", { url });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to update webhook: ${error.message}`);
        }
    });
    server.registerTool("delete_webhook", {
        title: "Delete Webhook",
        description: "Remove the webhook configuration. Events will no longer be sent.",
        inputSchema: {},
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
        },
    }, async () => {
        try {
            await apiRequest("/webhooks", "DELETE");
            return toolResult({ deleted: true });
        }
        catch (error) {
            return toolError(`Failed to delete webhook: ${error.message}`);
        }
    });
}
