import * as vscode from "vscode";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";

export function createOpenInGithub(provider: ref<GitHubDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-github.openInGithub",
    async () => {
      if (!provider.value) {
        return;
      }
      const url = provider.value.getRepoUrl();
      url && vscode.env.openExternal(vscode.Uri.parse(url));
    }
  );
}
