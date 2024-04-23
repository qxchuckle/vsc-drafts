import * as vscode from "vscode";
import * as path from "path";
import { GitHubDataProvider } from "../treeView/gitHubDataProvider";

export function createSaveDocumentWatch(provider: ref<GitHubDataProvider>) {
  return vscode.workspace.onDidSaveTextDocument(async (doc) => {
    if (!provider.value) {
      return;
    }
    const fsPath = doc.uri.fsPath;
    const tempPath = provider.value.tempPath;
    const relativePath = path.relative(tempPath, fsPath).replace(/\\/g, "/");
    // vscode.window.showInformationMessage(relativePath);
    // 检查文件是否在临时目录中
    if (!relativePath.startsWith("../")) {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `正在保存 ${relativePath}`,
        },
        async (progress) => {
          progress.report({ increment: 50 });
          const encoded = Buffer.from(doc.getText()).toString("base64");
          await provider.value!.createOrUpdateFile(
            relativePath,
            encoded,
            false
          );
          progress.report({ increment: 100 });
        }
      );
    }
  });
}
