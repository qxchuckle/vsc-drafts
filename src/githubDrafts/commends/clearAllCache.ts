import * as vscode from "vscode";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";

export function createClearAllCache(provider: ref<GitHubDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-github.clearAllCache",
    async () => {
      if (!provider.value) {
        return;
      }
      provider.value.clearAllCache();
      vscode.window.showInformationMessage("清除所有本地缓存成功");
    }
  );
}
