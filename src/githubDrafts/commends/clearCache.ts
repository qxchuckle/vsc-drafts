import * as vscode from "vscode";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";

export function createClearCache(provider: ref<GitHubDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-github.clearCache",
    async () => {
      if (!provider.value) {
        return;
      }
      provider.value.clearCache();
      vscode.window.showInformationMessage(
        `清除 ${provider.value.config.value?.owner}/${provider.value.config.value?.repo} 仓库的本地缓存成功`
      );
    }
  );
}
