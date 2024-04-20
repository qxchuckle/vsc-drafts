import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { FileItem } from "../treeView/fileItem";
import * as path from "path";

export function createDelete(provider: ref<FileTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts.delete",
    async (fileItem: FileItem) => {
      if (!provider.value || !fileItem.resourceUri) {
        return;
      }
      const confirm = await vscode.window.showWarningMessage(
        `你确定要删除 ${fileItem.resourceUri.fsPath} 吗？`,
        { modal: true },
        "确定"
      );
      if (confirm === "确定") {
        await vscode.workspace.fs.delete(fileItem.resourceUri, {
          useTrash: true, // 使用回收站
          recursive: true // 递归删除
        });
        provider.value.refresh();
      }
    }
  );
}
