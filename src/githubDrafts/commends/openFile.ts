import * as vscode from "vscode";
import { GitHubFile } from "../treeView/gitHubFile";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";

export function createOpenGithubFile(provider: ref<GitHubDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-github.openFile",
    async (file: GitHubFile) => {
      if (!provider.value) {
        return;
      }
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `正在打开 ${file.path}`,
        },
        async (progress) => {
          progress.report({ increment: 50 });
          await provider.value?.openFile(file.path);
          progress.report({ increment: 50 });
        }
      );
    }
  );
}
