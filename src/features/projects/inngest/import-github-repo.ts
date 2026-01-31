import { Octokit } from "octokit";

import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface ImportGithubRepoEvent {
  owner: string;
  repo: string;
  projectId: Id<"projects">;
  githubToken: string;
};

export const importGithubRepo = inngest.createFunction(
  {
    id: "import-github-repo",
    onFailure: async ({ event, step }) => {
      const { projectId } = event.data.event.data as ImportGithubRepoEvent;

      await step.run("set-failed-status", async () => {
        await convex.mutation(api.system.updateImportStatus, {
          projectId,
          status: "failed",
        });
      });
    },
  },
  {
    event: "github/import.repo",
  },
  async ({ event, step }) => {
    const { owner, repo, projectId, githubToken } =
      event.data as ImportGithubRepoEvent;

    const octokit = new Octokit({ auth: githubToken });

    // 1. Get the default branch
    const { data: repoData } = await step.run("get-repo-details", async () => {
      return await octokit.rest.repos.get({ owner, repo });
    });

    const defaultBranch = repoData.default_branch;

    // 2. Get the tree (recursive)
    const { data: treeData } = await step.run("get-repo-tree", async () => {
      return await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: "true",
      });
    });

    // Filter to only actual files (blobs), excluding large or binary files where possible
    // For now, we'll import everything but focus on text
    const filesToImport = treeData.tree.filter((item) => item.type === "blob");

    // Map to keep track of folder paths to parent IDs
    const folderPathToId: Record<string, Id<"files">> = {};

    // 3. Process the tree to create folders first
    const folders = treeData.tree.filter((item) => item.type === "tree");

    // Sort folders by depth to ensure parent folders are created first
    folders.sort((a, b) => (a.path?.split("/").length || 0) - (b.path?.split("/").length || 0));

    for (const folder of folders) {
      const path = folder.path!;
      const parts = path.split("/");
      const name = parts.pop()!;
      const parentPath = parts.join("/");
      const parentId = parentPath ? folderPathToId[parentPath] : undefined;

      const folderId = await step.run(`create-folder-${path}`, async () => {
        return await convex.mutation(api.system.createFolder, {
          projectId,
          name,
          parentId,
        });
      });

      folderPathToId[path] = folderId;
    }

    // 4. Import files
    for (const file of filesToImport) {
      const path = file.path!;
      const parts = path.split("/");
      const name = parts.pop()!;
      const parentPath = parts.join("/");
      const parentId = parentPath ? folderPathToId[parentPath] : undefined;

      await step.run(`import-file-${path}`, async () => {
        // Fetch file content
        const { data: blobData } = await octokit.rest.git.getBlob({
          owner,
          repo,
          file_sha: file.sha!,
        });

        const isBase64 = blobData.encoding === "base64";
        const content = isBase64
          ? Buffer.from(blobData.content, "base64").toString("utf-8")
          : blobData.content;

        // Note: For binary files, we would need to upload to storage
        // For simplicity, we're treating everything as text for now
        // or skipping if it looks very binary

        await convex.mutation(api.system.createFile, {
          projectId,
          name,
          content,
          parentId,
        });
      });
    }

    // 5. Set status to completed
    await step.run("set-completed-status", async () => {
      await convex.mutation(api.system.updateImportStatus, {
        projectId,
        status: "completed",
      });
    });

    return { success: true, filesImported: filesToImport.length };
  }
);
