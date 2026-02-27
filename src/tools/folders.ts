import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";
import { BASE_URL_GLOBAL } from "../auth.js";

export function registerFolderTools(server: McpServer) {
  server.registerTool(
    "list_folders",
    {
      title: "List Folders",
      description:
        "List all folders in your PandaVideo account. Optionally filter by parent folder or status.",
      inputSchema: {
        parent_folder_id: z
          .string()
          .uuid()
          .optional()
          .describe("Filter by parent folder UUID. Omit to list root-level folders."),
        status: z
          .string()
          .optional()
          .describe("Filter by status: 'true' for active, 'false' for inactive (default: true)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ parent_folder_id, status }) => {
      try {
        const data = await apiRequest(
          "/folders",
          "GET",
          undefined,
          { parent_folder_id, status },
          BASE_URL_GLOBAL,
        );
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to list folders: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "get_folder",
    {
      title: "Get Folder Details",
      description:
        "Get complete details of a specific folder including its videos, funnels, and DRM groups.",
      inputSchema: {
        folder_id: z.string().uuid().describe("Folder UUID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ folder_id }) => {
      try {
        const data = await apiRequest(
          `/folders/${folder_id}`,
          "GET",
          undefined,
          undefined,
          BASE_URL_GLOBAL,
        );
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to get folder: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "create_folder",
    {
      title: "Create Folder",
      description: "Create a new folder to organize videos.",
      inputSchema: {
        name: z.string().min(1).max(255).describe("Folder name (1-255 characters)"),
        parent_folder_id: z
          .string()
          .uuid()
          .optional()
          .describe("Parent folder UUID. Omit to create at root level."),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ name, parent_folder_id }) => {
      try {
        const body: Record<string, unknown> = { name };
        if (parent_folder_id !== undefined) body.parent_folder_id = parent_folder_id;

        const data = await apiRequest("/folders", "POST", body, undefined, BASE_URL_GLOBAL);
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to create folder: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "update_folder",
    {
      title: "Update Folder",
      description: "Update folder name, move it to a different parent, or change its status.",
      inputSchema: {
        folder_id: z.string().uuid().describe("Folder UUID to update"),
        name: z.string().min(1).max(255).optional().describe("New folder name (1-255 characters)"),
        parent_folder_id: z
          .string()
          .uuid()
          .optional()
          .describe("Move folder to this parent folder UUID"),
        status: z.boolean().optional().describe("Set folder active (true) or inactive (false)"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ folder_id, name, parent_folder_id, status }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.name = name;
        if (parent_folder_id !== undefined) body.parent_folder_id = parent_folder_id;
        if (status !== undefined) body.status = status;

        const data = await apiRequest(
          `/folders/${folder_id}`,
          "PUT",
          body,
          undefined,
          BASE_URL_GLOBAL,
        );
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to update folder: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "delete_folder",
    {
      title: "Delete Folder",
      description:
        "Soft-delete a folder. Videos inside may be moved to root or deleted depending on configuration.",
      inputSchema: {
        folder_id: z.string().uuid().describe("Folder UUID to delete"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async ({ folder_id }) => {
      try {
        await apiRequest(`/folders/${folder_id}`, "DELETE", undefined, undefined, BASE_URL_GLOBAL);
        return toolResult({ deleted: true, id: folder_id });
      } catch (error) {
        return toolError(`Failed to delete folder: ${(error as Error).message}`);
      }
    },
  );
}
