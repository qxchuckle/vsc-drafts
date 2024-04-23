import * as vscode from "vscode";
import { GitHubFile } from "../treeView/gitHubFile";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";

export function createGithubRefresh(provider: ref<GitHubDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-github.refresh",
    async (file: GitHubFile) => {
      if (!provider.value) {
        return;
      }
      provider.value.refresh();
    }
  );
}
