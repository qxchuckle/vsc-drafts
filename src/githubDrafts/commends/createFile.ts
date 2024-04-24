import * as vscode from "vscode";
import * as path from "path";
import { GitHubFile } from "../treeView/gitHubFile";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";

export function createCreateGithubFile(provider: ref<GitHubDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-github.createFile",
    async (file: GitHubFile) => {
      if (!provider.value) {
        return;
      }
      let rootPath = file?.path ?? "";
      if (rootPath && file?.contextValue === "file") {
        rootPath = path.dirname(rootPath);
        rootPath = rootPath === "." ? "" : rootPath;
      }
      // vscode.window.showInformationMessage(rootPath);
      const fileName = await vscode.window.showInputBox({
        prompt: "请输入文件名，以 / 分隔可创建父文件夹",
        placeHolder: `在 ${rootPath || "根目录"} 中新建文件`,
      });
      if (!fileName) {
        return;
      }
      const relativePath = rootPath ? rootPath + "/" + fileName : fileName;
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `正在创建 ${relativePath}`,
        },
        async (progress) => {
          progress.report({ increment: 30 });
          const path = await provider.value!.createOrUpdateFile(
            relativePath,
            "",
            true
          );
          if (path === false) {
            progress.report({ increment: 100 });
            return;
          }
          progress.report({ increment: 60 });
          provider.value?.refresh();
          await provider.value!.openFile(path);
          // 因为是github，要聚焦的话太慢了，还是不聚焦了
          // progress.report({ increment: 80 });
          // await provider.value?.revealItem(path);
          progress.report({ increment: 100 });
        }
      );
    }
  );
}
