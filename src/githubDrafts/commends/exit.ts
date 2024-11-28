import * as vscode from "vscode";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";

export function createExit(provider: ref<GitHubDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-github.exit",
    async () => {
      if (!provider.value) {
        return;
      }
      provider.value.exit();
      provider.value = null;
    }
  );
}
