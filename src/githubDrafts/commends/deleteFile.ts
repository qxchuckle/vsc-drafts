import * as vscode from "vscode";
import * as path from "path";
import { GitHubFile } from "../treeView/gitHubFile";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";

export function createDeleteGithubFile(provider: ref<GitHubDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-github.deleteFile",
    async (file: GitHubFile) => {
      if (!provider.value) {
        return;
      }
      let message = `你确定要删除 ${file.path} 吗？`;
      if (file.contextValue === "folder") {
        message = `你确定要删除 ${file.path} 以及其中所有文件吗？`;
      }
      const confirm = await vscode.window.showWarningMessage(
        message,
        { modal: true },
        "确定"
      );
      if (confirm === "确定") {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `正在删除 ${file.path}`,
          },
          async (progress) => {
            progress.report({ increment: 30 });
            // 删除硬盘缓存文件
            vscode.workspace.fs.delete(
              vscode.Uri.file(path.join(provider.value!.tempPath, file.path)),
              {
                useTrash: true, // 使用回收站
                recursive: true, // 递归删除
              }
            );
            progress.report({ increment: 60 });
            await provider.value?.deleteFile(file.path);
            provider.value?.refresh();
            progress.report({ increment: 100 });
          }
        );
      }
    }
  );
}
